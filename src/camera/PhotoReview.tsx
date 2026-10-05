import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PALETTE } from '@aesthetic/spec';
import { photoStorage } from '@/storage/photoStorage';
import { aiProvider, LiveAnalysisUnavailable, PhotoAnalysis } from '@/ai/AIProvider';
import { SIGNATURE_EDIT } from '@aesthetic/spec';

export const PhotoReview = () => {
  const navigate = useNavigate();
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isEdited, setIsEdited] = useState(true);
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('lastPhoto');
    if (data) {
      setPhotoData(data);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleSave = async () => {
    if (!photoData) return;
    
    const photo = await photoStorage.savePhoto({
      dataUrl: photoData,
      mode: 'photo',
      editPreset: SIGNATURE_EDIT.name,
      favourite: false,
    });
    
    navigate('/gallery');
  };

  const handleAnalyse = async () => {
    if (!photoData || isAnalysing) return;
    setIsAnalysing(true);
    setAnalysisError(null);

    try {
      const result = await aiProvider.analysePhoto(photoData);
      setAnalysis(result);
    } catch (err) {
      if (err instanceof LiveAnalysisUnavailable) {
        setAnalysisError(err.analysis.message || 'Live AI analysis unavailable.');
      } else {
        setAnalysisError('Live AI analysis unavailable.');
      }
    } finally {
      setIsAnalysing(false);
    }
  };

  if (!photoData) {
    return <div className="fixed inset-0 bg-charcoal-black" />;
  }

  return (
    <div className="fixed inset-0 bg-charcoal-black flex flex-col">
      <div className="flex-1 relative">
        <img 
          src={isEdited ? photoData : photoData}
          alt="Captured photo"
          className="w-full h-full object-contain"
        />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-graphite-grey/80 backdrop-blur-xs text-fog-white text-sm"
          >
            RETAKE
          </button>
          <div className="px-4 py-2 bg-graphite-grey/80 backdrop-blur-xs text-fog-white text-sm">
            {isEdited ? 'EDITED' : 'RAW'}
          </div>
        </div>

        <button
          onClick={() => setIsEdited(!isEdited)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-graphite-grey text-fog-white text-sm tracking-label"
        >
          TOGGLE RAW/EDIT
        </button>
      </div>

      <div className="bg-graphite-grey p-4 flex gap-2 justify-around">
        <button 
          onClick={handleSave}
          className="px-6 py-3 bg-safety-orange text-charcoal-black font-medium"
          style={{ backgroundColor: PALETTE.accentSharp }}
        >
          SAVE
        </button>
        <button 
          onClick={handleAnalyse}
          disabled={isAnalysing}
          className="px-6 py-3 bg-graphite-grey text-fog-white disabled:opacity-40"
        >
          {isAnalysing ? 'ANALYSING...' : 'ANALYSE'}
        </button>
        <button className="px-6 py-3 bg-graphite-grey text-fog-white">
          EDIT
        </button>
      </div>

      {analysis && (
        <div className="absolute bottom-24 left-4 right-4 bg-charcoal-black/90 backdrop-blur-xs p-4 rounded-lg">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-fog-white text-sm">ANALYSIS</span>
            <span
              className="text-[10px] uppercase"
              style={{
                letterSpacing: '0.1em',
                color:
                  analysis.source === 'freellmapi'
                    ? PALETTE.accentCool
                    : PALETTE.highlight,
              }}
            >
              {analysis.source === 'freellmapi'
                ? `FREEllmAPI · ${analysis.model ?? 'model'}`
                : analysis.source === 'mock'
                  ? 'DEMO DATA — NO AI'
                  : 'LOCAL — NO AI'}
            </span>
          </div>

          {analysis.source === 'mock' && (
            <div
              className="text-[11px] mb-2"
              style={{ color: PALETTE.accentSharp }}
            >
              {analysis.message}
            </div>
          )}

          <div className="text-concrete-grey text-xs space-y-1">
            {analysis.strengths.length === 0 && analysis.improvements.length === 0 ? (
              <div>No structured feedback returned.</div>
            ) : (
              <>
                {analysis.strengths.map((s, i) => (
                  <div key={`s-${i}`}>✓ {s}</div>
                ))}
                {analysis.improvements.map((s, i) => (
                  <div key={`i-${i}`}>→ {s}</div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
      
      {analysisError && (
        <div className="absolute bottom-64 left-4 right-4 bg-charcoal-black/90 backdrop-blur-xs p-4 rounded-lg">
          <div className="text-fog-white text-sm mb-2">ANALYSIS ERROR</div>
          <div className="text-concrete-grey text-xs">{analysisError}</div>
        </div>
      )}
    </div>
  );
};