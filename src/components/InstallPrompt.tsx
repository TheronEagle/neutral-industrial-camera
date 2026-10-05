import React from 'react';

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
