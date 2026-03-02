'use server';

/**
 * @fileOverview Server actions para notificações externas (Discord, Slack, etc).
 */

const DISCORD_TRIAL_WEBHOOK = 'https://discord.com/api/webhooks/1478120844650614975/2lA_BEnFEy3GVp7XgJrKSElwD9arpE_pfb9nQmaKPJ_dTTwCV_GkS0I_74ppcihSkDiB';
const DISCORD_EXPIRED_WEBHOOK = 'https://discord.com/api/webhooks/1478125268836290633/Mlrr5SjoDBI6ZRyuu0_fSd30AYui1qatyL4ixnZNyz4f62p-n47SQcJV8bL3GpaVi1Lr';
const DISCORD_PURCHASE_WEBHOOK = 'https://discord.com/api/webhooks/1478134001188212897/3FhQdoms7MYezt8zT2nO02PeKHibGr5MS71_7CIAVThphIaZxvquIxqHPiLHx8_RRrIL';

interface TrialNotificationData {
  name: string;
  email: string;
  phone?: string;
}

interface PurchaseNotificationData {
  name: string;
  email: string;
  phone?: string;
  plan: string;
  amount?: string;
}

/**
 * Envia uma notificação formatada para o Discord quando um novo trial é iniciado.
 */
export async function notifyTrialStartedAction(data: TrialNotificationData) {
  const embed = {
    title: '🚀 Novo Trial Iniciado!',
    description: 'Um novo artesão acaba de se juntar ao AtelierFlow.',
    color: 0xD96142, // Cor primária Earthy Rust
    fields: [
      {
        name: '👤 Nome',
        value: data.name,
        inline: true,
      },
      {
        name: '📧 E-mail',
        value: data.email,
        inline: true,
      },
      {
        name: '📱 WhatsApp',
        value: data.phone || 'Não informado',
        inline: true,
      },
    ],
    footer: {
      text: 'AtelierFlow CRM • Monitor de Crescimento',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(DISCORD_TRIAL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
        console.error('[Discord Notification Error]: HTTP status', response.status);
    }
  } catch (error) {
    console.error('[Discord Notification Error]:', error);
  }
}

/**
 * Envia uma notificação formatada para o Discord quando um trial é encerrado.
 */
export async function notifyTrialExpiredAction(data: TrialNotificationData) {
  const embed = {
    title: '⏰ Trial Encerrado',
    description: 'O período de teste de um artesão chegou ao fim. Hora do follow-up!',
    color: 0x858E8A, // Cor secundária Soft Olive
    fields: [
      {
        name: '👤 Nome',
        value: data.name,
        inline: true,
      },
      {
        name: '📧 E-mail',
        value: data.email,
        inline: true,
      },
      {
        name: '📱 WhatsApp',
        value: data.phone || 'Não informado',
        inline: true,
      },
    ],
    footer: {
      text: 'AtelierFlow CRM • Gestão de Retenção',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(DISCORD_EXPIRED_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
        console.error('[Discord Notification Error]: HTTP status', response.status);
    }
  } catch (error) {
    console.error('[Discord Notification Error]:', error);
  }
}

/**
 * Envia uma notificação formatada para o Discord quando uma compra (assinatura) é realizada.
 */
export async function notifyPurchaseAction(data: PurchaseNotificationData) {
  const embed = {
    title: '💰 Nova Assinatura Realizada!',
    description: 'Um artesão acaba de se tornar assinante do AtelierFlow.',
    color: 0x22C55E, // Verde sucesso
    fields: [
      {
        name: '👤 Nome',
        value: data.name,
        inline: true,
      },
      {
        name: '📧 E-mail',
        value: data.email,
        inline: true,
      },
      {
        name: '📱 WhatsApp',
        value: data.phone || 'Não informado',
        inline: true,
      },
      {
        name: '📦 Plano',
        value: data.plan,
        inline: true,
      },
      {
        name: '💵 Valor/Tipo',
        value: data.amount || 'N/A',
        inline: true,
      },
    ],
    footer: {
      text: 'AtelierFlow CRM • Monitor de Vendas',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(DISCORD_PURCHASE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
        console.error('[Discord Purchase Error]: HTTP status', response.status);
    }
  } catch (error) {
    console.error('[Discord Purchase Error]:', error);
  }
}