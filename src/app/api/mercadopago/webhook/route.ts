import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { add } from 'date-fns';
import '@/lib/load-env'; // Carrega as variáveis de ambiente

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

  if (body.type !== 'payment' || !body.data?.id) {
    console.log(`[LOG MP] Notificação não é do tipo 'payment' ou não contém ID. Tipo: ${body.type}`);
    return NextResponse.json({ status: 'Notificação não processada' }, { status: 200 });
  }

  try {
    const paymentId = body.data.id;
    console.log(`[LOG MP] ID do pagamento obtido do corpo: ${paymentId}`);

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('[ERRO MP] Access Token não encontrado.');
      return NextResponse.json({ error: 'Erro de configuração no servidor.' }, { status: 500 });
    }

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    
    const paymentInfo = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error('[ERRO MP] Falha ao buscar informações do pagamento:', paymentInfo);
      return NextResponse.json({ status: 'Falha ao buscar pagamento' }, { status: 200 });
    }

    console.log('[LOG MP] Informações do pagamento obtidas:', JSON.stringify(paymentInfo, null, 2));

    if (paymentInfo.status === 'approved') {
      const userId = paymentInfo.external_reference;
      const planIdentifier = paymentInfo.additional_info?.items?.[0]?.id as PlanIdentifier;
      
      if (!userId || !planIdentifier) {
         console.error('[ERRO MP] ID do usuário ou do plano não encontrado no pagamento.');
         return NextResponse.json({ error: 'Dados do pagamento incompletos.' }, { status: 400 });
      }

      console.log(`[LOG MP] Iniciando ativação para o usuário ${userId} com o plano ${planIdentifier}.`);
      
      try {
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();
        let startDate = new Date();

        if (userDoc.exists && userDoc.data()?.status === 'active' && userDoc.data()?.expiresAt) {
          const currentExpiration = userDoc.data()?.expiresAt.toDate();
          if (currentExpiration > new Date()) {
            startDate = currentExpiration;
          }
        }
        
        const { value, unit } = getDuration(planIdentifier);
        const expiresAt = add(startDate, { [unit]: value });

        await userRef.update({
          status: 'active',
          expiresAt: expiresAt,
        });

        console.log(`[LOG MP] Documento do usuário ${userId} atualizado com sucesso no Firestore.`);
      } catch (dbError) {
           console.error(`[ERRO MP] Falha ao atualizar o documento do usuário ${userId} no Firestore:`, dbError);
           return NextResponse.json({ error: 'Falha ao atualizar banco de dados.', details: (dbError as Error).message }, { status: 500 });
      }

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
