import { PALETTE } from '@aesthetic/spec';
import { useEffect, useState } from 'react';

export const FirstLaunch = ({ onComplete }: { onComplete: () => void }) => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-charcoal-black flex items-center justify-center">
      <div 
        className={`text-center px-8 max-w-md transition-all duration-700 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="mb-8">
          <h1 className="text-fog-white text-3xl font-light tracking-title mb-2">YOUR CAMERA</h1>
          <div className="h-px w-16 bg-safety-orange mx-auto mb-6" />
        </div>

        <p className="text-concrete-grey text-sm leading-relaxed mb-8">
          An AI coach tuned to your exact style — concrete, shadow, one sharp accent.
          The Neutral Industrial aesthetic is baked in. No style picker, no decisions.
          Just shoot.
        </p>

        <button
          onClick={onComplete}
          className="px-8 py-4 bg-graphite-grey hover:bg-concrete-grey text-fog-white transition-colors tracking-label w-full"
          style={{
            letterSpacing: '0.05em',
          }}
        >
          ENABLE CAMERA
        </button>

        <div className="mt-8 text-xs text-concrete-grey/60 tracking-label">
          PRIVACY: photos stay on device. AI analysis optional.
        </div>
      </div>
    </div>
  );
};
