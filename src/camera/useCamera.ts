import { useState, useEffect, useRef, useCallback } from 'react';
import { PALETTE } from '@aesthetic/spec';

interface CameraState {
  deviceId: string | null;
  facingMode: 'environment' | 'user';
  ready: boolean;
  error: string | null;
  analysisMode: 'periodic' | 'manual' | 'off';
  analysisInterval: number | null;
  lastAnalysis: number | null;
}

export const useCamera = () => {
  const [cameraState, setCameraState] = useState<CameraState>({
    deviceId: null,
    facingMode: 'environment',
    ready: false,
    error: null,
    analysisMode: 'off',
    analysisInterval: null,
    lastAnalysis: null,
  });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationRef.current !== null) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    setStream(null);
    setCameraState(s => ({
      ...s,
      analysisMode: 'off',
      analysisInterval: null,
      lastAnalysis: null,
    }));
    setAnalysisResult(null);
  }, []);

  const startCamera = useCallback(async (facingMode: 'environment' | 'user' = 'environment') => {
    stopStream();
    setCameraState(s => ({ ...s, ready: false, error: null }));

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          // Don't fix width/height - let it be responsive to the video element
          aspectRatio: 16 / 9,
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      const track = mediaStream.getVideoTracks()[0];
      const settings = track.getSettings();

      setCameraState({
        deviceId: settings.deviceId || null,
        facingMode,
        ready: true,
        error: null,
        analysisMode: cameraState.analysisMode,
        analysisInterval: cameraState.analysisInterval,
        lastAnalysis: Date.now(),
      });
    } catch (err: any) {
      const errorMsg = err.name === 'NotAllowedError'
        ? 'Camera permission denied'
        : err.name === 'NotFoundError'
        ? 'No camera found'
        : 'Camera unavailable';

      setCameraState(s => ({ ...s, ready: false, error: errorMsg }));
    }
  }, []);

  const switchCamera = useCallback(async () => {
    const newFacingMode = cameraState.facingMode === 'environment' ? 'user' : 'environment';
    await startCamera(newFacingMode);
  }, [cameraState.facingMode, startCamera]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || !stream) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const width = video.videoWidth;
    const height = video.videoHeight;
    // Use 4:3 or native aspect, or match video dimensions
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(video, 0, 0, width, height);
    // Return high-quality JPEG for storage
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [stream]);

  // Periodic AI analysis - captures a frame and sends to AI provider
  const startPeriodicAnalysis = useCallback(async (aiProvider: any, aiEnabled: boolean) => {
    if (!aiEnabled || cameraState.analysisMode !== 'periodic') return;

    const video = videoRef.current;
    if (!video) return;

    // Capture frame every ~2 seconds
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use a moderate resolution for analysis - not too small, not full
    const analysisWidth = 400;
    const analysisHeight = (video.videoHeight / video.videoWidth) * analysisWidth;
    canvas.width = analysisWidth;
    canvas.height = analysisHeight;

    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, analysisWidth, analysisHeight);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    try {
      const result = await aiProvider.analysePhoto(dataUrl);
      setAnalysisResult(result);
      setCameraState(s => ({ ...s, lastAnalysis: Date.now() }));
    } catch (err) {
      console.error('AI analysis failed', err);
      setAnalysisResult({ error: 'AI unavailable' });
    }
  }, []);

  const toggleAnalysisMode = useCallback(async (mode: 'periodic' | 'manual' | 'off', aiEnabled: boolean) => {
    if (mode === 'off') {
      stopStream();
      setAnalysisResult(null);
      return;
    }

    setCameraState(s => ({ ...s, analysisMode: mode }));

    if (mode === 'periodic') {
      // Start analysis every 2 seconds
      if (animationRef.current !== null) {
        clearInterval(animationRef.current);
      }
      animationRef.current = window.setInterval(async () => {
        await toggleAnalysisMode('periodic', aiEnabled);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  return {
    videoRef,
    cameraState,
    stream,
    startCamera,
    stopCamera: stopStream,
    switchCamera,
    capturePhoto,
    analysisResult,
    analysisMode: cameraState.analysisMode,
    lastAnalysis: cameraState.lastAnalysis,
    toggleAnalysisMode,
  };
};

export const getCameraDevices = async (): Promise<MediaDeviceInfo[]> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(d => d.kind === 'videoinput');
  } catch {
    return [];
  }
};
