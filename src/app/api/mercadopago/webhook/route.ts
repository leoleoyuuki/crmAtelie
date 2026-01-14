
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { doc, getDoc, runTransaction, updateDoc } from 'firebase/firestore';
import { app, db } from '@/firebase/config';
import { activateUserAccount } from '@/lib/activation';

// Inicialize o SDK do Mercado Pago
const accessToken = process.env.MP_ACCESS_TOKEN;
if (!accessToken) {
  throw new Error("[ERRO MP] Access Token não encontrado nas variáveis de ambiente.");
}
const client = new MercadoPagoConfig({ accessToken });
const payment = new Payment(client);

type PlanIdentifier = 'mensal' | 'trimestral' | 'anual';

export async function POST(request: NextRequest) {
  console.log('[LOG MP] Webhook recebido.');

  try {
    const body = await request.json();
    console.log('[LOG MP] Corpo do Webhook:', body);

    // Verificamos se a notificação é sobre um pagamento
    if (body.type === 'payment' && body.data && body.data.id) {
      const paymentId = body.data.id;
      console.log(`[LOG MP] ID do pagamento recebido: ${paymentId}`);

      // Buscamos os detalhes do pagamento na API do Mercado Pago
      const paymentInfo = await payment.get({ id: paymentId });
      console.log('[LOG MP] Informações do pagamento:', JSON.stringify(paymentInfo, null, 2));

      // Verificamos se o pagamento está aprovado e se temos os dados necessários
      if (paymentInfo.status === 'approved' && paymentInfo.external_reference && paymentInfo.order?.id) {
        const userId = paymentInfo.external_reference;
        const planIdentifier = paymentInfo.items?.[0]?.id as PlanIdentifier;
        
        if (!userId || !planIdentifier) {
           console.error('[ERRO MP] ID do usuário ou do plano não encontrado no pagamento.');
           return NextResponse.json({ error: 'Dados do pagamento incompletos.' }, { status: 400 });
        }

        console.log(`[LOG MP] Processando ativação para o usuário ${userId} com o plano ${planIdentifier}.`);
        
        // Ativa a conta do usuário
        await activateUserAccount(db, userId, planIdentifier);

        console.log(`[LOG MP] Ativação para ${userId} concluída com sucesso.`);
        return NextResponse.json({ success: true });

      } else {
        console.log(`[LOG MP] Status do pagamento não é 'approved' ou faltam dados: ${paymentInfo.status}`);
        return NextResponse.json({ status: 'Pagamento não aprovado ou dados incompletos' });
      }
    }

    return NextResponse.json({ status: 'Notificação não relevante' });
  } catch (error) {
    console.error('[ERRO MP] Falha ao processar webhook:', error);
    return NextResponse.json({ error: 'Falha interna ao processar o webhook.' }, { status: 500 });
  }
}
