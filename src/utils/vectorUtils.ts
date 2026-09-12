import potrace from 'potrace';
import { VectorSettings, VectorExportFormat } from '../types';

export interface VectorProcessResult {
  svg: string;
  pathsCount: number;
  width: number;
  height: number;
}

export interface PathCommand {
  type: string;
  numbers: number[];
}

// Tokenize SVG path data ("M85.07 42.59 C64.8 48.02, ...") into commands.
// Uses an explicit exec() loop — far more robust than the global .match()
// callbacks (which newer TypeScript versions type as `never` in some
// program configurations).
export function tokenizePathCommands(d: string): PathCommand[] {
  const commands: PathCommand[] = [];
  const re = /([A-Za-z])([^A-Za-z]*)/g;
  let execMatch: RegExpExecArray | null;
  while ((execMatch = re.exec(d)) !== null) {
    commands.push({
      type: execMatch[1],
      numbers: execMatch[2]
        .trim()
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => !isNaN(n)),
    });
  }
  return commands;
}

/**
 * Real-color posterized vectorizer.
 *
 * potrace's built-in Posterizer never emits actual colors — it stacks black
 * paths with fill-opacity (a grayscale result), and its default "auto" range
 * distribution runs an exhaustive recursive multilevel-Otsu search that hangs
 * for more than a few layers. This implementation instead:
 *   1. buckets non-background pixels into `levels` equal luma bands,
 *   2. traces each band (nested geometry, darkest band painted last) with
 *      plain Potrace,
 *   3. fills every layer with the band's true dominant RGB color.
 * Result: a flat-color posterized SVG with real colors in O(levels * pixels).
 */
