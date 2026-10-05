import { describe, it, expect, vi, afterEach } from 'vitest';
import worker from '../workers/index';

/**
 * These tests exercise the Worker's real request path against a stubbed
 * fetch. They prove that an actual image payload is transmitted to the
 * gateway in OpenAI-compatible form, and that every failure mode returns an
 * honest status rather than invented analysis.
 */

const ENV = { FREELLMAPI_GATEWAY_URL: 'https://gateway.test' } as never;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// A 1x1 JPEG. Small but a genuine, decodable image — not a text placeholder.
const REAL_JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsL' +
  'DBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAAB' +
  'AAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';

function req(body: unknown) {
  return new Request('https://app.test/api/analyse-photo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const fetchSpy = vi.fn();
afterEach(() => fetchSpy.mockReset());

describe('POST /api/analyse-photo', () => {
  it('rejects a non-image payload instead of analysing it', async () => {
    const res = await worker.fetch(req({ imageDataUrl: 'hello world' }), ENV);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('invalid_image');
  });

  it('rejects a JSON body that is not JSON', async () => {
    const res = await worker.fetch(
      new Request('https://app.test/api/analyse-photo', { method: 'POST', body: 'not json' }),
      ENV,
    );
    expect(res.status).toBe(400);
  });

  it('reports offline when no gateway URL is configured, and invents no analysis', async () => {
    const res = await worker.fetch(req({ imageDataUrl: REAL_JPEG }), {} as never);
    expect(res.status).toBe(503);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.status).toBe('offline');
    expect(body.strengths).toEqual([]);
    expect(body.overallScore).toBe(0);
  });

  it('refuses to guess a model id when none is configured', async () => {
    const res = await worker.fetch(req({ imageDataUrl: REAL_JPEG }), ENV);
    expect(res.status).toBe(503);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.status).toBe('model_unset');
    expect(body.source).toBe('local');
  });

  it('sends the actual image to the gateway as an image_url part and maps the reply', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse({
        choices: [
          {
            message: {
              content: JSON.stringify({
                composition: 82,
                lighting: 74,
                colour: 86,
                subject: 91,
                background: 78,
                mood: 80,
                overallScore: 81,
                strengths: ['Strong subject placement'],
                improvements: ['Background busy on the left'],
              }),
            },
          },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchSpy);

    const res = await worker.fetch(
      req({ imageDataUrl: REAL_JPEG }),
      { FREELLMAPI_GATEWAY_URL: 'https://gateway.test', FREELLMAPI_VISION_MODEL: 'some-vision-model' } as never,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;

    // Response is the PhotoReview schema, attributed to the real provider.
    expect(body.source).toBe('freellmapi');
    expect(body.model).toBe('some-vision-model');
    expect(body.composition).toBe(82);
    expect(body.overallScore).toBe(81);
    expect(body.strengths).toEqual(['Strong subject placement']);

    // Critically: verify the photograph itself was transmitted.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://gateway.test/v1/chat/completions');

    const sent = JSON.parse(String(init.body)) as {
      model: string;
      messages: Array<{ role: string; content: unknown }>;
    };
    expect(sent.model).toBe('some-vision-model');

    const parts = sent.messages[1].content as Array<Record<string, unknown>>;
    const imagePart = parts.find((p) => p.type === 'image_url') as
      | { type: string; image_url: { url: string } }
      | undefined;

    expect(imagePart).toBeDefined();
    expect(imagePart!.image_url.url).toBe(REAL_JPEG);
    expect(imagePart!.image_url.url.startsWith('data:image/jpeg;base64,')).toBe(true);
  });

  it('never leaks the API key to the caller and sends it upstream only as a header', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse({
        choices: [{ message: { content: '{"composition":80,"overallScore":80}' } }],
      }),
    );
    vi.stubGlobal('fetch', fetchSpy);

    const res = await worker.fetch(
      req({ imageDataUrl: REAL_JPEG }),
      {
        FREELLMAPI_GATEWAY_URL: 'https://gateway.test',
        FREELLMAPI_VISION_MODEL: 'm',
        FREELLMAPI_API_KEY: 'super-secret-key',
      } as never,
    );

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer super-secret-key');

    const raw = await res.text();
    expect(raw).not.toContain('super-secret-key');
  });

  it('surfaces an unreachable gateway without fabricating a score', async () => {
    fetchSpy.mockRejectedValue(new Error('ECONNREFUSED'));
    vi.stubGlobal('fetch', fetchSpy);

    const res = await worker.fetch(
      req({ imageDataUrl: REAL_JPEG }),
      { FREELLMAPI_GATEWAY_URL: 'https://gateway.test', FREELLMAPI_VISION_MODEL: 'm' } as never,
    );

    expect(res.status).toBe(502);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.status).toBe('gateway_unreachable');
    expect(body.overallScore).toBe(0);
  });

  it('reports a non-JSON model reply rather than guessing at its contents', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse({ choices: [{ message: { content: 'I think this photo is nice.' } }] }),
    );
    vi.stubGlobal('fetch', fetchSpy);

    const res = await worker.fetch(
      req({ imageDataUrl: REAL_JPEG }),
      { FREELLMAPI_GATEWAY_URL: 'https://gateway.test', FREELLMAPI_VISION_MODEL: 'm' } as never,
    );

    expect(res.status).toBe(502);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.status).toBe('unparseable_response');
    expect(body.strengths).toEqual([]);
  });

  it('tolerates a fenced JSON reply', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse({
        choices: [
          {
            message: {
              content: '```json\n{"composition":70,"overallScore":70,"strengths":["a"],"improvements":[]}\n```',
            },
          },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchSpy);

    const res = await worker.fetch(
      req({ imageDataUrl: REAL_JPEG }),
      { FREELLMAPI_GATEWAY_URL: 'https://gateway.test', FREELLMAPI_VISION_MODEL: 'm' } as never,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.composition).toBe(70);
  });

  it('clamps out-of-range scores', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse({
        choices: [
          { message: { content: '{"composition":900,"lighting":-50,"overallScore":101}' } },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchSpy);

    const res = await worker.fetch(
      req({ imageDataUrl: REAL_JPEG }),
      { FREELLMAPI_GATEWAY_URL: 'https://gateway.test', FREELLMAPI_VISION_MODEL: 'm' } as never,
    );

    const body = (await res.json()) as Record<string, number>;
    expect(body.composition).toBe(100);
    expect(body.lighting).toBe(0);
    expect(body.overallScore).toBe(100);
  });
});

describe('GET /health and GET /api/models', () => {
  it('health reports the provider honestly', async () => {
    const res = await worker.fetch(new Request('https://app.test/health'), {} as never);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.health).toBe('ok');
    expect(body.configured).toBe(false);
    expect(body.status).toBe('offline');
  });

  it('models roster is unavailable without a gateway', async () => {
    const res = await worker.fetch(new Request('https://app.test/api/models'), {} as never);
    expect(res.status).toBe(503);
  });

  it('models roster is proxied when configured', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({ data: [{ id: 'vision-a' }] }));
    vi.stubGlobal('fetch', fetchSpy);

    const res = await worker.fetch(
      new Request('https://app.test/api/models'),
      { FREELLMAPI_GATEWAY_URL: 'https://gateway.test' } as never,
    );

    expect(res.status).toBe(200);
    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toBe('https://gateway.test/v1/models');
  });
});
