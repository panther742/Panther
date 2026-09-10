import potrace from 'potrace';
import { VectorSettings, VectorExportFormat } from '../types';

export interface VectorProcessResult {
  svg: string;
  pathsCount: number;
  width: number;
  height: number;
}

// Convert SVG Path string to DXF entities
export function svgToDxf(svgContent: string, width = 800, height = 600): string {
  // Extract path 'd' attributes from SVG
  const pathRegex = /d="([^"]+)"/g;
  let match;
  const paths: string[] = [];
  while ((match = pathRegex.exec(svgContent)) !== null) {
    paths.push(match[1]);
  }

  let dxfEntities = '';
  paths.forEach((d) => {
    // Parse commands roughly into points
    const commands = d.match(/([A-Za-z])([^A-Za-z]*)/g) || [];
    let currentX = 0;
    let currentY = 0;

    dxfEntities += `0\nLWPOLYLINE\n5\n${Math.floor(Math.random() * 100000).toString(16)}\n100\nAcDbEntity\n8\n0\n100\nAcDbPolyline\n90\n4\n70\n1\n`;

    commands.forEach((cmd) => {
      const type = cmd[0];
      const numbers = cmd
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => !isNaN(n));

      if (type === 'M' || type === 'L') {
        for (let i = 0; i < numbers.length; i += 2) {
          currentX = numbers[i] || 0;
          currentY = height - (numbers[i + 1] || 0); // DXF Y axis flipped
          dxfEntities += `10\n${currentX.toFixed(3)}\n20\n${currentY.toFixed(3)}\n`;
        }
      }
    });
  });

  return `0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n${dxfEntities}0\nENDSEC\n0\nEOF\n`;
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
    const commands = d.match(/([A-Za-z])([^A-Za-z]*)/g) || [];
    commands.forEach((cmd) => {
      const type = cmd[0];
      const numbers = cmd
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => !isNaN(n));

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
    const commands = d.match(/([A-Za-z])([^A-Za-z]*)/g) || [];
    commands.forEach((cmd) => {
      const type = cmd[0];
      const numbers = cmd
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => !isNaN(n));

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
      if (!ctx) return reject('Failed to create canvas context');

      const width = img.width || 600;
      const height = img.height || 400;
      canvas.width = width;
      canvas.height = height;

      // Draw original image
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // 1. Optional background removal / Chroma keying
      if (settings.removeBackground) {
        // Detect background color from corners
        const cornerR = data[0];
        const cornerG = data[1];
        const cornerB = data[2];
        const tol = 40;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (
            Math.abs(r - cornerR) < tol &&
            Math.abs(g - cornerG) < tol &&
            Math.abs(b - cornerB) < tol
          ) {
            data[i + 3] = 0; // set alpha to 0
          }
        }
      }

      // 2. Posterization / B&W Thresholding
      if (settings.colorMode === 'bw') {
        const thresh = settings.threshold;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 10 && settings.transparentBg) {
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

      ctx.putImageData(imgData, 0, 0);

      // Now pass canvas to potrace vector trace
      const traceOptions = {
        threshold: settings.threshold,
        turnPolicy: (potrace as any).POTRACE_TURNPOLICY_MINORITY || 'minority',
        turdSize: Math.max(2, settings.turdSize || 4),
        optCurve: settings.smoothness > 0,
        optTolerance: (11 - settings.nodeReduction) * 0.2,
        blackOnWhite: !settings.transparentBg,
        color: settings.colorMode === 'bw' ? '#0F172A' : '#7C3AED',
        background: settings.transparentBg ? 'transparent' : '#FFFFFF',
      };

      const tracer = new potrace.Potrace(traceOptions);
      tracer.loadImage(canvas.toDataURL(), (err) => {
        if (err) return reject(err);
        const svgString = tracer.getSVG();
        const pathsCount = (svgString.match(/<path/g) || []).length;
        resolve({
          svg: svgString,
          pathsCount,
          width,
          height,
        });
      });
    };
    img.onerror = () => reject('Failed to load image for vectorization');
    img.src = dataUrl;
  });
}
