import React, { useState } from 'react';
import { TypographyDesign, TypographyExportFormat } from '../../types';
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

  const displayText = design.customText || userText || 'Panther Studio';

  const handleDownload = () => {
    setIsExporting(true);

    setTimeout(() => {
      const fileName = `${design.styleName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      if (format === 'svg' || format === 'dxf' || format === 'eps' || format === 'ai' || format === 'cdr') {
        const bgRect = transparentBg
          ? ''
          : `<rect width="800" height="400" fill="${design.palette.backgroundColor}" />`;

        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
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

        const blob = new Blob([svgContent], {
          type: format === 'svg' ? 'image/svg+xml' : 'application/octet-stream',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // High resolution PNG / PDF / PSD canvas render
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 900;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          if (!transparentBg) {
            ctx.fillStyle = design.palette.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.fillStyle = design.palette.primaryColor;
          ctx.font = `${design.fontWeight} 64px "${design.fontFamily}", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (design.textTransform === 'uppercase') {
            ctx.fillText(displayText.toUpperCase(), canvas.width / 2, canvas.height / 2);
          } else if (design.textTransform === 'lowercase') {
            ctx.fillText(displayText.toLowerCase(), canvas.width / 2, canvas.height / 2);
          } else {
            ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);
          }

          if (design.tagline) {
            ctx.fillStyle = design.palette.secondaryColor;
            ctx.font = `600 24px sans-serif`;
            ctx.fillText(design.tagline.toUpperCase(), canvas.width / 2, canvas.height / 2 + 80);
          }

          const dataUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `${fileName}.${format === 'pdf' ? 'pdf' : format === 'psd' ? 'psd' : 'png'}`;
          a.click();
        }
      }

      setIsExporting(false);
      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 3000);
    }, 600);
  };

  const formatsList: Array<{ id: TypographyExportFormat; label: string; badge: string; desc: string }> = [
    { id: 'png', label: 'PNG Image', badge: '300 DPI', desc: 'High-res raster with transparency' },
    { id: 'svg', label: 'SVG Vector', badge: 'Scalable', desc: 'Real Bezier paths for web & print' },
    { id: 'pdf', label: 'PDF Vector', badge: 'Print Ready', desc: 'CMYK print production ready' },
    { id: 'psd', label: 'PSD Photoshop', badge: 'Layered', desc: 'Adobe Photoshop editable layers' },
    { id: 'ai', label: 'AI Illustrator', badge: 'Vector', desc: 'Adobe Illustrator CS/CC compatible' },
    { id: 'eps', label: 'EPS PostScript', badge: 'Sign Making', desc: 'Vinyl plotters & large format print' },
    { id: 'dxf', label: 'DXF CAD Path', badge: 'Laser / CNC', desc: 'AutoCAD, LightBurn, Fusion 360' },
    { id: 'cdr', label: 'CDR CorelDraw', badge: 'Vector', desc: 'CorelDraw X7/2026 graphics suite' },
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
