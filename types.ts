
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

// Types for the new Strategic Action Plan
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
