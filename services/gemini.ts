import { GoogleGenAI } from "@google/genai";
import { DemoCategory } from "../types";

/**
 * Generates images using Imagen based on inputs.
 * Supports text-to-image batching.
 */
export const generateImagesBatch = async (
  prompt: string,
  category: string,
  totalCount: number
): Promise<string[]> => {
  
  // Initialize AI client lazily to avoid top-level errors if key is missing during initial load
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your settings.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  // Refine the prompt to ensure high quality demo images
  let refinedPrompt = "";
  
  if (category === DemoCategory.NONE) {
     refinedPrompt = `High quality, professional demo photo: ${prompt}. Photorealistic, well-lit, 4k resolution, commercial photography style.`;
  } else {
     refinedPrompt = `High quality, professional demo photo of ${category}: ${prompt}. Photorealistic, well-lit, 4k resolution, commercial photography style.`;
  }

  try {
    const allImages: string[] = [];

    // Use imagen-4.0-generate-001 for pure text-to-image with efficient batching
    const MAX_PER_REQUEST = 4;
    const batches = Math.ceil(totalCount / MAX_PER_REQUEST);
    const promises = [];

    for (let i = 0; i < batches; i++) {
      const countForThisBatch = Math.min(MAX_PER_REQUEST, totalCount - (i * MAX_PER_REQUEST));
      
      promises.push(
        ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: refinedPrompt,
          config: {
            numberOfImages: countForThisBatch,
            aspectRatio: '1:1',
            outputMimeType: 'image/jpeg',
          },
        })
      );
    }

    const responses = await Promise.all(promises);
    
    responses.forEach(response => {
      if (response.generatedImages) {
        response.generatedImages.forEach(img => {
          if (img.image.imageBytes) {
            allImages.push(`data:image/jpeg;base64,${img.image.imageBytes}`);
          }
        });
      }
    });

    return allImages;
  } catch (error) {
    console.error("Error generating images:", error);
    throw error;
  }
};