export function buildColorVectorSvg(
  data: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  levels: number,
  background: 'transparent' | '#FFFFFF',
  opts: { turdSize: number; turnPolicy: string; optCurve: boolean; optTolerance: number }
): string {
  const total = width * height;
  // potrace's own luminance formula — must match so banding and tracing agree
  const lum = new Uint8Array(total);
  let maxLuma = -1;
  for (let i = 0; i < total; i++) {
    const p = i * 4;
    if (data[p + 3] < 10) {
      lum[i] = 255; // background / transparent pixel
    } else {
      const l = Math.round(0.2126 * data[p] + 0.7153 * data[p + 1] + 0.0721 * data[p + 2]);
      lum[i] = l;
      if (l > maxLuma) maxLuma = l;
    }
  }
  if (maxLuma < 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" version="1.1"></svg>`;
  }
  // Pure white counts as background/paper: cap so white regions (and
  // transparent pixels) never enter a traced band.
  if (maxLuma >= 255) maxLuma = 254;

  const bands = Math.max(2, Math.min(16, levels));

  // Upper bound of each band; band j covers luma in (bound[j-1], bound[j]]
  const bound: number[] = [];
  for (let j = 0; j < bands; j++) {
    const raw = Math.round(((j + 1) * Math.max(1, maxLuma)) / bands);
    bound.push(Math.max(j === 0 ? 1 : bound[j - 1] + 1, raw));
  }
  bound[bands - 1] = Math.max(bound[bands - 2] + 1, maxLuma);

  // O(1) luma -> band lookup; luma above maxLuma counts as background
  const bandOf = new Int8Array(256);
  for (let l = 0; l <= 255; l++) {
    if (l > maxLuma) {
      bandOf[l] = -1;
      continue;
    }
    let idx = 0;
    while (idx < bands - 1 && l > bound[idx]) idx++;
    bandOf[l] = idx;
  }

  // Per-band dominant color + pixel counts
  const bandCount = new Uint32Array(bands);
  const bandHist = new Map<number, number>([]);
  const bandMaps: Map<number, number>[] = [];
  for (let j = 0; j < bands; j++) bandMaps.push(new Map());
  for (let i = 0; i < total; i++) {
    const j = bandOf[lum[i]];
    if (j < 0) continue;
    bandCount[j]++;
    const p = i * 4;
    const key = (data[p] << 16) | (data[p + 1] << 8) | data[p + 2];
    bandMaps[j].set(key, (bandMaps[j].get(key) || 0) + 1);
  }

  const dominantColor = (map: Map<number, number>): string => {
    let best = 0;
    let bestKey = 0;
    map.forEach((count, key) => {
      if (count > best) {
        best = count;
        bestKey = key;
      }
    });
    const r = (bestKey >> 16) & 255;
    const g = (bestKey >> 8) & 255;
    const b = bestKey & 255;
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  };

  // Grayscale feed: potrace's luminance of (l,l,l) equals our band luma;
  // background pixels stay white (255) and sit above the top band boundary.
  const feed = new Uint8Array(total * 4);
  for (let i = 0; i < total; i++) {
    const l = lum[i];
    feed[i * 4] = l;
    feed[i * 4 + 1] = l;
    feed[i * 4 + 2] = l;
    feed[i * 4 + 3] = 255;
  }
  const fakeImage = {
    bitmap: { width, height, data: feed },
    scan: (
      x0: number,
      y0: number,
      scanW: number,
      scanH: number,
      cb: (x: number, y: number, idx: number) => void
    ) => {
      for (let y = y0; y < y0 + scanH; y++) {
        for (let x = x0; x < x0 + scanW; x++) {
          cb(x, y, (y * width + x) * 4);
        }
      }
    },
  };

  // Trace brightest band first (painted first, covered by darker bands)
  const pathTags: string[] = [];
  for (let j = bands - 1; j >= 0; j--) {
    if (bandCount[j] === 0) continue;
    const tracer = new potrace.Potrace({
      threshold: bound[j],
      blackOnWhite: true,
      turdSize: Math.max(2, opts.turdSize || 4),
      optCurve: opts.optCurve,
      optTolerance: opts.optTolerance,
      color: dominantColor(bandMaps[j]),
      background: '#FFFFFF',
    } as any);
    (tracer as any)._processLoadedImage(fakeImage);
    // turnPolicy is a valid runtime potrace option but missing from the
    // community typings, so it is applied via setParameters instead.
    (tracer as any).setParameters({ turnPolicy: opts.turnPolicy || 'minority' });
    pathTags.push((tracer as any).getPathTag());
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" version="1.1">\n\t${
    background !== 'transparent' ? `<rect x="0" y="0" width="100%" height="100%" fill="${background}" />` : ''
  }\n\t${pathTags.join('\n\t')}\n</svg>`;
}


// Convert SVG Path string to DXF entities.
// Handles M/L/C/Z commands (potrace output uses M, C and Z). Cubic curves are
// flattened into short line segments so CAD software gets accurate geometry,
// and the LWPOLYLINE vertex count matches the emitted points.
export function svgToDxf(svgContent: string, width = 800, height = 600): string {
  const pathRegex = /d="([^"]+)"/g;
  let match;
  const paths: string[] = [];
  while ((match = pathRegex.exec(svgContent)) !== null) {
    paths.push(match[1]);
  }

  const flattenCurve = (
    x0: number, y0: number,
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
    segments = 12
  ): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const mt = 1 - t;
      const x = mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3;
      const y = mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3;
      pts.push([x, y]);
    }
    return pts;
  };

  let dxfEntities = '';
  let handleCounter = 0;

  const emitPolyline = (points: [number, number][], closed: boolean) => {
    if (points.length < 2) return;
    handleCounter++;
    dxfEntities += `0\nLWPOLYLINE\n5\n${handleCounter.toString(16).toUpperCase().padStart(2, '0')}\n100\nAcDbEntity\n8\n0\n100\nAcDbPolyline\n90\n${points.length}\n70\n${closed ? 1 : 0}\n`;
    points.forEach(([x, y]) => {
      dxfEntities += `10\n${x.toFixed(3)}\n20\n${(height - y).toFixed(3)}\n`; // DXF Y axis flipped
    });
  };

  paths.forEach((d) => {
    const commands = tokenizePathCommands(d);
    let currentX = 0;
    let currentY = 0;
    let subStart: [number, number] = [0, 0];
    let polyline: [number, number][] = [];

    const flushPolyline = () => {
      if (polyline.length >= 2) {
        // potrace paths have no Z: they return exactly to the subpath start.
        // Detect that and emit a properly closed CAD polyline (70=1).
        const first = polyline[0];
        const last = polyline[polyline.length - 1];
        const isClosed =
          polyline.length >= 3 &&
          Math.abs(last[0] - first[0]) < 0.5 &&
          Math.abs(last[1] - first[1]) < 0.5;
        emitPolyline(polyline, isClosed);
      }
      polyline = [];
    };

    commands.forEach((cmd) => {
      const type = cmd.type;
      const numbers = cmd.numbers;

      if (type === 'M') {
        flushPolyline();
        for (let i = 0; i + 1 < numbers.length; i += 2) {
          currentX = numbers[i];
          currentY = numbers[i + 1];
          subStart = [currentX, currentY];
        }
        polyline.push([currentX, currentY]);
      } else if (type === 'L') {
        for (let i = 0; i + 1 < numbers.length; i += 2) {
          currentX = numbers[i];
          currentY = numbers[i + 1];
          polyline.push([currentX, currentY]);
        }
      } else if (type === 'C') {
        for (let i = 0; i + 5 < numbers.length; i += 6) {
          const x1 = numbers[i], y1 = numbers[i + 1];
          const x2 = numbers[i + 2], y2 = numbers[i + 3];
          const x3 = numbers[i + 4], y3 = numbers[i + 5];
          const curvePts = flattenCurve(currentX, currentY, x1, y1, x2, y2, x3, y3);
          curvePts.forEach((p) => polyline.push(p));
          currentX = x3;
          currentY = y3;
        }
      } else if (type === 'Z' || type === 'z') {
        // Close subpath: connect back to the start point
        if (
          polyline.length > 0 &&
          (Math.abs(polyline[polyline.length - 1][0] - subStart[0]) > 0.01 ||
            Math.abs(polyline[polyline.length - 1][1] - subStart[1]) > 0.01)
        ) {
          polyline.push(subStart);
        }
        // Emit as a closed polyline
        if (polyline.length >= 3) {
          handleCounter++;
          const pts = polyline;
          dxfEntities += `0\nLWPOLYLINE\n5\n${handleCounter.toString(16).toUpperCase().padStart(2, '0')}\n100\nAcDbEntity\n8\n0\n100\nAcDbPolyline\n90\n${pts.length}\n70\n1\n`;
          pts.forEach(([x, y]) => {
            dxfEntities += `10\n${x.toFixed(3)}\n20\n${(height - y).toFixed(3)}\n`;
          });
        }
        polyline = [];
        return;
      }
    });

    // Flush any remaining open polyline
    flushPolyline();
  });

  return `0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1015\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n${dxfEntities}0\nENDSEC\n0\nEOF\n`;
}

// Convert SVG to EPS (Encapsulated PostScript)
export function svgToEps(svgContent: string, width = 800, height = 600): string {
  const pathRegex = /d="([^"]+)"/g;
  let match;
  const paths: string[] = [];
  while ((match = pathRegex.exec(svgContent)) !== null) {
    paths.push(match[1]);
  }

  let psCommands = '';
  paths.forEach((d) => {
    psCommands += 'newpath\n';
    const commands = tokenizePathCommands(d);
    commands.forEach((cmd) => {
      const type = cmd.type;
      const numbers = cmd.numbers;

      if (type === 'M' && numbers.length >= 2) {
        psCommands += `${numbers[0].toFixed(2)} ${(height - numbers[1]).toFixed(2)} moveto\n`;
      } else if (type === 'L' && numbers.length >= 2) {
        psCommands += `${numbers[0].toFixed(2)} ${(height - numbers[1]).toFixed(2)} lineto\n`;
      } else if (type === 'C' && numbers.length >= 6) {
        psCommands += `${numbers[0].toFixed(2)} ${(height - numbers[1]).toFixed(2)} ${numbers[2].toFixed(2)} ${(height - numbers[3]).toFixed(2)} ${numbers[4].toFixed(2)} ${(height - numbers[5]).toFixed(2)} curveto\n`;
      } else if (type === 'Z' || type === 'z') {
        psCommands += 'closepath\n';
      }
    });
    psCommands += 'fill\n';
  });

  return `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 ${width} ${height}
%%Creator: Panther Studio AI Vectorizer
%%Title: Panther Vector Output
%%Pages: 1
%%EndComments
gsave
0 0 translate
${psCommands}
grestore
showpage
%%EOF`;
}

// Convert SVG to PDF Vector file format
export function svgToPdfVector(svgContent: string, width = 800, height = 600): string {
  const pathRegex = /d="([^"]+)"/g;
  let match;
  const paths: string[] = [];
  while ((match = pathRegex.exec(svgContent)) !== null) {
    paths.push(match[1]);
  }

  let streamContent = `q\n0 0 ${width} ${height} re W n\n0.15 0.05 0.25 rg\n`;
  paths.forEach((d) => {
    const commands = tokenizePathCommands(d);
    commands.forEach((cmd) => {
      const type = cmd.type;
      const numbers = cmd.numbers;

      if (type === 'M' && numbers.length >= 2) {
        streamContent += `${numbers[0].toFixed(2)} ${(height - numbers[1]).toFixed(2)} m\n`;
      } else if (type === 'L' && numbers.length >= 2) {
        streamContent += `${numbers[0].toFixed(2)} ${(height - numbers[1]).toFixed(2)} l\n`;
      } else if (type === 'C' && numbers.length >= 6) {
        streamContent += `${numbers[0].toFixed(2)} ${(height - numbers[1]).toFixed(2)} ${numbers[2].toFixed(2)} ${(height - numbers[3]).toFixed(2)} ${numbers[4].toFixed(2)} ${(height - numbers[5]).toFixed(2)} c\n`;
      } else if (type === 'Z' || type === 'z') {
        streamContent += 'h\n';
      }
    });
    streamContent += 'f\n';
  });
  streamContent += 'Q\n';

  const streamLength = streamContent.length;

  return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 ${width} ${height}] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000118 00000 n 
0000000230 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
${280 + streamLength}
%%EOF`;
}

