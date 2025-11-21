
import React, { useMemo } from 'react';
import { Signal, MacroSource } from '../types';

interface FringeGraphProps {
  signals: Signal[];
  onNodeClick: (signal: Signal) => void;
}

const MACRO_SOURCES: MacroSource[] = [
  'Technology', 'Media & Telecommunications', 'Infrastructure', 
  'Education', 'Wealth Distribution', 'Government', 
  'Geopolitics', 'Economy', 'Public Health', 
  'Demographics', 'Environment'
];

export const FringeGraph: React.FC<FringeGraphProps> = ({ signals, onNodeClick }) => {
  const SIZE = 600;
  const CENTER = SIZE / 2;
  const RADIUS = SIZE / 2 - 40;

  // Group signals by macro source
  const signalsBySource = useMemo(() => {
    const groups: Record<string, Signal[]> = {};
    MACRO_SOURCES.forEach(s => groups[s] = []);
    (signals || []).forEach(s => {
        // Normalize source match
        const match = MACRO_SOURCES.find(ms => s.macroSource && s.macroSource.includes(ms)) || 'Technology';
        if(groups[match]) groups[match].push(s);
    });
    return groups;
  }, [signals]);

  // Calculate layout
  const sectors = MACRO_SOURCES.map((source, i) => {
    const anglePerSector = (2 * Math.PI) / MACRO_SOURCES.length;
    const startAngle = i * anglePerSector - Math.PI / 2; // Start from top
    const endAngle = (i + 1) * anglePerSector - Math.PI / 2;
    const labelAngle = startAngle + anglePerSector / 2;
    
    // Label Position
    const labelRadius = RADIUS + 20;
    const lx = CENTER + labelRadius * Math.cos(labelAngle);
    const ly = CENTER + labelRadius * Math.sin(labelAngle);
    
    // Signal Nodes
    const sourceSignals = signalsBySource[source] || [];
    const nodes = sourceSignals.map((signal, idx) => {
      // Distribute nodes within the sector wedge
      // Distance from center is inverted Relevancy (High relevancy = closer to core)
      const normalizedScore = Math.max(0.2, Math.min(1, signal.relevancyScore / 100));
      const distance = RADIUS * (1.1 - normalizedScore); // 100 score = 0.1 distance (close), 0 score = 0.9 distance (far)
      
      // Jitter angle slightly to avoid overlap
      const angleJitter = (Math.random() - 0.5) * (anglePerSector * 0.6);
      const nodeAngle = labelAngle + angleJitter;
      
      return {
        x: CENTER + distance * Math.cos(nodeAngle),
        y: CENTER + distance * Math.sin(nodeAngle),
        signal
      };
    });

    return { source, startAngle, endAngle, lx, ly, nodes };
  });

  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full overflow-visible font-sans">
        {/* Background Rings */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.3} fill="none" stroke="#374151" strokeWidth="1" strokeDasharray="2 4" className="opacity-30" />
        <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.6} fill="none" stroke="#374151" strokeWidth="1" strokeDasharray="2 4" className="opacity-30" />
        <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.9} fill="none" stroke="#374151" strokeWidth="1" className="opacity-50" />

        {/* Sectors */}
        {sectors.map((sector, i) => (
          <g key={i}>
            {/* Sector Dividers */}
            <line 
              x1={CENTER} y1={CENTER} 
              x2={CENTER + RADIUS * Math.cos(sector.startAngle)} 
              y2={CENTER + RADIUS * Math.sin(sector.startAngle)} 
              stroke="#374151" strokeWidth="1" className="opacity-30"
            />
            
            {/* Label */}
            <text 
              x={sector.lx} y={sector.ly} 
              textAnchor="middle" 
              dominantBaseline="middle"
              className="text-[8px] fill-gray-400 uppercase tracking-widest font-bold font-mono"
            >
              {sector.source.split(' ')[0]}
            </text>

            {/* Nodes */}
            {sector.nodes.map((node, nIdx) => (
              <g 
                key={nIdx} 
                className="cursor-pointer hover:opacity-80 transition-opacity group"
                onClick={() => onNodeClick(node.signal)}
              >
                 {/* Pulse Effect for high relevancy */}
                 {node.signal.relevancyScore > 85 && (
                    <circle cx={node.x} cy={node.y} r={10} fill="rgba(6,182,212,0.3)" className="animate-pulse" />
                 )}

                <circle 
                  cx={node.x} cy={node.y} 
                  r={3 + (node.signal.confidenceScore / 25)} 
                  fill={node.signal.velocity === 'Exponential' ? '#d946ef' : '#06b6d4'} 
                  stroke="rgba(0,0,0,0.8)" 
                  strokeWidth="1.5" 
                  className="transition-all duration-300 hover:r-6 hover:stroke-white"
                />
              </g>
            ))}
          </g>
        ))}
        
        {/* Center Hub */}
        <circle cx={CENTER} cy={CENTER} r={25} fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.5)" />
        <circle cx={CENTER} cy={CENTER} r={4} fill="#06b6d4" className="animate-pulse" />
        <text x={CENTER} y={CENTER} textAnchor="middle" dy="2.5em" className="text-[8px] font-mono font-bold fill-cyan-500 tracking-[0.2em]">F.T.I.</text>
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur p-3 rounded-xl border border-white/10 text-[10px] text-gray-400 shadow-lg">
         <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-fuchsia-500 border border-black"></div> <span className="font-mono uppercase">Exponential</span>
         </div>
         <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 border border-black"></div> <span className="font-mono uppercase">Linear</span>
         </div>
         <div className="h-px bg-gray-700 my-2"></div>
         <div className="text-[9px] opacity-70 font-mono text-center">PROXIMITY = RELEVANCE</div>
      </div>
    </div>
  );
};
