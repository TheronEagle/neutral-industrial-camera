import { useState, useEffect } from 'react';
import { PALETTE } from '@aesthetic/spec';

export const TopBar = ({ onSwitchCamera, onSettings }: {
  onSwitchCamera: () => void;
  onSettings: () => void;
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-center">
      <button 
        onClick={onSwitchCamera}
        className="text-fog-white/80 hover:text-fog-white transition-colors"
        aria-label="Switch camera"
      >
        ↻
      </button>
      
      <div className="flex items-center gap-4">
        <div className="text-fog-white text-xs tracking-label">AI ●</div>
        <button className="text-fog-white/80 hover:text-fog-white transition-colors">⚡</button>
        <button onClick={onSettings} className="text-fog-white/80 hover:text-fog-white transition-colors">⚙</button>
      </div>
    </div>
  );
};

export const BottomBar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-between items-center px-8 py-6">
      {children}
    </div>
  );
};

export const CameraModeSelector = ({ mode, onModeChange }: {
  mode: string;
  onModeChange: (mode: string) => void;
}) => {
  const modes = ['PHOTO', 'PORTRAIT', 'CINEMATIC', 'NIGHT', 'DOCUMENT', 'SELF'];
  
  return (
    <div className="flex justify-center gap-6 mb-4">
      {modes.map(m => (
        <button
          key={m}
          onClick={() => onModeChange(m.toLowerCase())}
          className={`text-xs tracking-label transition-colors ${
            mode.toUpperCase() === m 
              ? 'text-safety-orange' 
              : 'text-concrete-grey hover:text-fog-white'
          }`}
          style={{ 
            color: mode.toUpperCase() === m ? PALETTE.accentSharp : undefined 
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
};

export const AIStatusBar = () => {
  const [status, setStatus] = useState('active');
  
  return (
    <div className="absolute top-16 left-4 right-4 flex justify-center">
      <div className="bg-graphite-grey/60 backdrop-blur-xs px-3 py-1 rounded-full">
        <span className="text-fog-white text-[10px] tracking-label">
          AI COACH {status === 'active' ? '●' : '○'}
        </span>
      </div>
    </div>
  );
};

export const InstallPrompt = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-24 left-4 right-4 z-50">
      <div className="bg-graphite-grey p-4 rounded-lg">
        <div className="text-fog-white text-sm mb-2">Install Camera App</div>
        <div className="text-concrete-grey text-xs mb-3">
          Add to Home Screen for full-screen camera experience
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-safety-orange text-charcoal-black text-xs">
            INSTALL
          </button>
          <button className="px-4 py-2 bg-graphite-grey text-concrete-grey text-xs">
            LATER
          </button>
        </div>
      </div>
    </div>
  );
};
