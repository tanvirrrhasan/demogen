import { GoogleGenAI } from "@google/genai";
import { DemoCategory } from "../types";

/**
 * Generates images using Gemini Flash Image model.
 * This model is chosen because it is generally accessible without strict billing requirements
 * unlike the Imagen standalone models.
 */
export const generateImagesBatch = async (
  prompt: string,
  category: string,
  totalCount: number
): Promise<string[]> => {
  
  // Initialize AI client lazily
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your settings in Vercel.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  let refinedPrompt = "";
  if (category === DemoCategory.NONE) {
     refinedPrompt = `Generate a high quality, professional demo photo: ${prompt}. Photorealistic, 4k resolution.`;
  } else {
     refinedPrompt = `Generate a high quality, professional demo photo of ${category}: ${prompt}. Photorealistic, 4k resolution.`;
  }

  try {
    const promises = [];

    // gemini-2.5-flash-image generates 1 image per request via generateContent.
    // We run parallel requests to generate the requested batch size.
    for (let i = 0; i < totalCount; i++) {
      promises.push(
        ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: refinedPrompt,
          config: {
            imageConfig: {
              aspectRatio: '1:1'
            }
          },
        })
      );
    }

    const responses = await Promise.all(promises);
    const allImages: string[] = [];
    
    responses.forEach(response => {
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          // Check for inline data (image)
          if (part.inlineData && part.inlineData.data) {
            allImages.push(`data:image/png;base64,${part.inlineData.data}`);
          }
        }
      }
    });

    if (allImages.length === 0) {
      throw new Error("No images were returned by the model.");
    }

    return allImages;
  } catch (error: any) {
    console.error("Error generating images:", error);
    // Provide a user-friendly error message if it's a permission/billing issue
    if (error.message?.includes('400') || error.message?.includes('billed') || error.message?.includes('PERMISSION_DENIED')) {
       throw new Error("API Error: Ensure your API key is valid. If using a free key, limits may apply.");
    }
    throw error;
  }
};