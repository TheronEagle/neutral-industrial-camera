/**
 * NEUTRAL INDUSTRIAL / CLEAN MINIMAL — Aesthetic Specification
 *
 * This is the SINGLE SOURCE OF TRUTH for every color, preset value,
 * recipe, and AI prompt that derives from the aesthetic.
 *
 * All other modules MUST import from this file rather than
 * hard-coding aesthetic values in multiple places.
 */

// ============================================================
// COLOR PALETTE
// ============================================================

export const PALETTE = {
  base: '#1C1E1F',        // Charcoal Black (dominant)
  midtone: '#3E4144',     // Graphite Grey (surface/cards)
  accentCool: '#4A5A66',  // Steel Blue (secondary, links, info)
  highlight: '#8C8F8A',   // Concrete Grey (secondary text, inactive)
  offwhite: '#DCDCD8',    // Fog White (primary text)
  accentSharp: '#FF5A1F', // Safety Orange (sharp accent, ~5% of frame)
} as const;

export type PaletteRole = keyof typeof PALETTE;

// ============================================================
// EDIT SIGNATURE (base preset — Section 16 SIGNATURE)
// ============================================================

export interface EditPreset {
  name: string;
  exposure: number;          // EV stops
  brilliance: number;        // -100..100
  highlights: number;        // -100..100
  shadows: number;           // -100..100
  contrast: number;          // -100..100
  blackPoint: number;        // -100..100
  saturation: number;        // -100..100
  vibrance: number;          // -100..100
  warmth: number;            // -100..100 (cooler negative)
  tint: number;              // -100..100
  sharpness: number;         // 0..100
  definition: number;        // 0..100
  vignette: number;          // 0..100
}

export const SIGNATURE_EDIT: EditPreset = {
  name: 'SIGNATURE',
  exposure: -0.4,
  brilliance: -25,
  highlights: -30,
  shadows: -45,
  contrast: +25,
  blackPoint: +18,
  saturation: -25,
  vibrance: -10,
  warmth: -12,
  tint: +3,
  sharpness: +10,
  definition: +18,
  vignette: +12,
};

export const SIGNATURE_DEEP: EditPreset = {
  name: 'SIGNATURE / DEEP',
  exposure: -0.4,
  brilliance: -25,
  highlights: -30,
  shadows: -55,
  contrast: +30,
  blackPoint: +18,
  saturation: -25,
  vibrance: -10,
  warmth: -12,
  tint: +3,
  sharpness: +10,
  definition: +18,
  vignette: +12,
};

export const SIGNATURE_SOFT: EditPreset = {
  name: 'SIGNATURE / SOFT',
  exposure: -0.4,
  brilliance: -25,
  highlights: -30,
  shadows: -30,
  contrast: +15,
  blackPoint: +18,
  saturation: -25,
  vibrance: -10,
  warmth: -12,
  tint: +3,
  sharpness: +10,
  definition: +18,
  vignette: +12,
};


export const CONCRETE: EditPreset = {
  name: 'CONCRETE',
  exposure: -0.3,
  brilliance: 0,
  highlights: -30,
  shadows: -40,
  contrast: 28,
  blackPoint: 18,
  saturation: -30,
  vibrance: 0,
  warmth: -10,
  tint: 0,
  sharpness: 0,
  definition: 0,
  vignette: 10,
};



export const STEEL_BLUE: EditPreset = {
  name: 'STEEL BLUE',
  exposure: -0.3,
  brilliance: 0,
  highlights: -30,
  shadows: -42,
  contrast: 22,
  blackPoint: 18,
  saturation: -22,
  vibrance: 0,
  warmth: -22,
  tint: 0,
  sharpness: 0,
  definition: 0,
  vignette: 12,
};

export const MONOCHROME_ENGINEER: EditPreset = {
  name: 'MONOCHROME ENGINEER',
  exposure: -0.3,
  brilliance: 0,
  highlights: -30,
  shadows: -45,
  contrast: 32,
  blackPoint: 20,
  saturation: -42,
  vibrance: -10,
  warmth: -10,
  tint: 0,
  sharpness: 0,
  definition: 0,
  vignette: 15,
};

export const NIGHT_STREET: EditPreset = {
  name: 'NIGHT STREET',
  exposure: -0.6,
  brilliance: 0,
  highlights: -30,
  shadows: -58,
  contrast: 28,
  blackPoint: 22,
  saturation: -20,
  vibrance: 0,
  warmth: -5,
  tint: 0,
  sharpness: 0,
  definition: 0,
  vignette: 20,
};



