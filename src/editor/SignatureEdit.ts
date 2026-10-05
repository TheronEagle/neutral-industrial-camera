import { SIGNATURE_EDIT, SIGNATURE_DEEP, SIGNATURE_SOFT, EDIT_VARIANTS } from '@aesthetic/spec';

export interface EditState {
  exposure: number;
  brilliance: number;
  highlights: number;
  shadows: number;
  contrast: number;
  blackPoint: number;
  saturation: number;
  vibrance: number;
  warmth: number;
  tint: number;
  sharpness: number;
  definition: number;
  vignette: number;
}

export const applySignatureEdit = (canvas: HTMLCanvasElement, variant: 'SIGNATURE' | 'DEEP' | 'SOFT' = 'SIGNATURE'): EditState => {
  const preset = [SIGNATURE_EDIT, SIGNATURE_DEEP, SIGNATURE_SOFT].find(p => p.name.includes(variant)) || SIGNATURE_EDIT;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return preset;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    
    // Exposure and brightness
    const exposureMultiplier = 1 + (preset.exposure * 0.1);
    r *= exposureMultiplier;
    g *= exposureMultiplier;
    b *= exposureMultiplier;
    
    // Contrast
    const contrastFactor = (259 * (preset.contrast + 255)) / (255 * (259 - preset.contrast));
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;
    
    // Saturation
    const brightness = (r + g + b) / 3;
    const satFactor = 1 + preset.saturation / 100;
    r = brightness + (r - brightness) * satFactor;
    g = brightness + (g - brightness) * satFactor;
    b = brightness + (b - brightness) * satFactor;
    
    // Warmth (shift red/blue)
    const warmthFactor = preset.warmth / 100;
    r += warmthFactor * 10;
    b -= warmthFactor * 10;
    
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
  
  ctx.putImageData(imageData, 0, 0);
  return preset;
};

export const exportEditedPhoto = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL('image/jpeg', 0.92);
};

export const getEditPreview = (dataUrl: string, variant: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        applySignatureEdit(canvas, variant as any);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      }
    };
    img.src = dataUrl;
  });
};
