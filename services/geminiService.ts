
import { GoogleGenAI } from "@google/genai";

export const generateMockResult = async (toolName: string, query: string) => {
  try {
    // Fix: Instantiate the GoogleGenAI client right before the API call to ensure use of the correct environment key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um resultado de consulta de dados fictício mas realista para a ferramenta "${toolName}" usando o parâmetro "${query}". Retorne um objeto JSON formatado.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return { error: "Não foi possível processar a consulta agora." };
  }
};
