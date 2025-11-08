
export interface Signal {
  signal: string;
  sourceTitle: string;
  sourceUri: string;
}

export interface CipherAnalysis {
  contradictions: string[];
  inflections: string[];
  practices: string[];
  hacks: string[];
  extremes: string[];
  rarities: string[];
}

export interface Trend {
  trend: string;
  description: string;
}

export interface Scenario {
  title: string;
  narrative: string;
  implications: string[];
}

export interface Vision {
  statement: string;
  imageUrl: string;
  base64ImageData: string;
  mimeType: string;
}

export interface ForesightReport {
  strategicQuestion: string;
  discoveredSignals: Signal[];
  cipherAnalysis: CipherAnalysis;
  emergingTrends: Trend[];
}
