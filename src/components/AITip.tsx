import { PALETTE } from '@aesthetic/spec';

interface AITipProps {
  message: string;
}

export const AITip = ({ message }: AITipProps) => {
  return (
    <div className="absolute top-24 left-4 right-4">
      <div className="bg-charcoal-black/80 backdrop-blur-xs rounded-lg p-3 max-w-sm ml-auto">
        <div className="flex items-start gap-3">
          <div 
            className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: PALETTE.accentCool }}
          />
          <div>
            <div className="text-[11px] text-concrete-grey tracking-label mb-1">AI COACH</div>
            <p className="text-fog-white text-xs leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
