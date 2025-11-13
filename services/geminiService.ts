import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateCode = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.reject(new Error("API key not configured."));
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert game development assistant for 'DSE', a Lua-based engine that mirrors the Roblox API.
- Provide only clean, directly usable Lua code. Do not use markdown code fences.
- The game object is the root, e.g., 'game.Workspace' or 'game.ReplicatedStorage'.
- Scripts have access to a 'script' variable, and its parent via 'script.Parent'.
- Events are connected using a colon, like 'part.Touched:Connect(function(hit) ... end)'.
- Use services like 'game:GetService("TweenService")'.
- Be concise. For example, to make a part named 'Spinner' rotate constantly, you would write:
-- This script should be inside the 'Spinner' part.
local part = script.Parent
local RunService = game:GetService("RunService")

RunService.Heartbeat:Connect(function(deltaTime)
    part.CFrame = part.CFrame * CFrame.Angles(0, math.rad(90 * deltaTime), 0)
end)`,
        temperature: 0.4,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 1024,
      }
    });

    const text = response.text.trim();
    
    // Clean up potential markdown code fences that might slip through
    if (text.startsWith('```lua')) {
        return text.replace('```lua', '').replace('```', '').trim();
    }
    if (text.startsWith('```')) {
        return text.replace('```', '').replace('```', '').trim();
    }
    
    return text;

  } catch (error) {
    console.error("Error generating code with Gemini:", error);
    return Promise.reject(new Error("Failed to generate code."));
  }
};


export const generateTexture = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.reject(new Error("API key not configured."));
  }
  
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image was generated.");

  } catch(error) {
    console.error("Error generating texture with Gemini:", error);
    return Promise.reject(new Error("Failed to generate texture."));
  }
};