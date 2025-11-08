
import React from 'react';
import { SparklesIcon } from './icons';

interface FramingInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const FramingInput: React.FC<FramingInputProps> = ({ value, onChange, onGenerate, isLoading }) => {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-2xl shadow-black/30">
      <label htmlFor="strategic-question" className="block text-sm font-medium text-cyan-400 mb-2">
        Step 1: Frame Your Strategic Question
      </label>
      <textarea
        id="strategic-question"
        rows={3}
        className="w-full bg-gray-900/70 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200 placeholder-gray-500"
        placeholder="e.g., How will generative AI reshape the creative industries?"
        value={value}
        onChange={onChange}
        disabled={isLoading}
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Generate Foresight Brief
            </>
          )}
        </button>
      </div>
    </div>
  );
};
