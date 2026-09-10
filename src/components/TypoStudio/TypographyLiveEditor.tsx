import React, { useState } from 'react';
import { TypographyDesign } from '../../types';
import { POPULAR_GOOGLE_FONTS, loadGoogleFont } from '../../utils/fontUtils';
import { X, Check, RefreshCw, Type, Palette, Layers, Sparkles, Sliders } from 'lucide-react';

interface TypographyLiveEditorProps {
  design: TypographyDesign;
  userText: string;
  onSave: (updated: TypographyDesign) => void;
  onClose: () => void;
}

export const TypographyLiveEditor: React.FC<TypographyLiveEditorProps> = ({
  design,
  userText,
  onSave,
  onClose,
}) => {
  const [edited, setEdited] = useState<TypographyDesign>({ ...design });

  const handleFontChange = (family: string) => {
    loadGoogleFont(family);
    setEdited((prev) => ({
      ...prev,
      fontFamily: family,
      fontName: family,
    }));
  };

  const handleColorChange = (key: keyof TypographyDesign['palette'], val: string) => {
    setEdited((prev) => ({
      ...prev,
      palette: {
        ...prev.palette,
        [key]: val,
      },
      ...(key === 'primaryColor' && !prev.gradientFill ? { strokeColor: val } : {}),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl p-6 sm:p-8 rounded-[18px] bg-[#0E1628] border border-[#00D8FF]/30 shadow-2xl space-y-6 text-[#C9D4E5] max-h-[92vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-[#00D8FF]/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Live Typography Editor</h2>
              <p className="text-xs text-[#C9D4E5]/70">
                Customize typography, composition, colors, stroke, glow, curve, and badge frame.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#111C30] hover:bg-[#060B16] text-[#C9D4E5] hover:text-white border border-[#00D8FF]/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LIVE STAGE PREVIEW */}
        <div
          className="p-8 rounded-2xl border border-[#00D8FF]/30 flex items-center justify-center min-h-[220px] transition-colors shadow-2xl relative overflow-hidden"
          style={{ backgroundColor: edited.palette.backgroundColor }}
        >
          <div
            style={{
              fontFamily: `"${edited.fontFamily}", sans-serif`,
              fontWeight: edited.fontWeight,
              fontSize: `${Math.min(48, Math.max(20, edited.fontSize))}px`,
              letterSpacing: `${edited.letterSpacing}px`,
              wordSpacing: `${edited.wordSpacing}px`,
              textTransform: edited.textTransform,
              opacity: edited.opacity,
              transform: `rotate(${edited.rotation}deg)`,
              textAlign: edited.alignment,
              color: edited.gradientFill ? 'transparent' : edited.palette.primaryColor,
              backgroundImage: edited.gradientFill || undefined,
              WebkitBackgroundClip: edited.gradientFill ? 'text' : undefined,
              WebkitTextFillColor: edited.gradientFill ? 'transparent' : undefined,
              WebkitTextStroke:
                edited.strokeWidth > 0 ? `${edited.strokeWidth}px ${edited.strokeColor}` : undefined,
              textShadow:
                edited.glowRadius > 0
                  ? `0 0 ${edited.glowRadius}px ${edited.glowColor}, ${edited.shadowOffsetX}px ${edited.shadowOffsetY}px ${edited.shadowBlur}px ${edited.shadowColor}`
                  : `${edited.shadowOffsetX}px ${edited.shadowOffsetY}px ${edited.shadowBlur}px ${edited.shadowColor}`,
            }}
          >
            {edited.customText || userText || 'Panther Studio'}
          </div>
        </div>

        {/* CONTROLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* COLUMN 1: FONT, TEXT & SPACING */}
          <div className="p-4 rounded-xl bg-[#111C30]/70 border border-[#00D8FF]/20 space-y-3">
            <div className="flex items-center gap-2 text-[#00D8FF] font-bold">
              <Type className="w-4 h-4" />
              <span>Font & Typography Spacing</span>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono block text-[#C9D4E5]/70 mb-1">
                Custom Text
              </label>
              <input
                type="text"
                value={edited.customText || ''}
                onChange={(e) => setEdited((p) => ({ ...p, customText: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#060B16] border border-[#00D8FF]/30 text-white font-medium focus:outline-none focus:border-[#00D8FF]"
                placeholder="Type custom text..."
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono block text-[#C9D4E5]/70 mb-1">
                Font Family
              </label>
              <select
                value={edited.fontFamily}
                onChange={(e) => handleFontChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#060B16] border border-[#00D8FF]/30 text-white font-medium focus:outline-none focus:border-[#00D8FF]"
              >
                {POPULAR_GOOGLE_FONTS.map((f) => (
                  <option key={f.family} value={f.family}>
                    {f.family} ({f.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-mono block text-[#C9D4E5]/70 mb-1">
                  Font Weight ({edited.fontWeight})
                </label>
                <select
                  value={edited.fontWeight}
                  onChange={(e) => setEdited((p) => ({ ...p, fontWeight: Number(e.target.value) }))}
                  className="w-full px-2 py-1.5 rounded-lg bg-[#060B16] border border-[#00D8FF]/30 text-white font-mono"
                >
                  {[300, 400, 500, 600, 700, 800, 900].map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono block text-[#C9D4E5]/70 mb-1">
                  Transform
                </label>
                <select
                  value={edited.textTransform}
                  onChange={(e) =>
                    setEdited((p) => ({ ...p, textTransform: e.target.value as any }))
                  }
                  className="w-full px-2 py-1.5 rounded-lg bg-[#060B16] border border-[#00D8FF]/30 text-white font-mono"
                >
                  <option value="none">None</option>
                  <option value="uppercase">UPPERCASE</option>
                  <option value="lowercase">lowercase</option>
                  <option value="capitalize">Capitalize</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span>Font Size</span>
                <span className="text-[#5FFFF7]">{edited.fontSize}px</span>
              </div>
              <input
                type="range"
                min={16}
                max={80}
                value={edited.fontSize}
                onChange={(e) => setEdited((p) => ({ ...p, fontSize: Number(e.target.value) }))}
                className="w-full accent-[#00D8FF]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span>Letter Spacing</span>
                <span className="text-[#5FFFF7]">{edited.letterSpacing}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={24}
                value={edited.letterSpacing}
                onChange={(e) => setEdited((p) => ({ ...p, letterSpacing: Number(e.target.value) }))}
                className="w-full accent-[#00D8FF]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span>Word Spacing</span>
                <span className="text-[#5FFFF7]">{edited.wordSpacing}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={edited.wordSpacing}
                onChange={(e) => setEdited((p) => ({ ...p, wordSpacing: Number(e.target.value) }))}
                className="w-full accent-[#00D8FF]"
              />
            </div>
          </div>

          {/* COLUMN 2: COLORS, GRADIENT & BACKGROUND */}
          <div className="p-4 rounded-xl bg-[#111C30]/70 border border-[#00D8FF]/20 space-y-3">
            <div className="flex items-center gap-2 text-[#00D8FF] font-bold">
              <Palette className="w-4 h-4" />
              <span>Colors, Gradient & Background</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono block mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={edited.palette.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[10px]">{edited.palette.primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono block mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={edited.palette.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[10px]">{edited.palette.secondaryColor}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono block mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={edited.palette.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[10px]">{edited.palette.accentColor}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono block mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={edited.palette.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[10px]">{edited.palette.backgroundColor}</span>
                </div>
              </div>
            </div>

            {/* GRADIENT FILL TOGGLE */}
            <div className="pt-2 border-t border-[#00D8FF]/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase text-[#00D8FF]">Gradient Fill</span>
                <input
                  type="checkbox"
                  checked={!!edited.gradientFill}
                  onChange={(e) =>
                    setEdited((p) => ({
                      ...p,
                      gradientFill: e.target.checked
                        ? `linear-gradient(135deg, ${p.palette.secondaryColor} 0%, ${p.palette.primaryColor} 100%)`
                        : undefined,
                    }))
                  }
                  className="w-4 h-4 accent-[#00D8FF]"
                />
              </div>

              {edited.gradientFill && (
                <select
                  value={edited.gradientFill}
                  onChange={(e) => setEdited((p) => ({ ...p, gradientFill: e.target.value }))}
                  className="w-full px-2 py-1.5 rounded bg-[#060B16] border border-[#00D8FF]/30 text-white text-[10px] font-mono"
                >
                  <option value={`linear-gradient(135deg, ${edited.palette.secondaryColor} 0%, ${edited.palette.primaryColor} 100%)`}>
                    Cyan & Blue Gradient
                  </option>
                  <option value="linear-gradient(135deg, #FDE68A 0%, #D4AF37 50%, #9C7A1C 100%)">
                    Luxury Gold Gradient
                  </option>
                  <option value="linear-gradient(135deg, #FF79C6 0%, #BD93F9 50%, #8BE9FD 100%)">
                    Cyber Neon Gradient
                  </option>
                  <option value="linear-gradient(135deg, #FF5252 0%, #FF7A00 100%)">
                    Sunset Red Gradient
                  </option>
                  <option value="linear-gradient(135deg, #00E676 0%, #00B0FF 100%)">
                    Emerald Cyan Gradient
                  </option>
                </select>
              )}
            </div>

            {/* BACKGROUND RECOMMENDATION */}
            <div>
              <label className="text-[10px] uppercase font-mono block text-[#C9D4E5]/70 mb-1">
                Background Recommendation
              </label>
              <select
                value={edited.bgRecommendation}
                onChange={(e) =>
                  setEdited((p) => ({ ...p, bgRecommendation: e.target.value as any }))
                }
                className="w-full px-3 py-1.5 rounded-lg bg-[#060B16] border border-[#00D8FF]/30 text-white font-mono text-[10px]"
              >
                <option value="Dark">Dark Mode</option>
                <option value="Black">Solid Black</option>
                <option value="White">Solid White</option>
                <option value="Luxury Gold">Luxury Gold</option>
                <option value="Gradient">Gradient Blue</option>
                <option value="Neon">Neon Glow</option>
                <option value="Glass">Glassmorphism</option>
                <option value="Paper">Paper Texture</option>
                <option value="Texture">Carbon Texture</option>
                <option value="Minimal">Minimal Gray</option>
              </select>
            </div>
          </div>

          {/* COLUMN 3: OUTLINE, SHADOW, GLOW, CURVE, OPACITY & BORDER */}
          <div className="p-4 rounded-xl bg-[#111C30]/70 border border-[#00D8FF]/20 space-y-3">
            <div className="flex items-center gap-2 text-[#00D8FF] font-bold">
              <Layers className="w-4 h-4" />
              <span>Outline, Shadow, Curve & Border</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span>Stroke Width</span>
                  <span className="text-[#5FFFF7]">{edited.strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={edited.strokeWidth}
                  onChange={(e) => setEdited((p) => ({ ...p, strokeWidth: Number(e.target.value) }))}
                  className="w-full accent-[#00D8FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono block mb-1">Stroke Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={edited.strokeColor || '#00D8FF'}
                    onChange={(e) => setEdited((p) => ({ ...p, strokeColor: e.target.value }))}
                    className="w-6 h-6 rounded border-none cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[9px]">{edited.strokeColor}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span>Glow Radius</span>
                <span className="text-[#5FFFF7]">{edited.glowRadius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={edited.glowRadius}
                onChange={(e) => setEdited((p) => ({ ...p, glowRadius: Number(e.target.value) }))}
                className="w-full accent-[#00D8FF]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span>Shadow Blur</span>
                <span className="text-[#5FFFF7]">{edited.shadowBlur}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={edited.shadowBlur}
                onChange={(e) => setEdited((p) => ({ ...p, shadowBlur: Number(e.target.value) }))}
                className="w-full accent-[#00D8FF]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span>Curve / Arch Angle</span>
                <span className="text-[#5FFFF7]">{edited.curveAngle}°</span>
              </div>
              <input
                type="range"
                min={-45}
                max={45}
                value={edited.curveAngle}
                onChange={(e) => setEdited((p) => ({ ...p, curveAngle: Number(e.target.value) }))}
                className="w-full accent-[#00D8FF]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span>Opacity</span>
                <span className="text-[#5FFFF7]">{Math.round(edited.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={edited.opacity}
                onChange={(e) => setEdited((p) => ({ ...p, opacity: Number(e.target.value) }))}
                className="w-full accent-[#00D8FF]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono block text-[#C9D4E5]/70 mb-1">
                Border / Badge Frame
              </label>
              <select
                value={edited.badgeFrame || 'none'}
                onChange={(e) => setEdited((p) => ({ ...p, badgeFrame: e.target.value as any }))}
                className="w-full px-3 py-1.5 rounded-lg bg-[#060B16] border border-[#00D8FF]/30 text-white font-mono text-[10px]"
              >
                <option value="none">None (Border Off)</option>
                <option value="shield">Shield</option>
                <option value="circle">Circle Badge</option>
                <option value="pill">Pill Wrap</option>
                <option value="rectangle">Rectangle Outline</option>
                <option value="diamond">Diamond Rotate</option>
                <option value="corner-accents">Corner Accents</option>
                <option value="double-ring">Double Gold Ring</option>
                <option value="hex-badge">Hexagon Badge</option>
              </select>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-4 border-t border-[#00D8FF]/15 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#111C30] hover:bg-[#060B16] text-[#C9D4E5] font-semibold text-xs border border-[#00D8FF]/20 transition-all"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onSave(edited);
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00D8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-xs shadow-lg shadow-[#00D8FF]/20 flex items-center gap-2 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Apply & Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
