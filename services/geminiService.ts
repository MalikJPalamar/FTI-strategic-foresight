
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { ForesightReport, Signal, Trend, Scenario, VisionChartData, StrategicPlan, AIModel } from '../types';

// --- Helpers ---

const parseJsonResponse = <T>(text: string): T => {
  try {
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

    if (actualStartIndex === -1) throw new Error("No JSON object found.");
    
    const endIndex = text.lastIndexOf('}');
    const endArrayIndex = text.lastIndexOf(']');
    const actualEndIndex = Math.max(endIndex, endArrayIndex);
    
    if (actualEndIndex === -1) throw new Error("JSON object not closed.");

    const jsonString = text.substring(actualStartIndex, actualEndIndex + 1);
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON:", text, error);
    throw new Error("Failed to parse the AI response. Please try again.");
  }
};

// --- Prompts ---

const buildDiscoveryPrompt = (strategicQuestion: string, sectorFocus: string): string => {
  return `
    You are a rigorous, cynical Strategic Foresight Analyst for the Future Today Institute.
    Your job is to find "Weak Signals" — specific, verifiable fringe data points that suggest future disruption.
    
    **Strategic Question:** "${strategicQuestion}"
    
    **Search Focus Area:** ${sectorFocus}
    
    **Rules for Signal Discovery:**
    1.  **NO SLOP:** Reject generic buzzwords, press releases, and mainstream news (NYT, CNN, BBC, Forbes). 
    2.  **SOURCE QUALITY:** Prioritize academic papers (arXiv), patent filings, niche trade journals, engineering blogs, and direct primary sources.
    3.  **SPECIFICITY:** Do not give me "AI is growing". Give me "Company X released Model Y with Z capability".
    4.  **TIMEFRAME:** Only signals from the last 12-18 months.

    **Task:**
    Use Google Search to find 6-8 high-quality signals specifically within the "${sectorFocus}" domain.
    For each signal, assign:
    - A Relevancy Score (0-100): How critical is this to the strategic question?
    - A Confidence Score (0-100): How credible/primary is the source?
    - Velocity: Is this change Linear, Exponential, or Chaotic?
    - Macro Source: Which of the 11 FTI Macro Sources does this fit best? (e.g., Technology, Demographics, Wealth Distribution).

    **Output:**
    Return a JSON array of objects. No markdown.
    schema:
    [
      {
        "headline": "Short, punchy title",
        "description": "2 sentences on WHAT happened and WHY it matters.",
        "sourceTitle": "Name of the publication/source",
        "sourceUri": "URL",
        "macroSource": "Technology" | "Economy" | "Geopolitics" ... (Pick one of 11 FTI sources),
        "relevancyScore": 85,
        "confidenceScore": 90,
        "velocity": "Exponential"
      }
    ]
  `;
};

const buildCipherAnalysisPrompt = (signals: Signal[]): string => {
  const signalsText = signals.map(s => `- [${s.macroSource}] ${s.headline}: ${s.description}`).join('\n');
  return `
    You are a Pattern Recognition Engine using the FTI CIPHER framework.
    
    **Input Signals:**
    ${signalsText}

    **Task:**
    Analyze these signals to find hidden patterns using CIPHER.
    For each category below, provide a list of specific findings.
    Each finding MUST be an object with "pattern" (name) and "description" (context).
    
    Categories:
    - **Contradictions:** Things succeeding when they should fail (or vice versa).
    - **Inflections:** Major turning points in development.
    - **Practices:** New behaviors or ways of operating.
    - **Hacks:** Off-label uses of existing tech/systems.
    - **Extremes:** Pushing boundaries significantly.
    - **Rarities:** Black swan events or outliers.

    Synthesize 3-5 Emerging Trends based *strictly* on these patterns.

    **Output:**
    JSON Object.
    {
      "cipherAnalysis": { 
        "contradictions": [{ "pattern": "...", "description": "..." }], 
        "inflections": [{ "pattern": "...", "description": "..." }], 
        "practices": [{ "pattern": "...", "description": "..." }],
        "hacks": [{ "pattern": "...", "description": "..." }],
        "extremes": [{ "pattern": "...", "description": "..." }],
        "rarities": [{ "pattern": "...", "description": "..." }]
      },
      "emergingTrends": [ { "trend": "Name", "description": "..." } ]
    }
  `;
};

