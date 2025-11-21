
import React, { useState, useRef, useEffect } from 'react';
import { ForesightReport, Signal, Trend, Scenario, VisionChartData, StrategicPlan, AIModel, ChatMessage, CipherEntry } from '../types';
import { LinkIcon, LightBulbIcon, SearchIcon, BeakerIcon, FuturesIcon, SparklesIcon, RadarIcon, DatabaseIcon } from './icons';
import { ScenarioLab } from './ScenarioLab';
import { LoadingSpinner } from './LoadingSpinner';
import { ActionPlanner } from './ActionPlanner';
import { FringeGraph } from './FringeGraph';
import { createSignalChat } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

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
  model: AIModel;
}

// --- Components ---

const SignalDatabaseRow: React.FC<{ signal: Signal; onDive: (s: Signal) => void }> = ({ signal, onDive }) => (
  <div className="group grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-all items-center cursor-pointer" onClick={() => onDive(signal)}>
     <div className="col-span-6">
        <h5 className="text-cyan-100 font-medium text-sm truncate group-hover:text-cyan-400 transition-colors font-display tracking-wide">{signal.headline}</h5>
        <p className="text-gray-500 text-xs truncate font-mono mt-0.5">{signal.sourceTitle}</p>
     </div>
     <div className="col-span-2 text-[10px] uppercase tracking-wider text-gray-400 font-mono">
        {signal.macroSource}
     </div>
     <div className="col-span-2 flex gap-2">
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${signal.relevancyScore > 80 ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'}`}>
            R:{signal.relevancyScore}
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-blue-500/30 text-blue-400 bg-blue-500/10">
            C:{signal.confidenceScore}
        </span>
     </div>
     <div className="col-span-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-cyan-400 hover:text-cyan-200 bg-cyan-500/10 p-1.5 rounded-lg border border-cyan-500/20">
            <RadarIcon className="w-3 h-3" />
        </button>
     </div>
  </div>
);

const SignalDeepDive: React.FC<{ signal: Signal; model: AIModel; onClose: () => void }> = ({ signal, model, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      chatRef.current = createSignalChat(signal.headline, signal.sourceTitle, model);
      setMessages([{ role: 'model', text: `Signal Interrogator Active. Target: "${signal.headline}". Select a pressure-test vector.` }]);
    } catch (e) { console.error(e); }
  }, [signal, model]);

  const handleSend = async (text?: string) => {
    const msg = text || inputValue;
    if (!msg.trim() || !chatRef.current) return;
    setMessages(p => [...p, { role: 'user', text: msg }]);
    setInputValue('');
    setIsTyping(true);
    try {
      const res: GenerateContentResponse = await chatRef.current.sendMessage({ message: msg });
      setMessages(p => [...p, { role: 'model', text: res.text || "Signal lost." }]);
    } catch { setMessages(p => [...p, { role: 'model', text: "Connection error." }]); } 
    finally { setIsTyping(false); }
  };

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-gray-900/90 w-full max-w-3xl rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col h-[700px] overflow-hidden relative">
         {/* Header */}
         <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
            <div>
                <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest mb-1">Deep Dive Protocol</div>
                <h3 className="font-display font-bold text-xl text-white">{signal.headline}</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
         </div>

         {/* Chat Area */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`relative max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'user' 
                        ? 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-100 rounded-tr-none' 
                        : 'bg-gray-800/50 border border-gray-700 text-gray-300 rounded-tl-none'
                    }`}>
                        {m.role === 'model' && <div className="absolute -top-2 -left-2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>}
                        {m.text}
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-gray-800/50 border border-gray-700 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef}/>
         </div>
         
         {/* Suggestion Chips */}
         <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
            {['Who loses if this scales?', 'Identify 2nd order effects', 'Find the counter-trend', 'Is this a fad or trend?'].map(q => (
                <button key={q} onClick={() => handleSend(q)} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-cyan-300 hover:border-cyan-500/50 transition-all">
                    {q}
                </button>
            ))}
         </div>

         {/* Input */}
         <div className="p-4 bg-black/40 border-t border-white/10">
            <div className="flex gap-3 bg-gray-900/50 border border-gray-700 rounded-xl p-2 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
                <input 
                    className="flex-1 bg-transparent border-none outline-none text-white px-2 placeholder-gray-600" 
                    placeholder="Ask the Signal Interrogator..."
                    value={inputValue} 
                    onChange={e => setInputValue(e.target.value)} 
                    onKeyDown={e => e.key==='Enter' && handleSend()} 
                />
                <button onClick={() => handleSend()} className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};