// Convert SVG to CDR compatible export format
export function svgToCdrExport(svgContent: string): string {
  // Add CorelDraw XML namespace and vector metadata tag
  return svgContent.replace(
    '<svg ',
    '<svg xmlns:cdr="http://schemas.corel.com/coreldraw/2011/cdr" cdr:version="18.0" cdr:format="CorelDraw Vector Exchange" '
  );
}

// Process Image to Vector using Canvas in Browser
export async function vectorizeImageDataUrl(
  dataUrl: string,
  settings: VectorSettings
): Promise<VectorProcessResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Failed to create canvas context'));

      const width = img.width || 600;
      const height = img.height || 400;
      canvas.width = width;
      canvas.height = height;

      // Draw original image
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // 1. Optional background removal / Chroma keying (average of all 4 corners,
      //    so a busy photo background doesn't eat the whole image)
      if (settings.removeBackground) {
        const corners = [
          [data[0], data[1], data[2]],
          [data[(width - 1) * 4], data[(width - 1) * 4 + 1], data[(width - 1) * 4 + 2]],
          [data[(height - 1) * width * 4], data[(height - 1) * width * 4 + 1], data[(height - 1) * width * 4 + 2]],
          [data[((height - 1) * width + (width - 1)) * 4], data[((height - 1) * width + (width - 1)) * 4 + 1], data[((height - 1) * width + (width - 1)) * 4 + 2]],
        ];
        const bgR = (corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) / 4;
        const bgG = (corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) / 4;
        const bgB = (corners[0][2] + corners[1][2] + corners[2][2] + corners[3][2]) / 4;
        const tol = 40;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (
            Math.abs(r - bgR) < tol &&
            Math.abs(g - bgG) < tol &&
            Math.abs(b - bgB) < tol
          ) {
            data[i + 3] = 0; // set alpha to 0
          }
        }
      }

      // 2. Posterization / B&W Thresholding.
      //    Content is normalized to BLACK SHAPES on a WHITE background, so
      //    potrace must trace with blackOnWhite=true (its default direction).
      if (settings.colorMode === 'bw') {
        const thresh = settings.threshold;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 10) {
            // Removed/transparent background becomes the (white) canvas,
            // regardless of whether the final SVG keeps a background rect.
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            continue;
          }
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const bw = gray < thresh ? 0 : 255;
          data[i] = bw;
          data[i + 1] = bw;
          data[i + 2] = bw;
        }
      } else {
        // Color Posterize
        const levels = Math.max(2, Math.min(16, settings.posterizeColors));
        const step = 255 / (levels - 1);
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.round(data[i] / step) * step;
          data[i + 1] = Math.round(data[i + 1] / step) * step;
          data[i + 2] = Math.round(data[i + 2] / step) * step;
        }
      }

      // 3. Feed the processed RGBA pixels straight into potrace's tracing core.
      //    We bypass potrace's own Jimp-based image loader entirely — its bundled
      //    Jimp 0.14 cannot decode data URLs reliably (on modern Node it crashes;
      //    in the browser it routes through a heavy legacy bundle).
      const fakeImage = {
        bitmap: { width, height, data },
        scan: (
          x0: number,
          y0: number,
          scanW: number,
          scanH: number,
          cb: (x: number, y: number, idx: number) => void
        ) => {
          for (let y = y0; y < y0 + scanH; y++) {
            for (let x = x0; x < x0 + scanW; x++) {
              cb(x, y, (y * width + x) * 4);
            }
          }
        },
      };

      let svgString: string;
      if (settings.colorMode === 'color') {
        // Real multi-color vectorization: one traced layer per luma band,
        // each filled with the band's true dominant color. (potrace's own
        // Posterizer only layers black+opacity and hangs on its auto-range
        // threshold search, so we trace the bands ourselves.)
        svgString = buildColorVectorSvg(data, width, height, settings.posterizeColors, settings.transparentBg ? 'transparent' : '#FFFFFF', {
          turdSize: settings.turdSize,
          turnPolicy: settings.turnPolicy || 'minority',
          optCurve: settings.smoothness > 0,
          optTolerance: (11 - settings.nodeReduction) * 0.2,
        });
      } else {
        const traceOptions = {
          threshold: settings.threshold,
          turnPolicy: settings.turnPolicy || 'minority',
          turdSize: Math.max(2, settings.turdSize || 4),
          optCurve: settings.smoothness > 0,
          optTolerance: (11 - settings.nodeReduction) * 0.2,
          blackOnWhite: true, // image was normalized: black shapes on white background
          color: '#0F172A',
          background: settings.transparentBg ? 'transparent' : '#FFFFFF',
        };

        const tracer = new potrace.Potrace(traceOptions);
        (tracer as any)._processLoadedImage(fakeImage);
        svgString = tracer.getSVG();
      }

      const pathsCount = (svgString.match(/<path/g) || []).length;
      resolve({
        svg: svgString,
        pathsCount,
        width,
        height,
      });
    };
    img.onerror = () => reject(new Error('Failed to load image for vectorization'));
    img.src = dataUrl;
  });
}
