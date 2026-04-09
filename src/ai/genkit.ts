import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // Utilizando Gemma 3 para chamadas gratuitas em tarefas básicas
  model: 'googleai/gemma-3-1b-it', // Ou gemma-3-27b-it se precisar de mais potência
});
