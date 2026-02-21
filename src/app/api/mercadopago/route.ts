import { NextRequest, NextResponse } from 'next/server';
import '@/lib/load-env'; // Carrega as variáveis de ambiente

// Tipos de Planos - Foco em Mensal e Anual conforme nova estratégia
type Plan = 'mensal' | 'anual';

interface PlanDetails {
  title: string;
  price: number;
}

// Detalhes dos planos atualizados para garantir 2 meses de desconto no anual
const plans: Record<Plan, PlanDetails> = {
  mensal: { title: 'Plano Mensal - AtelierFlow', price: 99.90 },
  anual: { title: 'Plano Anual - AtelierFlow', price: 990.00 },
};

export async function POST(request: NextRequest) {
  const { plan, userId, userEmail } = await request.json() as { plan: Plan; userId: string; userEmail?: string };

  if (!plan || !plans[plan] || !userId) {
    return NextResponse.json({ error: 'Plano ou ID de usuário inválido' }, { status: 400 });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('[ERRO MP] Access Token não encontrado nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Erro de configuração no servidor.' }, { status: 500 });
  }

  const selectedPlan = plans[plan];
  
  // Use a test user email in development to ensure test cards work for guest checkouts
  const isDevelopment = process.env.NODE_ENV === 'development';
  const payerEmail = isDevelopment ? 'test_user_12345678@testuser.com' : userEmail;

  const preferencePayload = {
    items: [
      {
        id: plan,
        title: selectedPlan.title,
        quantity: 1,
        unit_price: selectedPlan.price,
        currency_id: 'BRL',
      },
    ],
    payer: {
      email: payerEmail,
    },
    external_reference: userId,
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      failure: `${process.env.NEXT_PUBLIC_APP_URL}/ativacao`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/ativacao`,
    },
    auto_return: 'approved',
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
    // Configuração para garantir que o parcelamento em 12x esteja disponível
    // O custo do parcelamento sem juros deve ser configurado no painel do Mercado Pago
    payment_methods: {
      installments: 12,
      default_installments: plan === 'anual' ? 12 : 1,
    }
  };

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferencePayload),
    });

    const data = await response.json();

    if (!response.ok || !data.init_point) {
        console.error('[ERRO MP] Falha ao criar preferência:', data);
        throw new Error(data.message || 'Erro da API do Mercado Pago');
    }

    return NextResponse.json({ init_point: data.init_point });

  } catch (error) {
    console.error('[ERRO MP] Falha catastrófica ao criar preferência:', error);
    return NextResponse.json({ error: 'Falha ao comunicar com o Mercado Pago.' }, { status: 500 });
  }
}
