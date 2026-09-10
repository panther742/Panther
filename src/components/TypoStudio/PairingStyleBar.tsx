import React from 'react';
import { PairingStyle, TypographyPairing } from '../../types';
import { PRESET_TYPOGRAPHY_PAIRINGS } from '../../utils/fontUtils';
import { Sparkles, Crown, Shuffle, Zap, Layers } from 'lucide-react';

interface PairingStyleBarProps {
  currentStyle: PairingStyle;
  onSelectStyle: (style: PairingStyle) => void;
  onGenerateAIPair: (promptType: string) => void;
}

export const PairingStyleBar: React.FC<PairingStyleBarProps> = ({
  currentStyle,
  onSelectStyle,
  onGenerateAIPair,
}) => {
  const stylesList: { id: PairingStyle; label: string }[] = [
    { id: 'luxury', label: 'Luxury' },
    { id: 'modern', label: 'Modern' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'corporate', label: 'Corporate' },
    { id: 'creative', label: 'Creative' },
    { id: 'startup', label: 'Startup' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'technology', label: 'Technology' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'elegant', label: 'Elegant' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'bold', label: 'Bold' },
    { id: 'magazine', label: 'Magazine' },
    { id: 'editorial', label: 'Editorial' },
  ];

  const aiQuickPrompts = [
    { type: 'random', label: 'Random Pair', icon: Shuffle },
    { type: 'premium', label: 'Premium Pair', icon: Crown },
    { type: 'luxury', label: 'Luxury Pair', icon: Sparkles },
    { type: 'minimal', label: 'Minimal Pair', icon: Layers },
    { type: 'brand', label: 'Brand Pair', icon: Zap },
    { type: 'creative', label: 'Creative Pair', icon: Sparkles },
    { type: 'poster', label: 'Poster Pair', icon: Layers },
    { type: 'ui', label: 'UI Pair', icon: Zap },
    { type: 'social', label: 'Social Media Pair', icon: Sparkles },
  ];

  return (
    <div className="space-y-4 bg-white/[0.02] border border-white/10 rounded-3xl p-5 shadow-xl">
      {/* AI GENERATOR BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-sm font-bold text-white tracking-wide">
            AI Font Pair Generator
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {aiQuickPrompts.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => onGenerateAIPair(item.type)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:from-[#D4AF37]/20 hover:to-[#9C7A1C]/30 border border-white/10 hover:border-[#D4AF37]/50 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STYLE CATEGORY SELECTORS */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Preset Pairing Styles (16 Themes)
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {stylesList.map((style) => (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                currentStyle === style.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#9C7A1C] text-black shadow-lg shadow-[#D4AF37]/20 font-extrabold'
                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