const CipherSection: React.FC<{ title: string; items: CipherEntry[] }> = ({ title, items }) => {
  if (!items?.length) return null;
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gray-900/40 border border-white/5 p-6 hover:bg-gray-900/60 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <h4 className="font-display font-bold text-lg text-gray-100 mb-4 uppercase tracking-wider flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
        {title}
      </h4>
      <ul className="space-y-3">
        {items.map((item, i) => {
            let content;
            if (typeof item === 'string') {
                content = item;
            } else if (typeof item === 'object' && item !== null) {
                content = (
                    <span className="flex flex-col gap-1">
                        <span className="font-bold text-cyan-200/90">{item.pattern}</span>
                        <span className="text-gray-400/90">{item.description}</span>
                    </span>
                );
            } else {
                content = "Invalid Data";
            }

            return (
                <li key={i} className="text-sm text-gray-400 leading-relaxed flex items-start gap-2">
                    <span className="text-cyan-500/50 mt-1">›</span>
                    <div className="flex-1">{content}</div>
                </li>
            );
        })}
      </ul>
    </div>
  );
};

export const ForesightDisplay: React.FC<ForesightDisplayProps> = ({ 
  report, scenarios, vision, strategicPlan,
  onGenerateScenarios, onGenerateVision, onGenerateStrategicPlan,
  isGeneratingScenarios, isGeneratingVision, isGeneratingPlan,
  onResetVision, model
}) => {
  const [activeSignal, setActiveSignal] = useState<Signal | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'database'>('graph');

  return (
    <div className="space-y-32">
      {activeSignal && <SignalDeepDive signal={activeSignal} model={model} onClose={() => setActiveSignal(null)} />}

      {/* STEP 2: DISCOVER (Signals) */}
      <section className="animate-fade-in">
         <div className="flex justify-between items-end mb-10 pb-6 border-b border-white/10 relative">
            <div className="absolute bottom-0 left-0 w-32 h-0.5 bg-cyan-500"></div>
            <div>
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                    <SearchIcon className="w-5 h-5" />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest">Step 2: Diverge</span>
                </div>
                <h2 className="text-4xl font-display font-bold text-white tracking-tight">Fringe Signal Discovery</h2>
            </div>
            <div className="flex gap-1 bg-gray-900/50 p-1 rounded-lg border border-white/10">
                <button onClick={() => setViewMode('graph')} className={`p-2 rounded-md transition-all ${viewMode === 'graph' ? 'bg-cyan-500/20 text-cyan-300 shadow-inner' : 'text-gray-500 hover:text-gray-300'}`} title="Fringe Sketch">
                    <RadarIcon className="w-5 h-5" />
                </button>
                <button onClick={() => setViewMode('database')} className={`p-2 rounded-md transition-all ${viewMode === 'database' ? 'bg-cyan-500/20 text-cyan-300 shadow-inner' : 'text-gray-500 hover:text-gray-300'}`} title="Signal Database">
                    <DatabaseIcon className="w-5 h-5" />
                </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2">
                 {viewMode === 'graph' ? (
                    <div className="relative bg-gray-900/40 backdrop-blur-sm rounded-3xl p-6 border border-white/10 shadow-2xl min-h-[500px]">
                         {/* Cosmetic corner accents */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-cyan-500/30 rounded-tl-3xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyan-500/30 rounded-tr-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-cyan-500/30 rounded-bl-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-cyan-500/30 rounded-br-3xl"></div>
                        
                        <FringeGraph signals={report.discoveredSignals || []} onNodeClick={setActiveSignal} />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-600 uppercase tracking-widest">FTI Visualizer v2.5</div>
                    </div>
                 ) : (
                    <div className="bg-gray-900/40 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl min-h-[500px] flex flex-col">
                        <div className="p-4 bg-black/20 border-b border-white/10 grid grid-cols-12 gap-4 text-[10px] font-mono font-bold text-cyan-500/70 uppercase tracking-widest">
                            <div className="col-span-6">Signal Origin</div>
                            <div className="col-span-2">Macro Source</div>
                            <div className="col-span-2">Metrics</div>
                            <div className="col-span-2 text-right">Scan</div>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                            {report.discoveredSignals?.map((s, i) => (
                                <SignalDatabaseRow key={i} signal={s} onDive={setActiveSignal} />
                            ))}
                        </div>
                    </div>
                 )}
             </div>
             <div className="space-y-6">
                <div className="bg-gradient-to-b from-gray-900/60 to-black/60 border border-white/10 rounded-3xl p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
                    <h3 className="text-lg font-display font-bold text-gray-200 mb-6 uppercase tracking-widest">Scan Telemetry</h3>
                    <div className="grid grid-cols-1 gap-8">
                        <div>
                            <div className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{report.discoveredSignals?.length || 0}</div>
                            <div className="text-xs text-gray-500 font-mono uppercase mt-1">Weak Signals Isolated</div>
                        </div>
                        <div>
                            <div className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                {report.discoveredSignals?.length > 0 ? Math.round(report.discoveredSignals.reduce((acc, s) => acc + s.confidenceScore, 0) / report.discoveredSignals.length) : 0}<span className="text-2xl">%</span>
                            </div>
                            <div className="text-xs text-gray-500 font-mono uppercase mt-1">Source Integrity</div>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-950/20 border border-blue-500/20 rounded-3xl p-6">
                    <h4 className="font-bold text-blue-400 font-mono text-xs uppercase mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                        Methodology Note
                    </h4>
                    <p className="text-xs text-blue-200/70 leading-relaxed">
                        Signals are extracted via multi-vector filtering across FTI's 11 Macro Sources. Only high-velocity signals with established provenance (Patents, arXiv, Trade Journals) pass the filter.
                    </p>
                </div>
             </div>
         </div>
      </section>

      {/* STEP 3: ANALYZE (Cipher) */}
      <section>
         <div className="flex items-center gap-2 text-cyan-400 mb-2">
             <BeakerIcon className="w-5 h-5" />
             <span className="font-mono text-xs font-bold uppercase tracking-widest">Step 3: Converge</span>
         </div>
         <h2 className="text-4xl font-display font-bold text-white mb-10">CIPHER Pattern Analysis</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CipherSection title="Contradictions" items={report.cipherAnalysis.contradictions} />
            <CipherSection title="Inflections" items={report.cipherAnalysis.inflections} />
            <CipherSection title="Practices" items={report.cipherAnalysis.practices} />
            <CipherSection title="Hacks" items={report.cipherAnalysis.hacks} />
            <CipherSection title="Extremes" items={report.cipherAnalysis.extremes} />
            <CipherSection title="Rarities" items={report.cipherAnalysis.rarities} />
         </div>
      </section>

      {/* STEP 4: SYNTHESIZE (Trends) */}
      <section>
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
             <LightBulbIcon className="w-5 h-5" />
             <span className="font-mono text-xs font-bold uppercase tracking-widest">Step 4: Synthesize</span>
         </div>
         <h2 className="text-4xl font-display font-bold text-white mb-10">Emerging Macro Trends</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.emergingTrends?.map((trend, i) => (
                <div key={i} className="relative group p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/50 to-black/50 hover:from-gray-900 hover:to-gray-900 transition-all duration-500 overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white"><path d="M2 12h20"/><path d="M12 2v20"/><circle cx="12" cy="12" r="10"/></svg>
                     </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">{trend.trend}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-white/10 pl-4 group-hover:border-cyan-500/50 transition-colors">{trend.description}</p>
                </div>
            ))}
         </div>
      </section>

      {/* Downstream Logic (Scenarios, Vision, Plan) */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent my-20"></div>

      {!scenarios && !isGeneratingScenarios && (
        <div className="text-center py-12">
            <button onClick={onGenerateScenarios} className="group relative inline-flex items-center justify-center px-8 py-4 bg-cyan-500 text-black font-display font-bold text-lg rounded-xl overflow-hidden transition-transform hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                 <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <FuturesIcon className="w-6 h-6 mr-2" /> Generate Futures Scenarios
            </button>
        </div>
      )}
      
      {isGeneratingScenarios && <LoadingSpinner />}

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

      {vision && !strategicPlan && !isGeneratingPlan && (
        <div className="text-center mt-20 mb-10">
           <button onClick={onGenerateStrategicPlan} className="group relative inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white font-display font-bold text-lg rounded-xl overflow-hidden transition-transform hover:scale-105 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
               <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <SparklesIcon className="w-6 h-6 mr-2" /> Develop Strategic Plan
            </button>
        </div>
      )}

      {isGeneratingPlan && <LoadingSpinner />}

      {strategicPlan && <ActionPlanner plan={strategicPlan} />}
    </div>
  );
};
