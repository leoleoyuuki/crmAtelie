'use server';

/**
 * @fileOverview Server actions para notificações externas (Discord, Slack, etc).
 */

const DISCORD_TRIAL_WEBHOOK = 'https://discord.com/api/webhooks/1478120844650614975/2lA_BEnFEy3GVp7XgJrKSElwD9arpE_pfb9nQmaKPJ_dTTwCV_GkS0I_74ppcihSkDiB';

interface TrialNotificationData {
  name: string;
  email: string;
  phone?: string;
}

/**
 * Envia uma notificação formatada para o Discord quando um novo trial é iniciado.
 */
export async function notifyTrialStartedAction(data: TrialNotificationData) {
  const embed = {
    title: '🚀 Novo Trial Iniciado!',
    description: 'Um novo artesão acaba de se juntar ao AtelierFlow.',
    color: 0xD96142, // Cor primária Earthy Rust em Hex (Decimal: 14246210)
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
