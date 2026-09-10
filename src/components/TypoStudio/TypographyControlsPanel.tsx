import React, { useState } from 'react';
import { TypographyPairing, FontRole, TypographyRoleConfig } from '../../types';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Italic,
  Underline,
  Sliders,
  ChevronRight,
  Palette,
  Sparkles,
  Layers,
  Info,
} from 'lucide-react';

interface TypographyControlsPanelProps {
  pairing: TypographyPairing;
  onUpdateRoleConfig: (role: FontRole, updates: Partial<TypographyRoleConfig>) => void;
  onOpenFontPicker: (role: FontRole) => void;
  onInspectFont?: (role: FontRole, family: string) => void;
}

export const TypographyControlsPanel: React.FC<TypographyControlsPanelProps> = ({
  pairing,
  onUpdateRoleConfig,
  onOpenFontPicker,
  onInspectFont,
}) => {
  const [activeRole, setActiveRole] = useState<FontRole>('heading');

  const roles: { id: FontRole; label: string }[] = [
    { id: 'heading', label: 'Heading' },
    { id: 'subheading', label: 'Subheading' },
    { id: 'body', label: 'Body' },
    { id: 'caption', label: 'Caption' },
    { id: 'button', label: 'Button' },
    { id: 'navigation', label: 'Nav' },
  ];

  const config = pairing.roles[activeRole] || pairing.roles.heading;

  const fontWeights = [
    { weight: 100, label: '100 Thin' },
    { weight: 200, label: '200 Extra Light' },
    { weight: 300, label: '300 Light' },
    { weight: 400, label: '400 Regular' },
    { weight: 500, label: '500 Medium' },
    { weight: 600, label: '600 SemiBold' },
    { weight: 700, label: '700 Bold' },
    { weight: 800, label: '800 ExtraBold' },
    { weight: 900, label: '900 Black' },
  ];

  const colorPresets = [
    '#D4AF37', // Gold
    '#FFFFFF', // White
    '#FACC15', // Yellow
    '#E2E8F0', // Slate
    '#94A3B8', // Gray
    '#38BDF8', // Cyan
    '#EC4899', // Pink
    '#A855F7', // Purple
    '#10B981', // Emerald
    '#000000', // Black
  ];

  const gradientPresets = [
    { label: 'Gold Shimmer', value: 'linear-gradient(135deg, #FDE68A 0%, #D4AF37 50%, #9C7A1C 100%)' },
    { label: 'White Platinum', value: 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%)' },
    { label: 'Cyber Yellow', value: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)' },
    { label: 'Purple Luxe', value: 'linear-gradient(135deg, #C084FC 0%, #7E22CE 100%)' },
    { label: 'None (Solid Color)', value: '' },
  ];

  return (
    <div className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
      {/* ROLE TABS */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-base font-bold text-white">Typography Controls</h3>
        </div>

        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 p-1 rounded-2xl overflow-x-auto scrollbar-none">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeRole === r.id
                  ? 'bg-[#D4AF37] text-black shadow font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE FONT FAMILY SELECTOR */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
            Active Font Family ({activeRole})
          </span>
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{config.fontFamily}</span>
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {onInspectFont && (
            <button
              onClick={() => onInspectFont(activeRole, config.fontFamily)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              title="Inspect Font Metadata & License"
            >
              <Info className="w-4 h-4 text-[#D4AF37]" />
              <span>Inspect Specs</span>
            </button>
          )}

          <button
            onClick={() => onOpenFontPicker(activeRole)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9C7A1C] hover:opacity-90 text-black font-extrabold text-xs flex items-center gap-2 shadow"
          >
            <Type className="w-4 h-4" />
            <span>Change Font</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CONTROLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. FONT SIZE & WEIGHT */}
        <div className="space-y-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Size & Weight
          </span>

          {/* Font Size */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Font Size</span>
              <span className="text-[#D4AF37] font-mono">{config.fontSize}px</span>
            </div>
            <input
              type="range"
              min="8"
              max="120"
              value={config.fontSize}
              onChange={(e) => onUpdateRoleConfig(activeRole, { fontSize: Number(e.target.value) })}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
          </div>

          {/* Font Weight */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium block">Font Weight</label>
            <select
              value={config.fontWeight}
              onChange={(e) => onUpdateRoleConfig(activeRole, { fontWeight: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              {fontWeights.map((w) => (
                <option key={w.weight} value={w.weight} className="bg-slate-900 text-white">
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. SPACING & LINE HEIGHT */}
        <div className="space-y-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Spacing & Rhythms
          </span>

          {/* Letter Spacing */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Letter Spacing</span>
              <span className="text-[#D4AF37] font-mono">{config.letterSpacing}px</span>
            </div>
            <input
              type="range"
              min="-5"
              max="20"
              step="0.5"
              value={config.letterSpacing}
              onChange={(e) => onUpdateRoleConfig(activeRole, { letterSpacing: Number(e.target.value) })}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
          </div>

          {/* Line Height */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Line Height</span>
              <span className="text-[#D4AF37] font-mono">{config.lineHeight}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={config.lineHeight}
              onChange={(e) => onUpdateRoleConfig(activeRole, { lineHeight: Number(e.target.value) })}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
          </div>
        </div>

        {/* 3. ALIGNMENT & TRANSFORM */}
        <div className="space-y-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Alignment & Transform
          </span>

          {/* Align */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium block">Text Align</label>
            <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              {[
                { id: 'left', icon: AlignLeft },
                { id: 'center', icon: AlignCenter },
                { id: 'right', icon: AlignRight },
                { id: 'justify', icon: AlignJustify },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onUpdateRoleConfig(activeRole, { textAlign: item.id as any })}
                    className={`flex-1 py-1.5 flex justify-center rounded-lg text-xs transition-colors ${
                      config.textAlign === item.id ? 'bg-[#D4AF37] text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transform */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium block">Text Transform</label>
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'none', label: 'Normal' },
                { id: 'uppercase', label: 'UPPER' },
                { id: 'lowercase', label: 'lower' },
                { id: 'capitalize', label: 'Capital' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateRoleConfig(activeRole, { textTransform: item.id as any })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                    config.textTransform === item.id ? 'bg-[#D4AF37] text-black font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. STYLES & OPACITY */}
        <div className="space-y-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Style Toggles & Opacity
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onUpdateRoleConfig(activeRole, { fontStyle: config.fontStyle === 'italic' ? 'normal' : 'italic' })
              }
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                config.fontStyle === 'italic'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <Italic className="w-4 h-4" />
              <span>Italic</span>
            </button>

            <button
              onClick={() =>
                onUpdateRoleConfig(activeRole, {
                  textDecoration: config.textDecoration === 'underline' ? 'none' : 'underline',
                })
              }
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                config.textDecoration === 'underline'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <Underline className="w-4 h-4" />
              <span>Underline</span>
            </button>
          </div>

          {/* Opacity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Opacity</span>
              <span className="text-[#D4AF37] font-mono">{Math.round(config.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={config.opacity}
              onChange={(e) => onUpdateRoleConfig(activeRole, { opacity: Number(e.target.value) })}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
          </div>
        </div>

        {/* 5. COLOR CONTROLS */}
        <div className="space-y-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 md:col-span-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Text Color & Gradient Effect
          </span>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Color Input */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.color}
                onChange={(e) => onUpdateRoleConfig(activeRole, { color: e.target.value, gradient: '' })}
                className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-white/10 p-1"
              />
              <span className="text-xs font-mono text-white bg-black/40 px-3 py-2 rounded-xl border border-white/10">
                {config.color}
              </span>
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {colorPresets.map((hex) => (
                <button
                  key={hex}
                  onClick={() => onUpdateRoleConfig(activeRole, { color: hex, gradient: '' })}
                  className="w-6 h-6 rounded-lg border border-white/20 hover:scale-110 transition-transform"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          {/* Gradient Text Select */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium block">Gradient Overlay</label>
            <select
              value={config.gradient || ''}
              onChange={(e) => onUpdateRoleConfig(activeRole, { gradient: e.target.value })}
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              {gradientPresets.map((g, idx) => (
                <option key={idx} value={g.value} className="bg-slate-900 text-white">
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
