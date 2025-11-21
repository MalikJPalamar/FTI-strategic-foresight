
export type MacroSource = 
  | 'Wealth Distribution' 
  | 'Education' 
  | 'Infrastructure' 
  | 'Government' 
  | 'Geopolitics' 
  | 'Economy' 
  | 'Public Health' 
  | 'Demographics' 
  | 'Environment' 
  | 'Media & Telecommunications' 
  | 'Technology';

export interface Signal {
  id: string;
  headline: string;
  description: string;
  sourceTitle: string;
  sourceUri: string;
  macroSource: MacroSource;
  relevancyScore: number; // 0-100
  confidenceScore: number; // 0-100 (Based on source credibility)
  velocity: 'Linear' | 'Exponential' | 'Chaotic';
}

export interface CipherItem {
  pattern: string;
  description: string;
}

export type CipherEntry = string | CipherItem;

export interface CipherAnalysis {
  contradictions: CipherEntry[];
  inflections: CipherEntry[];
  practices: CipherEntry[];
  hacks: CipherEntry[];
  extremes: CipherEntry[];
  rarities: CipherEntry[];
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

export interface VisionChartData {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  preferredFuture: {
    label: string;
    x: number; // A value between 0 and 100
    y: number; // A value between 0 and 100
  };
  quadrants: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
}

export interface ForesightReport {
  strategicQuestion: string;
  discoveredSignals: Signal[];
  cipherAnalysis: CipherAnalysis;
  emergingTrends: Trend[];
}

export interface KeyInitiative {
  initiative: string;
  description: string;
  first_steps: string[];
}

export interface StrategicImperative {
  imperative: string;
  description: string;
  key_initiatives: KeyInitiative[];
}

export interface StrategicPlan {
  title: string;
  strategic_imperatives: StrategicImperative[];
  early_warning_indicators: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type AIModel = 'gemini-2.5-flash' | 'gemini-3-pro-preview';
