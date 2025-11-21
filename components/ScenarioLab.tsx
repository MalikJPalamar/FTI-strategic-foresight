
import React, { useState } from 'react';
import { Scenario, VisionChartData } from '../types';
import { ChartQuadrantIcon, SparklesIcon, FuturesIcon } from './icons';
import { VisionChart } from './VisionChart';

interface ScenarioLabProps {
    scenarios: Scenario[];
    vision: VisionChartData | null;
    onGenerateVision: (params: { selectedElements: string[]; userPrompt: string }) => void;
    isGeneratingVision: boolean;
    onResetVision: () => void;
    onGenerateScenarios: () => void;
    isGeneratingScenarios: boolean;
}

const ScenarioCard: React.FC<{ scenario: Scenario, onSelect: (element: string, selected: boolean) => void }> = ({ scenario, onSelect }) => {
    return (
        <div className="flex flex-col h-full bg-gray-900/40 border border-white/10 rounded-3xl p-8 hover:border-cyan-500/30 transition-colors duration-300 shadow-lg">
            <div className="mb-4 pb-4 border-b border-white/5">
                <h4 className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">{scenario.title}</h4>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed flex-grow font-light">{scenario.narrative}</p>
            <div className="mt-6 pt-6 border-t border-white/5 bg-black/20 -mx-8 -mb-8 p-8 rounded-b-3xl">
                <h5 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-4">Strategic Implications</h5>
                <div className="space-y-3">
                    {scenario.implications?.map((imp, index) => (
                        <label key={index} className="group flex items-start p-3 rounded-xl bg-gray-800/50 border border-transparent hover:border-cyan-500/30 hover:bg-gray-800 transition-all cursor-pointer">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="peer h-4 w-4 rounded border-gray-600 bg-gray-900 text-cyan-500 focus:ring-offset-0 focus:ring-cyan-500/50"
                                    onChange={(e) => onSelect(imp, e.target.checked)}
                                />
                            </div>
                            <span className="ml-3 text-sm text-gray-300 group-hover:text-cyan-100 transition-colors">{imp}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};


export const ScenarioLab: React.FC<ScenarioLabProps> = ({ 
    scenarios, 
    vision, 
    onGenerateVision, 
    isGeneratingVision,
    onResetVision,
    onGenerateScenarios,
    isGeneratingScenarios,
 }) => {
    const [selectedElements, setSelectedElements] = useState<string[]>([]);
    const [userPrompt, setUserPrompt] = useState<string>('');

    const handleSelectElement = (element: string, selected: boolean) => {
        if (selected) {
            setSelectedElements(prev => [...prev, element]);
        } else {
            setSelectedElements(prev => prev.filter(e => e !== element));
        }
    };
    
    return (
        <section className="space-y-20 animate-fade-in">
            <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-white/10 pb-6 mb-10">
                    <div>
                         <div className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Step 5: Diverge</div>
                         <h2 className="text-4xl font-display font-bold text-white">Scenario Lab</h2>
                    </div>
                     <button
                        onClick={onGenerateScenarios}
                        disabled={isGeneratingScenarios}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-700 text-xs font-mono font-bold rounded-lg shadow-sm text-gray-400 bg-gray-900 hover:bg-gray-800 hover:text-white transition-all"
                        >
                        {isGeneratingScenarios ? (
                            <>
                               <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              RECALCULATING...
                            </>
                        ) : (
                            <>
                                <FuturesIcon className="w-3 h-3" />
                                REGENERATE
                            </>
                        )}
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {scenarios?.map((scenario, index) => (
                        <ScenarioCard key={index} scenario={scenario} onSelect={handleSelectElement} />
                    ))}
                </div>
            </div>

            <div>
                 <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                        <ChartQuadrantIcon className="w-6 h-6" />
                    </div>
                    <div>
                         <div className="font-mono text-xs font-bold text-purple-400 uppercase tracking-widest">Step 6: Converge</div>
                         <h2 className="text-3xl font-display font-bold text-white">{vision ? 'Strategic Matrix' : 'Vision Builder'}</h2>
                    </div>
                </div>
                
                {vision ? (
                    <VisionChart vision={vision} onReset={onResetVision} />
                ) : (
                     <div className="bg-gray-900/40 border border-white/10 rounded-3xl p-12 text-center max-w-3xl mx-auto backdrop-blur-sm">
                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                             <SparklesIcon className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Define Preferred Future</h3>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">Select desirable implications from the scenarios above to synthesize your strategic matrix.</p>
                        
                        <div className="max-w-lg mx-auto space-y-6">
                          <div className="text-left">
                              <label htmlFor="vision-prompt" className="block text-xs font-mono font-bold text-cyan-500 uppercase mb-2 ml-1">
                                Guidance Context (Optional)
                              </label>
                              <textarea
                                id="vision-prompt"
                                rows={2}
                                className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-gray-200 text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder-gray-700"
                                placeholder="e.g., focus on decentralized autonomous organizations..."
                                value={userPrompt}
                                onChange={(e) => setUserPrompt(e.target.value)}
                                disabled={isGeneratingVision}
                              />
                          </div>

                          <button
                            onClick={() => onGenerateVision({ selectedElements, userPrompt })}
                            disabled={selectedElements.length === 0 || isGeneratingVision}
                            className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 border border-transparent text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg text-black bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed disabled:from-gray-800 disabled:to-gray-800 transition-all"
                            >
                                {isGeneratingVision ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        PROCESSING MATRIX...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        SYNTHESIZE MATRIX ({selectedElements.length})
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
