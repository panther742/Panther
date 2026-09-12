import Jimp from 'jimp';
import {
  detectElementsFromPixels,
  LocalDetectedElement,
  LocalBackgroundInfo,
} from '../utils/localSegmentationCore';

export type { LocalDetectedElement, LocalBackgroundInfo };

/**
 * Panther Studio — Local Magic-Layer Segmentation Engine (SERVER wrapper)
 *
 * Decodes the uploaded image (Jimp) and delegates the pixel analysis to the
 * dependency-free core in src/utils/localSegmentationCore.ts — the same core
 * the browser uses in standalone/offline mode, so server & client produce
 * identical magic layers.
 */
export async function detectImageElementsAndBackground(
  imageDataUrl: string,
  maxElements: number = 15
): Promise<{ elements: LocalDetectedElement[]; background: LocalBackgroundInfo }> {
  // 1. Decode image (Buffer required — Jimp in Node cannot open data URLs)
  const base64Data = String(imageDataUrl).replace(/^data:image\/[\w.+-]+;base64,/, '');
  const imageBuffer = Buffer.from(base64Data, 'base64');
  const image = await Jimp.read(imageBuffer);

  const fullW = image.bitmap.width;
  const fullH = image.bitmap.height;

  // 2. Downscale for fast analysis (max 256px on the longest side).
  //    Nearest-neighbor keeps edges sharp & colors pure (no anti-alias halo
  //    bands that would glue distinct elements together).
  const scale = Math.min(1, 256 / Math.max(fullW, fullH));
  const w = Math.max(8, Math.round(fullW * scale));
  const h = Math.max(8, Math.round(fullH * scale));
  const small = image.clone().resize(w, h, Jimp.RESIZE_NEAREST_NEIGHBOR as any);
  const data = small.bitmap.data; // interleaved RGBA

  // 3. Shared pixel-analysis core (identical to the browser standalone engine)
  return detectElementsFromPixels(data, w, h, maxElements);
}
