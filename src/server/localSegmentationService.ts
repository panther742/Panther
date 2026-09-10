import Jimp from 'jimp';

/**
 * Panther Studio — Local Magic-Layer Segmentation Engine
 *
 * Analyzes the uploaded image's actual pixels and decomposes it into
 * independent visual elements (objects, subjects, text/graphic bits) the way
 * Canva's magic-layers do — WITHOUT requiring a Gemini API key.
 *
 * Pipeline: decode -> downscale -> background color model (border clusters)
 * -> foreground mask -> morphology cleanup -> connected components -> smart
 * merging (letters->lines, head->body) -> per-element bounding boxes.
 */

export interface LocalDetectedElement {
  id: string;
  name: string;
  /** [ymin, xmin, ymax, xmax] normalized 0-1000 */
  bbox: [number, number, number, number];
  avgColorHex: string;
  areaFraction: number;
  category: 'person' | 'text-like' | 'object';
  confidenceScorePercent: number;
}

export interface LocalBackgroundInfo {
  type: 'solid' | 'gradient' | 'photo';
  primaryColorHex: string;
  secondaryColorHex?: string;
  gradientAngle?: number;
}

interface Cluster {
  r: number;
  g: number;
  b: number;
  count: number;
}

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;

// Simple human-friendly color names for layer naming
const NAMED_COLORS: [string, number, number, number][] = [
  ['black', 10, 10, 12],
  ['white', 246, 246, 244],
  ['light gray', 190, 190, 190],
  ['dark gray', 70, 70, 76],
  ['red', 210, 45, 45],
  ['orange', 240, 130, 35],
  ['gold', 210, 165, 60],
  ['yellow', 240, 220, 70],
  ['green', 55, 160, 70],
  ['teal', 30, 150, 140],
  ['sky blue', 90, 170, 230],
  ['blue', 45, 90, 200],
  ['navy', 25, 35, 70],
  ['purple', 130, 60, 190],
  ['pink', 230, 100, 150],
  ['brown', 120, 75, 45],
  ['beige', 220, 200, 165],
];

