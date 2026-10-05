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
// If FREELLMAPI_GATEWAY_URL is set, use it; otherwise try default keyless gateway
const freellmapi = new Freellmapi({
  gatewayUrl: process.env.FREELLMAPI_GATEWAY_URL,
  // keyless mode works for some free vision models
  // API key can be set via FREELLMAPI_API_KEY env var if needed
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'neutral-industrial-ai' });
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
    
    // Use FreeLLMAPI to analyse the image
    // For vision analysis, we use the automatic model routing
    const result = await freellmapi.vision({
      image: base64Data,
      // 'auto' routes to the best available free vision model
      model: 'auto',
    });
    
    return c.json({ success: true, analysis: result });
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
    
    const result = await freellmapi.vision({
      image: body.base64Image,
      model: 'auto',
    });
    
    const suggestion = result.suggestion || 'Keep your current composition';
    
    return c.json({
      message: suggestion,
      type: 'composition',
    });
  } catch (err) {
    console.error('generate-suggestion error', err);
    return c.json({ error: 'Suggestion failed', details: err.message }, 500);
  }
});

export default app;