export interface AIProvider {
  analyseScene(dataUrl: string): Promise<SceneAnalysis>;
  analysePhoto(dataUrl: string): Promise<PhotoAnalysis>;
  generateShotSuggestion(context?: string): Promise<ShotSuggestion>;
}

export interface SceneAnalysis {
  lightingDirection: number;
  lightingQuality: 'hard' | 'soft' | 'flat';
  paletteFit: number;
  textureDetected: string[];
  accentPresent: boolean;
  clutterLevel: number;
  recommendation: string;
  aestheticScore: number;
}

export interface PhotoAnalysis {
  composition: number;
  lighting: number;
  colour: number;
  subject: number;
  background: number;
  mood: number;
  strengths: string[];
  improvements: string[];
  overallScore: number;
}

export interface ShotSuggestion {
  message: string;
  type: 'angle' | 'light' | 'background' | 'timing';
}

const DEFAULT_SYSTEM_PROMPT = `You are an AI photography coach. The user's aesthetic is fixed — Neutral Industrial/Clean Minimal.`;

export class MockAIProvider implements AIProvider {
  async analyseScene(dataUrl: string): Promise<SceneAnalysis> {
    await new Promise(r => setTimeout(r, 300));
    return {
      lightingDirection: 75,
      lightingQuality: 'hard',
      paletteFit: 81,
      textureDetected: ['concrete', 'metal'],
      accentPresent: true,
      clutterLevel: 22,
      recommendation: 'Move into the shadow — this scene reads flatter than your aesthetic allows',
      aestheticScore: 87,
    };
  }

  async analysePhoto(dataUrl: string): Promise<PhotoAnalysis> {
    await new Promise(r => setTimeout(r, 500));
    return {
      composition: 84,
      lighting: 92,
      colour: 81,
      subject: 78,
      background: 90,
      mood: 87,
      strengths: [
        'Strong directional shadow and clean concrete background',
        'Good texture contrast',
      ],
      improvements: [
        'A red car in background pulling focus',
        'Consider desaturating warm tones more',
      ],
      overallScore: 87,
    };
  }

  async generateShotSuggestion(): Promise<ShotSuggestion> {
    await new Promise(r => setTimeout(r, 200));
    return {
      message: 'That stairwell has good directional light — try shooting from the bottom looking up',
      type: 'light',
    };
  }
}

export const aiProvider = new MockAIProvider();
