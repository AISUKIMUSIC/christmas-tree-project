import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.CHAOS);

  const toggleState = useCallback(() => {
    setTreeState(prev => prev === TreeState.CHAOS ? TreeState.FORMED : TreeState.CHAOS);
  }, []);

  return (
    <div className="relative w-full h-screen bg-luxury-black">
      {/* 3D Canvas */}
      <Canvas 
        dpr={[1, 2]} 
        gl={{ 
            antialias: false, // Postprocessing handles AA better typically with bloom
            toneMapping: 3, // CineonToneMapping
            toneMappingExposure: 1.5 
        }}
      >
        <Scene treeState={treeState} />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
        
        {/* Header */}
        <header className="flex flex-col items-center text-center space-y-2 pointer-events-auto">
          <div className="w-16 h-1 bg-luxury-gold mb-4 shadow-[0_0_10px_#D4AF37]"></div>
          <h1 className="text-4xl md:text-6xl font-serif text-luxury-gold tracking-widest uppercase drop-shadow-lg">
            Grand Holiday
          </h1>
          <h2 className="text-sm md:text-lg font-sans text-luxury-goldLight tracking-[0.3em] uppercase opacity-80">
            Luxury Interactive Experience
          </h2>
        </header>

        {/* Footer Controls */}
        <footer className="flex flex-col items-center pb-8 pointer-events-auto">
            <p className="text-luxury-goldLight font-serif italic mb-6 opacity-60 text-center max-w-md">
                "Experience the magnificence of the season. Bring order to chaos."
            </p>
            
            <button
                onClick={toggleState}
                className="group relative px-12 py-4 bg-transparent overflow-hidden transition-all duration-500 ease-out"
            >
                {/* Button Background Layers */}
                <div className="absolute inset-0 bg-luxury-emerald opacity-40 group-hover:opacity-100 transition-opacity duration-500 border border-luxury-gold"></div>
                <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-center bg-luxury-gold transition-transform duration-500 ease-out opacity-20"></div>
                
                {/* Button Text */}
                <span className="relative z-10 font-serif text-xl tracking-widest text-luxury-gold group-hover:text-white transition-colors duration-300">
                    {treeState === TreeState.CHAOS ? 'ASSEMBLE' : 'SCATTER'}
                </span>
                
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-luxury-gold"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-luxury-gold"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-luxury-gold"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-luxury-gold"></div>
            </button>
            
            <div className="mt-4 text-[10px] text-luxury-goldLight opacity-30 tracking-widest">
                EST. 2024 • THE TRUMP COLLECTION
            </div>
        </footer>
      </div>
      
      {/* Decorative Border Frame */}
      <div className="absolute inset-4 border border-luxury-gold opacity-20 pointer-events-none rounded-lg"></div>
    </div>
  );
};

export default App;