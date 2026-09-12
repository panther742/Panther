/**
 * Panther Studio — direct browser image generation (standalone mode).
 *
 * When the Panther backend is unreachable (double-click HTML / offline), the
 * Image Studio still tries the free keyless Pollinations FLUX engine straight
 * from the browser. Needs internet, but no server and no API key.
 */

const ASPECT_SIZES: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
  '4:3': { width: 1152, height: 864 },
  '3:4': { width: 864, height: 1152 },
  '3:2': { width: 1152, height: 768 },
  '2:3': { width: 768, height: 1152 },
};

export interface DirectGeneratedImage {
  url: string;
  width: number;
  height: number;
  providerUsed: string;
}

export async function generatePollinationsImage(
  prompt: string,
  aspectRatio: string,
  stylePreset?: string
): Promise<DirectGeneratedImage> {
  const size = ASPECT_SIZES[aspectRatio] || ASPECT_SIZES['1:1'];
  const styleSuffix = stylePreset && stylePreset !== 'none' ? `, ${stylePreset}` : '';
  const fullPrompt = `${prompt}${styleSuffix}`.trim();

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    fullPrompt
  )}?width=${size.width}&height=${size.height}&nologo=true&model=flux`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) {
      throw new Error(`Pollinations engine responded HTTP ${resp.status}`);
    }
    const blob = await resp.blob();
    if (!blob.type.startsWith('image/')) {
      throw new Error('Pollinations engine did not return an image');
    }
    const objectUrl = URL.createObjectURL(blob);
    return { url: objectUrl, width: size.width, height: size.height, providerUsed: 'Pollinations FLUX (direct)' };
  } finally {
    clearTimeout(timeoutId);
  }
}
