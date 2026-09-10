import React from 'react';
import { PantherLogo } from './PantherLogo';
import { X, Sparkles, Layers, ShieldCheck, Zap, Award, CheckCircle2 } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchTool: (tool: 'color-studio' | 'vector-studio') => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onLaunchTool,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl p-8 rounded-[18px] bg-[#0E1628] border border-[#00D8FF]/30 shadow-2xl space-y-6 text-[#C9D4E5] overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#00D8FF]/15">
          <div className="flex items-center gap-4">
            <PantherLogo size={46} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Panther <span className="text-[#00D8FF]">Studio</span>
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#00D8FF]/20 text-[#5FFFF7] border border-[#00D8FF]/30 rounded-full">
                  Pro v3.0
                </span>
              </div>
              <p className="text-xs text-[#C9D4E5]/80">
                Premium AI Platform for Designers, Print Shops, Sign Makers & CNC Craftsmen.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#111C30] hover:bg-[#060B16] text-[#C9D4E5] hover:text-white border border-[#00D8FF]/20 transition-colors"
            id="close-about-modal-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mission Statement */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#00D8FF]">
            Craftsmanship & Speed Without Limits
          </h3>
          <p className="text-xs text-[#C9D4E5] leading-relaxed">
            Panther Studio was designed from the ground up to solve real design and print workflow bottlenecks. From instant multi-format vector tracing (SVG, DXF, EPS, PDF, CDR) for laser cutters and CNC routers, to real-time color harmony synthesis and WCAG accessibility analysis.
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-[18px] bg-[#111C30] border border-[#00D8FF]/20 space-y-2">
            <div className="flex items-center gap-2 text-[#00D8FF]">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold text-white">AI Color Studio</span>
            </div>
            <p className="text-[11px] text-[#C9D4E5]/80">
              Generate mathematical color harmonies, calculate WCAG AA/AAA contrast ratios, preview live UI layouts, and export ASE/GPL color swatches.
            </p>
          </div>

          <div className="p-4 rounded-[18px] bg-[#111C30] border border-[#00D8FF]/20 space-y-2">
            <div className="flex items-center gap-2 text-[#00D8FF]">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Image to Vector Engine</span>
            </div>
            <p className="text-[11px] text-[#C9D4E5]/80">
              Convert PNG, JPG, and WEBP raster files into clean, print-ready, laser-ready Bezier vector paths with automated noise suppression and edge sharpening.
            </p>
          </div>

          <div className="p-4 rounded-[18px] bg-[#111C30] border border-[#00D8FF]/20 space-y-2">
            <div className="flex items-center gap-2 text-[#00D8FF]">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Zero friction</span>
            </div>
            <p className="text-[11px] text-[#C9D4E5]/80">
              No registration, no accounts, no credit cards required. Instant browser execution with client-side WebAssembly speed.
            </p>
          </div>

          <div className="p-4 rounded-[18px] bg-[#111C30] border border-[#00D8FF]/20 space-y-2">
            <div className="flex items-center gap-2 text-[#00D8FF]">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Production Ready</span>
            </div>
            <p className="text-[11px] text-[#C9D4E5]/80">
              Real downloads for DXF CAD, EPS PostScript, PDF Vectors, and ASE Adobe Swatch files ready for Illustrator, Photoshop, and CorelDraw.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#00D8FF]/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-[#C9D4E5]/80 font-mono">
            <CheckCircle2 className="w-4 h-4 text-[#00D8FF]" />
            <span>100% Free & Open Access</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onLaunchTool('color-studio');
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#111C30] hover:bg-[#060B16] text-white font-semibold text-xs border border-[#00D8FF]/30 transition-all"
            >
              Open Color Studio
            </button>
            <button
              onClick={() => {
                onClose();
                onLaunchTool('vector-studio');
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-xs shadow-lg transition-all"
            >
              Open Vector Engine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
