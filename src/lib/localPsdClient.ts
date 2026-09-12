/**
 * Panther Studio — Standalone (browser-only) PSD reconstruction engine.
 *
 * Runs the SAME magic-layer pipeline as the server — segmentation core +
 * local blueprint builder — directly in the browser, so the PSD maker works
 * fully offline (double-click HTML, no backend, no API key).
 */
import { PSDReconstructionBlueprint, PSDReconstructionOptions } from './psdShared';
import { detectElementsFromPixels, downscaleNearest } from '../utils/localSegmentationCore';
import { buildLocalPSDBlueprintFromImage } from './psdBlueprintLocal';

/** Decode an image (data URL) into RGBA pixels via an offscreen canvas. */
export function imageDataUrlToPixels(
  dataUrl: string
): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const width = img.width || 1;
        const height = img.height || 1;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context unavailable');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);
        resolve({ data: imageData.data, width, height });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to decode image'));
    img.src = dataUrl;
  });
}

/**
 * Full local magic-layer reconstruction — identical pipeline to the server's
 * /api/psd/reconstruct without any network call.
 */
export async function runLocalPSDReconstruction(
  imageDataUrl: string,
  options: PSDReconstructionOptions = {},
  imageWidth?: number,
  imageHeight?: number
): Promise<PSDReconstructionBlueprint> {
  const { data, width: fullW, height: fullH } = await imageDataUrlToPixels(imageDataUrl);

  const scale = Math.min(1, 256 / Math.max(fullW, fullH));
  const w = Math.max(8, Math.round(fullW * scale));
  const h = Math.max(8, Math.round(fullH * scale));
  const small = downscaleNearest(data, fullW, fullH, w, h);

  const { elements, background } = detectElementsFromPixels(small, w, h, options.targetLayerDetail || 15);

  return buildLocalPSDBlueprintFromImage(
    imageWidth || fullW,
    imageHeight || fullH,
    imageDataUrl,
    'Uploaded Design',
    options,
    elements,
    background
  );
}
