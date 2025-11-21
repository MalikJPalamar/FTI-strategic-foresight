import React, { useEffect, useState } from 'react';
import { BrainCircuitIcon } from './icons';
import { AIModel } from '../types';

interface HeaderProps {
  model: AIModel;
  setModel: (model: AIModel) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ model, setModel, onReset }) => {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [model]);

  return (
    <header className="sticky top-4 z-50 bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl shadow-black/40 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-3 rounded-xl border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <BrainCircuitIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 uppercase">
            Centurion Foresight
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-xs text-cyan-500/80 font-mono tracking-widest uppercase">Strategic Intelligence Engine</p>
            <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
        <button
          onClick={() => setModel('gemini-2.5-flash')}
          className={`px-4 py-2 rounded-lg text-xs font-display font-semibold tracking-wider transition-all duration-300 ${
            model === 'gemini-2.5-flash'
              ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-cyan-500/30'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          ⚡ FLASH 2.5
        </button>
        <button
          onClick={() => setModel('gemini-3-pro-preview')}
          className={`px-4 py-2 rounded-lg text-xs font-display font-semibold tracking-wider transition-all duration-300 ${
            model === 'gemini-3-pro-preview'
              ? 'bg-purple-500/20 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)] border border-purple-500/30'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          🧠 PRO 3 PREVIEW
        </button>
      </div>

      <div className="flex flex-col items-end gap-1 pr-2">
          <button 
            onClick={onReset}
            className="text-[10px] font-mono text-red-400/60 hover:text-red-400 transition-colors hover:underline underline-offset-4 uppercase tracking-widest"
          >
            Reset Session
          </button>
          <div className={`flex items-center gap-2 transition-opacity duration-500 ${saved ? 'opacity-100' : 'opacity-0'}`}>
             <div className="w-1 h-1 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
             <span className="text-[10px] text-green-500/80 font-mono uppercase tracking-wider">
                System Synced
             </span>
          </div>
      </div>
    </header>
  );
};