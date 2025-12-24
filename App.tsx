import React, { useState } from 'react';
import { Experience } from './components/Experience';
import { UI } from './components/UI';
import { AppState } from './types';

const App: React.FC = () => {
  // Start in Formed state for immediate impact
  const [appState, setAppState] = useState<AppState>(AppState.FORMED);

  return (
    <div className="w-full h-screen relative bg-[#020402]">
      {/* 3D Scene */}
      <Experience appState={appState} />
      
      {/* UI Overlay */}
      <UI appState={appState} setAppState={setAppState} />
      
      {/* Texture/Grain Overlay for filmic look */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat mix-blend-overlay"></div>
    </div>
  );
};

export default App;
