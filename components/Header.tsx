
import React from 'react';
import { BrainCircuitIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="inline-flex items-center justify-center gap-3 bg-gray-900/50 border border-gray-700 px-6 py-3 rounded-full">
        <BrainCircuitIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">
          Centaurion Foresight
        </h1>
      </div>
      <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
        A strategic co-pilot for identifying weak signals and analyzing emerging trends.
      </p>
    </header>
  );
};
