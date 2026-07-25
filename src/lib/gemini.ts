import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

// Shared client initialization
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in the environment variables.",
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export const analyzeImageFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      imageBase64: string;
      mimeType: string;
      mode: "report" | "species";
    }) => d,
  )
  .handler(async ({ data: { imageBase64, mimeType, mode } }) => {
    try {
      const ai = getGeminiClient();
      const imagePart = {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      };

      const systemInstruction =
        mode === "species"
          ? "You are an expert ecologist specializing in the urban biodiversity of Hong Kong and Fa Hui Park (花墟公園). Analyze the image and verify if it contains a plant, flower, bird, insect, or tree species. Be strict: reject household objects, electronics, chargers, people, keyboards, or indoor home settings."
          : "You are an urban planner and environmental inspector for Fa Hui Park (花墟公園) in Hong Kong. Analyze the image and verify if it contains an environmental or public facility issue (such as littering, trash piles, plant decay, broken benches, path damage, or dead vegetation). Be strict: reject normal clean scenes, household objects, electronics, chargers, or indoor home rooms.";

      const prompt =
        mode === "species"
          ? "Analyze this image. Identify the species of plant, flower, bird, insect, or tree. You must return a JSON response with these properties:\n" +
            "- success: boolean (true only if it's a real biological species of bird, plant, flower, insect, or tree. If it's a household object, charger, or random indoor object, set to false)\n" +
            "- name: string (common English and traditional Chinese name of the species, or 'Unrecognized' if success is false)\n" +
            "- description: string (1-2 sentences in Traditional Chinese or English explaining what was detected and why it is accepted/rejected)\n" +
            "- coins: number (award 50 if success is true, otherwise 0)"
          : "Analyze this image. Identify any reportable environmental or public facility issue (e.g. litter, trash, dead plants, broken paths/benches). You must return a JSON response with these properties:\n" +
            "- success: boolean (true only if a real reportable park issue is detected. If it's a normal room or random household charger, set to false)\n" +
            "- issueType: string ('Litter/Trash', 'Plant Decay', 'Broken Facility', or 'None' if success is false)\n" +
            "- description: string (1-2 sentences in Traditional Chinese or English describing what is visible in the photo and why it's reportable or not)";

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema:
            mode === "species"
              ? {
                  type: Type.OBJECT,
                  properties: {
                    success: {
                      type: Type.BOOLEAN,
                      description:
                        "Whether a real biological species is detected.",
                    },
                    name: {
                      type: Type.STRING,
                      description:
                        "Common English and Traditional Chinese name.",
                    },
                    description: {
                      type: Type.STRING,
                      description: "Brief explanation of the result.",
                    },
                    coins: {
                      type: Type.INTEGER,
                      description:
                        "Coins/points awarded (50 if success is true, otherwise 0).",
                    },
                  },
                  required: ["success", "name", "description", "coins"],
                }
              : {
                  type: Type.OBJECT,
                  properties: {
                    success: {
                      type: Type.BOOLEAN,
                      description: "Whether a reportable issue is detected.",
                    },
                    issueType: {
                      type: Type.STRING,
                      description: "The type of environmental hazard.",
                    },
                    description: {
                      type: Type.STRING,
                      description: "Brief explanation of the report.",
                    },
                  },
                  required: ["success", "issueType", "description"],
                },
        },
      });

      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (error: any) {
      console.error("Gemini Image Analysis Error:", error);
      return {
        success: false,
        name: "Error",
        issueType: "Error",
        description: error.message || "Failed to analyze image.",
        coins: 0,
      };
    }
  });

export const transcribeAudioFn = createServerFn({ method: "POST" })
  .validator((d: { audioBase64: string; mimeType: string }) => d)
  .handler(async ({ data: { audioBase64, mimeType } }) => {
    try {
      const ai = getGeminiClient();
      const audioPart = {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      };

      const prompt =
        "Listen to this audio recorded at Fa Hui Park. Analyze if it contains bird songs, bird chirps, or other biodiversity sounds (insects, wind, leaves, water). Also transcribe any human voice if present. Return a JSON response with:\n" +
        "- success: boolean (true if genuine bird chirping, bird singing, or wildlife biodiversity sounds are heard. False if it's pure artificial playback, white noise, or silent)\n" +
        "- soundType: string (e.g. 'Eurasian Tree Sparrow Song', 'Nature Soundscape', or 'Silent/Noise' if success is false)\n" +
        "- description: string (1-2 sentences explaining what was identified in the audio)\n" +
        "- transcription: string (any transcribed speech or 'None' if no speech is heard)";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [audioPart, { text: prompt }] },
        config: {
          systemInstruction:
            "You are an expert bioacoustics researcher for Fa Hui Park. Identify local Hong Kong bird calls, insect hums, and general biodiversity soundscapes from short audio clips.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              success: { type: Type.BOOLEAN },
              soundType: { type: Type.STRING },
              description: { type: Type.STRING },
              transcription: { type: Type.STRING },
            },
            required: ["success", "soundType", "description", "transcription"],
          },
        },
      });

      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (error: any) {
      console.error("Gemini Audio Transcription Error:", error);
      return {
        success: false,
        soundType: "Error",
        description: error.message || "Failed to analyze audio.",
        transcription: "",
      };
    }
  });