function colorName(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  let best = 'colored';
  let bestDist = Infinity;
  for (const [name, nr, ng, nb] of NAMED_COLORS) {
    const d = Math.hypot(r - nr, g - ng, b - nb);
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  return best;
}

function addToClusters(clusters: Cluster[], r: number, g: number, b: number, maxClusters: number, mergeDist: number) {
  let bestIdx = -1;
  let bestDist = mergeDist;
  for (let i = 0; i < clusters.length; i++) {
    const d = Math.hypot(r - clusters[i].r, g - clusters[i].g, b - clusters[i].b);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  if (bestIdx >= 0) {
    const c = clusters[bestIdx];
    const n = c.count + 1;
    c.r = (c.r * c.count + r) / n;
    c.g = (c.g * c.count + g) / n;
    c.b = (c.b * c.count + b) / n;
    c.count = n;
  } else {
    if (clusters.length >= maxClusters) {
      // replace the smallest cluster
      let minIdx = 0;
      for (let i = 1; i < clusters.length; i++) {
        if (clusters[i].count < clusters[minIdx].count) minIdx = i;
      }
      clusters[minIdx] = { r, g, b, count: 1 };
    } else {
      clusters.push({ r, g, b, count: 1 });
    }
  }
}

const minDistToClusters = (r: number, g: number, b: number, clusters: Cluster[]): number => {
  if (clusters.length === 0) return 255;
  let minD = Infinity;
  for (const c of clusters) {
    const d = Math.hypot(r - c.r, g - c.g, b - c.b);
    if (d < minD) minD = d;
  }
  return minD;
};

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
  const total = w * h;

  // 3. Build background color model from border pixels (2px frame, opaque only)
  const clusters: Cluster[] = [];
  let borderCount = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const isBorder = x < 2 || y < 2 || x >= w - 2 || y >= h - 2;
      if (!isBorder) continue;
      const idx = (y * w + x) * 4;
      const a = data[idx + 3];
      if (a < 60) continue;
      borderCount++;
      addToClusters(clusters, data[idx], data[idx + 1], data[idx + 2], 10, 30);
    }
  }

  if (borderCount < 50) {
    return {
      elements: [],
      background: { type: 'photo', primaryColorHex: '#0B0F19' },
    };
  }

  clusters.sort((a, b) => b.count - a.count);
  const dominant = clusters[0];
  const borderCoverage = dominant.count / Math.max(1, borderCount);
  // Gradient backdrops spread across 2 large clusters (top & bottom); real
  // photos never concentrate that much in the top-2 clusters.
  const top2Coverage = (clusters[0].count + (clusters[1]?.count || 0)) / Math.max(1, borderCount);
  const backgroundClusters = clusters.slice(0, 4);

  // 4. Corner sampling for gradient detection (avg + stddev of each corner).
  //    A smooth gradient has LOW corner variance; a busy photo has HIGH variance.
  const sampleRegion = (
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): { avg: [number, number, number]; std: number } | null => {
    let rSum = 0, gSum = 0, bSum = 0, n = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const idx = (y * w + x) * 4;
        if (data[idx + 3] < 60) continue;
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
        n++;
      }
    }
    if (n < 8) return null;
    const ra = rSum / n, ga = gSum / n, ba = bSum / n;
    let varSum = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const idx = (y * w + x) * 4;
        if (data[idx + 3] < 60) continue;
        varSum += (data[idx] - ra) ** 2 + (data[idx + 1] - ga) ** 2 + (data[idx + 2] - ba) ** 2;
      }
    }
    return { avg: [ra, ga, ba], std: Math.sqrt(varSum / Math.max(1, n * 3)) };
  };

  const strip = Math.max(4, Math.round(Math.min(w, h) * 0.06));
  const tl = sampleRegion(0, 0, strip, strip);
  const tr = sampleRegion(w - strip, 0, w, strip);
  const bl = sampleRegion(0, h - strip, strip, h);
  const br = sampleRegion(w - strip, h - strip, w, h);

  // 5. Foreground mask
  const fg = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    const idx = i * 4;
    const a = data[idx + 3];
    if (a < 40) continue; // transparent = background
    const d = minDistToClusters(data[idx], data[idx + 1], data[idx + 2], backgroundClusters);
    if (d > 55) fg[i] = 1;
  }

  // 6. Morphology: erode isolated noise only. NO dilation — dilation paints a
  //    1px background-colored ring around every element, and those halo rings
  //    act as bridges that glue distinct elements into one giant layer.
  const mask = new Uint8Array(total);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (!fg[i]) continue;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (fg[i + dy * w + dx]) count++;
        }
      }
      if (count >= 3) mask[i] = 1;
    }
  }

  // 7. Connected components (8-connectivity BFS)
  const visited = new Uint8Array(total);
  const components: number[][] = [];
  for (let start = 0; start < total; start++) {
    if (!mask[start] || visited[start]) continue;
    const comp: number[] = [];
    const queue: number[] = [start];
    visited[start] = 1;
    let head = 0;
    while (head < queue.length) {
      const i = queue[head++];
      comp.push(i);
      const x = i % w;
      const y = Math.floor(i / w);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const ni = ny * w + nx;
          if (mask[ni] && !visited[ni]) {
            visited[ni] = 1;
            queue.push(ni);
          }
        }
      }
    }
    components.push(comp);
  }

  // 7b. Color-region splitting: elements that TOUCH each other (e.g. a person
  // standing right against a text bar) get separated by their color similarity.
  // This is what makes each visual element its own independent layer.
  const minArea = Math.max(12, Math.round(total * 0.0015));
  const regions: number[][] = [];
  for (const comp of components) {
    const sortedPixels = [...comp].sort((a, b) => a - b);
    const seen = new Uint8Array(total);
    for (const seed of sortedPixels) {
      if (seen[seed]) continue;
      const seedIdx = seed * 4;
      const sr = data[seedIdx];
      const sg = data[seedIdx + 1];
      const sb = data[seedIdx + 2];
      const region: number[] = [];
      const queue: number[] = [seed];
      seen[seed] = 1;
      let head = 0;
      while (head < queue.length) {
        const i = queue[head++];
        region.push(i);
        const x = i % w;
        const y = Math.floor(i / w);
        const neighbors = [i + 1, i - 1, i + w, i - w];
        for (const ni of neighbors) {
          if (ni < 0 || ni >= total || seen[ni] || !mask[ni]) continue;
          const nx = ni % w;
          const ny = Math.floor(ni / w);
          if (Math.abs(nx - x) > 1 || Math.abs(ny - y) > 1) continue;
          const pIdx = ni * 4;
          const d = Math.hypot(data[pIdx] - sr, data[pIdx + 1] - sg, data[pIdx + 2] - sb);
          if (d < 55) {
            seen[ni] = 1;
            queue.push(ni);
          }
        }
      }
      if (region.length >= minArea) {
        regions.push(region);
      }
    }
  }

  // 8. Filter noise-level regions
  const candidates = regions
    .filter((c) => c.length >= minArea)
    .map((comp) => {
      let minX = w, minY = h, maxX = 0, maxY = 0;
      let rSum = 0, gSum = 0, bSum = 0;
      for (const i of comp) {
        const x = i % w;
        const y = Math.floor(i / w);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        const idx = i * 4;
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
      }
      return {
        pixels: comp,
        area: comp.length,
        minX, minY, maxX, maxY,
        avg: [rSum / comp.length, gSum / comp.length, bSum / comp.length] as [number, number, number],
      };
    })
    .sort((a, b) => b.area - a.area);

  // 9. Smart merging: close/overlapping pieces of the same element
  //    (e.g. head + torso of a person, letters of one text line).
  //    Rules are intentionally strict so DISTINCT elements stay separate.
  const merged: typeof candidates = [];
  for (const c of candidates) {
    let matched = false;
    for (let pass = 0; pass < 3 && !matched; pass++) {
      for (const m of merged) {
        const overlapX = Math.min(c.maxX, m.maxX) - Math.max(c.minX, m.minX);
        const overlapY = Math.min(c.maxY, m.maxY) - Math.max(c.minY, m.minY);
        const cw = c.maxX - c.minX + 1;
        const ch = c.maxY - c.minY + 1;
        const mw = m.maxX - m.minX + 1;
        const mh = m.maxY - m.minY + 1;
        const gapX = Math.max(0, Math.max(c.minX, m.minX) - Math.min(c.maxX, m.maxX));
        const gapY = Math.max(0, Math.max(c.minY, m.minY) - Math.min(c.maxY, m.maxY));

        // Same-object merge: vertical stack with horizontal alignment (head->body)
        const verticalMerge =
          overlapX > 0.55 * Math.min(cw, mw) &&
          overlapX > 0.4 * Math.max(cw, mw) &&
          gapY < 0.08 * (ch + mh);
        // Same-line merge: side-by-side with vertical alignment (letters->line)
        const horizontalMerge =
          overlapY > 0.6 * Math.min(ch, mh) &&
          overlapY > 0.35 * Math.max(ch, mh) &&
          gapX < Math.max(2, 0.8 * Math.min(cw, mw));
        // Genuine overlap: a significant portion of the smaller piece is inside the other
        const intersectArea = Math.max(0, overlapX) * Math.max(0, overlapY);
        const overlapping = intersectArea > 0.5 * Math.min(c.area, m.area);

        if (verticalMerge || horizontalMerge || overlapping) {
          m.pixels = m.pixels.concat(c.pixels);
          m.area += c.area;
          m.minX = Math.min(m.minX, c.minX);
          m.minY = Math.min(m.minY, c.minY);
          m.maxX = Math.max(m.maxX, c.maxX);
          m.maxY = Math.max(m.maxY, c.maxY);
          const n = m.area;
          m.avg = [
            (m.avg[0] * (m.area - c.area) + c.avg[0] * c.area) / n,
            (m.avg[1] * (m.area - c.area) + c.avg[1] * c.area) / n,
            (m.avg[2] * (m.area - c.area) + c.avg[2] * c.area) / n,
          ];
          matched = true;
          break;
        }
      }
    }
    if (!matched) merged.push(c);
  }
  merged.sort((a, b) => b.area - a.area);

  // 10. Cap to element budget and build results
  const elements: LocalDetectedElement[] = [];
  const budget = Math.max(1, Math.min(maxElements, 60));
  for (let i = 0; i < Math.min(budget, merged.length); i++) {
    const c = merged[i];
    const padX = Math.max(1, Math.round((c.maxX - c.minX + 1) * 0.06));
    const padY = Math.max(1, Math.round((c.maxY - c.minY + 1) * 0.06));
    // NOTE: c.minX/c.minY live in DOWNSCALED image coordinates, so normalize
    // against the downscaled width/height (w/h) — that maps back to the same
    // relative position in the full-resolution image.
    const ymin = Math.max(0, (c.minY - padY) / h);
    const xmin = Math.max(0, (c.minX - padX) / w);
    const ymax = Math.min(1, (c.maxY + padY + 1) / h);
    const xmax = Math.min(1, (c.maxX + padX + 1) / w);

    const bw = c.maxX - c.minX + 1;
    const bh = c.maxY - c.minY + 1;
    const aspect = bh / Math.max(1, bw);
    const areaFraction = c.area / total;

    // Classification heuristics
    let category: 'person' | 'text-like' | 'object' = 'object';
    if (aspect > 1.6 && areaFraction > 0.12 && c.minX > 2 && c.maxX < w - 3) {
      category = 'person';
    } else if (areaFraction < 0.05) {
      // boundary density: text/graphics have high edge-to-area ratio
      const pixelSet = new Set(c.pixels);
      let boundaryCount = 0;
      for (const i of c.pixels) {
        const x = i % w;
        const y = Math.floor(i / w);
        let edges = 0;
        if (x === 0 || !pixelSet.has(i - 1)) edges++;
        if (x === w - 1 || !pixelSet.has(i + 1)) edges++;
        if (y === 0 || !pixelSet.has(i - w)) edges++;
        if (y === h - 1 || !pixelSet.has(i + w)) edges++;
        boundaryCount += edges;
      }
      const boundaryRatio = boundaryCount / Math.max(1, c.pixels.length);
      if (boundaryRatio > 0.4 && c.pixels.length > 60) category = 'text-like';
    }

    const hex = rgbToHex(...c.avg);
    const label = category === 'person' ? 'Model / Subject' : category === 'text-like' ? 'Text & Graphics' : 'Detected Element';
    elements.push({
      id: `element-${i + 1}`,
      name: `${label} ${i + 1} (${colorName(hex)})`,
      bbox: [Math.round(ymin * 1000), Math.round(xmin * 1000), Math.round(ymax * 1000), Math.round(xmax * 1000)],
      avgColorHex: hex,
      areaFraction,
      category,
      confidenceScorePercent: Math.round(Math.min(98, 70 + borderCoverage * 20 + (c.area / total) * 40)),
    });
  }

  // 11. Background plate classification
  let background: LocalBackgroundInfo;
  const avgColor = rgbToHex(dominant.r, dominant.g, dominant.b);
  const transparentBorder = 1 - borderCount / Math.max(1, (w + h) * 2 * 2);

  const corners = [tl, tr, bl, br];
  const cornerStd = (c: typeof tl) => c?.std ?? 999;
  const cornerAvg = (c: typeof tl) => c?.avg ?? null;
  const smoothCorners = corners.every((c) => cornerStd(c) < 22);

  if (top2Coverage >= 0.75 && transparentBorder < 0.3) {
    // Solid vs gradient: compare corner regions
    const tla = cornerAvg(tl), tra = cornerAvg(tr), bla = cornerAvg(bl), bra = cornerAvg(br);
    const topAvg: [number, number, number] | null =
      tla && tra ? [(tla[0] + tra[0]) / 2, (tla[1] + tra[1]) / 2, (tla[2] + tra[2]) / 2] : null;
    const botAvg: [number, number, number] | null =
      bla && bra ? [(bla[0] + bra[0]) / 2, (bla[1] + bra[1]) / 2, (bla[2] + bra[2]) / 2] : null;
    const leftAvg: [number, number, number] | null =
      tla && bla ? [(tla[0] + bla[0]) / 2, (tla[1] + bla[1]) / 2, (tla[2] + bla[2]) / 2] : null;
    const rightAvg: [number, number, number] | null =
      tra && bra ? [(tra[0] + bra[0]) / 2, (tra[1] + bra[1]) / 2, (tra[2] + bra[2]) / 2] : null;

    // Only classify as gradient when corners are smooth (a real photo with a
    // blue sky top and busy ground bottom has high corner variance).
    if (smoothCorners && topAvg && botAvg && Math.hypot(topAvg[0] - botAvg[0], topAvg[1] - botAvg[1], topAvg[2] - botAvg[2]) > 40) {
      background = {
        type: 'gradient',
        primaryColorHex: rgbToHex(...topAvg),
        secondaryColorHex: rgbToHex(...botAvg),
        gradientAngle: 90, // top -> bottom
      };
    } else if (smoothCorners && leftAvg && rightAvg && Math.hypot(leftAvg[0] - rightAvg[0], leftAvg[1] - rightAvg[1], leftAvg[2] - rightAvg[2]) > 40) {
      background = {
        type: 'gradient',
        primaryColorHex: rgbToHex(...leftAvg),
        secondaryColorHex: rgbToHex(...rightAvg),
        gradientAngle: 0, // left -> right
      };
    } else {
      background = { type: 'solid', primaryColorHex: avgColor };
    }
  } else if (transparentBorder >= 0.3) {
    background = { type: 'photo', primaryColorHex: avgColor };
  } else if (borderCoverage >= 0.35) {
    background = { type: 'solid', primaryColorHex: avgColor };
  } else {
    // Busy photographic backdrop — keep the original pixels as the backdrop plate
    background = { type: 'photo', primaryColorHex: avgColor };
  }

  return { elements, background };
}
