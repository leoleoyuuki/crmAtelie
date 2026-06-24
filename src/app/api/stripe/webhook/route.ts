import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { notifyTrialStartedAction, notifyPurchaseAction } from '@/app/actions/notifications';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err: any) {
    console.error('Falha na verificação da assinatura do Webhook:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (!adminDb) {
      console.error('Firebase admin db não está inicializado');
      return NextResponse.json({ error: 'Erro de configuração no Firebase' }, { status: 500 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        console.log(`Processando checkout.session.completed para o usuário: ${userId}`);

        if (userId) {
          // Buscamos a assinatura para pegar a data de expiração real
          const subscription = (await stripe.subscriptions.retrieve(stripeSubscriptionId)) as any;
          
          // Adicionamos um período de graça de 24 horas para evitar bloqueios por delay de faturamento
          const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;
          const expiresAt = new Date((subscription.current_period_end * 1000) + GRACE_PERIOD_MS);

          const isTrial = subscription.status === 'trialing';

          const updateData: any = {
            stripeCustomerId,
            stripeSubscriptionId,
            subscriptionProvider: 'stripe',
            status: 'active',
            expiresAt: expiresAt,
          };

          if (isTrial) {
            updateData.trialStarted = true;
            updateData.trialExpiresAt = expiresAt;
          }

          await adminDb.collection('users').doc(userId).update(updateData);
          console.log(`Usuário ${userId} ativado com validade (incl. grace period) até ${expiresAt.toLocaleString()}${isTrial ? ' (Em período de Teste/Trial)' : ''}`);

          // Buscar dados do usuário no Firestore para a notificação
          let userData: any = null;
          try {
            const userDoc = await adminDb.collection('users').doc(userId).get();
            userData = userDoc.exists ? userDoc.data() : null;
          } catch (err) {
            console.error('Erro ao buscar dados do usuário no Firestore para notificação:', err);
          }

          const userName = userData?.displayName || userData?.name || 'Artesão(ã)';
          const userEmail = userData?.email || session.customer_details?.email || 'N/A';
          const userPhone = userData?.phone || userData?.whatsapp || session.customer_details?.phone || 'Não informado';

          if (isTrial) {
            try {
              await notifyTrialStartedAction({
                name: userName,
                email: userEmail,
                phone: userPhone
              });
              console.log(`Notificação de trial enviada ao Discord para o usuário: ${userId}`);
            } catch (err) {
              console.error('Erro ao enviar notificação de trial para o Discord no webhook da Stripe:', err);
            }
          } else {
            try {
              const isAnnual = subscription.plan?.id === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANUAL;
              const planName = isAnnual ? 'AtelierFlow Pro - Anual' : 'AtelierFlow Pro - Mensal';
              const priceAmount = isAnnual ? 'R$ 859,00/ano' : 'R$ 62,00/mês';

              await notifyPurchaseAction({
                name: userName,
                email: userEmail,
                phone: userPhone,
                plan: planName,
                amount: priceAmount
              });
              console.log(`Notificação de nova compra direta enviada ao Discord para o usuário: ${userId}`);
            } catch (err) {
              console.error('Erro ao enviar notificação de compra para o Discord no webhook da Stripe:', err);
            }
          }
        }
        break;
      }
      case 'invoice.payment_succeeded':
      case 'invoice.paid': {
        const invoice = event.data.object as any;
        const stripeCustomerId = invoice.customer as string;
        const stripeSubscriptionId = invoice.subscription as string;

        console.log(`Recebido evento de fatura paga. Customer: ${stripeCustomerId}`);

        if (stripeCustomerId) {
          const usersRef = adminDb.collection('users');
          const snapshot = await usersRef.where('stripeCustomerId', '==', stripeCustomerId).get();
          
          if (!snapshot.empty) {
            const userDoc = snapshot.docs[0];
            const userData = userDoc.data();
            
            // Pega a data final do período da fatura e adiciona 24h de margem
            const periodEnd = invoice.lines.data[0]?.period?.end;
            const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;
            const expiresAt = periodEnd 
              ? new Date((periodEnd * 1000) + GRACE_PERIOD_MS) 
              : new Date(Date.now() + 32 * 24 * 60 * 60 * 1000);

            await userDoc.ref.update({
              status: 'active',
              stripeSubscriptionId,
              subscriptionProvider: 'stripe',
              expiresAt: expiresAt,
            });
            console.log(`Fatura confirmada: Usuário ${userDoc.id} renovado até ${expiresAt.toLocaleString()}`);

            // Enviar notificação se for cobrança recorrente (subscription_cycle) ou transição de trial
            // Evitamos notificar se for a fatura inicial de criação de assinatura (que já notificamos no checkout.session.completed)
            const billingReason = invoice.billing_reason;
            const isRecurrentOrTrialEnd = billingReason === 'subscription_cycle' || billingReason === 'subscription_threshold' || billingReason === 'subscription_update';
            const amountPaid = invoice.amount_paid ? invoice.amount_paid / 100 : 0;

            if (isRecurrentOrTrialEnd && amountPaid > 0) {
              try {
                const planId = invoice.lines.data[0]?.price?.id;
                const isAnnual = planId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANUAL;
                const planName = isAnnual ? 'AtelierFlow Pro - Anual (Renovação)' : 'AtelierFlow Pro - Mensal (Renovação)';
                const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amountPaid);

                await notifyPurchaseAction({
                  name: userData?.displayName || userData?.name || 'Artesão(ã)',
                  email: userData?.email || 'N/A',
                  phone: userData?.phone || userData?.whatsapp || 'Não informado',
                  plan: planName,
                  amount: `${priceFormatted} (${billingReason === 'subscription_cycle' ? 'Ciclo normal' : 'Conversão de Trial'})`
                });
                console.log(`Notificação de pagamento recorrente enviada ao Discord para o usuário: ${userDoc.id}`);
              } catch (err) {
                console.error('Erro ao enviar notificação de renovação de pagamento para o Discord:', err);
              }
            }
          } else {
              console.log(`Usuário com Customer ID ${stripeCustomerId} ainda não mapeado no Firestore.`);
          }
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubscriptionId = (invoice as any).subscription as string;
        
        if (stripeSubscriptionId) {
            const usersRef = adminDb.collection('users');
            const snapshot = await usersRef.where('stripeSubscriptionId', '==', stripeSubscriptionId).get();
            if (!snapshot.empty) {
                // Poderíamos marcar o usuário com status: 'inactive' ou pendente
                console.log(`Pagamento falhou para a assinatura: ${stripeSubscriptionId}`);
            }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = subscription.id;
        if (stripeSubscriptionId) {
            const usersRef = adminDb.collection('users');
            const snapshot = await usersRef.where('stripeSubscriptionId', '==', stripeSubscriptionId).get();
            if (!snapshot.empty) {
                const userDoc = snapshot.docs[0];
                await userDoc.ref.update({
                    status: 'inactive'
                });
                console.log(`Assinatura cancelada, acesso inativado para ID: ${userDoc.id}`);
            }
        }
        break;
      }
      default:
        console.log(`Tipo de evento não processado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('ERRO CRÍTICO NO WEBHOOK:', err);
    return NextResponse.json({ error: `Webhook Handler Error: ${err.message}` }, { status: 500 });
  }
}
