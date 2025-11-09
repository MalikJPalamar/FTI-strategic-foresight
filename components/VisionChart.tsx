import React from 'react';
import { VisionChartData } from '../types';

interface VisionChartProps {
  vision: VisionChartData;
  onReset: () => void;
}

// A utility to wrap text for SVG <tspan> elements based on character count
const wrapText = (text: string, maxCharsPerLine: number): string[] => {
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
  const { title, xAxisLabel, yAxisLabel, preferredFuture, quadrants } = vision;

  const VIEWBOX_SIZE = 600;
  const PADDING = 80;
  const CENTER = VIEWBOX_SIZE / 2;
  const CHART_START = PADDING;
  const CHART_END = VIEWBOX_SIZE - PADDING;
  const CHART_SIZE = CHART_END - CHART_START;

  // Map the 0-100 data coordinates to the SVG's chart area coordinates
  const pointX = CHART_START + (preferredFuture.x / 100) * CHART_SIZE;
  const pointY = CHART_START + ((100 - preferredFuture.y) / 100) * CHART_SIZE; // Invert Y for SVG

  // Dynamically place the "Preferred Future" label above or below the point to avoid clipping
  const labelYOffset = pointY < CENTER ? 24 : -16;
  const preferredFutureLines = wrapText(preferredFuture.label, 18);
  const preferredFutureVerticalAnchor = labelYOffset > 0 ? 'start' : 'end';
  
  const QuadrantLabel: React.FC<{text: string, x: number, y: number}> = ({text, x, y}) => {
    const lines = wrapText(text, 20);
    // Adjust starting y to center the whole text block
    const yAdjust = y - ((lines.length - 1) * 14) / 2;
     return (
        <text x={x} y={yAdjust} textAnchor="middle" className="text-lg font-semibold fill-gray-400">
            {lines.map((line, index) => (
                <tspan key={index} x={x} dy={index === 0 ? 0 : '1.4em'}>{line}</tspan>
            ))}
        </text>
     )
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black/50 border border-cyan-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-cyan-900/20">
      <h3 className="text-xl font-bold text-center text-gray-200 mb-4">{title}</h3>
      <div className="relative w-full aspect-square max-w-2xl mx-auto">
        <svg viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} className="w-full h-full font-sans">
          {/* Dashed Border */}
          <rect
            x={CHART_START} y={CHART_START} width={CHART_SIZE} height={CHART_SIZE}
            fill="none"
            stroke="rgba(0, 170, 255, 0.3)"
            strokeWidth="2"
            strokeDasharray="8 8"
          />

          {/* Axes */}
          <line x1={CHART_START} y1={CENTER} x2={CHART_END} y2={CENTER} className="stroke-gray-600" strokeWidth="1" />
          <line x1={CENTER} y1={CHART_START} x2={CENTER} y2={CHART_END} className="stroke-gray-600" strokeWidth="1" />

          {/* Quadrant Labels */}
          <QuadrantLabel text={quadrants.topLeft} x={CHART_START + CHART_SIZE * 0.25} y={CHART_START + CHART_SIZE * 0.25} />
          <QuadrantLabel text={quadrants.topRight} x={CHART_START + CHART_SIZE * 0.75} y={CHART_START + CHART_SIZE * 0.25} />
          <QuadrantLabel text={quadrants.bottomLeft} x={CHART_START + CHART_SIZE * 0.25} y={CHART_START + CHART_SIZE * 0.75} />
          <QuadrantLabel text={quadrants.bottomRight} x={CHART_START + CHART_SIZE * 0.75} y={CHART_START + CHART_SIZE * 0.75} />

          {/* Axis Labels */}
          <text x={CENTER} y={CHART_END + PADDING / 1.8} textAnchor="middle" className="text-base fill-gray-500 font-medium tracking-wide">{xAxisLabel}</text>
          <text x={CHART_START - PADDING / 1.8} y={CENTER} textAnchor="middle" transform={`rotate(-90 ${CHART_START - PADDING / 1.8} ${CENTER})`} className="text-base fill-gray-500 font-medium tracking-wide">{yAxisLabel}</text>
          
          {/* Preferred Future Point */}
          <g transform={`translate(${pointX}, ${pointY})`} className="cursor-pointer group">
            <circle r="12" className="fill-cyan-400/30 group-hover:fill-cyan-400/50 transition-colors" />
            <circle r="6" className="fill-cyan-400 stroke-gray-900" strokeWidth="1" />
            
            <g transform={`translate(0, ${labelYOffset})`}>
              <text textAnchor="middle" className="text-base font-bold fill-gray-100 group-hover:fill-white transition-colors" stroke="#0a0a0a" strokeWidth="4" strokeLinejoin="round" paintOrder="stroke">
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
      <div className="mt-6 flex justify-center">
         <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
        >
            Build a New Matrix
        </button>
      </div>
    </div>
  );
};