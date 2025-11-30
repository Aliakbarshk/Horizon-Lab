import { GoogleGenAI } from "@google/genai";
import { AspectRatio, Character } from "../types";

// Initialize Gemini Client
// NOTE: In a real Next.js app, this would be a server action to hide the key.
// Here we use it client-side as per the restricted environment instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Simulates "training" a character by analyzing uploaded reference images
 * to create a dense visual description (System Prompt).
 */
export const trainCharacterIdentity = async (
  name: string,
  imageDatas: string[] // Base64 strings
): Promise<Character> => {
  try {
    const parts = imageDatas.map((data) => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: data.split(",")[1] || data, // Ensure clean base64
      },
    }));

    // We use the vision model to analyze the face/character
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        role: "user",
        parts: [
          ...parts,
          {
            text: `Analyze these images of a specific character named "${name}". 
            Provide a highly detailed visual description of their physical features, 
            face structure, hair, typical clothing style, and vibe. 
            Focus on consistent details that can be used to recreate this character. 
            Keep it under 100 words.`,
          },
        ],
      },
    });

    const description = response.text || `A character named ${name}`;
    
    return {
      id: crypto.randomUUID(),
      name,
      description,
      thumbnail: imageDatas[0], // Use first image as thumb
    };
  } catch (error) {
    console.error("Training failed:", error);
    throw new Error("Failed to analyze character identity.");
  }
};

/**
 * Generates an image using Nano Banana (Flash Image) or Pro Image
 */
export const generateCreativeImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  negativePrompt?: string,
  characterDescription?: string,
  style?: string
): Promise<string> => {
  try {
    // Construct the enhanced prompt
    let finalPrompt = prompt;
    
    if (style) {
      finalPrompt = `${style} style. ${finalPrompt}`;
    }
    
    if (characterDescription) {
      finalPrompt = `Character: ${characterDescription}. Context: ${finalPrompt}`;
    }

    if (negativePrompt) {
      finalPrompt = `${finalPrompt} --no ${negativePrompt}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image", // Nano Banana mapping
      contents: {
        parts: [{ text: finalPrompt }],
      },
      config: {
        imageConfig: {
            aspectRatio: aspectRatio,
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

/**
 * Utility: Face Swap or Background Replacement via Image Editing
 */
export const editImageUtility = async (
  baseImage: string, // Base64
  operation: 'FACESWAP' | 'UPSCALE' | 'BACKGROUND',
  params: { prompt?: string; secondaryImage?: string }
): Promise<string> => {
  try {
    const parts: any[] = [
      {
        inlineData: {
          mimeType: "image/png",
          data: baseImage.split(",")[1] || baseImage,
        },
      },
    ];

    let textPrompt = "";
    
    switch (operation) {
      case 'FACESWAP':
         textPrompt = "Swap the face in the main image with the face provided in the context context.";
         if (params.secondaryImage) {
             // Gemini 2.5 Flash Image supports multiple image inputs for context
             parts.push({
                inlineData: {
                    mimeType: "image/png",
                    data: params.secondaryImage.split(",")[1] || params.secondaryImage
                }
             });
         }
         break;
      case 'UPSCALE':
        textPrompt = "High resolution, highly detailed, 4k remastered version of this image.";
        break;
      case 'BACKGROUND':
        textPrompt = params.prompt || "Change background to a clean studio setting.";
        break;
    }

    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Editing failed");

  } catch (error) {
    console.error("Utility op failed:", error);
    throw error;
  }
};

/**
 * Autocoding Service
 */
export const generateComponentCode = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a single-file React Functional Component using Tailwind CSS based on this request: "${prompt}". 
      Return ONLY the code within a markdown code block. Do not add explanations.`,
    });
    
    return response.text || "// Failed to generate code";
  } catch (error) {
    console.error("Code gen failed:", error);
    return "// Error generating code";
  }
};
