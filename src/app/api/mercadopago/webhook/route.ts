import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { add } from 'date-fns';
import '@/lib/load-env'; // Carrega as variáveis de ambiente
import { createHash } from 'crypto'; // For Facebook Conversions API

type PlanIdentifier = 'mensal' | 'anual';

const getDuration = (planIdentifier: PlanIdentifier): { value: number, unit: 'months' | 'years' } => {
    if (planIdentifier === 'mensal') return { value: 1, unit: 'months' };
    if (planIdentifier === 'anual') return { value: 1, unit: 'years' };
    throw new Error('Identificador de plano inválido.');
};

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.type !== 'payment' || !body.data?.id) {
    return NextResponse.json({ status: 'Notificação não processada' }, { status: 200 });
  }

  try {
    const paymentId = body.data.id;
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
      return NextResponse.json({ status: 'Falha ao buscar pagamento' }, { status: 200 });
    }

    if (paymentInfo.status === 'approved') {
      const userId = paymentInfo.external_reference;
      const planIdentifier = paymentInfo.additional_info?.items?.[0]?.id as PlanIdentifier;
      
      if (!userId || !planIdentifier) {
         return NextResponse.json({ error: 'Dados do pagamento incompletos.' }, { status: 400 });
      }

      try {
        if (!adminDb) {
          throw new Error('Firebase Admin não inicializado.');
        }

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

        await userRef.set({
          status: 'active',
          expiresAt: expiresAt,
        }, { merge: true });

      } catch (dbError: any) {
           console.error(`[ERRO MP] Falha no Firestore:`, dbError);
           return NextResponse.json({ error: 'Falha ao atualizar banco de dados.' }, { status: 500 });
      }
      
      // Facebook Conversions API
      const fbCapiToken = process.env.FB_CONVERSIONS_API_TOKEN;
      const pixelId = '25321081740913131';

      if (fbCapiToken) {
        try {
          const hash = (data: string) => createHash('sha256').update(data.toLowerCase()).digest('hex');
          const payer = paymentInfo.payer || {};
          
          const userData = {
            em: payer.email ? hash(payer.email) : undefined,
            ph: payer.phone?.number ? hash(payer.phone.number) : undefined,
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
        } catch (fbError) {
          console.error('[ERRO FB CAPI] Falha ao enviar Purchase:', fbError);
        }
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ status: 'Pagamento não aprovado' }, { status: 200 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'Falha interna ao processar webhook.' }, { status: 500 });
  }
}
