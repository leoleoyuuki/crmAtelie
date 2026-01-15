import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
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

  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  const selectedPlan = plans[plan];

  try {
    const response = await preference.create({
      body: {
        items: [
          {
            id: plan,
            title: selectedPlan.title,
            quantity: 1,
            unit_price: selectedPlan.price,
            currency_id: 'BRL',
          },
        ],
        // O external_reference é crucial para sabermos qual usuário pagou
        external_reference: userId, 
        purpose: 'wallet_purchase',
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/ativacao`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/ativacao`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
      },
    });

    return NextResponse.json({ id: response.id });
  } catch (error) {
    console.error('[ERRO MP] Falha ao criar preferência:', error);
    return NextResponse.json({ error: 'Falha ao comunicar com o Mercado Pago.' }, { status: 500 });
  }
}
