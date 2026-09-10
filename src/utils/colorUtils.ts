import { colord, extend } from 'colord';
import harmoniesPlugin from 'colord/plugins/harmonies';
import cmykPlugin from 'colord/plugins/cmyk';
import a11yPlugin from 'colord/plugins/a11y';
import { ColorItem, PaletteType } from '../types';

extend([harmoniesPlugin, cmykPlugin, a11yPlugin]);

function rgbToHsv(r: number, g: number, b: number) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

export function hexToColorItem(hexStr: string, idPrefix = 'c'): ColorItem {
  const c = colord(hexStr);
  const validHex = c.toHex();
  const rgb = c.toRgb();
  const hsl = c.toHsl();
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const cmyk = c.toCmyk();

  return {
    id: `${idPrefix}-${Math.random().toString(36).substring(2, 9)}`,
    hex: validHex.toUpperCase(),
    rgb: { r: rgb.r, g: rgb.g, b: rgb.b },
    hsl: { h: Math.round(hsl.h), s: Math.round(hsl.s), l: Math.round(hsl.l) },
    hsv,
    cmyk: { c: Math.round(cmyk.c), m: Math.round(cmyk.m), y: Math.round(cmyk.y), k: Math.round(cmyk.k) },
    isLocked: false,
    isFavorite: false,
  };
}

export function generateHarmony(baseHex: string, type: PaletteType): ColorItem[] {
  const c = colord(baseHex);
  const baseHsl = c.toHsl();

  if (type === 'single') {
    return [hexToColorItem(baseHex)];
  }

  if (type === 'complementary') {
    const compHue = (baseHsl.h + 180) % 360;
    return [
      hexToColorItem(baseHex),
      hexToColorItem(colord({ h: compHue, s: baseHsl.s, l: baseHsl.l }).toHex()),
    ];
  }

  if (type === 'split-complementary') {
    const h1 = (baseHsl.h + 150) % 360;
    const h2 = (baseHsl.h + 210) % 360;
    return [
      hexToColorItem(baseHex),
      hexToColorItem(colord({ h: h1, s: baseHsl.s, l: baseHsl.l }).toHex()),
      hexToColorItem(colord({ h: h2, s: baseHsl.s, l: baseHsl.l }).toHex()),
    ];
  }

  if (type === 'analogous') {
    const offsets = [-30, -15, 0, 15, 30];
    return offsets.map((off) => {
      const h = (baseHsl.h + off + 360) % 360;
      return hexToColorItem(colord({ h, s: baseHsl.s, l: baseHsl.l }).toHex());
    });
  }

  if (type === 'triadic') {
    const h1 = (baseHsl.h + 120) % 360;
    const h2 = (baseHsl.h + 240) % 360;
    return [
      hexToColorItem(baseHex),
      hexToColorItem(colord({ h: h1, s: baseHsl.s, l: baseHsl.l }).toHex()),
      hexToColorItem(colord({ h: h2, s: baseHsl.s, l: baseHsl.l }).toHex()),
    ];
  }

  if (type === 'tetradic') {
    const h1 = (baseHsl.h + 60) % 360;
    const h2 = (baseHsl.h + 180) % 360;
    const h3 = (baseHsl.h + 240) % 360;
    return [
      hexToColorItem(baseHex),
      hexToColorItem(colord({ h: h1, s: baseHsl.s, l: baseHsl.l }).toHex()),
      hexToColorItem(colord({ h: h2, s: baseHsl.s, l: baseHsl.l }).toHex()),
      hexToColorItem(colord({ h: h3, s: baseHsl.s, l: baseHsl.l }).toHex()),
    ];
  }

  if (type === 'square') {
    const hues = [baseHsl.h, (baseHsl.h + 90) % 360, (baseHsl.h + 180) % 360, (baseHsl.h + 270) % 360];
    return hues.map((h) => hexToColorItem(colord({ h, s: baseHsl.s, l: baseHsl.l }).toHex()));
  }

  if (type === 'rectangle') {
    const hues = [baseHsl.h, (baseHsl.h + 60) % 360, (baseHsl.h + 180) % 360, (baseHsl.h + 240) % 360];
    return hues.map((h) => hexToColorItem(colord({ h, s: baseHsl.s, l: baseHsl.l }).toHex()));
  }

  if (type === 'monochromatic') {
    const saturations = [20, 40, 60, 80, 100];
    return saturations.map((s) =>
      hexToColorItem(colord({ h: baseHsl.h, s, l: baseHsl.l }).toHex())
    );
  }

  if (type === 'shades') {
    const lightnesses = [15, 30, 50, 70, 85];
    return lightnesses.map((l) =>
      hexToColorItem(colord({ h: baseHsl.h, s: baseHsl.s, l }).toHex())
    );
  }

  // Presets
  const presets: Record<string, string[]> = {
    pastel: ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'],
    luxury: ['#060B16', '#0E1628', '#111C30', '#00D8FF', '#5FFFF7'],
    'earth-tone': ['#606C38', '#283618', '#EAE0D5', '#28B8FF', '#0055FF'],
    cyberpunk: ['#060B16', '#FF0055', '#00D8FF', '#5FFFF7', '#7B00FF'],
    neon: ['#0E1628', '#00D8FF', '#5FFFF7', '#28B8FF', '#0099FF'],
    minimal: ['#060B16', '#0E1628', '#111C30', '#C9D4E5', '#FFFFFF'],
  };

  if (presets[type]) {
    return presets[type].map((h) => hexToColorItem(h));
  }

  return [baseHex, '#8B5CF6', '#EC4899', '#3B82F6', '#10B981'].map((h) => hexToColorItem(h));
}

