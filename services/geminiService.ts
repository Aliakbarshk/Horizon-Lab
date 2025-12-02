import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, Character } from "../types";

// Initialize Gemini Client
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
            Also note the lighting style if consistent.
            Focus on consistent details that can be used to recreate this character in different settings. 
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

interface GenOptions {
  negativePrompt?: string;
  character?: Character;
  referenceImage?: string; // Background/Structure
  styleReferenceImage?: string; // New: Style/Vibe Reference
  guidance?: number;
  seed?: number;
  lighting?: string;
  camera?: string;
  colorGrade?: string;
}

/**
 * Generates an image using Nano Banana (Flash Image) with advanced consistency options.
 * Supports utilizing both a Character Reference and a Background Reference simultaneously.
 */
export const generateCreativeImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  style: string,
  options: GenOptions = {}
): Promise<string> => {
  try {
    const parts: any[] = [];
    
    // Explicit Aspect Ratio Prompt Injection
    const arKeywords: Record<string, string> = {
        '16:9': "cinematic wide screen 16:9 shot",
        '9:16': "tall vertical 9:16 social media story format, full body shot",
        '1:1': "square 1:1 instagram format",
        '4:3': "standard 4:3 photography format",
        '3:4': "vertical 3:4 portrait format"
    };
    const arPrompt = arKeywords[aspectRatio] || "";

    // Style Specific Keywords mapping
    const styleKeywords: Record<string, string> = {
        'Pixar 3D': "Disney Pixar animation style, 3D render, unreal engine 5, cute, vibrant saturated colors, soft rounded shapes, expressive features, cinematic lighting, high detail, masterpiece",
        'Cinematic': "Cinematic film still, 8k, highly detailed, dramatic lighting",
        'Photorealistic': "Hyper-realistic photography, 8k, raw photo",
        'Anime': "High quality anime art, Studio Ghibli style, vibrant",
    };
    const styleDescription = styleKeywords[style] || style;

    // Advanced Param Injection
    const lightingPrompt = options.lighting ? `, ${options.lighting} lighting` : "";
    const cameraPrompt = options.camera ? `, shot on ${options.camera}` : "";
    const colorPrompt = options.colorGrade ? `, ${options.colorGrade} color grading` : "";

    // -- STRICT CHARACTER DEFINITION --
    // We inject the character description FIRST so it is the primary subject.
    let characterPreamble = "";
    if (options.character) {
        characterPreamble = `MAIN SUBJECT: The character is ${options.character.name}. Visual Description: ${options.character.description}. `;
    }

    let instructions = `${characterPreamble} Style: ${styleDescription}${lightingPrompt}${cameraPrompt}${colorPrompt}. Format: ${arPrompt}.`;
    let referencesText = "";
    let refIndex = 1;

    // 1. Handle Background Reference (Priority for setting)
    if (options.referenceImage) {
        parts.push({
            inlineData: {
                mimeType: "image/png",
                data: options.referenceImage.split(",")[1] || options.referenceImage
            }
        });
        referencesText += ` [Reference Image ${refIndex}: BACKGROUND/SETTING]. `;
        instructions += ` Use Reference Image ${refIndex} as the strict background environment and lighting reference.`;
        refIndex++;
    }

    // 2. Handle Character Reference (Priority for identity)
    if (options.character) {
        parts.push({
            inlineData: {
                mimeType: "image/jpeg", // Assuming thumb is jpeg/png
                data: options.character.thumbnail.split(",")[1] || options.character.thumbnail
            }
        });
        referencesText += ` [Reference Image ${refIndex}: CHARACTER IDENTITY]. `;
        instructions += ` Use Reference Image ${refIndex} to strictly maintain the character's facial identity and physique.`;
        refIndex++;
    }

    // 3. Handle Style Reference (New)
    if (options.styleReferenceImage) {
        parts.push({
            inlineData: {
                mimeType: "image/png", 
                data: options.styleReferenceImage.split(",")[1] || options.styleReferenceImage
            }
        });
        referencesText += ` [Reference Image ${refIndex}: ART STYLE]. `;
        instructions += ` Use Reference Image ${refIndex} strictly for the art style, color palette, and rendering technique.`;
        refIndex++;
    }

    // Composition Instructions
    if (options.character && options.referenceImage) {
        instructions += " COMPOSITION: Place the Character into the Background. Ensure the character's lighting and shadows match the background environment perfectly.";
    }

    // Strict Anti-Hallucination
    instructions += " STRICT CONSTRAINT: Only generate what is explicitly described in the 'SCENE ACTION'. Do not add unrequested objects, animals (like parrots), or extra characters.";

    if (options.negativePrompt) {
        instructions += ` Avoid: ${options.negativePrompt}.`;
    }

    const finalPrompt = `${instructions} ${referencesText} \nSCENE ACTION: ${prompt}`;
    parts.push({ text: finalPrompt });

    // FAST TIMEOUT: We want < 5s if possible, but large generation can take 8-10s.
    // We set a strict 15s timeout to avoid hanging.
    const timeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 15000)
    );

    const fetchImage = async () => {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: {
            parts: parts,
          },
          config: {
            imageConfig: {
                aspectRatio: aspectRatio,
            },
          }
        });
    
        // Extract image
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
        throw new Error("No image data returned");
    }

    return await Promise.race([fetchImage(), timeout]);

  } catch (error) {
    console.error("Image generation failed:", error);
    // Return empty string instead of throwing to allow batch to continue
    return "";
  }
};

