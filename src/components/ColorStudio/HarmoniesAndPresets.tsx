import React from 'react';
import { PaletteType } from '../../types';
import { Sparkles, Layers, SlidersHorizontal } from 'lucide-react';

interface HarmoniesAndPresetsProps {
  activeType: PaletteType;
  onSelectType: (type: PaletteType) => void;
  onRandomize: () => void;
}

export const HarmoniesAndPresets: React.FC<HarmoniesAndPresetsProps> = ({
  activeType,
  onSelectType,
  onRandomize,
}) => {
  const harmonies: { id: PaletteType; label: string; tag: string }[] = [
    { id: 'single', label: 'Single Color', tag: '1 Point' },
    { id: 'complementary', label: 'Complementary', tag: 'High Contrast' },
    { id: 'split-complementary', label: 'Split Comp', tag: 'Nuanced Accent' },
    { id: 'analogous', label: 'Analogous', tag: 'Harmonious' },
    { id: 'triadic', label: 'Triadic', tag: 'Vibrant Balance' },
    { id: 'tetradic', label: 'Tetradic', tag: '4-Point Dual' },
    { id: 'square', label: 'Square', tag: '4-Point Mesh' },
    { id: 'rectangle', label: 'Rectangle', tag: 'Tetradic Geometry' },
    { id: 'monochromatic', label: 'Monochromatic', tag: 'Smooth Shading' },
    { id: 'shades', label: 'Shades', tag: 'Lightness Gradient' },
    { id: 'custom', label: 'Custom Mode', tag: 'Unrestricted Free' },
  ];

  const presets: { id: PaletteType; label: string; icon: string }[] = [
    { id: 'pastel', label: 'Pastel', icon: '🌸' },
    { id: 'luxury', label: 'Luxury', icon: '✨' },
    { id: 'earth-tone', label: 'Earth Tone', icon: '🌿' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: '🌃' },
    { id: 'neon', label: 'Neon', icon: '⚡' },
    { id: 'minimal', label: 'Minimal', icon: '🔳' },
  ];

  return (
    <div className="p-6 rounded-3xl bg-[#111C30] border border-[#00D8FF]/20 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Palette Type & Harmonies</h3>
        </div>

        <button
          onClick={onRandomize}
          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#0E1628] hover:bg-[#00D8FF]/10 text-[#C9D4E5] border border-[#00D8FF]/20 transition-all flex items-center gap-1.5"
          id="randomize-harmony-palette-btn"
        >
          <span>🎲 Randomize</span>
        </button>
      </div>

      {/* Mathematical Harmonies */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Color Harmonies
        </span>
        <div className="flex flex-wrap gap-2">
          {harmonies.map((h) => (
            <button
              key={h.id}
              onClick={() => onSelectType(h.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-2 ${
                activeType === h.id
                  ? 'bg-[#00D8FF] border-[#00D8FF] text-black font-extrabold shadow-lg shadow-[#00D8FF]/20'
                  : 'bg-[#0E1628] border-[#00D8FF]/15 text-[#C9D4E5] hover:border-[#00D8FF]/50 hover:text-white'
              }`}
            >
              <span>{h.label}</span>
              <span className={`text-[10px] ${activeType === h.id ? 'text-black/70 font-semibold' : 'opacity-60'}`}>({h.tag})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preset Atmospheres */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Preset Atmospheres
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectType(p.id)}
              className={`p-2.5 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                activeType === p.id
                  ? 'bg-gradient-to-r from-[#00E5FF] to-[#009DFF] border-[#00D8FF] text-black font-extrabold shadow-md'
                  : 'bg-[#0E1628] border-[#00D8FF]/15 text-[#C9D4E5] hover:border-[#00D8FF]/50'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
