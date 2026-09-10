import React, { useState } from 'react';
import { TypographyPairing, TypographyRoleConfig } from '../../types';
import {
  generatePairingCSS,
  generateGoogleFontsLink,
  generateGoogleFontsImport,
  generateTypographyBrandGuide,
} from '../../utils/fontUtils';
import { X, Copy, Check, Download, Code, FileText, Sparkles } from 'lucide-react';

interface ExportTypoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pairing: TypographyPairing;
}

export const ExportTypoModal: React.FC<ExportTypoModalProps> = ({ isOpen, onClose, pairing }) => {
  const [activeTab, setActiveTab] = useState<'css' | 'html' | 'import' | 'specimen'>('css');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cssCode = generatePairingCSS(pairing);
  const htmlCode = generateGoogleFontsLink(pairing);
  const importCode = generateGoogleFontsImport(pairing);
  const specimenMd = generateTypographyBrandGuide(pairing);

  const getCurrentCode = () => {
    switch (activeTab) {
      case 'css':
        return cssCode;
      case 'html':
        return htmlCode;
      case 'import':
        return importCode;
      case 'specimen':
        return specimenMd;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    // Generate a clean PNG canvas representation
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = pairing.bgColor || '#0B0B0F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gold Accent Header
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('PANTHER TYPO STUDIO SPECIMEN', 60, 80);

      // Pairing Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(pairing.name.toUpperCase(), 60, 130);

      let y = 220;
      Object.entries(pairing.roles).forEach(([role, cfg]) => {
        const config = cfg as TypographyRoleConfig;
        ctx.fillStyle = '#D4AF37';
        ctx.font = '14px monospace';
        ctx.fillText(role.toUpperCase() + ` — ${config.fontFamily} (${config.fontWeight})`, 60, y);

        ctx.fillStyle = config.color || '#FFFFFF';
        ctx.font = `${config.fontWeight} ${Math.min(config.fontSize, 36)}px sans-serif`;
        ctx.fillText(`Sample Specimen for ${role}`, 60, y + 40);

        y += 90;
      });

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `panther-typography-${pairing.style}.png`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0D0D12] border border-white/10 rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Export Typography Suite</h2>
              <p className="text-xs text-slate-400">
                Copy CSS, Font Stacks, Google Fonts tags, or download Brand Guides & Images
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {[
              { id: 'css', label: 'Copy CSS' },
              { id: 'html', label: 'HTML <link>' },
              { id: 'import', label: 'CSS @import' },
              { id: 'specimen', label: 'Brand Guide (.md)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#D4AF37] text-black shadow font-extrabold'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
          </button>
        </div>

        {/* CODE VIEW AREA */}
        <div className="p-6 bg-[#050508] relative">
          <pre className="p-4 rounded-2xl bg-black/80 border border-white/10 text-xs text-amber-200 font-mono overflow-x-auto max-h-72 scrollbar-thin">
            {getCurrentCode()}
          </pre>
        </div>

        {/* DOWNLOAD ACTION BUTTONS */}
        <div className="p-6 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPNG}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all border border-white/10"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span>Download PNG Preview</span>
            </button>

            <button
              onClick={() =>
                handleDownloadFile(specimenMd, `${pairing.name.toLowerCase().replace(/\s+/g, '-')}-guide.md`, 'text/markdown')
              }
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all border border-white/10"
            >
              <FileText className="w-4 h-4 text-[#D4AF37]" />
              <span>Download Brand Specimen</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9C7A1C] text-black font-extrabold text-xs shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
