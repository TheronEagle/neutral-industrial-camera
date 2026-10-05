import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Freellmapi } from 'freellmapi';

const app = new Hono();

// CORS for local development
app.use('*', cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// FreeLLMAPI client - configured for keyless/gateway access
// Gateway URL is REQUIRED for vision analysis
// Set via FREELLMAPI_GATEWAY_URL env var in Cloudflare dashboard
const FREELLMAPI_GATEWAY_URL = process.env.FREELLMAPI_GATEWAY_URL || '';
const freellmapi = new Freellmapi({
  gatewayUrl: FREELLMAPI_GATEWAY_URL,
});

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    service: 'neutral-industrial-ai',
    ai_provider: FREELLMAPI_GATEWAY_URL ? 'freellmapi' : 'mock',
  });
});

// API: analyse scene - quick scene analysis
app.post('/api/analyse-scene', async (c) => {
  try {
    const body = await c.req.json();
    const imageDataUrl = body.imageDataUrl || '';
    
    // Parse the data URL to get the base64 image
    let base64Data = '';
    if (imageDataUrl.startsWith('data:image')) {
      const match = imageDataUrl.match(/^data:image\/[\w+\-]+;base64,(.+)$/);
      if (match && match[1]) {
        base64Data = match[1];
      }
    }
    
    if (!base64Data) {
      return c.json({ error: 'No image data' }, 400);
    }
    
    if (!FREELLMAPI_GATEWAY_URL) {
      // Return mock data when gateway not configured
      return c.json({
        success: false,
        provider: 'mock',
        analysis: {
          aestheticScore: 87,
          lightingDirection: 75,
          lightingQuality: 'hard',
          paletteFit: 81,
          textureDetected: ['concrete', 'metal'],
          accentPresent: true,
          clutterLevel: 22,
          recommendation: 'Move into the shadow — this scene reads flatter than your aesthetic allows',
          timestamp: Date.now(),
        },
      });
    }
    
    // Use FreeLLMAPI to analyse the image
    const result = await freellmapi.vision({
      image: base64Data,
      model: 'auto',
    });
    
    return c.json({ success: true, provider: 'freellmapi', analysis: result });
  } catch (err) {
    console.error('analyse-scene error', err);
    return c.json({ error: 'Analysis failed', details: err.message }, 500);
  }
});

// API: analyse photo - detailed photography analysis
app.post('/api/analyse-photo', async (c) => {
  try {
    const body = await c.req.json();
    const imageDataUrl = body.imageDataUrl || '';
    
    let base64Data = '';
    if (imageDataUrl.startsWith('data:image')) {
      const match = imageDataUrl.match(/^data:image\/[\w+\-]+;base64,(.+)$/);
      if (match && match[1]) {
        base64Data = match[1];
      }
    }
    
    if (!base64Data) {
      return c.json({ error: 'No image data' }, 400);
    }
    
    if (!FREELLMAPI_GATEWAY_URL) {
      // Return mock data when gateway not configured
      return c.json({
        success: false,
        provider: 'mock',
        analysis: {
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
          timestamp: Date.now(),
        },
      });
    }
    
    // Use FreeLLMAPI vision analysis with automatic model routing
    const result = await freellmapi.vision({
      image: base64Data,
      model: 'auto',
    });
    
    // Transform FreeLLMAPI response to our expected format
    const analysis = {
      composition: result.score || 80,
      lighting: result.lightingScore || 85,
      colour: result.colourScore || 75,
      subject: result.subjectScore || 70,
      background: result.backgroundScore || 80,
      mood: result.moodScore || 80,
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      overallScore: result.overallScore || 75,
      provider: 'freellmapi',
      model: result.model || 'auto',
    };
    
    return c.json(analysis);
  } catch (err) {
    console.error('analyse-photo error', err);
    return c.json({ error: 'Analysis failed', details: err.message }, 500);
  }
});

// API: generate shot suggestion
app.post('/api/generate-suggestion', async (c) => {
  try {
    const body = await c.req.json();
    const context = body.context || '';
    
    if (!FREELLMAPI_GATEWAY_URL) {
      return c.json({
        success: false,
        provider: 'mock',
        message: 'That stairwell has good directional light — try shooting from the bottom looking up.',
        type: 'light',
      });
    }
    
    const result = await freellmapi.vision({
      image: body.base64Image,
      model: 'auto',
    });
    
    const suggestion = result.suggestion || 'Keep your current composition';
    
    return c.json({
      success: true,
      provider: 'freellmapi',
      message: suggestion,
      type: 'composition',
    });
  } catch (err) {
    console.error('generate-suggestion error', err);
    return c.json({ error: 'Suggestion failed', details: err.message }, 500);
  }
});

export default app;