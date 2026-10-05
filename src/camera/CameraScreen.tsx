import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from './useCamera';
import { PALETTE } from '@aesthetic/spec';
import { AIStatusBar } from '@/components/AIStatusBar';
import { CompositionOverlay } from '@/components/CompositionOverlay';
import { AITip } from '@/components/AITip';
import { ShutterButton } from '@/components/ShutterButton';

type CameraModeId = 'photo' | 'portrait' | 'cinematic' | 'night' | 'document' | 'self';

const MODES: string[] = ['PHOTO', 'PORTRAIT', 'CINEMATIC', 'NIGHT', 'DOCUMENT', 'SELF'];

export const CameraScreen = () => {
  const navigate = useNavigate();
  const { videoRef, cameraState, startCamera, switchCamera, capturePhoto } = useCamera();
  const [mode, setMode] = useState<CameraModeId>('photo');
  const [showGrid, setShowGrid] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  // SELF always uses the front camera, so the control is not a dead label.
  useEffect(() => {
    if (mode === 'self' && cameraState.facingMode !== 'user') {
      void startCamera('user');
    } else if (
      mode !== 'self' &&
      mode !== 'portrait' &&
      cameraState.facingMode === 'user'
    ) {
      void startCamera('environment');
    }
    // Intentionally keyed on mode only: re-running on facingMode would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

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
      <div className="app-viewport grid place-items-center p-6">
        <div className="max-w-xs space-y-3 text-center text-fog-white">
          <div className="text-lg font-light tracking-label">CAMERA UNAVAILABLE</div>
          <p className="text-sm text-concrete-grey">{cameraState.error}</p>
          {cameraState.error === 'Camera permission denied' && (
            <p className="text-xs text-concrete-grey">
              Allow camera access in your browser settings, then try again.
            </p>
          )}
          <button
            type="button"
            onClick={() => startCamera(cameraState.facingMode)}
            className="mt-4 min-h-11 w-full bg-graphite-grey px-6 py-3 text-sm tracking-label text-fog-white transition-colors hover:bg-concrete-grey"
          >
            RETRY
          </button>
          <button
            type="button"
            onClick={() => navigate('/gallery')}
            className="min-h-11 w-full px-6 py-3 text-sm tracking-label text-concrete-grey transition-colors"
          >
            OPEN GALLERY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-viewport">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-label="Live camera preview"
        className="absolute inset-0 h-full w-full object-cover"
      />
      
      <div className="absolute inset-0 bg-charcoal-black/10" />
      
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-safe-top">
        <button
          type="button"
          onClick={switchCamera}
          aria-label="Switch camera"
          className="grid h-11 w-11 place-items-center text-xl text-fog-white/80 transition-colors active:text-fog-white"
        >
          ↻
        </button>

        <button
          type="button"
          onClick={() => setShowGrid((v) => !v)}
          aria-label="Toggle composition guides"
          aria-pressed={showGrid}
          className={`grid h-11 w-11 place-items-center text-xl transition-colors ${
            showGrid ? 'text-fog-white' : 'text-fog-white/40'
          }`}
        >
          ⊞
        </button>
      </div>

      <AIStatusBar status={cameraState.ready ? 'ready' : 'offline'} />

      {showGrid && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <CompositionOverlay mode={mode} palette={PALETTE} />
        </div>
      )}

      <AITip
        message="Move into the shadow — this scene reads flatter than your aesthetic allows"
      />

      <div className="absolute bottom-0 left-0 right-0 pb-safe-bottom">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/gallery')}
              aria-label="Open gallery"
              className="grid h-11 w-11 place-items-center text-xl text-concrete-grey transition-colors active:text-fog-white"
            >
              ◉
            </button>

            <ShutterButton
              onClick={handleCapture}
              disabled={!cameraState.ready || isCapturing}
              capturing={isCapturing}
            />

            <button
              type="button"
              onClick={switchCamera}
              aria-label="Switch camera"
              className="grid h-11 w-11 place-items-center text-xl text-concrete-grey transition-colors active:text-fog-white"
            >
              ⇄
            </button>
          </div>
        </div>

        <div
          className="flex justify-center gap-4 overflow-x-auto px-4 pb-2"
          role="tablist"
          aria-label="Camera mode"
        >
          {MODES.map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(m.toLowerCase() as CameraModeId)}
                className={`min-h-11 shrink-0 px-1 text-[10px] tracking-label transition-colors ${
                  active ? 'text-safety-orange' : 'text-concrete-grey'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
