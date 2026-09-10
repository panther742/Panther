import React, { useState } from 'react';
import { ColorItem } from '../../types';
import { Lock, Unlock, Copy, Check, Heart, Trash2, ArrowLeftRight } from 'lucide-react';

interface PaletteCardsProps {
  colors: ColorItem[];
  onToggleLock: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRemoveColor: (id: string) => void;
  onSelectColor: (color: ColorItem) => void;
}

export const PaletteCards: React.FC<PaletteCardsProps> = ({
  colors,
  onToggleLock,
  onToggleFavorite,
  onRemoveColor,
  onSelectColor,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Active Palette</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30 font-mono font-bold">
            {colors.length} Colors
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {colors.map((color, index) => (
          <div
            key={color.id}
            className="group relative rounded-2xl overflow-hidden bg-[#111C30] border border-[#00D8FF]/15 shadow-xl transition-all duration-200 hover:border-[#00D8FF]/50 flex flex-col"
          >
            {/* Color Swatch Display */}
            <div
              onClick={() => onSelectColor(color)}
              className="h-36 w-full cursor-pointer relative p-3 flex flex-col justify-between transition-transform duration-200 group-hover:scale-[1.02]"
              style={{ backgroundColor: color.hex }}
            >
              {/* Top Controls: Lock / Favorite */}
              <div className="flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(color.id);
                  }}
                  className="p-2 rounded-xl bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                  title={color.isLocked ? 'Unlock Color' : 'Lock Color'}
                >
                  {color.isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-[#00D8FF]" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 opacity-70" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(color.id);
                  }}
                  className="p-2 rounded-xl bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                  title="Favorite Color"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      color.isFavorite ? 'text-[#5FFFF7] fill-[#5FFFF7]' : 'opacity-70'
                    }`}
                  />
                </button>
              </div>

              {/* HEX Code Overlay */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md font-mono text-xs font-bold text-white tracking-wider">
                  {color.hex}
                </span>

                {colors.length > 2 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveColor(color.id);
                    }}
                    className="p-1.5 rounded-lg bg-red-950/80 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Color"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Detailed Color Values Panel (RGB, CMYK, HSL, HSV) */}
            <div className="p-3 bg-[#0E1628] space-y-2 text-[11px] font-mono text-[#C9D4E5]">
              {/* HEX Copy */}
              <div className="flex items-center justify-between hover:text-white transition-colors">
                <span>HEX</span>
                <button
                  onClick={() => handleCopy(color.hex, `${color.id}-hex`)}
                  className="flex items-center gap-1 font-bold text-[#00D8FF] hover:text-[#5FFFF7]"
                >
                  <span>{color.hex}</span>
                  {copiedId === `${color.id}-hex` ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* RGB Copy */}
              <div className="flex items-center justify-between hover:text-white transition-colors">
                <span>RGB</span>
                <button
                  onClick={() =>
                    handleCopy(
                      `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
                      `${color.id}-rgb`
                    )
                  }
                  className="font-semibold text-slate-300 hover:text-white"
                >
                  {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                </button>
              </div>

              {/* CMYK */}
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>CMYK</span>
                <span>
                  {color.cmyk.c}%, {color.cmyk.m}%, {color.cmyk.y}%, {color.cmyk.k}%
                </span>
              </div>

              {/* HSL */}
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>HSL</span>
                <span>
                  {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
                </span>
              </div>

              {/* HSV */}
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>HSV</span>
                <span>
                  {color.hsv.h}°, {color.hsv.s}%, {color.hsv.v}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
