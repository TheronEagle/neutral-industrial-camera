import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { resolve } from '@hono/node-server/vanilla/js';

const app = new Hono();

// CORS for local development
app.use('*', cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// API routes
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'neutral-industrial-ai' });
});

app.post('/api/analyse-scene', async (c) => {
  const body = await c.req.json();
  const imageData = body.imageDataUrl || '';
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

// Serve the Vite app for all non-API routes (SPA routing)
app.all('/', async (c) => {
  return c.html('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Neutral Industrial Camera</title></head><body><div id="root"></div></body></html>');
});

// Catch-all for SPA routing: serve index.html for any route that isn't /api/*
app.get('*', async (c) => {
  const url = c.req.url;
  // If it's an API route, Hono should have already handled it
  if (url.pathname.startsWith('/api/')) {
    return c.json({ error: 'Not found' }, 404);
  }
  // Try to serve the Vite app's index.html
  // In production, the Worker's assets will serve this
  try {
    constresponse = await fetch('index.html', {
      headers: { 'Accept': 'text/html' }
    });
    if (response.ok) {
      const html = await response.text();
      return c.body(html, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }
  } catch (e) {
    console.error('SPA fallback fetch failed:', e);
  }
  return c.notFound();
});

export default app;
