import { PALETTE } from '@aesthetic/spec';

export const AIStatusBar = () => {
  const [status, setStatus] = useState<'ready' | 'analysing' | 'offline'>('ready');

  return (
    <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-center text-xs">
      <div className="flex items-center gap-2">
        <div 
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            status === 'ready' 
              ? `bg-${PALETTE.accentCool}` 
              : status === 'analysing' 
                ? `bg-${PALETTE.accentSharp}` 
                : `bg-${PALETTE.highlight}`
          }`}
        />
        <span className="text-[PALETTE.highlight]">{status.toUpperCase()}</span>
      </div>
    </div>
  );
};