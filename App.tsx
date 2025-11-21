import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { FramingInput } from './components/FramingInput';
import { ForesightDisplay } from './components/ForesightDisplay';
import { generateForesightAnalysis, generateScenarios, generateVision, generateStrategicPlan } from './services/geminiService';
import { ForesightReport, Scenario, VisionChartData, StrategicPlan, AIModel } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';

const STORAGE_KEY = 'centaurion_foresight_state_v1';

const App: React.FC = () => {
  // State
  const [strategicQuestion, setStrategicQuestion] = useState<string>(
    "What are the emerging technological, cultural, and economic trends shaping the future of the remote and hybrid workforce?"
  );
  const [model, setModel] = useState<AIModel>('gemini-2.5-flash');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [foresightReport, setForesightReport] = useState<ForesightReport | null>(null);

  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState<boolean>(false);
  
  const [vision, setVision] = useState<VisionChartData | null>(null);
  const [isGeneratingVision, setIsGeneratingVision] = useState<boolean>(false);

  const [strategicPlan, setStrategicPlan] = useState<StrategicPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);

  // Data Persistence: Load
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.strategicQuestion) setStrategicQuestion(parsed.strategicQuestion);
        if (parsed.model) setModel(parsed.model);
        if (parsed.foresightReport) setForesightReport(parsed.foresightReport);
        if (parsed.scenarios) setScenarios(parsed.scenarios);
        if (parsed.vision) setVision(parsed.vision);
        if (parsed.strategicPlan) setStrategicPlan(parsed.strategicPlan);
      } catch (e) {
        console.error("Failed to load session:", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Data Persistence: Save
  useEffect(() => {
    const stateToSave = {
      strategicQuestion,
      model,
      foresightReport,
      scenarios,
      vision,
      strategicPlan
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [strategicQuestion, model, foresightReport, scenarios, vision, strategicPlan]);

  // Reset Session
  const handleResetSession = useCallback(() => {
    if (window.confirm("Are you sure you want to clear your entire research session?")) {
      localStorage.removeItem(STORAGE_KEY);
      setForesightReport(null);
      setScenarios(null);
      setVision(null);
      setStrategicPlan(null);
      setStrategicQuestion("");
      window.location.reload();
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!strategicQuestion.trim()) {
      setError("Please enter a strategic question.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setForesightReport(null);
    setScenarios(null);
    setVision(null);
    setStrategicPlan(null);

    try {
      const { report } = await generateForesightAnalysis(strategicQuestion, model);
      setForesightReport(report);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred. Please check the console for details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [strategicQuestion, model]);

  const handleGenerateScenarios = useCallback(async () => {
    if (!foresightReport?.emergingTrends) return;
    setIsGeneratingScenarios(true);
    setError(null);
    setVision(null); 
    setStrategicPlan(null);
    try {
      const generatedScenarios = await generateScenarios(foresightReport.emergingTrends, model);
      setScenarios(generatedScenarios);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An error occurred while generating scenarios.");
      }
    } finally {
      setIsGeneratingScenarios(false);
    }
  }, [foresightReport, model]);

  const handleGenerateVision = useCallback(async ({ selectedElements, userPrompt }: { selectedElements: string[]; userPrompt: string }) => {
    if (selectedElements.length === 0) {
      setError("Please select at least one element to build your vision.");
      return;
    }
    setIsGeneratingVision(true);
    setError(null);
    setStrategicPlan(null);
    try {
      const generatedVision = await generateVision(selectedElements, userPrompt, model);
      setVision(generatedVision);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An error occurred while generating the vision.");
      }
    } finally {
      setIsGeneratingVision(false);
    }
  }, [model]);

  const handleGenerateStrategicPlan = useCallback(async () => {
    if (!vision || !foresightReport?.emergingTrends) return;
    setIsGeneratingPlan(true);
    setError(null);
    try {
      const plan = await generateStrategicPlan(vision, foresightReport.emergingTrends, model);
      setStrategicPlan(plan);
    } catch (e) {
       console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An error occurred while generating the strategic plan.");
      }
    } finally {
      setIsGeneratingPlan(false);
    }
  }, [vision, foresightReport, model]);


  const handleResetVision = useCallback(() => {
    setVision(null);
    setStrategicPlan(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-gray-200 font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
      {/* Ambient Lighting / Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      
      {/* Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 pointer-events-none mask-gradient"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <Header model={model} setModel={setModel} onReset={handleResetSession} />

        <main className="mt-8 pb-20">
          <FramingInput
            value={strategicQuestion}
            onChange={(e) => setStrategicQuestion(e.target.value)}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
          
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 backdrop-blur-md border border-red-500/50 rounded-xl text-red-200 shadow-lg shadow-red-900/20 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                {error}
              </div>
            </div>
          )}
          
          {isLoading && <LoadingSpinner />}
          
          {foresightReport && (
            <div className="mt-16 animate-fade-in">
              <ForesightDisplay 
                report={foresightReport}
                scenarios={scenarios}
                vision={vision}
                strategicPlan={strategicPlan}
                onGenerateScenarios={handleGenerateScenarios}
                onGenerateVision={handleGenerateVision}
                onGenerateStrategicPlan={handleGenerateStrategicPlan}
                isGeneratingScenarios={isGeneratingScenarios}
                isGeneratingVision={isGeneratingVision}
                isGeneratingPlan={isGeneratingPlan}
                onResetVision={handleResetVision}
                model={model}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;