export function calculateContrast(hex1: string, hex2: string): number {
  return colord(hex1).contrast(hex2);
}

export function isLightColor(hex: string): boolean {
  return colord(hex).isLight();
}

// Format Exports
export function generateCssExport(colors: ColorItem[], name = 'panther-palette'): string {
  const vars = colors
    .map((c, i) => `  --color-${i + 1}: ${c.hex}; /* RGB: ${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b} */`)
    .join('\n');
  return `:root {\n  /* Generated by Panther Studio */\n${vars}\n}`;
}

export function generateJsonExport(colors: ColorItem[], name = 'Panther Studio Palette'): string {
  return JSON.stringify(
    {
      paletteName: name,
      createdAt: new Date().toISOString(),
      creator: 'Panther Studio AI',
      colors: colors.map((c) => ({
        hex: c.hex,
        rgb: c.rgb,
        hsl: c.hsl,
        cmyk: c.cmyk,
        hsv: c.hsv,
      })),
    },
    null,
    2
  );
}

export function generateGplExport(colors: ColorItem[], name = 'Panther Studio'): string {
  const header = `GIMP Palette\nName: ${name}\nColumns: ${colors.length}\n#\n`;
  const body = colors
    .map((c) => {
      const r = c.rgb.r.toString().padStart(3, ' ');
      const g = c.rgb.g.toString().padStart(3, ' ');
      const b = c.rgb.b.toString().padStart(3, ' ');
      return `${r} ${g} ${b}\t${c.hex}`;
    })
    .join('\n');
  return header + body;
}

