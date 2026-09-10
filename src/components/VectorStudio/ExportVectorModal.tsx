import React, { useState } from 'react';
import {
  svgToDxf,
  svgToEps,
  svgToPdfVector,
  svgToCdrExport,
} from '../../utils/vectorUtils';
import { downloadFile } from '../../utils/colorUtils';
import { X, Download, Check, FileCode, Layers } from 'lucide-react';

interface ExportVectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgContent: string;
  width?: number;
  height?: number;
}

export const ExportVectorModal: React.FC<ExportVectorModalProps> = ({
  isOpen,
  onClose,
  svgContent,
  width = 800,
  height = 600,
}) => {
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerDownload = (format: 'svg' | 'dxf' | 'eps' | 'pdf' | 'cdr') => {
    const filename = `panther-vector-${Date.now()}`;

    if (format === 'svg') {
      downloadFile(svgContent, `${filename}.svg`, 'image/svg+xml');
    } else if (format === 'dxf') {
      const dxf = svgToDxf(svgContent, width, height);
      downloadFile(dxf, `${filename}.dxf`, 'application/dxf');
    } else if (format === 'eps') {
      const eps = svgToEps(svgContent, width, height);
      downloadFile(eps, `${filename}.eps`, 'application/postscript');
    } else if (format === 'pdf') {
      const pdf = svgToPdfVector(svgContent, width, height);
      downloadFile(pdf, `${filename}.pdf`, 'application/pdf');
    } else if (format === 'cdr') {
      const cdrSvg = svgToCdrExport(svgContent);
      downloadFile(cdrSvg, `${filename}.cdr.svg`, 'image/svg+xml');
    }

    setDownloadedFormat(format);
    setTimeout(() => setDownloadedFormat(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Export Vector Files</h3>
            <p className="text-xs text-slate-400">
              Download CAD, PostScript, PDF, and CorelDraw vector files.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vector Download Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'svg', label: 'SVG (Scalable Vector)', ext: '.svg', desc: 'Standard Web & Design Vector' },
            { id: 'dxf', label: 'DXF (AutoCAD Drawing)', ext: '.dxf', desc: 'CNC / Laser / CAD Polyline' },
            { id: 'eps', label: 'EPS (Encapsulated PS)', ext: '.eps', desc: 'Print & Publishing EPSF-3.0' },
            { id: 'pdf', label: 'PDF Vector Document', ext: '.pdf', desc: 'Vector PDF 1.4 Format' },
            { id: 'cdr', label: 'CDR Compatible Export', ext: '.cdr.svg', desc: 'CorelDraw XML Namespace SVG' },
          ].map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => triggerDownload(fmt.id as any)}
              className="p-3.5 rounded-2xl bg-slate-950 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/50 flex flex-col items-start gap-1 text-left transition-all group"
              id={`export-vector-${fmt.id}-btn`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                  {fmt.label}
                </span>
                {downloadedFormat === fmt.id ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-400">{fmt.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
