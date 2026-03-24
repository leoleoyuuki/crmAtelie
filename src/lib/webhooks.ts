
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1485804265594159176/rLkxNp9nGXcQceOxo-acIoPm4TWfsw6bApxy-5k0o48j1_mb6OlJ9DMIqX06hX5qMGEq';

export async function sendLeadNotification(name: string, phone: string, source: string) {
  try {
    const payload = {
      embeds: [
        {
          title: '🆕 Novo Lead Capturado!',
          color: 0x00ff00, // Verde
          fields: [
            {
              name: '👤 Nome',
              value: name,
              inline: true,
            },
            {
              name: '📱 WhatsApp',
              value: phone,
              inline: true,
            },
            {
              name: '🛠️ Ferramenta',
              value: source,
              inline: false,
            },
            {
              name: '📅 Data/Hora',
              value: new Date().toLocaleString('pt-BR'),
              inline: false,
            },
          ],
          footer: {
            text: 'AtelierFlow Freetools',
          },
        },
      ],
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to send discord notification:', await response.text());
    }
  } catch (error) {
    console.error('Error sending lead notification:', error);
  }
}
