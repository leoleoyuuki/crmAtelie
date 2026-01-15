import { NextRequest, NextResponse } from 'next/server';
import '@/lib/load-env'; // Carrega as variáveis de ambiente

// Tipos de Planos
type Plan = 'mensal' | 'trimestral' | 'anual';

interface PlanDetails {
  title: string;
  price: number;
}

// Detalhes dos planos (preços e títulos)
const plans: Record<Plan, PlanDetails> = {
  mensal: { title: 'Plano Mensal - AtelierFlow', price: 29.90 },
  trimestral: { title: 'Plano Trimestral - AtelierFlow', price: 79.90 },
  anual: { title: 'Plano Anual - AtelierFlow', price: 299.90 },
};

export async function POST(request: NextRequest) {
  const { plan, userId } = await request.json() as { plan: Plan; userId: string };

  if (!plan || !plans[plan] || !userId) {
    return NextResponse.json({ error: 'Plano ou ID de usuário inválido' }, { status: 400 });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('[ERRO MP] Access Token não encontrado nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Erro de configuração no servidor.' }, { status: 500 });
  }

  const selectedPlan = plans[plan];
  
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
    external_reference: userId,
    purpose: 'wallet_purchase', // Essencial para sinalizar que não é de um marketplace
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      failure: `${process.env.NEXT_PUBLIC_APP_URL}/ativacao`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/ativacao`,
    },
    auto_return: 'approved',
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
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

    if (!response.ok) {
        console.error('[ERRO MP] Falha ao criar preferência (HTTP):', data);
        throw new Error(data.message || 'Erro da API do Mercado Pago');
    }

    return NextResponse.json({ id: data.id });

  } catch (error) {
    console.error('[ERRO MP] Falha catastrófica ao criar preferência:', error);
    return NextResponse.json({ error: 'Falha ao comunicar com o Mercado Pago.' }, { status: 500 });
  }
}
