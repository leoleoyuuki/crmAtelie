import { GoogleGenAI } from "@google/genai";

// Usando o SDK direto do Google Generative AI (@google/genai) para garantir suporte 
// ao modelo Gemma 3 e à versão de API desejada.
export const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    apiVersion: "v1beta"
  }
});

export const DEFAULT_AI_MODEL = "gemini-3.1-flash-lite-preview";
