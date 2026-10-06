import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EDIT_VARIANTS, EditPreset } from '@aesthetic/spec';
import { applySignatureEdit } from './SignatureEdit';

export const EditorScreen = () => {
  const navigate = useNavigate();
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [variant, setVariant] = useState<string>(EDIT_VARIANTS[0].name);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('lastPhoto');
    if (data) {
      setPhotoData(data);
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (!photoData) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        applySignatureEdit(canvas, variant);
        setPreviewUrl(canvas.toDataURL('image/jpeg', 0.92));
      }
    };
    img.src = photoData;
  }, [photoData, variant]);

  if (!photoData) return null;

  return (
    <div className="fixed inset-0 bg-charcoal-black flex flex-col">
      <div className="flex-1 relative">
        <img src={previewUrl || photoData} className="w-full h-full object-contain" alt="Editing" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 px-4 py-2 bg-graphite-grey text-fog-white text-sm"
        >
          BACK
        </button>
      </div>

      <div className="bg-graphite-grey p-4">
        <div className="text-fog-white text-sm mb-3 tracking-label">EDIT VARIANT</div>
        <div className="flex gap-2 overflow-x-auto">
          {EDIT_VARIANTS.map(p => (
            <button
              key={p.name}
              onClick={() => setVariant(p.name)}
              className={`flex-1 py-3 text-xs shrink-0 whitespace-nowrap ${
                variant === p.name 
                  ? 'bg-safety-orange text-charcoal-black' 
                  : 'bg-charcoal-black text-fog-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};