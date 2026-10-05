import { useState, useEffect } from 'react';
import { PALETTE } from '@aesthetic/spec';
import { aiProvider } from '@/ai/AIProvider';

export const useAIVCoach = () => {
  const [tip, setTip] = useState<string>('Ready to shoot');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isAnalysing) return;
      setIsAnalysing(true);
      
      try {
        const suggestion = await aiProvider.generateShotSuggestion();
        setTip(suggestion.message);
      } catch (err) {
        setTip('AI unavailable — basic camera assistance still active');
      } finally {
        setIsAnalysing(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAnalysing]);

  const analyseScene = async (dataUrl?: string) => {
    setIsAnalysing(true);
    try {
      const analysis = await aiProvider.analyseScene(dataUrl || '');
      setLastAnalysis(analysis);
      setTip(analysis.recommendation);
      return analysis;
    } catch (err) {
      setTip('AI unavailable — basic camera assistance still active');
      return null;
    } finally {
      setIsAnalysing(false);
    }
  };

  return {
    tip,
    isAnalysing,
    lastAnalysis,
    analyseScene,
  };
};
