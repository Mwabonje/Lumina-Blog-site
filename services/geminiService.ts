import { GoogleGenAI, Type } from '@google/genai';
import { AISuggestion } from '../types';

// Lazy initialize the client to prevent immediate crashes if env var is missing
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. AI features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSEOSuggestions = async (content: string): Promise<AISuggestion> => {
  const ai = getAIClient();
  if (!ai) {
    throw new Error("API Key missing. Please configure process.env.API_KEY");
  }

  const model = "gemini-3-flash-preview";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze the following blog content and generate SEO metadata. 
      Content: ${content.substring(0, 5000)}...`, // Truncate to avoid huge context usage
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A catchy, SEO-optimized title (max 60 chars)" },
            excerpt: { type: Type.STRING, description: "A compelling summary (max 160 chars)" },
            seo: {
              type: Type.OBJECT,
              properties: {
                metaTitle: { type: Type.STRING },
                metaDescription: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                ogTitle: { type: Type.STRING },
                ogDescription: { type: Type.STRING }
              },
              required: ["metaTitle", "metaDescription", "keywords"]
            }
          },
          required: ["title", "excerpt", "seo"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as AISuggestion;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate AI suggestions");
  }
};