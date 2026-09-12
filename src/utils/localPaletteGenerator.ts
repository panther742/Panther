/**
 * Deterministic local palette synthesizer — shared offline fallback so the
 * palette tool always produces a good-looking result even without a Gemini
 * key (works in the browser standalone mode too).
 */
export function synthesizeLocalPalette(prompt: string, paletteType?: string): { title: string; colors: string[] } {
  let seed = 0;
  for (let i = 0; i < prompt.length; i++) {
    seed = (seed * 31 + prompt.charCodeAt(i)) >>> 0;
  }
  const rand = (n: number) => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed % n;
  };

  const baseHue = rand(360);
  const kind = (paletteType || '').toLowerCase();
  const hueOffsets =
    kind.includes('complement') || kind.includes('split')
      ? [0, 180]
      : kind.includes('triad')
      ? [0, 120, 240]
      : kind.includes('analog')
      ? [0, 30, 60, -30, -60]
      : kind.includes('mono')
      ? [0, 0, 0, 0, 0]
      : [0, 30, 60, 150, 210]; // balanced default
  const lightnesses = [28, 42, 55, 68, 82];

  const hslToHex = (h: number, s: number, l: number): string => {
    h = ((h % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const saturations = [0.75, 0.62, 0.5, 0.4, 0.85];
  const colors: string[] = [];
  for (let i = 0; i < 5; i++) {
    const off = hueOffsets[i] !== undefined ? hueOffsets[i] : hueOffsets[rand(hueOffsets.length)];
    colors.push(hslToHex(baseHue + off, saturations[i], lightnesses[i] / 100));
  }

  const title = `${prompt.trim().slice(0, 42) || 'Panther'} — Local Harmony`;
  return { title, colors };
}