/**
 * Internal helper to process a list of prompts into images
 */
export const generateStoryFromPrompts = async (
    prompts: string[],
    character?: Character,
    backgroundRef?: string,
    styleRef?: string,
    style: string = "Cinematic",
    aspectRatio: AspectRatio = "16:9",
    advancedOptions: { lighting?: string; camera?: string; colorGrade?: string } = {},
    onProgress?: (completed: number, total: number) => void
): Promise<string[]> => {
    const BATCH_SIZE = 4; // Parallel requests
    let allImages: string[] = [];
    let completedCount = 0;

    for (let i = 0; i < prompts.length; i += BATCH_SIZE) {
        const chunk = prompts.slice(i, i + BATCH_SIZE);
        
        const chunkPromises = chunk.map(sceneAction => {
           // We do NOT modify the prompt too much here, relying on generateCreativeImage to prepend the character description
           // This ensures the user's specific action is preserved.
           return generateCreativeImage(
              sceneAction,
              aspectRatio,
              style,
              {
                  negativePrompt: 'text, watermark, blurry, distorted face, bad anatomy, extra limbs, animals, parrot, bird',
                  character: character,
                  referenceImage: backgroundRef,
                  styleReferenceImage: styleRef,
                  lighting: advancedOptions.lighting,
                  camera: advancedOptions.camera,
                  colorGrade: advancedOptions.colorGrade
              }
           );
        });
        
        const chunkResults = await Promise.all(chunkPromises);
        const validResults = chunkResults.filter(img => img !== "");
        allImages = [...allImages, ...validResults];
        
        completedCount += chunk.length;
        if (onProgress) onProgress(completedCount, prompts.length);
    }
    return allImages;
}

/**
 * Script to Storyboard Engine (Auto-Script Mode)
 */
export const generateScriptToStory = async (
    script: string,
    frameCount: number,
    character?: Character,
    backgroundRef?: string,
    styleRef?: string,
    style: string = "Cinematic",
    aspectRatio: AspectRatio = "16:9",
    advancedOptions: { lighting?: string; camera?: string; colorGrade?: string } = {},
    onProgress?: (completed: number, total: number) => void
  ): Promise<string[]> => {
    try {
      // Step 1: Analyze script to get scenes
      const analysisPrompt = `
      Break this script into exactly ${frameCount} visual scene descriptions.
      Script: "${script.substring(0, 1000)}".
      Output JSON only: { "scenes": ["scene 1 visual", ...] }
      `;

      let scenes: string[] = [];

      const performAnalysis = async () => {
         const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: analysisPrompt,
            config: { responseMimeType: "application/json" }
         });
         const data = JSON.parse(response.text || "{}");
         return data.scenes || [];
      };

      try {
        const analysisPromise = performAnalysis();
        const timeoutPromise = new Promise<string[]>((resolve) => setTimeout(() => resolve([]), 3000));
        
        const result = await Promise.race([analysisPromise, timeoutPromise]);
        
        if (result.length > 0) {
            scenes = result;
        } else {
            console.log("Analysis too slow, switching to fast split.");
            scenes = script.split(/[.!?]/).filter(s => s.trim().length > 10);
        }
      } catch (e) {
          scenes = script.split(/[.!?]/).filter(s => s.trim().length > 10);
      }

      // Normalization
      if (scenes.length === 0) scenes = [script];
      while (scenes.length < frameCount) {
          scenes.push(scenes[scenes.length % scenes.length]); // Repeat to fill
      }
      scenes = scenes.slice(0, frameCount);

      // Step 2: Use the common batch generator
      return await generateStoryFromPrompts(
          scenes, 
          character, 
          backgroundRef,
          styleRef,
          style, 
          aspectRatio, 
          advancedOptions, 
          onProgress
      );
  
    } catch (error) {
      console.error("Story generation failed:", error);
      throw error;
    }
  };

/**
 * Utility: Face Swap, Background Replacement, Upscale, Aspect Ratio Change
 */
export const editImageUtility = async (
  baseImage: string, // Base64
  operation: 'FACESWAP' | 'UPSCALE' | 'BACKGROUND' | 'ASPECT_SHIFT',
  params: { prompt?: string; secondaryImage?: string; targetAspectRatio?: AspectRatio }
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
    let configObj: any = {};
    
    switch (operation) {
      case 'FACESWAP':
         textPrompt = "Swap the face in the main image with the face provided in the context context.";
         if (params.secondaryImage) {
             parts.push({
                inlineData: {
                    mimeType: "image/png",
                    data: params.secondaryImage.split(",")[1] || params.secondaryImage
                }
             });
         }
         break;
      case 'UPSCALE':
        textPrompt = "High resolution, highly detailed, 4k remastered version of this image. Improve sharpness and details.";
        break;
      case 'BACKGROUND':
        textPrompt = params.prompt || "Change background to a clean studio setting.";
        break;
      case 'ASPECT_SHIFT':
        textPrompt = "Expand and outpaint this image to fill the new aspect ratio. Preserve the original subject composition exactly but extend the background seamlessly to fit.";
        if (params.targetAspectRatio) {
            configObj.imageConfig = { aspectRatio: params.targetAspectRatio };
        }
        break;
    }

    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts },
      config: configObj
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