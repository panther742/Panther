import React from 'react';
import { GoogleFont, FontRole } from '../../types';
import { POPULAR_GOOGLE_FONTS, loadGoogleFont } from '../../utils/fontUtils';
import { X, ExternalLink, Award, Globe, Type, Layers, ShieldCheck, Sparkles, Check } from 'lucide-react';

interface FontDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontFamily: string;
  roleName?: FontRole;
}

export const FontDetailsModal: React.FC<FontDetailsModalProps> = ({
  isOpen,
  onClose,
  fontFamily,
  roleName,
}) => {
  if (!isOpen) return null;

  // Find font details or generate fallback metadata
  const fontData: GoogleFont = POPULAR_GOOGLE_FONTS.find(
    (f) => f.family.toLowerCase() === fontFamily.toLowerCase()
  ) || {
    family: fontFamily,
    category: 'sans-serif',
    variants: ['300', '400', '500', '600', '700', '800'],
    subsets: ['latin', 'latin-ext'],
  };

  loadGoogleFont(fontData.family);

  const googleFontsUrl = `https://fonts.google.com/specimen/${fontData.family.replace(/\s+/g, '+')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0D0D12] border border-[#D4AF37]/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-slate-100">
        {/* TOP GLOW ACCENT */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full">
                  Font Metadata Inspector
                </span>
                {roleName && (
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-white/10 text-slate-300 rounded-full">
                    Role: {roleName}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-1">{fontData.family}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SPECIMEN PREVIEW CARD */}
        <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-3">
          <span className="text-[10px] text-slate-400 font-mono uppercase">Live Font Specimen</span>
          <p
            className="text-3xl sm:text-4xl leading-tight font-normal text-amber-100 break-words"
            style={{ fontFamily: `'${fontData.family}', sans-serif` }}
          >
            Sphinx of black quartz, judge my vow. 0123456789
          </p>
        </div>

        {/* METADATA GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          {/* CATEGORY */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Layers className="w-4 h-4 text-[#D4AF37]" />
              <span>Category</span>
            </div>
            <p className="text-sm font-bold text-white uppercase">{fontData.category}</p>
          </div>

          {/* LICENSE */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>License</span>
            </div>
            <p className="text-sm font-bold text-white">SIL Open Font License (OFL)</p>
          </div>

          {/* STYLES & VARIANTS */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Available Styles</span>
            </div>
            <p className="text-sm font-bold text-white">
              {fontData.variants.length} Weights ({fontData.variants.join(', ')})
            </p>
          </div>

          {/* LANGUAGE SUBSETS */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Language Support</span>
            </div>
            <p className="text-sm font-bold text-white capitalize">
              {fontData.subsets ? fontData.subsets.join(', ') : 'Latin, Latin Extended'}
            </p>
          </div>
        </div>

        {/* EXTERNAL GOOGLE FONTS ACTION */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-400">Hosted by Google Fonts Infrastructure</span>
          <a
            href={googleFontsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#FACC15] text-black font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg"
          >
            <span>View on Google Fonts</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
