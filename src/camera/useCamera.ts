import { useState, useEffect, useRef, useCallback } from 'react';
import { PALETTE, THEME } from '@aesthetic/spec';

interface CameraState {
  deviceId: string | null;
  facingMode: 'environment' | 'user';
  ready: boolean;
  error: string | null;
}

export const useCamera = () => {
  const [cameraState, setCameraState] = useState<CameraState>({
    deviceId: null,
    facingMode: 'environment',
    ready: false,
    error: null,
  });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
  }, []);

  const startCamera = useCallback(async (facingMode: 'environment' | 'user' = 'environment') => {
    stopStream();
    setCameraState(s => ({ ...s, ready: false, error: null }));
    
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
          aspectRatio: { ideal: 16 / 9 },
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
      });
    } catch (err: any) {
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Camera permission denied'
        : err.name === 'NotFoundError'
        ? 'No camera found'
        : 'Camera unavailable';
      
      setCameraState(s => ({ ...s, ready: false, error: errorMsg }));
    }
  }, [stopStream]);

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
    canvas.width = width;
    canvas.height = height;
    
    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [stream]);

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
