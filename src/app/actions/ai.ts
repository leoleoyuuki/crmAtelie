"use server"

import { ai, DEFAULT_AI_MODEL } from '@/ai/genkit';
import { z } from 'zod';

const UniversalVoiceResponseSchema = z.object({
  operation: z.enum(['ORDER', 'SALE', 'CUSTOMER', 'PURCHASE', 'FIXED_COST'] as const)
    .describe("A operação identificada pelo comando de voz."),
  data: z.object({
    // ==== CAMPOS DE PEDIDO (ORDER) ====
    customerName: z.string().optional().describe("Nome do cliente. Ex: \"Maria\", \"João\"."),
    items: z.array(z.object({
      serviceType: z.string().describe("Nome ou tipo do serviço/produto. Ex: Vestido, Saia, Caneca."),
      quantity: z.number().default(1).describe("Quantidade do item."),
      value: z.number().default(0).describe("Valor do item em Reais (R$)."),
      description: z.string().optional().describe("Detalhes extras do produto/serviço."),
    })).optional().describe("Lista de itens (obrigatório para pedidos)."),
    dueDate: z.string().optional().describe("Data de entrega (YYYY-MM-DD). Use cálculos com base em hoje."),

    // ==== CAMPOS DE VENDA (SALE) ====
    productName: z.string().optional().describe("Nome do produto vendido."),
    price: z.number().optional().describe("Preço de venda (R$)."),
    cost: z.number().optional().describe("Custo da venda (R$). Padrão é 0 se não informado."),

    // ==== CAMPOS DE CLIENTE (CUSTOMER) ====
    phone: z.string().optional().describe("Telefone do cliente no formato (XX) XXXXX-XXXX se possível. Pode ser extraído de frases como 'telefone 11...'. Se não informado, deixe vazio."),

    // ==== CAMPOS DE COMPRA DE MATERIAIS (PURCHASE) ====
    materialName: z.string().optional().describe("Nome do material comprado (ex: Tecido algodão, Linha)."),
    quantity: z.number().optional().describe("Quantidade do material comprado. (ex: 5 para 5 metros). Padrão é 1 se omitido."),
    unit: z.string().optional().describe("Unidade de medida: ml, cm, m, unid, g, kg. Tente inferir pelo contexto."),

    // ==== CAMPOS DE CONTA/CUSTO FIXO (FIXED_COST) ====
    description: z.string().optional().describe("Descrição da conta (ex: Aluguel, Luz, Internet)."),
    // O valor será extraído pelo campo "price" ou "cost".
  }).describe("Os dados extraídos da transcrição, baseados na operação detectada.")
});

export type UniversalVoiceResponse = z.infer<typeof UniversalVoiceResponseSchema>;

export async function processUniversalVoiceCommand(transcription: string) {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    let response;
    let retries = 3;
    let delay = 1000;

    for (let i = 0; i < retries; i++) {
        try {
            const result = await ai.models.generateContent({
                model: DEFAULT_AI_MODEL,
                contents: `
        Você é um assistente cirúrgico de extração de dados e roteamento de intenções.
        Sua tarefa em duas etapas é:
        1. Classificar o que o usuário deseja fazer de acordo com o áudio. OPÇÕES:
           - ORDER: Adicionar novo pedido (serviço sob encomenda, arranjos, encomendas pendentes).
           - SALE: Registrar venda de algo pronto (ex: Vendi um vestido que já estava pronto, vendi uma caneca por...).
           - CUSTOMER: Registrar novo cliente (cadastrar um cliente, com nome e talvez telefone).
           - PURCHASE: Registrar nova compra de materiais (ex: Comprei tecido, linha, material para o ateliê).
           - FIXED_COST: Adicionar conta ou custo fixo (ex: Paguei aluguel, conta de luz).
        2. Sabendo a operação, extrair os dados corretos no objeto "data" e preencher com precisão baseando-se nas chaves disponíveis.

        Regras de Preenchimento:
        - Para ORDER: Forneça pelo menos "customerName", "items" (com "serviceType", "quantity", "value", "description") e "dueDate" (se mencionado).
        - Para SALE: Forneça "productName", "price", "customerName" (se mencionado). Costume usar o campo "price" para o que ele recebeu.
        - Para CUSTOMER: Forneça "customerName", "phone" (se mencionado).
        - Para PURCHASE: Forneça "materialName", "quantity", "unit" (infira ex: metros, kg, unid), e coloque o valor gasto em "cost".
        - Para FIXED_COST: Forneça "description" e o valor gasto em "cost.

        Hoje é ${today.toLocaleDateString('pt-BR')} (formato JSON: ${todayStr}).
        Amanhã é ${tomorrow.toLocaleDateString('pt-BR')} (${tomorrowStr}).
        Converta qualquer menção a datas para YYYY-MM-DD.

        Texto recebido: "${transcription}"

        RETORNE APENAS UM JSON VÁLIDO NO SEGUINTE FORMATO EXATO:
        {
          "operation": "ORDER | SALE | CUSTOMER | PURCHASE | FIXED_COST",
          "data": {
            // campos extraidos aqui
          }
        }
        
        NENHUM TEXTO ADICIONAL ANTES OU DEPOIS. 
        NAO INCLUA MARCAÇÕES MARKDOWN.
      `,
            });
            response = result;
            break; // Success, exit loop
        } catch (error) {
            if (i === retries - 1) throw error;
            console.warn(`Retry ${i + 1}/${retries} for AI command failed:`, error);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        }
    }

    if (!response || !response.text) {
        throw new Error("Falha ao obter resposta da IA após várias tentativas.");
    }

    const text = response.text;
    const jsonStr = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    
    // Fallback: if AI uses 'intent' instead of 'operation', fix it
    const parsed = JSON.parse(jsonStr) as any;
    if (parsed.intent && !parsed.operation) {
        parsed.operation = parsed.intent;
    }
    
    return parsed as UniversalVoiceResponse;
  } catch (error) {
    console.error("Failed to process universal voice command after retries:", error);
    throw new Error("Falha ao processar o áudio com IA.");
  }
}

// Mantendo para retrocompatibilidade caso ainda esteja sendo importado diretamente em outro lugar.
// Se soubermos que não é usado, podemos remover. Vamos manter apontando pro novo.
export async function processVoiceOrder(transcription: string) {
    console.warn("processVoiceOrder is deprecated. Use processUniversalVoiceCommand instead.");
    const res = await processUniversalVoiceCommand(transcription);
    return res.data; // Aproxima o retorno antigo. Ideal é migrar as chamadas antigas.
}
