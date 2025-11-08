
import { GoogleGenAI, Modality } from "@google/genai";
import { ForesightReport, Trend, Scenario, Vision } from '../types';

export interface EditedImage {
    imageUrl: string;
    base64ImageData: string;
    mimeType: string;
}

const buildPrompt = (strategicQuestion: string): string => {
  return `You are a world-class senior strategic foresight analyst co-pilot at the Centaurion Institute, reporting directly to Malik Palamar Lead Futurist. Your expertise lies in identifying non-obvious, weak signals at the fringe and synthesizing them into actionable, data-driven insights. You are rigorous, evidence-based, and allergic to mainstream hype.

Your task is to execute the first three steps of the FTI Strategic Foresight Funnel for the following strategic question. You will use real-time Google Search as your primary data collection tool and the CIPHER framework for analysis.

**Strategic Question:**
"${strategicQuestion}"

**Execution Steps & Constraints:**

1.  **Acknowledge the Frame:** Begin by restating the strategic question to confirm your focus.

2.  **Discover Weak Signals:**
    *   Activate your Google Search tool to find a minimum of 10 distinct, high-quality "weak signals."
    *   Prioritize sources from the last 12-18 months.
    *   Avoid generic, mainstream news headlines from major outlets (e.g., NYT, BBC). Instead, focus on niche industry publications, scientific journals (e.g., Nature, arXiv), university research announcements, recently filed patents, venture capital funding news for novel startups, and influential expert blogs.
    *   For each signal, you MUST provide a concise description, the full title of the source page, and the verifiable URI.

3.  **Analyze Signals with the CIPHER Framework:**
    *   Rigorously analyze the collected signals through the lens of the FTI CIPHER framework.
    *   Provide distinct, insightful analysis for EACH of the six categories: Contradictions, Inflections, Practices, Hacks, Extremes, and Rarities.
    *   Do not invent analysis; every point in your CIPHER analysis must be directly supported by one or more of the signals you discovered.
    *   Provide at least 2-3 bullet points of analysis for each CIPHER category. If no signals apply to a category, state "No significant signals identified for this category."

4.  **Synthesize Emerging Trends:**
    *   Based *only* on the signals discovered and the patterns identified in your CIPHER analysis, synthesize 3-5 emerging macro trends.
    *   For each trend, provide a concise, powerful name (e.g., "The Sentient Workplace," "Algorithmic Management," "Decentralized Corporate Nations").
    *   For each trend, write a detailed description (2-3 sentences) explaining what it is, what's driving it (based on your signals), and its potential future impact.

**Output Format:**
Your entire response MUST be a single, valid, minified JSON object. There must be NO markdown formatting (like \`\`\`json), code comments, or any explanatory text outside of the JSON structure itself.

**Required JSON Schema:**
{
  "strategicQuestion": "The user's original strategic question.",
  "discoveredSignals": [
    {
      "signal": "A brief, one-sentence description of the weak signal.",
      "sourceTitle": "The full title of the source article or page.",
      "sourceUri": "The complete, functional URL of the source."
    }
  ],
  "cipherAnalysis": {
    "contradictions": ["Analysis point 1.", "Analysis point 2."],
    "inflections": ["Analysis point 1.", "Analysis point 2."],
    "practices": ["Analysis point 1.", "Analysis point 2."],
    "hacks": ["Analysis point 1.", "Analysis point 2."],
    "extremes": ["Analysis point 1.", "Analysis point 2."],
    "rarities": ["Analysis point 1.", "Analysis point 2."]
  },
  "emergingTrends": [
    {
      "trend": "The concise name of the emerging trend.",
      "description": "A detailed, 2-3 sentence description of the trend, its drivers, and potential impact, based on the CIPHER analysis."
    }
  ]
}
`;
};

