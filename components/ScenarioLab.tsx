
import React, { useState } from 'react';
import { Scenario, Vision } from '../types';
import { EyeIcon, SparklesIcon, FuturesIcon, PencilIcon } from './icons';

interface ScenarioLabProps {
    scenarios: Scenario[];
    vision: Vision | null;
    onGenerateVision: (params: { selectedElements: string[]; userPrompt: string }) => void;
    isGeneratingVision: boolean;
    onEditVision: (prompt: string) => void;
    isEditingVision: boolean;
    onResetVision: () => void;
    onGenerateScenarios: () => void;
    isGeneratingScenarios: boolean;
}

const ScenarioCard: React.FC<{ scenario: Scenario, onSelect: (element: string, selected: boolean) => void }> = ({ scenario, onSelect }) => {
    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col h-full">
            <h4 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">{scenario.title}</h4>
            <p className="mt-3 text-gray-400 flex-grow">{scenario.narrative}</p>
            <div className="mt-4 border-t border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-300 mb-2">Selectable Elements:</h5>
                <div className="space-y-2">
                    {scenario.implications.map((imp, index) => (
                        <label key={index} className="flex items-start p-3 rounded-md bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-600"
                                onChange={(e) => onSelect(imp, e.target.checked)}
                            />
                            <span className="ml-3 text-gray-300">{imp}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

const VisionEditor: React.FC<{ vision: Vision, onEdit: (prompt: string) => void, isEditing: boolean, onReset: () => void }> = ({ vision, onEdit, isEditing, onReset }) => {
    const [editPrompt, setEditPrompt] = useState('');

    const handleEditClick = () => {
        if (editPrompt.trim()) {
            onEdit(editPrompt);
            setEditPrompt('');
        }
    };

    return (
    <div className="bg-gradient-to-br from-gray-900 to-black/50 border border-cyan-500/30 rounded-2xl p-8 shadow-2xl shadow-cyan-900/20">
        <div className="relative">
            <img 
                src={vision.imageUrl} 
                alt="Generated Vision" 
                className="w-full h-auto max-h-[512px] object-contain rounded-lg border-2 border-gray-700 mb-6"
            />
            {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                    <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
        </div>

        <p className="text-lg text-gray-200 leading-relaxed italic text-center">"{vision.statement}"</p>

        <div className="mt-6 border-t border-gray-700 pt-6 space-y-4">
             <label htmlFor="vision-edit-prompt" className="flex items-center justify-center gap-2 text-sm font-medium text-cyan-400">
                <PencilIcon className="w-4 h-4" />
                Edit Your Vision Image
            </label>
             <textarea
                id="vision-edit-prompt"
                rows={2}
                className="w-full bg-gray-900/70 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200 placeholder-gray-500"
                placeholder="e.g., Add a retro filter, make it more vibrant, change style to solarpunk..."
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                disabled={isEditing}
            />
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={handleEditClick}
                    disabled={isEditing || !editPrompt.trim()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all w-full sm:w-auto"
                >
                    <SparklesIcon className="w-5 h-5" />
                    Apply Edit
                </button>
                 <button
                    onClick={onReset}
                    disabled={isEditing}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
                >
                    Build a New Vision
                </button>
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
    onEditVision,
    isEditingVision,
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
        <section className="space-y-12">
            <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b-2 border-cyan-500/30 pb-2 mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-200">Step 4: Scenario Lab</h2>
                     <button
                        onClick={onGenerateScenarios}
                        disabled={isGeneratingScenarios}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                        {isGeneratingScenarios ? (
                            <>
                               <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Regenerating...
                            </>
                        ) : (
                            <>
                                <FuturesIcon className="w-4 h-4" />
                                Regenerate Scenarios
                            </>
                        )}
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {scenarios.map((scenario, index) => (
                        <ScenarioCard key={index} scenario={scenario} onSelect={handleSelectElement} />
                    ))}
                </div>
            </div>

            <div>
                 <h2 className="text-2xl font-bold text-gray-200 border-b-2 border-cyan-500/30 pb-2 mb-6 flex items-center gap-3">
                    <EyeIcon className="w-7 h-7" />
                    Step 5: {vision ? 'Your Preferred Vision' : 'Vision Builder'}
                </h2>
                
                {vision ? (
                    <VisionEditor 
                        vision={vision} 
                        onEdit={onEditVision}
                        isEditing={isEditingVision}
                        onReset={onResetVision}
                    />
                ) : (
                     <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-center">
                        <p className="text-gray-400 mb-6">Select desirable elements from the scenarios above, then provide an optional style prompt to create your preferred future.</p>
                        
                        <div className="max-w-lg mx-auto space-y-4">
                          <label htmlFor="vision-prompt" className="block text-sm font-medium text-cyan-400">
                            Add a brief description to guide the image style (optional)
                          </label>
                          <textarea
                            id="vision-prompt"
                            rows={2}
                            className="w-full bg-gray-900/70 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200 placeholder-gray-500"
                            placeholder="e.g., minimalist, solarpunk aesthetic, hopeful, high-tech"
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            disabled={isGeneratingVision}
                          />

                          <button
                            onClick={() => onGenerateVision({ selectedElements, userPrompt })}
                            disabled={selectedElements.length === 0 || isGeneratingVision}
                            className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                            >
                                {isGeneratingVision ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Synthesizing Vision...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        Synthesize Preferred Vision ({selectedElements.length} selected)
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
