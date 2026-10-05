import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { SIGNATURE_EDIT, SIGNATURE_DEEP, SIGNATURE_SOFT, AI_SYSTEM_PROMPT } from '../src/aesthetic/spec';

const app = new Hono();

// CORS for local development
app.use('*', cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'neutral-industrial-ai' });
});

app.post('/api/analyse-scene', async (c) => {
  const body = await c.req.json();
  const imageData = body.imageDataUrl || '';

  // Mock analysis for demo - in production this would call OpenAI/Claude
  const analysis = {
    aestheticScore: 87,
    lightingDirection: 75,
    lightingQuality: 'hard',
    paletteFit: 81,
    textureDetected: ['concrete', 'metal'],
    accentPresent: true,
    clutterLevel: 22,
    recommendation: 'Move into the shadow — this scene reads flatter than your aesthetic allows',
    timestamp: Date.now(),
  };

  return c.json(analysis);
});

app.post('/api/analyse-photo', async (c) => {
  const body = await c.req.json();
  const imageData = body.imageDataUrl || '';

  const analysis = {
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
  };

  return c.json(analysis);
});

app.post('/api/generate-suggestion', async (c) => {
  const body = await c.req.json();
  
  const suggestions = [
    'That stairwell has good directional light — try shooting from the bottom looking up.',
    'Your car\'s parked outside — go get the wheel/brake-caliper shot.',
    'This wall has great concrete texture — a half-face portrait here would work well.',
    'Wait for someone to walk past that doorway — use it as a silhouette moment.',
  ];

  return c.json({
    message: suggestions[Math.floor(Math.random() * suggestions.length)],
    type: 'light',
    timestamp: Date.now(),
  });
});

app.get('/api/aesthetic-spec', (c) => {
  return c.json({
    palette: {
      base: '#1C1E1F',
      midtone: '#3E4144',
      accentCool: '#4A5A66',
      highlight: '#8C8F8A',
      offwhite: '#DCDCD8',
      accentSharp: '#FF5A1F',
    },
    editPresets: {
      signature: SIGNATURE_EDIT,
      deep: SIGNATURE_DEEP,
      soft: SIGNATURE_SOFT,
    },
    systemPrompt: AI_SYSTEM_PROMPT,
  });
});

export default app;
