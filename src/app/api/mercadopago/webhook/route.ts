
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { add } from 'date-fns';
import '@/lib/load-env'; // Carrega as variáveis de ambiente
import { createHash } from 'crypto'; // For Facebook Conversions API

type PlanIdentifier = 'mensal' | 'trimestral' | 'anual';

const getDuration = (planIdentifier: PlanIdentifier): { value: number, unit: 'months' | 'years' } => {
    if (planIdentifier === 'mensal') return { value: 1, unit: 'months' };
    if (planIdentifier === 'trimestral') return { value: 3, unit: 'months' };
    if (planIdentifier === 'anual') return { value: 1, unit: 'years' };
    throw new Error('Identificador de plano inválido.');
};

export async function POST(request: NextRequest) {
  console.log('[LOG MP] Webhook recebido.');
  const body = await request.json();
  console.log('[LOG MP] Corpo do Webhook:', JSON.stringify(body, null, 2));

  // O Mercado Pago envia múltiplos tipos de notificação.
  // Nosso interesse é na de 'payment' que tem o 'data.id'.
  if (body.type !== 'payment' || !body.data?.id) {
    console.log(`[LOG MP] Notificação não é do tipo 'payment' ou não contém ID. Tipo: ${body.type}. Ignorando.`);
    return NextResponse.json({ status: 'Notificação não processada' }, { status: 200 });
  }

  try {
    const paymentId = body.data.id;
    console.log(`[LOG MP] ID do pagamento obtido do corpo: ${paymentId}`);

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('[ERRO MP] Access Token do Mercado Pago não encontrado nas variáveis de ambiente.');
      return NextResponse.json({ error: 'Erro de configuração no servidor (MP Access Token).' }, { status: 500 });
    }

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    
    const paymentInfo = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error('[ERRO MP] Falha ao buscar informações do pagamento:', paymentInfo);
      // Retornamos 200 para que o Mercado Pago não continue tentando enviar o webhook.
      return NextResponse.json({ status: 'Falha ao buscar pagamento' }, { status: 200 });
    }

    console.log('[LOG MP] Informações do pagamento obtidas:', JSON.stringify(paymentInfo, null, 2));

    if (paymentInfo.status === 'approved') {
      const userId = paymentInfo.external_reference;
      // Caminho corrigido para obter o ID do plano
      const planIdentifier = paymentInfo.additional_info?.items?.[0]?.id as PlanIdentifier;
      
      if (!userId || !planIdentifier) {
         console.error('[ERRO MP] ID do usuário (external_reference) ou ID do plano (items.id) não encontrado no pagamento.');
         return NextResponse.json({ error: 'Dados do pagamento incompletos.' }, { status: 400 });
      }

      console.log(`[LOG MP] Iniciando ativação para o usuário ${userId} com o plano ${planIdentifier}.`);
      
      try {
        if (!adminDb) {
          console.error('[ERRO CRÍTICO] Firebase Admin não inicializado. Verifique as variáveis de ambiente do servidor.');
          throw new Error('A conexão com o banco de dados do administrador não está disponível.');
        }

        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();
        let startDate = new Date();

        // Se o usuário já tiver uma assinatura ativa, adiciona o novo período ao final da assinatura existente.
        if (userDoc.exists && userDoc.data()?.status === 'active' && userDoc.data()?.expiresAt) {
          const currentExpiration = userDoc.data()?.expiresAt.toDate();
          if (currentExpiration > new Date()) {
            startDate = currentExpiration;
          }
        }
        
        const { value, unit } = getDuration(planIdentifier);
        const expiresAt = add(startDate, { [unit]: value });

        // Atualiza o documento do usuário com o novo status e data de expiração.
        await userRef.set({
          status: 'active',
          expiresAt: expiresAt,
        }, { merge: true }); // Usar `set` com `merge` é mais seguro para criar ou atualizar.

        console.log(`[LOG MP] Documento do usuário ${userId} atualizado com sucesso no Firestore.`);
      } catch (dbError: any) {
           console.error(`[ERRO MP] Falha ao atualizar o documento do usuário ${userId} no Firestore:`, dbError);
           // Não retorne o erro do banco de dados para o cliente
           return NextResponse.json({ error: 'Falha ao atualizar banco de dados.' }, { status: 500 });
      }
      
      // --- Início: Facebook Conversions API ---
      const fbCapiToken = process.env.FB_CONVERSIONS_API_TOKEN;
      const pixelId = '25321081740913131';

      if (!fbCapiToken) {
        console.log('[LOG FB CAPI] FB_CONVERSIONS_API_TOKEN não configurado. Pulando evento de Purchase.');
      } else {
        try {
          const hash = (data: string) => createHash('sha256').update(data.toLowerCase()).digest('hex');
          const payer = paymentInfo.payer || {};
          
          const userData = {
            em: payer.email ? hash(payer.email) : undefined,
            ph: payer.phone?.number ? hash(payer.phone.number) : undefined,
            fn: payer.first_name ? hash(payer.first_name) : undefined,
            ln: payer.last_name ? hash(payer.last_name) : undefined,
            client_ip_address: request.ip,
            client_user_agent: request.headers.get('user-agent'),
          };

          const eventData = {
            data: [
              {
                event_name: 'Purchase',
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'website',
                event_id: paymentId.toString(),
                user_data: userData,
                custom_data: {
                  value: paymentInfo.transaction_amount,
                  currency: 'BRL',
                },
              },
            ],
          };

          await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${fbCapiToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
          
          console.log(`[LOG FB CAPI] Evento de Purchase para o pagamento ${paymentId} enviado com sucesso.`);

        } catch (fbError) {
          console.error('[ERRO FB CAPI] Falha ao enviar o evento de Purchase:', fbError);
        }
      }
      // --- Fim: Facebook Conversions API ---

      console.log(`[LOG MP] Ativação para ${userId} concluída com sucesso.`);
      return NextResponse.json({ success: true }, { status: 200 });

    } else {
      console.log(`[LOG MP] Status do pagamento não é 'approved'. Status: ${paymentInfo.status}`);
      return NextResponse.json({ status: 'Pagamento não aprovado' }, { status: 200 });
    }

  } catch (error: any) {
    console.error('[ERRO MP] Falha catastrófica ao processar webhook:', error);
    return NextResponse.json({ error: 'Falha interna ao processar o webhook.', message: error.message }, { status: 500 });
  }
}
