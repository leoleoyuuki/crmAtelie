
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { doc, getDoc, runTransaction, updateDoc } from 'firebase/firestore';
import { app, db } from '@/firebase/config';
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

  try {
    const body = await request.json();
    console.log('[LOG MP] Corpo do Webhook:', body);

    if (body.type === 'payment' && body.data && body.data.id) {
      const paymentId = body.data.id;
      console.log(`[LOG MP] ID do pagamento recebido: ${paymentId}`);

      const paymentInfo = await payment.get({ id: paymentId });
      console.log('[LOG MP] Informações do pagamento obtidas:', JSON.stringify(paymentInfo, null, 2));

      if (paymentInfo.status === 'approved' && paymentInfo.external_reference && paymentInfo.order?.id) {
        const userId = paymentInfo.external_reference;
        const planIdentifier = paymentInfo.items?.[0]?.id as PlanIdentifier;
        
        if (!userId || !planIdentifier) {
           console.error('[ERRO MP] ID do usuário ou do plano não encontrado no pagamento.');
           return NextResponse.json({ error: 'Dados do pagamento incompletos.' }, { status: 400 });
        }

        console.log(`[LOG MP] Iniciando ativação para o usuário ${userId} com o plano ${planIdentifier}.`);
        
        // --- Lógica de ativação diretamente aqui ---
        const userRef = doc(db, 'users', userId);
        const { value, unit } = getDurationFromPlan(planIdentifier);
        const expiresAt = add(new Date(), { [unit]: value });

        console.log(`[LOG MP] Calculada data de expiração: ${expiresAt.toISOString()}`);
        
        try {
            await updateDoc(userRef, {
                status: 'active',
                expiresAt: expiresAt,
            });
            console.log(`[LOG MP] Documento do usuário ${userId} atualizado com sucesso no Firestore.`);
        } catch (dbError) {
             console.error(`[ERRO MP] Falha ao atualizar o documento do usuário ${userId} no Firestore:`, dbError);
             // Retornar um erro 500 para o Mercado Pago tentar novamente.
             return NextResponse.json({ error: 'Falha ao atualizar banco de dados.' }, { status: 500 });
        }
        // --- Fim da lógica de ativação ---

        console.log(`[LOG MP] Ativação para ${userId} concluída com sucesso.`);
        return NextResponse.json({ success: true });

      } else {
        console.log(`[LOG MP] Status do pagamento não é 'approved' ou faltam dados. Status: ${paymentInfo.status}`);
        return NextResponse.json({ status: 'Pagamento não aprovado ou dados incompletos' });
      }
    }

    console.log(`[LOG MP] Tipo de notificação não é 'payment': ${body.type}`);
    return NextResponse.json({ status: 'Notificação não relevante' });
  } catch (error) {
    console.error('[ERRO MP] Falha catastrófica ao processar webhook:', error);
    return NextResponse.json({ error: 'Falha interna ao processar o webhook.' }, { status: 500 });
  }
}
