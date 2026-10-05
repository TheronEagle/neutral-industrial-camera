import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { CameraScreen } from '@/camera/CameraScreen';
import { PhotoReview } from '@/camera/PhotoReview';
import { GalleryScreen } from '@/gallery/GalleryScreen';
import { EditorScreen } from '@/editor/EditorScreen';
import { FirstLaunch } from '@/components/FirstLaunch';
import { InstallPrompt } from '@/components/InstallPrompt';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

function App() {
  const [hasLaunched, setHasLaunched] = useState(false);
  const [installEvent, setInstallEvent] = useState<any>(null);
  const navigate = useNavigate();

  const installPrompt = useInstallPrompt();

  useEffect(() => {
    const launched = localStorage.getItem('nicamera-launched');
    if (launched) {
      setHasLaunched(true);
    }
  }, []);

  const handleFirstLaunchComplete = () => {
    localStorage.setItem('nicamera-launched', 'true');
    setHasLaunched(true);
  };

  if (!hasLaunched) {
    return <FirstLaunch onComplete={handleFirstLaunchComplete} />;
  }

  return (
    <>
      {installPrompt.isInstallable && !installEvent && (
        <InstallPrompt visible={installPrompt.isInstallable && !installPrompt.installed} />
      )}
      <Routes>
        <Route path="/" element={<CameraScreen />} />
        <Route path="/review" element={<PhotoReview />} />
        <Route path="/gallery" element={<GalleryScreen />} />
        <Route path="/editor" element={<EditorScreen />} />
      </Routes>
    </>
  );
}

export default App;
