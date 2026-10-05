import { PALETTE } from '@aesthetic/spec';

export const CompositionOverlay = ({ 
  mode,
  palette
}: { 
  mode: string;
  palette: typeof PALETTE;
}) => {
  const gridStyle = {
    color: PALETTE.accentCool,
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0">
        {/* Rule of thirds */}
        <div className="absolute top-0 left-0 w-full h-px opacity-12" style={{ backgroundColor: PALETTE.accentCool, top: '33.33%' }} />
        <div className="absolute top-0 left-0 w-full h-px opacity-12" style={{ backgroundColor: PALETTE.accentCool, top: '66.66%' }} />
        <div className="absolute top-0 left-0 w-px h-full opacity-12" style={{ backgroundColor: PALETTE.accentCool, left: '33.33%' }} />
        <div className="absolute top-0 left-0 w-px h-full opacity-12" style={{ backgroundColor: PALETTE.accentCool, left: '66.66%' }} />
        
        {/* Horizon line */}
        <div className="absolute bottom-1/3 left-0 right-0 h-px opacity-8" style={{ backgroundColor: PALETTE.accentCool }} />
        
        {/* Portrait framing guide for portrait mode */}
        {mode === 'portrait' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-48 h-64 border-2 border-dashed opacity-20"
              style={{ borderColor: PALETTE.accentSharp }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
