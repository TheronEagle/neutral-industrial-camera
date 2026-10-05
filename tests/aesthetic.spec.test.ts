import { describe, it, expect } from 'vitest';
import { PALETTE, SIGNATURE_EDIT, SHOT_RECIPES, AI_SYSTEM_PROMPT } from '../src/aesthetic/spec';

describe('Neutral Industrial Aesthetic Spec', () => {
  it('palette colors are exact hex values', () => {
    expect(PALETTE.base).toBe('#1C1E1F');
    expect(PALETTE.accentSharp).toBe('#FF5A1F');
    expect(PALETTE.accentCool).toBe('#4A5A66');
  });

  it('signature edit values match specification', () => {
    expect(SIGNATURE_EDIT.exposure).toBeCloseTo(-0.4);
    expect(SIGNATURE_EDIT.shadows).toBe(-45);
    expect(SIGNATURE_EDIT.contrast).toBe(25);
    expect(SIGNATURE_EDIT.warmth).toBe(-12);
  });

  it('shot recipes are hard-coded', () => {
    expect(SHOT_RECIPES.length).toBe(7);
    expect(SHOT_RECIPES[0].name).toBe('MOODY PORTRAIT');
    expect(SHOT_RECIPES[0].editPreset).toBe('SIGNATURE');
  });

  it('AI system prompt includes aesthetic specification', () => {
    expect(AI_SYSTEM_PROMPT).toContain('Neutral Industrial');
    expect(AI_SYSTEM_PROMPT).toContain('#1C1E1F');
    expect(AI_SYSTEM_PROMPT).toContain('hard-source directional light');
  });
});