export const GOLDEN_INDUSTRIAL: EditPreset = {
  name: 'GOLDEN INDUSTRIAL',
  exposure: -0.2,
  brilliance: 0,
  highlights: -30,
  shadows: -35,
  contrast: 20,
  blackPoint: 18,
  saturation: -20,
  vibrance: 0,
  warmth: 5,
  tint: 0,
  sharpness: 0,
  definition: 0,
  vignette: 10,
};

export const RAW_PORTRAIT: EditPreset = {
  name: 'RAW PORTRAIT',
  exposure: -0.2,
  brilliance: 0,
  highlights: -30,
  shadows: -30,
  contrast: 18,
  blackPoint: 12,
  saturation: -15,
  vibrance: 0,
  warmth: -10,
  tint: 0,
  sharpness: 0,
  definition: 0,
  vignette: 8,
};

export const ACCENT_POP: EditPreset = {
  name: 'ACCENT POP',
  exposure: -0.4,
  brilliance: 0,
  highlights: -30,
  shadows: -45,
  contrast: 25,
  blackPoint: 18,
  saturation: -25,
  vibrance: 0,
  warmth: -12,
  tint: 0,
  sharpness: 0,
  definition: 0,
  vignette: 14,
};


export const EDIT_VARIANTS: EditPreset[] = [
  SIGNATURE_EDIT,
  SIGNATURE_DEEP,
  SIGNATURE_SOFT,
  CONCRETE,
  STEEL_BLUE,
  MONOCHROME_ENGINEER,
  NIGHT_STREET,
  GOLDEN_INDUSTRIAL,
  RAW_PORTRAIT,
  ACCENT_POP,
];

// ============================================================
// SHOT RECIPES (hard-coded to this aesthetic)
// ============================================================

export interface ShotRecipe {
  id: string;
  name: string;
  icon: string;
  framing: string;
  distance: string;
  height: string;
  lighting: string;
  movement: string;
  background: string;
  editPreset: string;
}

export const SHOT_RECIPES: ShotRecipe[] = [
  {
    id: 'moody_portrait',
    name: 'MOODY PORTRAIT',
    icon: '👤',
    framing: 'Half-face/profile, chin slightly down, eyes averted or sharp on one eye',
    distance: '1.2 m',
    height: 'Eye level',
    lighting: 'Single hard side-light, deep shadow on the opposite side of face',
    movement: 'Still — wait for a natural, non-posed expression',
    background: 'Concrete or plain dark backdrop, minimal color',
    editPreset: 'SIGNATURE',
  },
  {
    id: 'concrete_backdrop',
    name: 'CONCRETE / INDUSTRIAL',
    icon: '🏭',
    framing: 'Subject against raw concrete, brick, or brushed metal',
    distance: '1–2 m',
    height: 'Waist to eye level',
    lighting: 'Hard directional light casting strong shadow contrast',
    movement: 'Subtle — let subject rest or move naturally',
    background: 'Raw concrete, metal, brick — no bright color clutter',
    editPreset: 'SIGNATURE',
  },
  {
    id: 'car_detail',
    name: 'CAR DETAIL',
    icon: '🚗',
    framing: 'Low angle, partial wheel/panel, rule-of-thirds off-center',
    distance: '0.8 m',
    height: 'Ground level',
    lighting: 'Side-light grazing the surface, brake caliper or reflective detail as accent',
    movement: 'Still — wait for reflections to settle',
    background: 'Wet or textured pavement, muted tones only',
    editPreset: 'SIGNATURE / DEEP',
  },
  {
    id: 'desk_flatlay',
    name: 'DESK / FLATLAY',
    icon: '📐',
    framing: 'Overhead or 3/4, decluttered surface',
    distance: 'Overhead',
    height: 'Directly above',
    lighting: 'Overhead hard source, deep shadow under objects',
    movement: 'Static setup',
    background: 'Black/grey/steel-blue objects only, one plant or concrete object as the only "soft" element',
    editPreset: 'SIGNATURE',
  },
  {
    id: 'dashboard_interior',
    name: 'DASHBOARD / INTERIOR',
    icon: '🪟',
    framing: 'Through windscreen or doorway, strong interior/exterior contrast',
    distance: '0.5 m from glass',
    height: 'Slightly above dashboard',
    lighting: 'Backlit by exterior, deep shadow in foreground',
    movement: 'Still',
    background: 'Deep shadow or bokeh that keeps palette muted',
    editPreset: 'SIGNATURE / DEEP',
  },
  {
    id: 'night_street',
    name: 'NIGHT STREET',
    icon: '🌃',
    framing: 'Single streetlight or doorway as key light',
    distance: '2–4 m',
    height: 'Waist level',
    lighting: 'One hard light source, wet pavement for reflection',
    movement: 'Wait for subject to pass through the light pool',
    background: 'Deep shadow fill, ambient city glow muted',
    editPreset: 'SIGNATURE / DEEP',
  },
  {
    id: 'gym_action',
    name: 'GYM / ACTION',
    icon: '💪',
    framing: 'Mid-motion or just-finished, raw gym/concrete environment',
    distance: '1.5–2 m',
    height: 'Waist level',
    lighting: 'Single overhead gym light or window, natural sweat/chalk texture',
    movement: 'Capture the moment after effort — no posed smiling',
    background: 'Concrete wall or steel equipment, muted',
    editPreset: 'SIGNATURE',
  },
];