// --- Main Services ---

export const generateForesightAnalysis = async (strategicQuestion: string, model: AIModel): Promise<{ report: ForesightReport }> => {
  if (!process.env.API_KEY) throw new Error("API_KEY not set");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Multi-Vector Search Strategy (Parallel Execution to widen the net)
  // We split the 11 Macro Sources into 3 strategic clusters to ensure diversity.
  const vector1 = "Technology, Infrastructure, Media & Telecommunications";
  const vector2 = "Demographics, Public Health, Education, Wealth Distribution";
  const vector3 = "Economy, Government, Geopolitics, Environment";

  const vectors = [vector1, vector2, vector3];
  
  try {
    const searchPromises = vectors.map(sector => 
      ai.models.generateContent({
        model: model, 
        contents: buildDiscoveryPrompt(strategicQuestion, sector),
        config: { tools: [{ googleSearch: {} }] }
      })
    );

    const results = await Promise.all(searchPromises);

    // 2. Aggregation & Deduplication
    let allSignals: Signal[] = [];
    
    results.forEach((response, idx) => {
      try {
        const text = response.text;
        if (!text) return;
        
        const signals = parseJsonResponse<any[]>(text);
        
        // Map Grounding Metadata (URLs)
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        const mappedSignals = signals.map((s, i) => {
            // Fallback logic if the LLM didn't provide a URI but Grounding did
            let uri = s.sourceUri;
            let title = s.sourceTitle;
            
            if ((!uri || uri.includes('example.com')) && groundingChunks && groundingChunks[i]) {
                uri = groundingChunks[i].web?.uri || uri;
                title = groundingChunks[i].web?.title || title;
            }

            return {
                ...s,
                id: `sig-${idx}-${i}`,
                sourceUri: uri,
                sourceTitle: title
            } as Signal;
        });

        allSignals = [...allSignals, ...mappedSignals];
      } catch (e) {
        console.warn(`Failed to parse vector ${idx}`, e);
      }
    });

    // 3. Filter "Slop" (Low Confidence/Relevancy)
    const curatedSignals = allSignals
        .filter(s => s.relevancyScore > 60 && s.confidenceScore > 50) // Threshold filtering
        .sort((a, b) => b.relevancyScore - a.relevancyScore)
        .slice(0, 15); // Cap at top 15 high-quality signals

    if (curatedSignals.length === 0) {
        throw new Error("No high-quality signals found. Try refining your strategic question.");
    }

    // 4. CIPHER Analysis & Trend Synthesis on Curated Data
    const analysisResponse = await ai.models.generateContent({
        model: model,
        contents: buildCipherAnalysisPrompt(curatedSignals)
    });

    const analysisData = parseJsonResponse<{ cipherAnalysis: any, emergingTrends: any }>(analysisResponse.text!);

    const report: ForesightReport = {
        strategicQuestion,
        discoveredSignals: curatedSignals,
        cipherAnalysis: analysisData.cipherAnalysis,
        emergingTrends: analysisData.emergingTrends
    };

    return { report };

  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};

export const generateScenarios = async (trends: Trend[], model: AIModel): Promise<Scenario[]> => {
    if (!process.env.API_KEY) throw new Error("API_KEY not set");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const trendsString = trends.map(t => `**${t.trend}:** ${t.description}`).join('\n');

    const prompt = `
      You are a master scenario planner.
      **Input Trends:**
      ${trendsString}

      **Task:**
      Generate 3 distinct 10-year future scenarios (Baseline, Optimistic, Pessimistic).
      Return JSON array: [{ "title": "...", "narrative": "...", "implications": ["..."] }]
    `;

    const response = await ai.models.generateContent({ model, contents: prompt });
    return parseJsonResponse<Scenario[]>(response.text!);
};


export const generateVision = async (selectedElements: string[], userPrompt: string, model: AIModel): Promise<VisionChartData> => {
    if (!process.env.API_KEY) throw new Error("API_KEY not set");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const elementsString = selectedElements.map(e => `- ${e}`).join('\n');

    const prompt = `
      Synthesize these selected scenario elements into a Strategic 2x2 Matrix for visualization.
      Selected Elements:
      ${elementsString}
      ${userPrompt ? `User Context: ${userPrompt}` : ''}
      
      Output MUST be a valid JSON object matching this structure exactly:
      {
        "title": "Matrix Title",
        "xAxisLabel": "Label for X Axis (Low -> High)",
        "yAxisLabel": "Label for Y Axis (Low -> High)",
        "preferredFuture": {
          "label": "Name of Preferred State",
          "x": 75, 
          "y": 80
        },
        "quadrants": {
          "topLeft": "Scenario Description",
          "topRight": "Scenario Description",
          "bottomLeft": "Scenario Description",
          "bottomRight": "Scenario Description"
        }
      }
      Note: x and y are numbers 0-100.
    `;

    const response = await ai.models.generateContent({ 
        model, 
        contents: prompt,
        config: { responseMimeType: "application/json" } 
    });
    return parseJsonResponse<VisionChartData>(response.text!);
};

export const generateStrategicPlan = async (vision: VisionChartData, trends: Trend[], model: AIModel): Promise<StrategicPlan> => {
    if (!process.env.API_KEY) throw new Error("API_KEY not set");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Create a comprehensive Strategic Action Plan based on the following Vision and Emerging Trends.
      
      **Vision Matrix Data:** 
      ${JSON.stringify(vision)}

      **Emerging Trends:**
      ${JSON.stringify(trends)}
      
      **Task:**
      Develop 3-4 high-level "Strategic Imperatives" required to achieve the Preferred Future defined in the Vision.
      For each imperative, define specific "Key Initiatives" with tactical first steps.
      Also identify "Early Warning Indicators" that suggest the plan needs adjustment.

      **Output Format:**
      You MUST return a valid JSON object exactly matching this schema (respect snake_case keys):
      {
        "title": "A compelling title for the strategic plan",
        "strategic_imperatives": [
          {
            "imperative": "High-level strategic goal",
            "description": "Strategic rationale",
            "key_initiatives": [
              {
                "initiative": "Name of initiative",
                "description": "What it involves",
                "first_steps": [
                   "First tactical step",
                   "Second tactical step"
                ]
              }
            ]
          }
        ],
        "early_warning_indicators": [
          "Indicator 1",
          "Indicator 2",
          "Indicator 3"
        ]
      }
    `;

    const response = await ai.models.generateContent({ 
        model, 
        contents: prompt,
        config: { responseMimeType: "application/json" } 
    });
    return parseJsonResponse<StrategicPlan>(response.text!);
};

// --- Deep Dive Chat ---

export const createSignalChat = (signal: string, source: string, modelId: AIModel): Chat => {
  if (!process.env.API_KEY) throw new Error("API_KEY not set");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  return ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: `
        You are a specialized "Signal Interrogator" designed for the Future Today Institute (FTI) methodology.
        
        Signal: "${signal}" (${source})

        Goal: Pressure test this signal.
        1. Velocity: How fast is it moving?
        2. Impact: Who is disrupted (1st, 2nd, 3rd order)?
        3. Convergence: What does this combine with?
        
        Be concise, provocative, and evidence-based.
      `,
    },
  });
};
