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
        >
          {m}
        </button>
      ))}
    </div>
  );
};