// ============================================================
// CAMERA MODES
// ============================================================

export type CameraMode = 'photo' | 'portrait' | 'cinematic' | 'night' | 'document' | 'self';

export const CAMERA_MODES: { id: CameraMode; name: string; icon: string }[] = [
  { id: 'photo', name: 'PHOTO', icon: '●' },
  { id: 'portrait', name: 'PORTRAIT', icon: '👤' },
  { id: 'cinematic', name: 'CINEMATIC', icon: '🎬' },
  { id: 'night', name: 'NIGHT', icon: '🌙' },
  { id: 'document', name: 'DOCUMENT', icon: '📄' },
  { id: 'self', name: 'SELF', icon: '🤳' },
];

// ============================================================
// ASPECT RATIOS
// ============================================================

export const ASPECT_RATIOS: { id: string; label: string; ratio: number }[] = [
  { id: '4-3', label: '4:3', ratio: 4 / 3 },
  { id: '16-9', label: '16:9', ratio: 16 / 9 },
  { id: '1-1', label: '1:1', ratio: 1 },
  { id: '9-16', label: '9:16', ratio: 9 / 16 },
  { id: '3-4', label: '3:4', ratio: 3 / 4 },
];

// ============================================================
// THEMING
// ============================================================

export const THEME = {
  colors: PALETTE,
  fonts: {
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  letterSpacing: {
    label: '0.05em',
    title: '0.03em',
  },
};

// ============================================================
// AI SYSTEM PROMPT (injected into every AI request)
// ============================================================

export const AI_SYSTEM_PROMPT = `You are an AI photography coach. The user's aesthetic is fixed and non-negotiable — it is defined below and you must never suggest alternatives or ask the user to "choose a style."

== AESTHETIC SPECIFICATION ==

Name: Neutral Industrial / Clean Minimal
Mood: quiet, engineered, deliberate. Never decorative, never cluttered. Raw and utilitarian rather than polished or glossy.

COLOR PALETTE (exact hex values):
- Base (dominant): Charcoal Black #1C1E1F
- Mid-tone: Graphite Grey #3E4144
- Cool accent: Steel Blue #4A5A66
- Highlight: Concrete Grey #8C8F8A
- Off-white: Fog White #DCDCD8
- Sharp accent (sparing, max ~5% of frame): Safety Orange #FF5A1F

LIGHTING: single hard-source directional light, strong shadow contrast, never flat/even. Deep crushed shadows, controlled highlights.

TEXTURE: raw concrete, brushed metal, matte fabric, woven technical material. No glossy surfaces, no visible bright colors beyond the single accent.

SIGNATURE EDIT VALUES:
Exposure -0.4 | Brilliance -25 | Highlights -30 | Shadows -45 | Contrast +25 | Black Point +18 | Saturation -25 | Vibrance -10 | Warmth -12 | Tint +3 | Sharpness +10 | Definition +18 | Vignette +12

Every piece of advice you give — composition tips, shot recipes, edit suggestions, scene analysis, scores — must be grounded in this specification. Evaluate scenes against this aesthetic: look for single directional light, textured industrial surfaces, minimal color, and the potential for one sharp accent. Flag flat lighting, color clutter, and glossy surfaces as mismatches.`;

// ============================================================
// EXPORT ALL
// ============================================================

export default {
  PALETTE,
  THEME,
  SIGNATURE_EDIT,
  SIGNATURE_DEEP,
  SIGNATURE_SOFT,
  EDIT_VARIANTS,
  SHOT_RECIPES,
  CAMERA_MODES,
  ASPECT_RATIOS,
  AI_SYSTEM_PROMPT,
};
