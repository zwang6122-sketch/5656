import React from 'react';
import { AppState } from '../types';

interface UIProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
}

export const UI: React.FC<UIProps> = ({ appState, setAppState }) => {
  const isFormed = appState === AppState.FORMED;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      
      {/* Header */}
      <header className="flex flex-col items-center text-center animate-fade-in-down">
        <h1 className="font-serif text-3xl md:text-5xl text-yellow-400 tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: '"Cinzel", serif' }}>
          THE GRAND CHRISTMAS
        </h1>
        <div className="h-0.5 w-32 bg-yellow-500 mt-2 shadow-[0_0_10px_#FFD700]"></div>
        <p className="mt-2 text-yellow-200/80 font-serif italic text-sm md:text-base tracking-wider">
          A Luxury Interactive Experience
        </p>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center mb-10 pointer-events-auto">
        <div className="backdrop-blur-sm bg-black/40 p-2 border border-yellow-500/30 rounded-full">
           <button
            onClick={() => setAppState(isFormed ? AppState.CHAOS : AppState.FORMED)}
            className={`
              relative group overflow-hidden px-10 py-4 rounded-full border-2 transition-all duration-500
              ${isFormed 
                ? 'border-yellow-500 bg-emerald-950/80 text-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.3)]' 
                : 'border-red-800 bg-gray-900/80 text-red-100 shadow-[0_0_30px_rgba(255,0,0,0.2)]'}
            `}
          >
            <span className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer`}></span>
            <span className="font-serif font-bold tracking-widest text-lg" style={{ fontFamily: '"Cinzel", serif' }}>
              {isFormed ? 'RELEASE CHAOS' : 'ASSEMBLE TREE'}
            </span>
          </button>
        </div>
        
        <p className="mt-4 text-xs text-yellow-500/60 font-serif tracking-widest uppercase">
          {isFormed ? 'Status: Formed • Luxury Mode Active' : 'Status: Entropy • Awaiting Order'}
        </p>
      </div>

      {/* Borders */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-yellow-600"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-yellow-600"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-yellow-600"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-yellow-600"></div>

    </div>
  );
};
