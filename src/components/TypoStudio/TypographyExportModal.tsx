import React, { useState } from 'react';
import { TypographyDesign, TypographyExportFormat } from '../../types';
import { buildPdfWithPng, buildEpsWithPng, buildTextDxf, buildTypographyPSD } from '../../utils/exportFormats';
import { X, Download, FileText, CheckCircle2 } from 'lucide-react';

interface TypographyExportModalProps {
  design: TypographyDesign;
  userText: string;
  onClose: () => void;
}

export const TypographyExportModal: React.FC<TypographyExportModalProps> = ({
  design,
  userText,
  onClose,
}) => {
  const [format, setFormat] = useState<TypographyExportFormat>('png');
  const [transparentBg, setTransparentBg] = useState<boolean>(true);
  const [dpi, setDpi] = useState<number>(300);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedSuccess, setExportedSuccess] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const displayText = design.customText || userText || 'Panther Studio';

  const applyTransform = (text: string, t: 'none' | 'uppercase' | 'lowercase' | 'capitalize') =>
    t === 'uppercase' ? text.toUpperCase() : t === 'lowercase' ? text.toLowerCase() : text;

  // Render the design onto a canvas at the requested DPI (base 800x400 pt).
  const renderCanvas = async (): Promise<HTMLCanvasElement> => {
    const scale = dpi / 72;
    const width = Math.round(800 * scale);
    const height = Math.round(400 * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas rendering is not available in this browser.');

    try {
      await document.fonts.ready;
    } catch {
      // older browsers without FontFaceSet — continue with fallback fonts
    }

    if (!transparentBg) {
      ctx.fillStyle = design.palette.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    // ---- AUTO FONT MIX: render each part with its OWN font family ----
    if (design.mixedFonts && design.mixedFonts.length > 0) {
      // Word-wrap long parts (blog body excerpts) to the canvas width
      const maxLineWidth = width * 0.84;
      for (const part of design.mixedFonts) {
        const text = applyTransform(part.text, part.textTransform);
        const fontSizePx = Math.max(8, part.fontSize * scale);
        const lineHeight = (part.lineHeight || 1.2) * fontSizePx;
        ctx.save();
        ctx.textAlign = part.align || 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = part.colorHex;
        ctx.font = `${part.italic ? 'italic ' : ''}${part.fontWeight} ${fontSizePx}px "${part.fontFamily}", sans-serif`;
        ctx.letterSpacing = `${part.letterSpacing * scale}px` as any;
        if (design.shadowBlur > 0) {
          ctx.shadowColor = design.shadowColor;
          ctx.shadowBlur = design.shadowBlur * scale;
          ctx.shadowOffsetX = design.shadowOffsetX * scale;
          ctx.shadowOffsetY = design.shadowOffsetY * scale;
        }

        // Split into wrapped lines
        const words = text.split(/\s+/).filter(Boolean);
        const lines: string[] = [];
        let current = '';
        for (const w of words) {
          const candidate = current ? `${current} ${w}` : w;
          if (ctx.measureText(candidate).width <= maxLineWidth || !current) {
            current = candidate;
          } else {
            lines.push(current);
            current = w;
          }
        }
        if (current) lines.push(current);
        if (lines.length === 0) lines.push(text);

        const startY = part.y * scale - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, li) => {
          ctx.fillText(line, part.x * scale, startY + li * lineHeight);
        });
        ctx.restore();
      }
      return canvas;
    }

    const appliedText =
      design.textTransform === 'uppercase'
        ? displayText.toUpperCase()
        : design.textTransform === 'lowercase'
        ? displayText.toLowerCase()
        : displayText;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();

    // Gradient text fill
    if (design.gradientFill) {
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      const stops = design.gradientFill.split(',').map((s) => s.trim());
      if (stops.length >= 2) {
        grad.addColorStop(0, stops[0]);
        grad.addColorStop(1, stops[stops.length - 1]);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = design.palette.primaryColor;
      }
    } else {
      ctx.fillStyle = design.palette.primaryColor;
    }

    ctx.font = `${design.fontWeight} ${Math.max(24, design.fontSize * 1.5 * scale)}px "${design.fontFamily}", sans-serif`;
    ctx.letterSpacing = `${design.letterSpacing * scale}px` as any;

    // Glow / shadow
    if (design.glowRadius > 0) {
      ctx.shadowColor = design.glowColor;
      ctx.shadowBlur = design.glowRadius * scale;
    }
    if (design.shadowBlur > 0) {
      ctx.shadowColor = design.shadowColor;
      ctx.shadowBlur = design.shadowBlur * scale;
      ctx.shadowOffsetX = design.shadowOffsetX * scale;
      ctx.shadowOffsetY = design.shadowOffsetY * scale;
    }

    // Stroke
    if (design.strokeWidth > 0) {
      ctx.lineWidth = design.strokeWidth * scale;
      ctx.strokeStyle = design.strokeColor;
      ctx.strokeText(appliedText, width / 2, height / 2);
    }

    ctx.fillText(appliedText, width / 2, height / 2);
    ctx.restore();

    if (design.tagline) {
      ctx.fillStyle = design.palette.secondaryColor;
      ctx.font = `${Math.max(10, 14 * scale)}px "Inter", sans-serif`;
      ctx.fillText(
        design.tagline.toUpperCase(),
        width / 2,
        height / 2 + Math.max(40, 80 * scale)
      );
    }

    return canvas;
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const fileName = `${design.styleName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      // --- Real vector SVG (also the honest CDR-compatible path) ---
      if (format === 'svg' || format === 'cdr') {
        const bgRect = transparentBg
          ? ''
          : `<rect width="800" height="400" fill="${design.palette.backgroundColor}" />`;

        let svgContent: string;
        if (design.mixedFonts && design.mixedFonts.length > 0) {
          // Multi-font vector composition: one <text> node per part, each
          // with its own font family, weight, size, spacing and color.
          const fontImports = design.mixedFonts
            .map(
              (part) =>
                `@import url('https://fonts.googleapis.com/css2?family=${part.fontFamily.replace(/\s+/g, '+')}:wght@${part.fontWeight}&amp;display=swap');`
            )
            .join('\n    ');
          // Word-wrap long parts (blog body) into per-line tspans
          const wrapText = (text: string, maxChars: number): string[] => {
            const words = text.split(/\s+/).filter(Boolean);
            const lines: string[] = [];
            let current = '';
            for (const w of words) {
              const candidate = current ? `${current} ${w}` : w;
              if (candidate.length <= maxChars || !current) current = candidate;
              else {
                lines.push(current);
                current = w;
              }
            }
            if (current) lines.push(current);
            return lines.length ? lines : [text];
          };

          const textNodes = design.mixedFonts
            .map((part) => {
              const anchor = part.align === 'left' ? 'start' : part.align === 'right' ? 'end' : 'middle';
              const text = applyTransform(part.text, part.textTransform);
              const lineHeight = (part.lineHeight || 1.2) * part.fontSize;
              const maxChars = Math.max(28, Math.round(640 / Math.max(8, part.fontSize * 0.62)));
              const lines = part.lineHeight && part.lineHeight > 1.2 ? wrapText(text, maxChars) : [text];
              const italicAttr = part.italic ? ` font-style="italic"` : '';
              const yStart = part.y - ((lines.length - 1) * lineHeight) / 2;
              const tspans = lines
                .map((line, li) =>
                  li === 0
                    ? `<tspan x="${part.x}" y="${yStart}">${line}</tspan>`
                    : `<tspan x="${part.x}" dy="${lineHeight}">${line}</tspan>`
                )
                .join('');
              return `  <text x="${part.x}" y="${yStart}" text-anchor="${anchor}" dominant-baseline="middle" font-family="'${part.fontFamily}', sans-serif" font-weight="${part.fontWeight}"${italicAttr} font-size="${part.fontSize}" letter-spacing="${part.letterSpacing}" text-transform="${part.textTransform}" fill="${part.colorHex}">${tspans}</text>`;
            })
            .join('\n');
          svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
  <style>
    ${fontImports}
  </style>
  ${bgRect}
${textNodes}
</svg>`;
        } else {
          svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=${design.fontFamily.replace(/\s+/g, '+')}:wght@${design.fontWeight}&amp;display=swap');
    .typo-text {
      font-family: '${design.fontFamily}', sans-serif;
      font-weight: ${design.fontWeight};
      font-size: ${design.fontSize * 1.5}px;
      letter-spacing: ${design.letterSpacing}px;
      text-transform: ${design.textTransform};
      fill: ${design.palette.primaryColor};
      text-anchor: middle;
      dominant-baseline: middle;
    }
  </style>
  ${bgRect}
  <text x="400" y="200" class="typo-text">${displayText}</text>
  ${design.tagline ? `<text x="400" y="260" font-family="sans-serif" font-size="14" fill="${design.palette.secondaryColor}" letter-spacing="4" text-anchor="middle">${design.tagline}</text>` : ''}
</svg>`;
        }
        const cdrSvg =
          format === 'cdr'
            ? svgContent.replace(
                '<svg ',
                '<svg xmlns:cdr="http://schemas.corel.com/coreldraw/2011/cdr" cdr:version="18.0" cdr:format="CorelDraw Vector Exchange" '
              )
            : svgContent;
        downloadBlob(
          new Blob([cdrSvg], { type: 'image/svg+xml' }),
          `${fileName}${format === 'cdr' ? '-corel-compatible' : ''}.svg`
        );
      } else {
        // Raster-render the design once and produce REAL files per format
        const canvas = await renderCanvas();
        const pngDataUrl = canvas.toDataURL('image/png');

        if (format === 'png') {
          downloadBlob(await (await fetch(pngDataUrl)).blob(), `${fileName}.png`);
        } else if (format === 'pdf' || format === 'ai') {
          // Real PDF 1.4 with embedded image. Illustrator opens PDF-based .ai
          // files natively, so the same payload is valid for both formats.
          const pdf = buildPdfWithPng(pngDataUrl, 800, 400);
          downloadBlob(new Blob([pdf], { type: 'application/pdf' }), `${fileName}.${format}`);
        } else if (format === 'psd') {
          const scale = dpi / 72;
          const textLayers = design.mixedFonts && design.mixedFonts.length > 0
            ? design.mixedFonts.map((part) => ({
                text: applyTransform(part.text, part.textTransform),
                fontFamily: part.fontFamily,
                fontSizePx: Math.max(8, Math.round(part.fontSize * scale)),
                colorHex: part.colorHex,
                fontWeight: part.fontWeight,
                x: Math.round(canvas.width * 0.08),
                y: Math.round((part.y / 400) * canvas.height),
              }))
            : [
                {
                  text: displayText,
                  fontFamily: design.fontFamily,
                  fontSizePx: Math.max(24, design.fontSize * 1.5 * scale),
                  colorHex: design.palette.primaryColor,
                  fontWeight: design.fontWeight,
                  x: Math.round(canvas.width * 0.1),
                  y: Math.round(canvas.height * 0.42),
                },
                ...(design.tagline
                  ? [
                      {
                        text: design.tagline.toUpperCase(),
                        fontFamily: 'Inter',
                        fontSizePx: Math.max(10, 14 * scale),
                        colorHex: design.palette.secondaryColor,
                        fontWeight: 600,
                        x: Math.round(canvas.width * 0.1),
                        y: Math.round(canvas.height * 0.62),
                      },
                    ]
                  : []),
              ];
          const psdBytes = buildTypographyPSD(
            canvas.width,
            canvas.height,
            textLayers,
            transparentBg ? null : design.palette.backgroundColor
          );
          downloadBlob(new Blob([psdBytes], { type: 'application/octet-stream' }), `${fileName}.psd`);
        } else if (format === 'eps') {
          const eps = await buildEpsWithPng(pngDataUrl, canvas.width, canvas.height);
          downloadBlob(new Blob([eps], { type: 'application/postscript' }), `${fileName}.eps`);
        } else if (format === 'dxf') {
          // Real DXF with TEXT entities (AutoCAD / LibreCAD / laser software).
          // CAD Y is bottom-up, so convert design-space y → 400 - y.
          const dxf = buildTextDxf(
            design.mixedFonts && design.mixedFonts.length > 0
              ? design.mixedFonts.map((part, idx) => ({
                  text: applyTransform(part.text, part.textTransform),
                  x: part.x,
                  y: 400 - part.y,
                  height: Math.max(8, part.fontSize),
                  colorIndex: idx === 0 ? 4 : 3,
                }))
              : [
                  { text: displayText, x: 400, y: 200, height: design.fontSize * 1.5, colorIndex: 4 },
                  ...(design.tagline
                    ? [{ text: design.tagline.toUpperCase(), x: 400, y: 130, height: 14, colorIndex: 3 }]
                    : []),
                ]
          );
          downloadBlob(new Blob([dxf], { type: 'application/dxf' }), `${fileName}.dxf`);
        }
      }

      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Typography export error:', err);
      setExportError(err?.message || 'Export failed unexpectedly. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatsList: Array<{ id: TypographyExportFormat; label: string; badge: string; desc: string }> = [
    { id: 'png', label: 'PNG Image', badge: '300 DPI', desc: 'High-res raster with transparency' },
    { id: 'svg', label: 'SVG Vector', badge: 'Scalable', desc: 'Real vector text for web & print' },
    { id: 'pdf', label: 'PDF Document', badge: 'Print Ready', desc: 'Valid PDF 1.4 with embedded render' },
    { id: 'psd', label: 'PSD Photoshop', badge: 'Layered', desc: 'Real layered PSD with editable text' },
    { id: 'ai', label: 'AI Illustrator', badge: 'Print', desc: 'PDF-based .ai — opens in Illustrator' },
    { id: 'eps', label: 'EPS PostScript', badge: 'Sign Making', desc: 'Valid EPS with embedded render' },
    { id: 'dxf', label: 'DXF CAD Text', badge: 'Laser / CNC', desc: 'Real TEXT entities (AutoCAD)' },
    { id: 'cdr', label: 'CorelDraw SVG', badge: 'SVG', desc: 'CorelDraw-importable vector SVG' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-[18px] bg-[#0E1628] border border-[#00D8FF]/30 shadow-2xl space-y-6 text-[#C9D4E5]">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-[#00D8FF]/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Export Production Asset</h2>
              <p className="text-xs text-[#C9D4E5]/70">
                Download vector & high-res assets for laser, CNC, web & print.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#111C30] hover:bg-[#060B16] text-[#C9D4E5] hover:text-white border border-[#00D8FF]/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORMAT SELECTION GRID */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase font-mono tracking-wider text-[#00D8FF]">
            Select Export Format
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {formatsList.map((f) => (
              <div
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  format === f.id
                    ? 'bg-[#00D8FF]/20 border-[#00D8FF] ring-1 ring-[#00D8FF]'
                    : 'bg-[#111C30] hover:bg-[#060B16] border-[#00D8FF]/20'
                }`}
              >
                <span className="text-xs font-bold block text-white">{f.label}</span>
                <span className="text-[9px] font-mono text-[#5FFFF7] uppercase">{f.badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* EXPORT OPTIONS */}
        <div className="p-4 rounded-xl bg-[#111C30]/80 border border-[#00D8FF]/20 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">Transparent Background</span>
            <input
              type="checkbox"
              checked={transparentBg}
              onChange={(e) => setTransparentBg(e.target.checked)}
              className="w-4 h-4 accent-[#00D8FF]"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#00D8FF]/10">
            <span className="font-medium text-white">Print Resolution DPI</span>
            <select
              value={dpi}
              onChange={(e) => setDpi(Number(e.target.value))}
              className="px-2 py-1 rounded bg-[#060B16] border border-[#00D8FF]/30 text-white font-mono"
            >
              <option value={72}>72 DPI (Web)</option>
              <option value={150}>150 DPI (Medium)</option>
              <option value={300}>300 DPI (High-Res Print)</option>
            </select>
          </div>
        </div>

        {exportError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold animate-fade-in">
            {exportError}
          </div>
        )}

        {exportedSuccess && (
          <div className="p-3 rounded-xl bg-[#00D8FF]/15 border border-[#00D8FF]/40 text-[#5FFFF7] text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#5FFFF7]" />
            <span>Asset successfully generated and downloaded!</span>
          </div>
        )}

        {/* ACTION BUTTON */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#111C30] hover:bg-[#060B16] text-[#C9D4E5] font-semibold text-xs border border-[#00D8FF]/20"
          >
            Close
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00D8FF] via-[#28B8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-xs shadow-lg shadow-[#00D8FF]/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating Asset...' : `Download .${format.toUpperCase()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
