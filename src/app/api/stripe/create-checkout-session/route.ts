import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const { priceId, userId, userEmail } = await req.json();

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios faltando: priceId, userId, ou userEmail' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ativacao/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ativacao`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout da Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
