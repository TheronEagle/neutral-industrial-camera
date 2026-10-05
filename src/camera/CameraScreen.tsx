import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from './useCamera';
import { PALETTE } from '@aesthetic/spec';
import { AIStatusBar } from '@/components/AIStatusBar';
import { CompositionOverlay } from '@/components/CompositionOverlay';
import { AITip } from '@/components/AITip';
import { ShutterButton } from '@/components/ShutterButton';
import { CameraModeSelector } from '@/components/CameraModeSelector';
import { TopBar } from '@/components/TopBar';
import { BottomBar } from '@/components/BottomBar';

export const CameraScreen = () => {
  const navigate = useNavigate();
  const { videoRef, cameraState, startCamera, switchCamera, capturePhoto } = useCamera();
  const [mode, setMode] = useState<'photo' | 'portrait' | 'cinematic' | 'night' | 'document' | 'self'>('photo');
  const [showGrid, setShowGrid] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera('environment');
  }, [startCamera]);

  const handleCapture = async () => {
    if (isCapturing || !cameraState.ready) return;
    
    setIsCapturing(true);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const dataUrl = capturePhoto();
    if (dataUrl) {
      sessionStorage.setItem('lastPhoto', dataUrl);
      navigate('/review');
    }
    
    setIsCapturing(false);
  };

  if (cameraState.error) {
    return (
      <div className="fixed inset-0 bg-charcoal-black flex flex-col items-center justify-center p-6">
        <div className="text-fog-white text-center space-y-3">
          <div className="text-2xl font-light tracking-label">CAMERA UNAVAILABLE</div>
          <div className="text-concrete-grey text-sm">{cameraState.error}</div>
          <button 
            onClick={() => startCamera(cameraState.facingMode)}
            className="mt-6 px-6 py-3 bg-graphite-grey hover:bg-concrete-grey transition-colors text-fog-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-charcoal-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-charcoal-black/10" />
      
      <TopBar 
        onSwitchCamera={switchCamera}
        onSettings={() => {}}
      />
      
      <AIStatusBar />

      <div className="absolute inset-0 flex items-center justify-center">
        {showGrid && (
          <CompositionOverlay 
            mode={mode}
            palette={PALETTE}
          />
        )}
      </div>

      <AITip 
        message="Move into the shadow — this scene reads flatter than your aesthetic allows"
      />

      <div className="absolute bottom-0 left-0 right-0 pb-safe-bottom">
        <BottomBar>
          <button className="text-concrete-grey hover:text-fog-white transition-colors">
            <span className="text-xl">✛</span>
          </button>

          <div className="flex flex-col items-center gap-4">
            <ShutterButton 
              onClick={handleCapture}
              disabled={!cameraState.ready || isCapturing}
            />
            <div className="text-concrete-grey text-xs tracking-label">SHUTTER</div>
          </div>

          <button className="text-concrete-grey hover:text-fog-white transition-colors">
            <span className="text-xl">◉</span>
          </button>
        </BottomBar>

        <CameraModeSelector 
          mode={mode}
          onModeChange={setMode}
        />
      </div>
    </div>
  );
};