export const chatWithFahyFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      messages: { role: "user" | "model" | "system"; content: string }[];
      highThinking?: boolean;
    }) => d,
  )
  .handler(async ({ data: { messages, highThinking } }) => {
    try {
      const ai = getGeminiClient();

      const systemInstruction =
        "You are FAHY (花墟智慧精靈), the friendly pixel-art guide and companion for Fa Hui Park (花墟公園) and the surrounding Mong Kok district in Hong Kong.\n" +
        "You help users learn about the park's local flora (like Winter Camellias, Banyan Trees), fauna (Eurasian Tree Sparrows, Red-whiskered Bulbuls), environmental initiatives, and local workshops.\n" +
        "Keep your tone warm, enthusiastic, and knowledgeable. Answer in the same language the user asks (Traditional Chinese or English).\n" +
        "Your answers should be highly accurate, practical, and grounded in real-world facts. Use your tools to find directions, opening hours, or species facts if needed.\n" +
        "Be compact and concise: write in short paragraphs, and use bullet points where helpful.";

      const formattedContents = messages.map((m) => ({
        role: m.role === "model" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      // Use Search Grounding with gemini-3.5-flash for real-time information when highThinking is disabled
      const tools = [{ googleSearch: {} }];
      const model = highThinking
        ? "gemini-3.1-pro-preview"
        : "gemini-3.5-flash";

      const response = await ai.models.generateContent({
        model,
        contents: formattedContents,
        config: {
          systemInstruction,
          tools: highThinking ? undefined : tools,
          thinkingConfig: highThinking
            ? { thinkingLevel: ThinkingLevel.HIGH }
            : undefined,
        },
      });

      // Extract search grounding metadata sources if available
      const chunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = chunks
        ? chunks
            .map((c: any) => ({
              uri: c.web?.uri || "",
              title: c.web?.title || c.web?.uri || "Web Source",
            }))
            .filter((s: any) => s.uri)
        : [];

      return {
        response: response.text || "Sorry, I couldn't generate a response.",
        sources,
      };
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      return {
        response:
          "Sorry, I'm having trouble connecting to my brain right now: " +
          (error.message || "Unknown error"),
        sources: [],
      };
    }
  });

export const analyzeVideoFn = createServerFn({ method: "POST" })
  .validator((d: { videoBase64: string; mimeType: string }) => d)
  .handler(async ({ data: { videoBase64, mimeType } }) => {
    try {
      const ai = getGeminiClient();
      const videoPart = {
        inlineData: {
          mimeType,
          data: videoBase64,
        },
      };

      const systemInstruction =
        "You are an expert bio-monitoring AI specializing in Hong Kong's urban parks (such as Fa Hui Park) and cultural environments. " +
        "Analyze the uploaded video for key ecological or community findings (such as bird movements, insect flight, plant conditions, weather elements, visitor activity, or public space maintenance).";

      const prompt =
        "Perform a comprehensive video analysis. Look for species of plants, flowers, birds, or insects, and inspect any environmental threats, littering, foliage health, or community activities. " +
        "You must return a JSON response with these properties:\n" +
        "- success: boolean (true if the video contains readable frames related to natural/park scenes, wildlife, or municipal environments)\n" +
        "- title: string (a short, descriptive title of what was captured, e.g. 'Foliage Inspection' or 'Wildlife Activity')\n" +
        "- keyFindings: string[] (at least 3 detailed bullet points describing your observations across the clip)\n" +
        "- recommendation: string (1-2 sentences with concrete eco-friendly recommendations or park maintenance suggestions based on the video content)";

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: { parts: [videoPart, { text: prompt }] },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              success: { type: Type.BOOLEAN },
              title: { type: Type.STRING },
              keyFindings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendation: { type: Type.STRING },
            },
            required: ["success", "title", "keyFindings", "recommendation"],
          },
        },
      });

      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (error: any) {
      console.error("Gemini Video Analysis Error:", error);
      return {
        success: false,
        title: "Video Parsing Failed",
        keyFindings: [
          "Error: " + (error.message || "Failed to analyze video clip."),
        ],
        recommendation:
          "Please try uploading a different video format or clip.",
      };
    }
  });

export const verifyArtisanSignFn = createServerFn({ method: "POST" })
  .validator(
    (d: { imageBase64: string; mimeType: string; category: string }) => d,
  )
  .handler(async ({ data: { imageBase64, mimeType, category } }) => {
    try {
      const ai = getGeminiClient();
      const imagePart = {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      };

      const systemInstruction =
        "You are an expert cultural heritage inspector specializing in traditional Hong Kong crafts and Mong Kok artisan shops. " +
        "Analyze the image and verify if it represents an authentic storefront, plaque, workshop interior, or handcraft object associated with: " +
        category +
        ".\n" +
        "Be strict: reject unrelated random household environments, chargers, plain walls, keyboards, or generic computer screens.";

      const prompt =
        "Analyze this image. Identify if it represents or contains elements of a traditional " +
        category +
        " workshop/shop or handcrafted work in Hong Kong.\n" +
        "You must return a JSON response with these properties:\n" +
        "- success: boolean (true only if it genuinely relates to " +
        category +
        " like teaware/tea leaves for Tea Master, deep blue indigo dyes/patterns for Indigo Artisan, bamboo strips/baskets for Bamboo Weaver, etc. Otherwise false)\n" +
        "- feedback: string (1-2 sentences in Traditional Chinese or English explaining what was observed and whether it matches the craft or why it is rejected)";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              success: {
                type: Type.BOOLEAN,
                description:
                  "Whether the image is verified to relate to the artisan category.",
              },
              feedback: {
                type: Type.STRING,
                description: "Detailed feedback on the verification.",
              },
            },
            required: ["success", "feedback"],
          },
        },
      });

      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (error: any) {
      console.error("Gemini Artisan Verification Error:", error);
      return {
        success: false,
        feedback: "Error: " + (error.message || "Failed to analyze image."),
      };
    }
  });
