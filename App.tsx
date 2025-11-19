
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FramingInput } from './components/FramingInput';
import { ForesightDisplay } from './components/ForesightDisplay';
import { generateForesightAnalysis, generateScenarios, generateVision, generateStrategicPlan } from './services/geminiService';
import { ForesightReport, Scenario, VisionChartData, StrategicPlan } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';

const App: React.FC = () => {
  const [strategicQuestion, setStrategicQuestion] = useState<string>(
    "What are the emerging technological, cultural, and economic trends shaping the future of the remote and hybrid workforce, and what are their potential second- and third-order impacts on business operations, urban planning, and employee well-being?"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [foresightReport, setForesightReport] = useState<ForesightReport | null>(null);

  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState<boolean>(false);
  
  const [vision, setVision] = useState<VisionChartData | null>(null);
  const [isGeneratingVision, setIsGeneratingVision] = useState<boolean>(false);

  const [strategicPlan, setStrategicPlan] = useState<StrategicPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);


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
      const { report } = await generateForesightAnalysis(strategicQuestion);
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
  }, [strategicQuestion]);

  const handleGenerateScenarios = useCallback(async () => {
    if (!foresightReport?.emergingTrends) return;
    setIsGeneratingScenarios(true);
    setError(null);
    setVision(null); 
    setStrategicPlan(null);
    try {
      const generatedScenarios = await generateScenarios(foresightReport.emergingTrends);
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
  }, [foresightReport]);

  const handleGenerateVision = useCallback(async ({ selectedElements, userPrompt }: { selectedElements: string[]; userPrompt: string }) => {
    if (selectedElements.length === 0) {
      setError("Please select at least one element to build your vision.");
      return;
    }
    setIsGeneratingVision(true);
    setError(null);
    setStrategicPlan(null);
    try {
      const generatedVision = await generateVision(selectedElements, userPrompt);
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
  }, []);

  const handleGenerateStrategicPlan = useCallback(async () => {
    if (!vision || !foresightReport?.emergingTrends) return;
    setIsGeneratingPlan(true);
    setError(null);
    try {
      const plan = await generateStrategicPlan(vision, foresightReport.emergingTrends);
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
  }, [vision, foresightReport]);


  const handleResetVision = useCallback(() => {
    setVision(null);
    setStrategicPlan(null);
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-gray-900/[0.2] z-0"></div>
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        <Header />

        <main className="mt-12">
          <FramingInput
            value={strategicQuestion}
            onChange={(e) => setStrategicQuestion(e.target.value)}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
          
          {error && <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">{error}</div>}
          
          {isLoading && <LoadingSpinner />}
          
          {foresightReport && (
            <div className="mt-12 animate-fade-in">
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
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
