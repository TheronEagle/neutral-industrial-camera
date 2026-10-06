import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PALETTE } from '@aesthetic/spec';
import { photoStorage, Photo } from '@/storage/photoStorage';

export const GalleryScreen = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      const loaded = await photoStorage.getPhotos();
      setPhotos(loaded);
      setLoading(false);
    };
    loadPhotos();
  }, []);

  const handleToggleFavourite = async (id: string) => {
    await photoStorage.toggleFavourite(id);
    const updated = await photoStorage.getPhotos();
    setPhotos(updated);
  };

  return (
    <div className="min-h-screen bg-charcoal-black">
      <div className="p-4 border-b border-graphite-grey">
        <div className="flex items-center justify-between">
          <h1 className="text-fog-white text-xl tracking-title">GALLERY</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-concrete-grey hover:text-safety-orange text-sm font-medium"
            aria-label="Back to camera"
          >
            ← Back to Camera
          </button>
        </div>
        <p className="text-concrete-grey text-xs mt-1">{photos.length} photos</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-concrete-grey">Loading...</div>
        </div>
      ) : photos.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-concrete-grey text-sm mb-2">No photos yet</div>
            <div className="text-concrete-grey/60 text-xs">Capture your first shot</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {photos.map((photo) => (
            <div key={photo.id} className="aspect-square relative group">
              <img
                src={photo.dataUrl}
                alt={`Photo ${photo.timestamp}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              <button
                onClick={() => handleToggleFavourite(photo.id)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className={`text-sm ${photo.favourite ? 'text-safety-orange' : 'text-fog-white'}`}>
                  {photo.favourite ? '★' : '☆'}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};