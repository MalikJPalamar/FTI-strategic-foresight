
import React from 'react';
import { ForesightReport, Signal, Trend, Scenario, VisionChartData, StrategicPlan } from '../types';
import { LinkIcon, LightBulbIcon, SearchIcon, BeakerIcon, FuturesIcon, SparklesIcon } from './icons';
import { ScenarioLab } from './ScenarioLab';
import { LoadingSpinner } from './LoadingSpinner';
import { ActionPlanner } from './ActionPlanner';

interface ForesightDisplayProps {
  report: ForesightReport;
  scenarios: Scenario[] | null;
  vision: VisionChartData | null;
  strategicPlan: StrategicPlan | null;
  onGenerateScenarios: () => void;
  onGenerateVision: (params: { selectedElements: string[]; userPrompt: string }) => void;
  onGenerateStrategicPlan: () => void;
  isGeneratingScenarios: boolean;
  isGeneratingVision: boolean;
  isGeneratingPlan: boolean;
  onResetVision: () => void;
}

const SignalCard: React.FC<{ signal: Signal }> = ({ signal }) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 transition-all hover:border-cyan-700/50">
    <p className="text-gray-300">{signal.signal}</p>
    {signal.sourceUri && (
      <a
        href={signal.sourceUri}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <LinkIcon className="w-3 h-3" />
        {signal.sourceTitle || new URL(signal.sourceUri).hostname}
      </a>
    )}
  </div>
);

const TrendCard: React.FC<{ trend: Trend }> = ({ trend }) => (
  <div className="bg-gradient-to-br from-gray-900 to-black/50 border border-gray-800 rounded-lg p-6">
     <h4 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
        <LightBulbIcon className="w-5 h-5" />
        {trend.trend}
      </h4>
    <p className="mt-2 text-gray-400">{trend.description}</p>
  </div>
);

const cipherDescriptions: { [key: string]: string } = {
  Contradictions: "Tensions, paradoxes, or things that don't make sense together yet co-exist.",
  Inflections: "Signals suggesting a significant change in direction or acceleration of a trend.",
  Practices: "New behaviors, rituals, or ways of doing things that are emerging.",
  Hacks: "Clever, often unconventional solutions, workarounds, or 'cheats' to problems.",
  Extremes: "The furthest edge of a phenomenon; pushing the boundaries of what's possible or acceptable.",
  Rarities: "Things that are rare today but could become common in the future; early novelties.",
};

const CipherSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
  if (!items || items.length === 0 || (items.length === 1 && items[0].trim() === '')) return null;
  const description = cipherDescriptions[title];

  return (
    <div>
      <h4 className="font-semibold text-gray-300">{title}</h4>
      {description && <p className="mt-1 text-xs text-gray-500 italic">{description}</p>}
      <ul className="mt-2 list-disc list-inside space-y-1 text-gray-400">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export const ForesightDisplay: React.FC<ForesightDisplayProps> = ({ 
  report, 
  scenarios, 
  vision,
  strategicPlan,
  onGenerateScenarios, 
  onGenerateVision,
  onGenerateStrategicPlan,
  isGeneratingScenarios,
  isGeneratingVision,
  isGeneratingPlan,
  onResetVision
}) => {
  return (
    <div className="space-y-12">
      
      {/* Phase 1: Analysis */}
      <section>
        <h2 className="text-2xl font-bold text-gray-200 border-b-2 border-cyan-500/30 pb-2 mb-6">Step 4: Synthesize Emerging Trends (Converging)</h2>
        <div className="space-y-6">
          {report.emergingTrends.map((trend, index) => (
            <TrendCard key={index} trend={trend} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-200 border-b-2 border-cyan-500/30 pb-2 mb-6 flex items-center gap-3">
          <BeakerIcon className="w-7 h-7" />
          Step 3: Analyze Signals (Converging)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
          <CipherSection title="Contradictions" items={report.cipherAnalysis.contradictions} />
          <CipherSection title="Inflections" items={report.cipherAnalysis.inflections} />
          <CipherSection title="Practices" items={report.cipherAnalysis.practices} />
          <CipherSection title="Hacks" items={report.cipherAnalysis.hacks} />
          <CipherSection title="Extremes" items={report.cipherAnalysis.extremes} />
          <CipherSection title="Rarities" items={report.cipherAnalysis.rarities} />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-200 border-b-2 border-cyan-500/30 pb-2 mb-6 flex items-center gap-3">
          <SearchIcon className="w-7 h-7" />
          Step 2: Discover Weak Signals (Diverging)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.discoveredSignals.map((signal, index) => (
            <SignalCard key={index} signal={signal} />
          ))}
        </div>
      </section>

      {/* Phase 2: Futuring & Visioning */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-700 to-transparent my-16"></div>
      
      {!scenarios && !isGeneratingScenarios && (
        <div className="text-center">
            <button
              onClick={onGenerateScenarios}
              disabled={isGeneratingScenarios}
              className="inline-flex items-center gap-3 px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              <FuturesIcon className="w-6 h-6" />
              Step 5: Generate Future Scenarios (Diverging)
            </button>
        </div>
      )}
      
      {isGeneratingScenarios && !scenarios && <LoadingSpinner />}


      {scenarios && (
        <ScenarioLab 
          scenarios={scenarios}
          vision={vision}
          onGenerateVision={onGenerateVision}
          isGeneratingVision={isGeneratingVision}
          onResetVision={onResetVision}
          onGenerateScenarios={onGenerateScenarios}
          isGeneratingScenarios={isGeneratingScenarios}
        />
      )}

      {/* Phase 3: Strategy & Action */}
      {vision && !strategicPlan && !isGeneratingPlan && (
        <div className="text-center mt-12 animate-fade-in">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-700 to-transparent mb-12"></div>
           <button
              onClick={onGenerateStrategicPlan}
              className="inline-flex items-center gap-3 px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              <SparklesIcon className="w-6 h-6" />
              Step 7: Develop Strategic Action Plan (Converging)
            </button>
        </div>
      )}

      {isGeneratingPlan && <LoadingSpinner />}

      {strategicPlan && (
        <div className="mt-12 animate-fade-in">
          <ActionPlanner plan={strategicPlan} />
        </div>
      )}
    </div>
  );
};