const parseJsonResponse = <T>(text: string): T => {
  try {
    // The model can sometimes return the JSON wrapped in ```json ... ```.
    // It can also sometimes include text before or after the JSON.
    // This function attempts to find the start and end of the JSON object/array and parse it.
    
    const startIndex = text.indexOf('{');
    const startArrayIndex = text.indexOf('[');
    
    let actualStartIndex = -1;

    if (startIndex !== -1 && startArrayIndex !== -1) {
        actualStartIndex = Math.min(startIndex, startArrayIndex);
    } else if (startIndex !== -1) {
        actualStartIndex = startIndex;
    } else {
        actualStartIndex = startArrayIndex;
    }

    if (actualStartIndex === -1) {
        throw new Error("No JSON object or array found in the response.");
    }
    
    const endIndex = text.lastIndexOf('}');
    const endArrayIndex = text.lastIndexOf(']');
    
    const actualEndIndex = Math.max(endIndex, endArrayIndex);
    
    if (actualEndIndex === -1) {
        throw new Error("JSON object or array not properly closed.");
    }

    const jsonString = text.substring(actualStartIndex, actualEndIndex + 1);
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON:", text, error);
    throw new Error("Failed to parse the analysis from the AI. The response might not be valid JSON.");
  }
};

export const generateForesightAnalysis = async (strategicQuestion: string): Promise<{ report: ForesightReport; prompt: string }> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = buildPrompt(strategicQuestion);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    
    if (!text) {
      console.error("Gemini response did not contain text.", response);
      if (response.promptFeedback?.blockReason) {
        throw new Error(`Request was blocked due to ${response.promptFeedback.blockReason}. Please adjust your query.`);
      }
      throw new Error("The AI returned an empty response. Please try again.");
    }
    
    const report = parseJsonResponse<ForesightReport>(text);
    
    // Supplement report signals with grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && report.discoveredSignals) {
       report.discoveredSignals = report.discoveredSignals.map((signal, index) => {
         const chunk = groundingChunks[index]?.web;
         if(chunk && !signal.sourceUri) {
            return {
              ...signal,
              sourceTitle: signal.sourceTitle || chunk.title,
              sourceUri: chunk.uri,
            };
         }
         return signal;
       });
    }

    return { report, prompt };
  } catch (error) {
    console.error("Error in generateForesightAnalysis:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred during foresight analysis.");
  }
};

