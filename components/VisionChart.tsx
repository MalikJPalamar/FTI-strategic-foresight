
import React from 'react';
import { VisionChartData } from '../types';

interface VisionChartProps {
  vision: VisionChartData;
  onReset: () => void;
}

// A utility to wrap text for SVG <tspan> elements based on character count
const wrapText = (text: string, maxCharsPerLine: number): string[] => {
    if (!text) return [""];
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + ' ' + word).trim().length > maxCharsPerLine && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = (currentLine ? currentLine + ' ' : '') + word;
        }
    });
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines;
};

export const VisionChart: React.FC<VisionChartProps> = ({ vision, onReset }) => {
  // Guard clause for missing data to prevent "reading 'x' of undefined"
  if (!vision || !vision.preferredFuture || !vision.quadrants) {
    return (
      <div className="bg-gray-900/40 backdrop-blur-md border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center">
        <h3 className="text-xl font-display font-bold text-red-400 mb-4">Matrix Data Corruption</h3>
        <p className="text-gray-400 text-sm font-mono mb-6">The AI generated an incomplete dataset for the vision matrix.</p>
        <button
            onClick={onReset}
            className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg hover:bg-red-500/30 transition-all font-mono text-xs uppercase tracking-widest"
        >
            Reset & Regenerate
        </button>
      </div>
    );
  }

  const { title, xAxisLabel, yAxisLabel, preferredFuture, quadrants } = vision;

  const VIEWBOX_SIZE = 600;
  const PADDING = 80;
  const CENTER = VIEWBOX_SIZE / 2;
  const CHART_START = PADDING;
  const CHART_END = VIEWBOX_SIZE - PADDING;
  const CHART_SIZE = CHART_END - CHART_START;

  // Map the 0-100 data coordinates to the SVG's chart area coordinates
  // Safe access with fallback
  const valX = typeof preferredFuture.x === 'number' ? preferredFuture.x : 50;
  const valY = typeof preferredFuture.y === 'number' ? preferredFuture.y : 50;

  const pointX = CHART_START + (valX / 100) * CHART_SIZE;
  const pointY = CHART_START + ((100 - valY) / 100) * CHART_SIZE; // Invert Y for SVG

  // Dynamically place the "Preferred Future" label above or below the point to avoid clipping
  const labelYOffset = pointY < CENTER ? 24 : -16;
  const preferredFutureLines = wrapText(preferredFuture.label || "Preferred Future", 18);
  const preferredFutureVerticalAnchor = labelYOffset > 0 ? 'start' : 'end';
  
  const QuadrantLabel: React.FC<{text: string, x: number, y: number}> = ({text, x, y}) => {
    const lines = wrapText(text || "Undefined", 20);
    // Adjust starting y to center the whole text block
    const yAdjust = y - ((lines.length - 1) * 14) / 2;
     return (
        <text x={x} y={yAdjust} textAnchor="middle" className="text-sm font-bold fill-gray-500 font-display uppercase tracking-wide">
            {lines.map((line, index) => (
                <tspan key={index} x={x} dy={index === 0 ? 0 : '1.4em'}>{line}</tspan>
            ))}
        </text>
     )
  }

  return (
    <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
      <h3 className="text-2xl font-display font-bold text-center text-white mb-6">{title || "Strategic Matrix"}</h3>
      <div className="relative w-full aspect-square max-w-2xl mx-auto bg-black/20 rounded-2xl border border-white/5 p-4">
        <svg viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} className="w-full h-full font-sans overflow-visible">
          {/* Dashed Border */}
          <rect
            x={CHART_START} y={CHART_START} width={CHART_SIZE} height={CHART_SIZE}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Axes */}
          <line x1={CHART_START} y1={CENTER} x2={CHART_END} y2={CENTER} className="stroke-cyan-500/30" strokeWidth="2" />
          <line x1={CENTER} y1={CHART_START} x2={CENTER} y2={CHART_END} className="stroke-cyan-500/30" strokeWidth="2" />
          
          {/* Arrows on axes */}
          <path d={`M ${CHART_END} ${CENTER} l -10 -5 v 10 z`} className="fill-cyan-500/30" />
          <path d={`M ${CENTER} ${CHART_START} l -5 10 h 10 z`} className="fill-cyan-500/30" />

          {/* Quadrant Labels */}
          <QuadrantLabel text={quadrants.topLeft} x={CHART_START + CHART_SIZE * 0.25} y={CHART_START + CHART_SIZE * 0.25} />
          <QuadrantLabel text={quadrants.topRight} x={CHART_START + CHART_SIZE * 0.75} y={CHART_START + CHART_SIZE * 0.25} />
          <QuadrantLabel text={quadrants.bottomLeft} x={CHART_START + CHART_SIZE * 0.25} y={CHART_START + CHART_SIZE * 0.75} />
          <QuadrantLabel text={quadrants.bottomRight} x={CHART_START + CHART_SIZE * 0.75} y={CHART_START + CHART_SIZE * 0.75} />

          {/* Axis Labels */}
          <text x={CENTER} y={CHART_END + PADDING / 1.5} textAnchor="middle" className="text-xs fill-cyan-400 font-mono font-bold tracking-widest uppercase">{xAxisLabel || "X Axis"}</text>
          <text x={CHART_START - PADDING / 1.5} y={CENTER} textAnchor="middle" transform={`rotate(-90 ${CHART_START - PADDING / 1.5} ${CENTER})`} className="text-xs fill-cyan-400 font-mono font-bold tracking-widest uppercase">{yAxisLabel || "Y Axis"}</text>
          
          {/* Preferred Future Point */}
          <g transform={`translate(${pointX}, ${pointY})`} className="cursor-pointer group">
            <circle r="20" className="fill-purple-500/20 animate-pulse-slow" />
            <circle r="8" className="fill-purple-500 stroke-white" strokeWidth="2" />
            
            <g transform={`translate(0, ${labelYOffset})`}>
              <text textAnchor="middle" className="text-sm font-bold fill-white filter drop-shadow-lg" paintOrder="stroke" stroke="#000" strokeWidth="3">
                {preferredFutureLines.map((line, index) => (
                  <tspan key={index} x="0" dy={
                    index === 0 && preferredFutureVerticalAnchor === 'end' 
                    ? `-${(preferredFutureLines.length - 1) * 1.2}em` 
                    : index > 0 ? '1.2em' : '0'
                  }>{line}</tspan>
                ))}
              </text>
            </g>
          </g>
        </svg>
      </div>
      <div className="mt-8 flex justify-center">
         <button
            onClick={onReset}
            className="text-xs font-mono text-gray-500 hover:text-white uppercase tracking-widest border-b border-transparent hover:border-white transition-all pb-1"
        >
            Reset Matrix Data
        </button>
      </div>
    </div>
  );
};
