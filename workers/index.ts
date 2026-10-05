/**
 * Neutral Industrial Camera — Cloudflare Worker
 *
 * Serves the PWA static assets (configured via [assets] in wrangler.toml) and
 * exposes the AI proxy routes.
 *
 * The Worker is the ONLY component that talks to the FreeLLMAPI gateway. The
 * gateway URL lives in a plain env var; an optional API key lives in a Worker
 * secret (env.FREELLMAPI_API_KEY). Neither is ever returned to the browser.
 *
 * FreeLLMAPI speaks the OpenAI-compatible API, so vision requests are plain
 * POSTs to {GATEWAY}/v1/chat/completions with an image_url content part.
 * No inference SDK is involved.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Env {
  FREELLMAPI_GATEWAY_URL?: string;
  FREELLMAPI_API_KEY?: string;
  FREELLMAPI_VISION_MODEL?: string;
  AI_PROVIDER?: string;
  LOG_LEVEL?: string;
}

/** Upper bound on an inbound image. Base64 inflates by ~4/3. */
const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6 MB decoded
const IMAGE_DATA_URL = /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/;

interface PhotoAnalysis {
  composition: number;
  lighting: number;
  colour: number;
  subject: number;
  background: number;
  mood: number;
  strengths: string[];
  improvements: string[];
  overallScore: number;
  source: 'freellmapi' | 'local' | 'mock';
  model?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Local dev origins only. In production this Worker and the frontend are the
// same origin, so no cross-origin access is granted at all.
app.use('/api/*', cors({
  origin: (origin) =>
    origin === 'http://localhost:8080' || origin === 'http://127.0.0.1:8080'
      ? origin
      : '',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  maxAge: 86400,
}));

function gatewayUrl(env: Env): string | null {
  const raw = env.FREELLMAPI_GATEWAY_URL?.trim();
  if (!raw) return null;
  // Accept either the root or an already-/v1 URL; normalise to the root.
  return raw.replace(/\/+$/, '').replace(/\/v1$/i, '');
}

function describeProvider(env: Env) {
  const configured = Boolean(gatewayUrl(env));
  return {
    provider: 'freellmapi',
    configured,
    // Honest reporting: without a gateway URL no model is being contacted.
    status: configured ? ('configured' as const) : ('offline' as const),
    model: env.FREELLMAPI_VISION_MODEL?.trim() || null,
  };
}

app.get('/health', (c) =>
  c.json({ service: 'neutral-industrial-camera', health: 'ok', ...describeProvider(c.env) }),
);

/**
 * Deterministic local fallback.
 *
 * This is NOT vision AI and must never be labelled as such. It only reports
 * that live analysis is unavailable; the client renders an offline state.
 */
function offlineAnalysis(): PhotoAnalysis {
  return {
    composition: 0, lighting: 0, colour: 0, subject: 0, background: 0, mood: 0,
    strengths: [], improvements: [], overallScore: 0,
    source: 'local',
  };
}

function clampScore(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter((v) => v.length > 0)
    .slice(0, 4);
}

/** Pull JSON out of a model reply that may be wrapped in prose or a code fence. */
function parseModelJson(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(candidate.slice(start, end + 1));
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function mapModelJson(raw: Record<string, unknown>, model: string): PhotoAnalysis {
  const scores = (raw.scores && typeof raw.scores === 'object' ? raw.scores : raw) as Record<string, unknown>;
  return {
    composition: clampScore(scores.composition, 0),
    lighting: clampScore(scores.lighting, 0),
    colour: clampScore(scores.colour ?? scores.color, 0),
    subject: clampScore(scores.subject, 0),
    background: clampScore(scores.background, 0),
    mood: clampScore(scores.mood, 0),
    strengths: asStringList(raw.strengths),
    improvements: asStringList(raw.improvements),
    overallScore: clampScore(raw.overallScore ?? raw.overall_score, 0),
    source: 'freellmapi',
    model,
  };
}

const SYSTEM_PROMPT = [
  'You are a photography coach. Judge this photo against one fixed aesthetic:',
  '"Neutral Industrial / Clean Minimal" — quiet, engineered, deliberate.',
  'Single hard-source directional light, deep crushed shadows, controlled highlights.',
  'Raw concrete, brushed metal or matte technical materials.',
  'Desaturated palette (charcoal, graphite, steel blue, fog white) with at most one',
  'small sharp accent (safety orange or similar) occupying roughly 5% or less of frame.',
  'Flat/even lighting, glossy surfaces and colourful clutter are mismatches.',
  '',
  'Reply with ONLY compact JSON, no prose and no code fence, using exactly these keys:',
  '{"composition":0,"lighting":0,"colour":0,"subject":0,"background":0,"mood":0,',
  '"overallScore":0,"strengths":["..."],"improvements":["..."]}',
  '',
  'All eight numbers are integers 0-100. strengths and improvements each hold at most',
  'two short strings of at most 12 words. Be specific and critical, not encouraging.',
].join('\n');

app.post('/api/analyse-photo', async (c) => {
  let body: { imageDataUrl?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_json' }, 400);
  }

  const raw = typeof body.imageDataUrl === 'string' ? body.imageDataUrl : '';
  const match = IMAGE_DATA_URL.exec(raw.trim());
  if (!match) {
    return c.json({ error: 'invalid_image', message: 'Expected a base64 image data URL (jpeg, png or webp).' }, 400);
  }

  const base64 = match[2].replace(/\s/g, '');
  // 4 base64 chars -> 3 bytes
  const approxBytes = Math.floor((base64.length * 3) / 4);
  if (approxBytes > MAX_IMAGE_BYTES) {
    return c.json({ error: 'image_too_large', message: 'Image exceeds 6 MB.' }, 413);
  }

  const gateway = gatewayUrl(c.env);
  if (!gateway) {
    // No gateway configured: say so plainly instead of inventing a result.
    return c.json({
      ...offlineAnalysis(),
      provider: 'freellmapi',
      status: 'offline',
      message: 'No FreeLLMAPI gateway configured. Set FREELLMAPI_GATEWAY_URL in Cloudflare.',
    }, 503);
  }

  const model = c.env.FREELLMAPI_VISION_MODEL?.trim();
  if (!model) {
    // Deliberately refusing to guess a model id.
    return c.json({
      ...offlineAnalysis(),
      provider: 'freellmapi',
      status: 'model_unset',
      message: 'No vision model configured. Inspect GET {gateway}/v1/models and set FREELLMAPI_VISION_MODEL.',
    }, 503);
  }

  const mime = match[1] === 'jpg' ? 'image/jpeg' : `image/${match[1]}`;
  const dataUrl = `data:${mime};base64,${base64}`;

  let upstream: Response;
  try {
    upstream = await fetch(`${gateway}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(c.env.FREELLMAPI_API_KEY
          ? { Authorization: `Bearer ${c.env.FREELLMAPI_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Rate this photograph against the aesthetic described above.' },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    return c.json({
      ...offlineAnalysis(),
      provider: 'freellmapi',
      status: 'gateway_unreachable',
      message: err instanceof Error ? err.message : 'Gateway request failed',
    }, 502);
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    return c.json({
      ...offlineAnalysis(),
      provider: 'freellmapi',
      status: 'gateway_error',
      message: `Gateway returned ${upstream.status}`,
      detail: detail.slice(0, 300),
    }, 502);
  }

  let payload: { choices?: Array<{ message?: { content?: unknown } }> };
  try {
    payload = await upstream.json();
  } catch {
    return c.json({
      ...offlineAnalysis(),
      provider: 'freellmapi',
      status: 'bad_gateway_response',
      message: 'Gateway did not return JSON.',
    }, 502);
  }

  const content = payload.choices?.[0]?.message?.content;
  const text = typeof content === 'string'
    ? content
    : Array.isArray(content)
      ? content.map((p) => (p && typeof p === 'object' && 'text' in p ? String(p.text) : '')).join('')
      : '';

  const parsed = text ? parseModelJson(text) : null;
  if (!parsed) {
    return c.json({
      ...offlineAnalysis(),
      provider: 'freellmapi',
      status: 'unparseable_response',
      message: 'Model reply was not valid JSON.',
      raw: text.slice(0, 300),
    }, 502);
  }

  return c.json(mapModelJson(parsed, model));
});

/** Expose the gateway roster so the vision model can be chosen from real data. */
app.get('/api/models', async (c) => {
  const gateway = gatewayUrl(c.env);
  if (!gateway) {
    return c.json({ status: 'offline', message: 'No FreeLLMAPI gateway configured.' }, 503);
  }
  try {
    const res = await fetch(`${gateway}/v1/models`, {
      headers: c.env.FREELLMAPI_API_KEY
        ? { Authorization: `Bearer ${c.env.FREELLMAPI_API_KEY}` }
        : {},
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      return c.json({ status: 'gateway_error', message: `Gateway returned ${res.status}` }, 502);
    }
    return c.json({ status: 'ok', roster: await res.json() });
  } catch (err) {
    return c.json({
      status: 'gateway_unreachable',
      message: err instanceof Error ? err.message : 'Gateway request failed',
    }, 502);
  }
});

export default app;
