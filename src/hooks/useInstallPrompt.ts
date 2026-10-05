import { PALETTE, THEME } from '@aesthetic/spec';
import { useState, useEffect } from 'react';

interface InstallPromptState {
  show: boolean;
  installed: boolean;
  deferredPrompt: Event | null;
}

export const useInstallPrompt = () => {
  const [promptState, setPromptState] = useState<InstallPromptState>({
    show: false,
    installed: false,
    deferredPrompt: null,
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptState(s => ({ ...s, deferredPrompt: e, show: true }));
    };

    const installedHandler = () => {
      setPromptState(s => ({ ...s, installed: true, show: false, deferredPrompt: null }));
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const promptInstall = async () => {
    if (promptState.deferredPrompt) {
      setPromptState(s => ({ ...s, show: false }));
      (promptState.deferredPrompt as any).prompt();
      const result = await (promptState.deferredPrompt as any).userChoice;
      setPromptState(s => ({ ...s, deferredPrompt: null }));
      return result.outcome === 'accepted';
    }
    return false;
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone;

  return {
    ...promptState,
    isInstalled: isStandalone || promptState.installed,
    isInstallable: !isStandalone && !promptState.installed && !!promptState.deferredPrompt,
    isIOS,
    promptInstall,
  };
};
