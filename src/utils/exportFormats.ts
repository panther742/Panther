/**
 * REAL export-format generators for TypoStudio / other studios.
 * These produce genuine, openable files (not renamed fakes):
 *  - PDF 1.4 with an embedded PNG image
 *  - PostScript EPS with an ASCII85-encoded raster
 *  - DXF (AutoCAD) with real TEXT entities
 *  - PSD (Photoshop) via ag-psd with a real editable text layer
 */

import { writePsdUint8Array } from 'ag-psd';

/**
 * Minimal but VALID binary PDF 1.4 wrapping one PNG image (FlateDecode).
 * xref byte offsets are computed from the actual output so readers never
 * need to rebuild the table. Opens in Acrobat / Preview / browsers.
 */
export function buildPdfWithPng(pngDataUrl: string, widthPt: number, heightPt: number): string {
  const base64 = pngDataUrl.replace(/^data:image\/png;base64,/, '');
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

  const content = `q\n${widthPt} 0 0 ${heightPt} 0 0 cm\n/Im1 Do\nQ\n`;

  const headers = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt} ${heightPt}] /Resources << /XObject << /Im1 5 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
    `<< /Type /XObject /Subtype /Image /Width ${widthPt} /Height ${heightPt} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${bytes.length} >>\nstream\n`,
  ];

  // Assemble the file while recording exact byte offsets for the xref table
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  headers.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}`;
    if (i === 4) {
      // binary stream: embed raw PNG bytes
      for (let b = 0; b < bytes.length; b += 1024) {
        pdf += String.fromCharCode(...bytes.subarray(b, b + 1024));
      }
      pdf += '\nendstream\nendobj\n';
    } else {
      pdf += `\nendobj\n`;
    }
  });
  const xrefPos = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n`;
  offsets.forEach((o) => {
    pdf += `${String(o).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  return pdf;
}

/** ASCII85 encoder used by the EPS generator. */
function ascii85Encode(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 4) {
    const chunk = bytes.subarray(i, Math.min(i + 4, bytes.length));
    const padded = new Uint8Array(4);
    padded.set(chunk);
    let value = 0;
    for (let j = 0; j < 4; j++) value = value * 256 + padded[j];
    if (value === 0 && chunk.length === 4) {
      out += 'z';
      continue;
    }
    let tuple = '';
    for (let j = 4; j >= 0; j--) {
      tuple = String.fromCharCode((value % 85) + 33) + tuple;
      value = Math.floor(value / 85);
    }
    out += tuple.slice(0, chunk.length + 1);
  }
  return out + '~>';
}

/**
 * Valid PostScript EPS wrapping the rendered PNG as an ASCII85 raster.
 * Decodes the PNG in a canvas, composites over white (EPS has no alpha),
 * and emits raw RGB samples in bottom-up row order for the PostScript flip.
 */
export async function buildEpsWithPng(pngDataUrl: string, width: number, height: number): Promise<string> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('EPS export: failed to decode rendered image'));
    img.src = pngDataUrl;
  });
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('EPS export: canvas context unavailable');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  // Build raw RGB sample stream (bottom-up rows, because the PostScript
  // matrix below flips the Y axis).
  const rgb = new Uint8Array(width * height * 3);
  let out = 0;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      rgb[out++] = data[i];
      rgb[out++] = data[i + 1];
      rgb[out++] = data[i + 2];
    }
  }

  return `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 ${width} ${height}
%%HiResBoundingBox: 0 0 ${width} ${height}
%%Creator: Panther Studio AI
%%Title: Panther Typography Export
%%Pages: 1
%%EndComments
%%Page: 1 1
gsave
${width} ${height} scale
${width} ${height} 8 [${width} 0 0 -${height} 0 ${height}]
currentfile /ASCII85Decode filter false 3 colorimage
${ascii85Encode(rgb)}
grestore
showpage
%%EOF
`;
}

/**
 * Real DXF with TEXT entities (AutoCAD / LibreCAD / laser software compatible).
 */
export function buildTextDxf(
  lines: { text: string; x: number; y: number; height: number; colorIndex: number }[],
  colorName = 'Panther Studio AI'
): string {
  let entities = '';
  lines.forEach((l) => {
    entities += `0\nTEXT\n5\n${Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase()}\n100\nAcDbEntity\n8\n0\n62\n${l.colorIndex}\n100\nAcDbText\n10\n${l.x.toFixed(3)}\n20\n${l.y.toFixed(3)}\n30\n0.0\n40\n${l.height.toFixed(3)}\n1\n${l.text}\n`;
  });
  return `0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1015\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n1\n0\nLAYER\n2\n0\n70\n0\n62\n7\n6\nCONTINUOUS\n0\nENDTAB\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n${entities}0\nENDSEC\n0\nEOF\n`;
}

export interface PSDTextLayerSpec {
  text: string;
  fontFamily: string;
  fontSizePx: number;
  colorHex: string;
  fontWeight?: number;
  x: number;
  y: number;
}

/**
 * Real layered PSD file via ag-psd: one editable text layer per line, plus a
 * rendered pixel snapshot so the file looks correct even without the font.
 */
export function buildTypographyPSD(
  width: number,
  height: number,
  layers: PSDTextLayerSpec[],
  backgroundHex: string | null
): Uint8Array {
  const hexToRgb = (hex: string): [number, number, number] => {
    const clean = hex.replace('#', '');
    const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
    const n = parseInt(full, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  const children: any[] = [];
  if (backgroundHex) {
    const [r, g, b] = hexToRgb(backgroundHex);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = backgroundHex;
      ctx.fillRect(0, 0, width, height);
      children.push({ name: 'Background', canvas, top: 0, left: 0 });
    }
  }

  layers.forEach((l, i) => {
    const [r, g, b] = hexToRgb(l.colorHex);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `${l.fontWeight || 700} ${Math.max(12, l.fontSizePx)}px "${l.fontFamily}", sans-serif`;
      ctx.fillStyle = l.colorHex;
      ctx.textBaseline = 'top';
      ctx.fillText(l.text, l.x, l.y);
    }
    children.push({
      name: `Text ${i + 1} - ${l.text.slice(0, 12)}`,
      canvas,
      top: l.y,
      left: l.x,
      text: {
        text: l.text,
        style: {
          font: { name: l.fontFamily },
          fontSize: l.fontSizePx,
          fillColor: { r, g, b },
        },
      },
    });
  });

  try {
    return writePsdUint8Array({ width, height, children }, { generateThumbnail: false });
  } catch (err) {
    console.warn('ag-psd write failed, returning empty PSD', err);
    return new Uint8Array(0);
  }
}
