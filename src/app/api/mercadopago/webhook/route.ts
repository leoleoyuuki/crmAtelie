
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { doc, getDoc, runTransaction, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { add } from 'date-fns';

// Inicialize o SDK do Mercado Pago fora da função de requisição
const accessToken = process.env.MP_ACCESS_TOKEN;
if (!accessToken) {
  console.error("[ERRO MP] Access Token não encontrado nas variáveis de ambiente.");
}
const client = new MercadoPagoConfig({ accessToken: accessToken || '' });
const payment = new Payment(client);

type PlanIdentifier = 'mensal' | 'trimestral' | 'anual';

const getDurationFromPlan = (planIdentifier: PlanIdentifier): { value: number, unit: 'months' | 'years' } => {
    if (planIdentifier === 'mensal') return { value: 1, unit: 'months' };
    if (planIdentifier === 'trimestral') return { value: 3, unit: 'months' };
    if (planIdentifier === 'anual') return { value: 1, unit: 'years' };
    throw new Error('Identificador de plano inválido.');
}

export async function POST(request: NextRequest) {
  console.log('[LOG MP] Webhook recebido.');
  const body = await request.json();
  console.log('[LOG MP] Corpo do Webhook:', JSON.stringify(body, null, 2));

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    // Verificamos se o tipo é 'payment' e se o corpo da requisição contém o ID.
    if (type === 'payment' && body.data?.id) {
      const paymentId = body.data.id; // Usamos o ID do corpo da requisição!
      console.log(`[LOG MP] ID do pagamento obtido do corpo: ${paymentId}`);

      const paymentInfo = await payment.get({ id: paymentId });
      console.log('[LOG MP] Informações do pagamento obtidas:', JSON.stringify(paymentInfo, null, 2));

      if (paymentInfo.status === 'approved' && paymentInfo.external_reference) {
        const userId = paymentInfo.external_reference;
        const planIdentifier = paymentInfo.items?.[0]?.id as PlanIdentifier;
        
        if (!userId || !planIdentifier) {
           console.error('[ERRO MP] ID do usuário ou do plano não encontrado no pagamento.');
           return NextResponse.json({ error: 'Dados do pagamento incompletos.' }, { status: 400 });
        }

        console.log(`[LOG MP] Iniciando ativação para o usuário ${userId} com o plano ${planIdentifier}.`);
        
        const userRef = doc(db, 'users', userId);
        const { value, unit } = getDurationFromPlan(planIdentifier);

        try {
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();
            let startDate = new Date();
            if (userData && userData.status === 'active' && userData.expiresAt) {
                const currentExpiration = userData.expiresAt.toDate();
                if (currentExpiration > new Date()) {
                    startDate = currentExpiration;
                }
            }
            
            const expiresAt = add(startDate, { [unit]: value });

            console.log(`[LOG MP] Calculada data de expiração: ${expiresAt.toISOString()}`);
            
            await updateDoc(userRef, {
                status: 'active',
                expiresAt: expiresAt,
            });
            console.log(`[LOG MP] Documento do usuário ${userId} atualizado com sucesso no Firestore.`);

        } catch (dbError) {
             console.error(`[ERRO MP] Falha ao atualizar o documento do usuário ${userId} no Firestore:`, dbError);
             return NextResponse.json({ error: 'Falha ao atualizar banco de dados.' }, { status: 500 });
        }

        console.log(`[LOG MP] Ativação para ${userId} concluída com sucesso.`);
        return NextResponse.json({ success: true }, { status: 200 });

      } else {
        console.log(`[LOG MP] Status do pagamento não é 'approved' ou faltam dados. Status: ${paymentInfo.status}`);
        return NextResponse.json({ status: 'Pagamento não aprovado ou dados incompletos' }, { status: 200 });
      }
    }

    console.log(`[LOG MP] Tipo de notificação não é 'payment' ou ID do pagamento não encontrado no corpo. Tipo: ${type}`);
    return NextResponse.json({ status: 'Notificação não relevante' }, { status: 200 });
  } catch (error: any) {
    console.error('[ERRO MP] Falha catastrófica ao processar webhook:', error);
    return NextResponse.json({ error: 'Falha interna ao processar o webhook.', message: error.message }, { status: 500 });
  }
}