export const generateScenarios = async (trends: Trend[]): Promise<Scenario[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const trendsString = trends.map(t => `**${t.trend}:** ${t.description}`).join('\n');

    const prompt = `
You are a master scenario planner and futurist. Your task is to take a set of emerging trends and project them into the future, creating a set of distinct, plausible, and thought-provoking scenarios.

**Input Trends:**
${trendsString}

**Task:**
Based on the trends provided, generate exactly 3 distinct future scenarios. For each scenario, provide:
1.  A compelling title.
2.  A rich, narrative description (3-4 sentences) of what this future looks like in 10-15 years.
3.  A bulleted list of 3-4 key implications or characteristics of this scenario.

**Scenarios to Generate:**
1.  **A Baseline / "Expected" Future:** What is the most likely outcome if trends continue on their current trajectory?
2.  **An Optimistic / "Transformative" Future:** What is a plausible best-case outcome where the positive aspects of the trends are maximized?
3.  **A Challenging / "Pessimistic" Future:** What is a plausible worst-case outcome where the negative aspects of the trends create significant challenges?

**Output Format:**
Your entire response MUST be a single, valid JSON array containing exactly three objects, one for each scenario. There must be NO markdown formatting, code comments, or any explanatory text outside of the JSON structure itself. Ensure the JSON is well-formed.

**Required JSON Schema (Array of 3 objects):**
[
  {
    "title": "Title of Scenario 1",
    "narrative": "A 3-4 sentence narrative description of this future.",
    "implications": [
      "First key implication.",
      "Second key implication.",
      "Third key implication."
    ]
  },
  {
    "title": "Title of Scenario 2",
    "narrative": "A 3-4 sentence narrative description of this future.",
    "implications": [
      "First key implication.",
      "Second key implication.",
      "Third key implication."
    ]
  },
  {
    "title": "Title of Scenario 3",
    "narrative": "A 3-4 sentence narrative description of this future.",
    "implications": [
      "First key implication.",
      "Second key implication.",
      "Third key implication."
    ]
  }
]
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text = response.text;
        if (!text) {
            throw new Error("The AI returned an empty response for scenarios.");
        }
        return parseJsonResponse<Scenario[]>(text);
    } catch (error) {
        console.error("Error generating scenarios:", error);
        throw new Error("An error occurred while generating future scenarios.");
    }
};


export const generateVision = async (selectedElements: string[], userPrompt: string): Promise<Vision> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const elementsString = selectedElements.map(e => `- ${e}`).join('\n');

    try {
        // Step 1: Generate the vision statement using a text model.
        const statementPrompt = `
You are a visionary strategist. Your task is to synthesize a collection of desirable future concepts into a single, compelling vision statement.

**Input - Desirable Future Elements:**
${elementsString}

${userPrompt ? `**User Guidance for the Vision:**\n${userPrompt}` : ''}

**Task:**
Synthesize the desirable future elements above, keeping the user's guidance in mind if provided, into a single, short, inspiring, and powerful vision statement (2-3 sentences). This statement should encapsulate the core essence of the preferred future these elements describe. Your output should be ONLY the vision statement text, with no extra formatting, labels, or explanations.
`;

        const statementResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: statementPrompt,
        });

        const statement = statementResponse.text?.trim();

        if (!statement) {
            if (statementResponse.promptFeedback?.blockReason) {
                throw new Error(`Vision statement generation was blocked: ${statementResponse.promptFeedback.blockReason}. Please adjust your query.`);
            }
            throw new Error("The AI failed to generate a vision statement.");
        }

        // Step 2: Generate the image using the vision statement.
        const imagePrompt = `
Generate a symbolic, abstract, and highly aesthetic image that visually represents the following vision. The image should be inspiring and evoke feelings of optimism, innovation, and progress. It should not be a literal depiction but a beautiful, metaphorical interpretation.

**Vision:** "${statement}"

${userPrompt ? `**User's Creative Direction for Image Style:** "${userPrompt}"` : ''}
`;

        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: imagePrompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        let imageUrl = '';
        let base64ImageData = '';
        let mimeType = '';

        const parts = imageResponse.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    base64ImageData = part.inlineData.data;
                    mimeType = part.inlineData.mimeType;
                    imageUrl = `data:${mimeType};base64,${base64ImageData}`;
                    break; // Found the image
                }
            }
        }

        if (!imageUrl) {
            if (imageResponse.promptFeedback?.blockReason) {
                throw new Error(`Vision image generation was blocked: ${imageResponse.promptFeedback.blockReason}. Please adjust your query.`);
            }
            throw new Error("The AI failed to generate a vision image.");
        }
        
        return { statement, imageUrl, base64ImageData, mimeType };

    } catch (error) {
        console.error("Error generating vision:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An error occurred while generating the vision and image.");
    }
};

export const editVisionImage = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string
): Promise<EditedImage> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        let newImageUrl = '';
        let newBase64ImageData = '';
        let newMimeType = '';

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    newBase64ImageData = part.inlineData.data;
                    newMimeType = part.inlineData.mimeType;
                    newImageUrl = `data:${newMimeType};base64,${newBase64ImageData}`;
                    break;
                }
            }
        }
        
        if (!newImageUrl) {
            if (response.promptFeedback?.blockReason) {
                throw new Error(`Image editing was blocked: ${response.promptFeedback.blockReason}.`);
            }
            throw new Error("The AI failed to return an edited image.");
        }

        return { imageUrl: newImageUrl, base64ImageData: newBase64ImageData, mimeType: newMimeType };
    } catch (error) {
        console.error("Error editing vision image:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred while editing the image.");
    }
};