export function generateAseExport(colors: ColorItem[], paletteName = 'Panther Studio'): Uint8Array {
  // Binary Adobe Swatch Exchange (.ase) file format generator
  const encoder = new TextEncoder();
  const buffer: number[] = [];

  // Header 'ASEF'
  buffer.push(0x41, 0x53, 0x45, 0x46);
  // Version 1.0
  buffer.push(0x00, 0x01, 0x00, 0x00);

  // Number of blocks (1 group start, N colors, 1 group end)
  const numBlocks = colors.length + 2;
  buffer.push((numBlocks >> 24) & 0xff, (numBlocks >> 16) & 0xff, (numBlocks >> 8) & 0xff, numBlocks & 0xff);

  // Block 1: Group Start (0xC001)
  const groupNameUtf16 = paletteName + '\0';
  const groupNameBytes = new Uint8Array(groupNameUtf16.length * 2);
  for (let i = 0; i < groupNameUtf16.length; i++) {
    const code = groupNameUtf16.charCodeAt(i);
    groupNameBytes[i * 2] = (code >> 8) & 0xff;
    groupNameBytes[i * 2 + 1] = code & 0xff;
  }
  const groupBlockLen = 2 + groupNameBytes.length;

  buffer.push(0xc0, 0x01); // Block type
  buffer.push((groupBlockLen >> 24) & 0xff, (groupBlockLen >> 16) & 0xff, (groupBlockLen >> 8) & 0xff, groupBlockLen & 0xff);
  buffer.push((groupNameUtf16.length >> 8) & 0xff, groupNameUtf16.length & 0xff);
  for (let i = 0; i < groupNameBytes.length; i++) buffer.push(groupNameBytes[i]);

  // Color Blocks (0x0001)
  colors.forEach((c) => {
    const colorNameUtf16 = c.hex + '\0';
    const colorNameBytes = new Uint8Array(colorNameUtf16.length * 2);
    for (let i = 0; i < colorNameUtf16.length; i++) {
      const code = colorNameUtf16.charCodeAt(i);
      colorNameBytes[i * 2] = (code >> 8) & 0xff;
      colorNameBytes[i * 2 + 1] = code & 0xff;
    }

    // RGB mode 'RGB ' = 0x52 0x47 0x42 0x20
    // Float32 for R, G, B (0.0 to 1.0)
    const floatBuffer = new ArrayBuffer(12);
    const floatView = new DataView(floatBuffer);
    floatView.setFloat32(0, c.rgb.r / 255, false); // big-endian
    floatView.setFloat32(4, c.rgb.g / 255, false);
    floatView.setFloat32(8, c.rgb.b / 255, false);
    const floatBytes = new Uint8Array(floatBuffer);

    // Color type: 0 = Global, 1 = Spot, 2 = Process (Use 0)
    const colorBlockLen = 2 + colorNameBytes.length + 4 + 12 + 2;

    buffer.push(0x00, 0x01); // Block type
    buffer.push((colorBlockLen >> 24) & 0xff, (colorBlockLen >> 16) & 0xff, (colorBlockLen >> 8) & 0xff, colorBlockLen & 0xff);
    buffer.push((colorNameUtf16.length >> 8) & 0xff, colorNameUtf16.length & 0xff);
    for (let i = 0; i < colorNameBytes.length; i++) buffer.push(colorNameBytes[i]);
    buffer.push(0x52, 0x47, 0x42, 0x20); // 'RGB '
    for (let i = 0; i < floatBytes.length; i++) buffer.push(floatBytes[i]);
    buffer.push(0x00, 0x00); // Global type
  });

  // Block N: Group End (0xC002)
  buffer.push(0xc0, 0x02);
  buffer.push(0x00, 0x00, 0x00, 0x00); // Block length = 0

  return new Uint8Array(buffer);
}

export function generateSvgPalette(colors: ColorItem[]): string {
  const width = 800;
  const height = 300;
  const colWidth = width / colors.length;

  const rects = colors
    .map(
      (c, i) => `
    <g transform="translate(${i * colWidth}, 0)">
      <rect width="${colWidth}" height="${height}" fill="${c.hex}" />
      <rect y="${height - 70}" width="${colWidth}" height="70" fill="rgba(15, 23, 42, 0.85)" />
      <text x="${colWidth / 2}" y="${height - 40}" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${c.hex}</text>
      <text x="${colWidth / 2}" y="${height - 18}" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#94A3B8" text-anchor="middle">RGB ${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}</text>
    </g>`
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>text { font-family: system-ui, -apple-system, sans-serif; }</style>
  <rect width="${width}" height="${height}" fill="#0F172A" />
  ${rects}
</svg>`;
}

export function downloadFile(content: string | Uint8Array, filename: string, mimeType: string) {
  const blob = content instanceof Uint8Array ? new Blob([content], { type: mimeType }) : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
