import React from 'react';

const loadingMessages = [
  "INITIALIZING SENSOR ARRAY...",
  "SCANNING FRINGE DATA SOURCES...",
  "DECRYPTING SIGNAL PATTERNS...",
  "APPLYING CIPHER LOGIC GATES...",
  "SYNTHESIZING MACRO TRENDS...",
];

export const LoadingSpinner: React.FC = () => {
  const [message, setMessage] = React.useState(loadingMessages[0]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prev => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-20 flex flex-col items-center justify-center gap-6 animate-fade-in">
      <div className="relative w-24 h-24">
         {/* Radar Rings */}
        <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-[ping_3s_linear_infinite]"></div>
        <div className="absolute inset-4 border-2 border-purple-500/30 rounded-full animate-[ping_3s_linear_infinite_1s]"></div>
        
        {/* Center Core */}
        <div className="absolute inset-0 m-auto w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_15px_cyan]"></div>
        
        {/* Rotating Scanner */}
        <div className="absolute inset-0 w-full h-full animate-spin [animation-duration:4s]">
             <div className="w-1/2 h-full bg-gradient-to-l from-cyan-500/20 to-transparent rounded-l-full origin-right border-r border-cyan-500/50 transform rotate-180"></div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase animate-pulse">{message}</p>
        <p className="text-[10px] text-gray-600 font-mono">CENTURION ENGINE V1.0</p>
      </div>
    </div>
  );
};