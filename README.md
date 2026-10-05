# Neutral Industrial Camera

A production-quality AI photography camera web app built around **one person's fixed aesthetic** — Neutral Industrial / Clean Minimal.

No style picker. No generic filters. One aesthetic, hard-coded, coaching the user before, during, and after capture.

## Aesthetic Specification (Single Source of Truth)

**Name:** Neutral Industrial / Clean Minimal  
**Mood:** Quiet, engineered, deliberate. Never decorative, never cluttered.

**Color Palette:**
- Base (dominant): Charcoal Black #1C1E1F
- Mid-tone: Graphite Grey #3E4144
- Cool accent: Steel Blue #4A5A66
- Highlight: Concrete Grey #8C8F8A
- Off-white: Fog White #DCDCD8
- Sharp accent (≤5% of frame): Safety Orange #FF5A1F

**Signature Edit Preset:**
Exposure -0.4 · Brilliance -25 · Highlights -30 · Shadows -45 · Contrast +25 · Black Point +18 · Saturation -25 · Vibrance -10 · Warmth -12 · Tint +3 · Sharpness +10 · Definition +18 · Vignette +12

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS with custom Neutral Industrial palette
- **Camera:** MediaDevices API, getUserMedia, ImageCapture
- **PWA:** vite-plugin-pwa with service worker offline support
- **Backend:** Cloudflare Workers / Pages Functions
- **Storage:** IndexedDB / localStorage (local-first, privacy by design)
- **Deployment:** Cloudflare Pages

## Repository Structure

```
├── src/
│   ├── aesthetic/spec.ts          # Single source of truth for palette, presets, recipes
│   ├── camera/                     # Camera system, capture, review
│   ├── ai/                         # AI abstraction, provider interface
│   ├── gallery/                    # Photo grid, storage
│   ├── editor/                     # Signature edit preview
│   ├── components/                 # UI components matching aesthetic
│   ├── hooks/                      # React hooks for camera, AI
│   ├── services/                   # Worker API client
│   ├── storage/                    # IndexedDB wrapper
│   └── utils/                      # Helpers
├── workers/                        # Cloudflare Workers AI proxy
├── public/
│   ├── manifest.json
│   └── icons/
└── .env.example
```

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:8080

Camera permissions required. Test on real device for accurate PWA install behavior.

## Environment Variables

Copy `.env.example` to `.env` (not committed):

```bash
VITE_AI_PROVIDER=mock          # or openai / anthropic
VITE_AI_API_URL=                # Cloudflare Worker URL
```

Secrets live only in Cloudflare Environment Variables.

## Cloudflare Deployment

```bash
npm run build
npx wrangler deploy
# or connect GitHub repo to Cloudflare Pages
```

Set environment variables in Cloudflare Pages → Settings → Environment Variables.

## PWA Installation

1. Deploy to Cloudflare Pages
2. Open URL on iPhone Safari or Android Chrome
3. Add to Home Screen
4. Launch from Home Screen (standalone mode, no browser chrome)

## Security & Privacy

- No secrets in frontend code
- API keys stored in Cloudflare env vars only
- Photos remain local by default
- AI analysis only when explicitly requested
- CORS restricted, input validation on all endpoints

## Browser Compatibility

Primary: Safari iOS 17+ (iPhone 17e target)  
Secondary: Chrome Android, Safari macOS, Chrome Desktop

Camera API behavior varies — tested on iOS PWA first.

## AI Architecture

Frontend → Cloudflare Worker → AI Provider

AI prompts always include `AI_SYSTEM_PROMPT` from spec.ts, grounding all coaching output in the single Neutral Industrial aesthetic.

Fallback mode active when AI unavailable — basic camera assistance still works.

## Known Limitations

- iOS PWA: No background sync, limited notifications
- Camera resolution varies by device
- No cloud backup in V1 (local storage only)
- Portrait mode is software-simulated, not true depth

## License

Private project. All rights reserved.
