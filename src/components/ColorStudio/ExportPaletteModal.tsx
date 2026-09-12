import React, { useState } from 'react';
import { ColorItem } from '../../types';
import {
  generateAseExport,
  generateGplExport,
  generateCssExport,
  generateJsonExport,
  generateSvgPalette,
  downloadFile,
} from '../../utils/colorUtils';
import { buildPdfWithPng } from '../../utils/exportFormats';
import { X, Download, FileCode, FileText, Image, Check } from 'lucide-react';

interface ExportPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: ColorItem[];
}

export const ExportPaletteModal: React.FC<ExportPaletteModalProps> = ({
  isOpen,
  onClose,
  colors,
}) => {
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerDownload = (format: 'ase' | 'gpl' | 'css' | 'json' | 'svg' | 'png' | 'pdf') => {
    const filename = `panther-palette-${Date.now()}`;

    if (format === 'css') {
      const css = generateCssExport(colors);
      downloadFile(css, `${filename}.css`, 'text/css');
    } else if (format === 'json') {
      const json = generateJsonExport(colors);
      downloadFile(json, `${filename}.json`, 'application/json');
    } else if (format === 'gpl') {
      const gpl = generateGplExport(colors);
      downloadFile(gpl, `${filename}.gpl`, 'text/plain');
    } else if (format === 'ase') {
      const aseBytes = generateAseExport(colors);
      downloadFile(aseBytes, `${filename}.ase`, 'application/octet-stream');
    } else if (format === 'svg') {
      const svg = generateSvgPalette(colors);
      downloadFile(svg, `${filename}.svg`, 'image/svg+xml');
    } else if (format === 'png' || format === 'pdf') {
      // Render to canvas for PNG / PDF download
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#060B16';
        ctx.fillRect(0, 0, 1200, 400);

        const colWidth = 1200 / colors.length;
        colors.forEach((c, i) => {
          ctx.fillStyle = c.hex;
          ctx.fillRect(i * colWidth, 0, colWidth, 320);

          ctx.fillStyle = 'rgba(6, 11, 22, 0.9)';
          ctx.fillRect(i * colWidth, 320, colWidth, 80);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 20px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(c.hex, i * colWidth + colWidth / 2, 355);

          ctx.fillStyle = '#C9D4E5';
          ctx.font = '14px system-ui, sans-serif';
          ctx.fillText(`RGB ${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}`, i * colWidth + colWidth / 2, 380);
        });

        if (format === 'png') {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${filename}.png`;
              a.click();
            }
          });
        } else {
          // Real printable PDF 1.4 with the rendered swatch sheet embedded
          const pngDataUrl = canvas.toDataURL('image/png');
          const pdf = buildPdfWithPng(pngDataUrl, 1200, 400);
          downloadFile(pdf, `${filename}.pdf`, 'application/pdf');
        }
      }
    }

    setDownloadedFormat(format);
    setTimeout(() => setDownloadedFormat(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 rounded-3xl bg-[#0E1628] border border-[#00D8FF]/30 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#00D8FF]/15">
          <div>
            <h3 className="text-base font-bold text-white">Export Palette Files</h3>
            <p className="text-xs text-[#C9D4E5]">
              Download real production files in professional color exchange formats.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#060B16] hover:bg-white/10 text-[#C9D4E5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Download Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'ase', label: 'ASE (Adobe Swatch)', ext: '.ase', desc: 'Photoshop / Illustrator' },
            { id: 'gpl', label: 'GPL (GIMP Palette)', ext: '.gpl', desc: 'GIMP / Inkscape' },
            { id: 'css', label: 'CSS Variables', ext: '.css', desc: ':root { --color: #hex }' },
            { id: 'json', label: 'JSON Metadata', ext: '.json', desc: 'HEX, RGB, CMYK, HSL' },
            { id: 'svg', label: 'SVG Vector Swatch', ext: '.svg', desc: 'Scalable graphic' },
            { id: 'png', label: 'PNG Image Sheet', ext: '.png', desc: 'High-res image' },
            { id: 'pdf', label: 'PDF Vector Doc', ext: '.pdf', desc: 'Printable swatch' },
          ].map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => triggerDownload(fmt.id as any)}
              className="p-3.5 rounded-2xl bg-[#060B16] hover:bg-[#111C30] border border-[#00D8FF]/20 hover:border-[#00D8FF]/50 flex flex-col items-start gap-1 text-left transition-all group"
              id={`export-palette-${fmt.id}-btn`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-white group-hover:text-[#00D8FF]">
                  {fmt.label}
                </span>
                {downloadedFormat === fmt.id ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-[#00D8FF]" />
                )}
              </div>
              <span className="text-[10px] text-[#C9D4E5]/70">{fmt.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
