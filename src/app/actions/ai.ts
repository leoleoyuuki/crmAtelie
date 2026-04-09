"use server"

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const OrderExtractionSchema = z.object({
  customerName: z.string().describe("O nome do cliente mencionado no texto. Deixe vazio se não for mencionado."),
  items: z.array(z.object({
    serviceType: z.string().describe("O nome ou tipo do serviço/produto. Ex: Vestido, Saia, Caneca."),
    quantity: z.number().default(1).describe("A quantidade mencionada. Padrão é 1 se não mencionado."),
    value: z.number().default(0).describe("O valor do item em Reais (R$). Ex: 150 para cento e cinquenta reais. Se não mencionado, retorne 0."),
    description: z.string().optional().describe("Qualquer detalhe extra sobre o produto ou serviço (cores, medidas, etc)."),
  })).describe("Lista de itens do pedido. Pode ter mais de um."),
  dueDate: z.string().describe("A data de entrega mencionada, convertida para o formato yyyy-mm-dd. Se for 'amanhã', calcule a data baseada em hoje. Se não mencionada, deixe vazio."),
});

export async function processVoiceOrder(transcription: string) {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    const response = await ai.generate({
      prompt: `
        Você é um assistente de extração de dados.
        Sua tarefa é ler a transcrição e extrair os dados no formato JSON exigido.
        Hoje é ${today.toLocaleDateString('pt-BR')} (fomato JSON: ${todayStr}).
        Amanhã é ${tomorrow.toLocaleDateString('pt-BR')} (${tomorrowStr}).
        
        Texto recebido: "${transcription}"
        
        RETORNE APENAS UM JSON VÁLIDO. NENHUM TEXTO ADICIONAL ANTES OU DEPOIS. 
        NAO INCLUA MARCAÇÕES MARKDOWN.
        
        ATENÇÃO CRÍTICA SOBRE DATA DE ENTREGA:
        Se o usuário falar "para amanhã", "entregar amanhã", "para sexta", você DEVE preencher o campo "dueDate" e NUNCA colocar a data de entrega dentro de "description"!
        
        Exemplo de Retorno:
        {
          "customerName": "Maria",
          "items": [
             {
                "serviceType": "Ajuste do vestido",
                "quantity": 1,
                "value": 150,
                "description": "Apertar 5cm da barriga"
             }
          ],
          "dueDate": "${todayStr}"
        },
        {
          "customerName": "Ana",
          "items": [
             {
                "serviceType": "Bolo personalizado",
                "quantity": 1,
                "value": 150,
                "description": "Tema: Chapeuzinho Vermelho"
             }
          ],
          "dueDate": "${todayStr}"
        }
        
        Formato obrigatório:
        {
          "customerName": "Nome do cliente ou vazio se não houver",
          "items": [
             {
                "serviceType": "Tipo do serviço",
                "quantity": 1,
                "value": 150,
                "description": "Detalhes sobre o serviço ou produto. NUNCA COLOQUE DATAS DE ENTREGA NEM SE FOR POR ESCRITO (ex: para entregar dia 10) AQUI!"
             }
          ],
          "dueDate": "YYYY-MM-DD" // Data de entrega no formato YYYY-MM-DD. Se vazio, use "". preste atenção nas datas que o usuario fala ex(dia 15, dia 20 de abril, segunda que vem etc)
        }
      `,
    });

    const text = response.text;
    const jsonStr = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to process voice order:", error);
    throw new Error("Falha ao processar o áudio.");
  }
}
