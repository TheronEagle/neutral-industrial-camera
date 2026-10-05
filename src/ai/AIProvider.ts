/**
 * AI layer.
 *
 * Production path: browser -> this module -> POST /api/analyse-photo ->
 * Cloudflare Worker -> FreeLLMAPI gateway -> vision model.
 *
 * The browser never contacts FreeLLMAPI directly, and never sees the gateway
 * URL or any API key.
 *
 * `MockAIProvider` is retained strictly as an explicit development fallback
 * and is never presented to the user as real AI: callers receive a
 * `source` field so the UI can label it honestly.
 */

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
  /** Where the analysis actually came from. */
  source: 'freellmapi' | 'local' | 'mock';
  model?: string;
  /** Present when live analysis was attempted and did not succeed. */
  status?: string;
  message?: string;
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
  source: 'freellmapi' | 'local' | 'mock';
}

export interface ShotSuggestion {
  message: string;
  type: 'angle' | 'light' | 'background' | 'timing';
  source: 'freellmapi' | 'local' | 'mock';
}

export interface AIProvider {
  analysePhoto(dataUrl: string): Promise<PhotoAnalysis>;
  analyseScene(dataUrl: string): Promise<SceneAnalysis>;
}

const ENDPOINT = '/api/analyse-photo';
const REQUEST_TIMEOUT_MS = 35_000;

/**
 * Treats "live analysis unavailable" as a normal, expected outcome rather than
 * an exception, so callers get a typed result instead of a thrown error.
 */
export class LiveAnalysisUnavailable extends Error {
  readonly analysis: PhotoAnalysis;
  constructor(analysis: PhotoAnalysis) {
    super(analysis.message || 'Live AI analysis unavailable');
    this.name = 'LiveAnalysisUnavailable';
    this.analysis = analysis;
  }
}

function isImageDataUrl(value: string): boolean {
  return /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=\s]+$/.test(value.trim());
}

async function readBody(response: Response): Promise<Record<string, unknown>> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export class WorkerAIProvider implements AIProvider {
  async analysePhoto(dataUrl: string): Promise<PhotoAnalysis> {
    if (!isImageDataUrl(dataUrl)) {
      throw new LiveAnalysisUnavailable({
        composition: 0, lighting: 0, colour: 0, subject: 0, background: 0, mood: 0,
        strengths: [], improvements: [], overallScore: 0,
        source: 'local', status: 'invalid_image',
        message: 'Image payload was not a valid base64 image.',
      });
    }

    let response: Response;
    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (err) {
      throw new LiveAnalysisUnavailable({
        composition: 0, lighting: 0, colour: 0, subject: 0, background: 0, mood: 0,
        strengths: [], improvements: [], overallScore: 0,
        source: 'local', status: 'network_error',
        message: err instanceof Error && err.name === 'TimeoutError'
          ? 'Analysis timed out.'
          : 'Could not reach the analysis service.',
      });
    }

    const body = await readBody(response);

    if (!response.ok) {
      throw new LiveAnalysisUnavailable({
        ...(body as unknown as PhotoAnalysis),
        composition: 0, lighting: 0, colour: 0, subject: 0, background: 0, mood: 0,
        strengths: [], improvements: [], overallScore: 0,
        source: 'local',
      });
    }

    return body as unknown as PhotoAnalysis;
  }

  async analyseScene(dataUrl: string): Promise<SceneAnalysis> {
    // Live scene coaching is not implemented server-side yet; the camera
    // screen uses on-device guidance instead of pretending otherwise.
    void dataUrl;
    return {
      lightingDirection: 0,
      lightingQuality: 'hard',
      paletteFit: 0,
      textureDetected: [],
      accentPresent: false,
      clutterLevel: 0,
      recommendation: 'Live scene analysis is not available yet.',
      aestheticScore: 0,
      source: 'local',
    };
  }
}

/**
 * Development-only stand-in. Produces fixed values and is always labelled
 * `source: 'mock'` so it can never be mistaken for real vision AI.
 */
export class MockAIProvider implements AIProvider {
  async analysePhoto(): Promise<PhotoAnalysis> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      composition: 84, lighting: 92, colour: 81, subject: 78,
      background: 90, mood: 87, overallScore: 87,
      strengths: [
        'Strong directional shadow and clean concrete background',
        'Good texture contrast',
      ],
      improvements: [
        'A red car in background pulling focus',
        'Consider desaturating warm tones more',
      ],
      source: 'mock',
      status: 'mock',
      message: 'DEMO DATA — no AI model was contacted.',
    };
  }

  async analyseScene(): Promise<SceneAnalysis> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      lightingDirection: 75, lightingQuality: 'hard', paletteFit: 81,
      textureDetected: ['concrete', 'metal'], accentPresent: true, clutterLevel: 22,
      recommendation: 'Move into the shadow — this scene reads flatter than your aesthetic allows',
      aestheticScore: 87,
      source: 'mock',
    };
  }
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK_AI === 'true';

export const aiProvider: AIProvider = USE_MOCK ? new MockAIProvider() : new WorkerAIProvider();
