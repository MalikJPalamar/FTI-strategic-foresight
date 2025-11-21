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
    <div className="relative group">
        {/* Glowing border effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl opacity-30 group-hover:opacity-60 transition duration-500 blur"></div>
        
        <div className="relative bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
              <label htmlFor="strategic-question" className="text-sm font-display font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Step 1: Strategic Framing
              </label>
              <span className="text-[10px] font-mono text-gray-500 border border-gray-800 px-2 py-1 rounded">PHASE: CONVERGE</span>
          </div>
          
          <textarea
            id="strategic-question"
            rows={3}
            className="w-full bg-black/50 border border-gray-700/50 rounded-xl p-4 text-gray-200 font-mono text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 placeholder-gray-600 resize-none shadow-inner"
            placeholder="Enter strategic imperative..."
            value={value}
            onChange={onChange}
            disabled={isLoading}
          />
          
          <div className="mt-6 flex justify-between items-center">
            <p className="text-xs text-gray-500 max-w-lg hidden md:block">
                The AI will perform a multi-vector sweep across 11 macro sources of disruption including patents, arXiv, and niche trade journals.
            </p>
            <button
              onClick={onGenerate}
              disabled={isLoading}
              className="relative overflow-hidden group inline-flex items-center gap-3 px-8 py-3 bg-cyan-500 text-black font-display font-bold tracking-wide rounded-lg transition-all hover:bg-cyan-400 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>INITIALIZING SCAN...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>INITIATE FORESIGHT PROTOCOL</span>
                </>
              )}
            </button>
          </div>
        </div>
    </div>
  );
};