import React, { useState, useRef, useEffect } from 'react';
import { ColorItem } from '../../types';
import { hexToColorItem } from '../../utils/colorUtils';
import { Sparkles, Sliders, Pipette, RefreshCw } from 'lucide-react';

interface ColorCanvasProps {
  currentColor: ColorItem;
  onColorChange: (color: ColorItem) => void;
  onAddColorToPalette: (color: ColorItem) => void;
}

export const ColorCanvas: React.FC<ColorCanvasProps> = ({
  currentColor,
  onColorChange,
  onAddColorToPalette,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hue, setHue] = useState<number>(currentColor.hsl.h);
  const [saturation, setSaturation] = useState<number>(currentColor.hsl.s);
  const [lightness, setLightness] = useState<number>(currentColor.hsl.l);
  const [hexInput, setHexInput] = useState<string>(currentColor.hex);

  useEffect(() => {
    setHexInput(currentColor.hex);
    setHue(currentColor.hsl.h);
    setSaturation(currentColor.hsl.s);
    setLightness(currentColor.hsl.l);
  }, [currentColor.hex]);

  // Draw 2D Saturation / Lightness canvas for selected Hue
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const sat = (x / w) * 100;
        const light = 100 - (y / h) * 100;
        ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [hue]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const s = Math.round((x / rect.width) * 100);
    const l = Math.round(100 - (y / rect.height) * 100);

    setSaturation(s);
    setLightness(l);

    const newColor = hexToColorItem(`hsl(${hue}, ${s}%, ${l}%)`);
    onColorChange(newColor);
  };

  const handleHexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^#?[0-9A-Fa-f]{6}$/.test(hexInput)) {
      const formatted = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
      const newColor = hexToColorItem(formatted);
      onColorChange(newColor);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-[#111C30] border border-[#00D8FF]/20 shadow-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Spatial Color Canvas</h3>
        </div>
        <button
          onClick={() => onAddColorToPalette(currentColor)}
          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#00D8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black shadow-md shadow-[#00D8FF]/20 transition-all font-extrabold"
          id="add-canvas-color-to-palette-btn"
        >
          + Add Color
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* 2D Interactive Color Canvas */}
        <div className="relative group">
          <canvas
            ref={canvasRef}
            width={300}
            height={200}
            onClick={handleCanvasClick}
            className="w-full h-48 rounded-2xl cursor-crosshair border border-[#00D8FF]/20 shadow-inner transition-transform group-hover:scale-[1.01]"
          />
          <div className="absolute top-2 right-2 px-2 py-1 text-[10px] font-mono bg-[#060B16]/80 backdrop-blur-md rounded-md text-slate-300">
            H: {hue}° S: {saturation}% L: {lightness}%
          </div>
        </div>

        {/* Circular Hue Selector & Numeric Sliders */}
        <div className="space-y-4">
          {/* Active Color Preview Block */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#060B16] border border-[#00D8FF]/20">
            <div
              className="w-12 h-12 rounded-xl shadow-lg border border-white/20 shrink-0 transition-colors"
              style={{ backgroundColor: currentColor.hex }}
            />
            <form onSubmit={handleHexSubmit} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold uppercase bg-[#0E1628] border border-[#00D8FF]/30 rounded-lg text-white focus:outline-none focus:border-[#00D8FF]"
                placeholder="#HEX"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-[#0E1628] hover:bg-white/10 text-[#C9D4E5] rounded-lg border border-[#00D8FF]/20"
              >
                Apply
              </button>
            </form>
          </div>

          {/* Hue Range Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-[#C9D4E5]">
              <span>Hue Spectrum</span>
              <span className="font-mono text-[#00D8FF]">{hue}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={hue}
              onChange={(e) => {
                const h = Number(e.target.value);
                setHue(h);
                onColorChange(hexToColorItem(`hsl(${h}, ${saturation}%, ${lightness}%)`));
              }}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background:
                  'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
              }}
            />
          </div>

          {/* Saturation Range */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-[#C9D4E5]">
              <span>Saturation</span>
              <span className="font-mono text-[#00D8FF]">{saturation}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={saturation}
              onChange={(e) => {
                const s = Number(e.target.value);
                setSaturation(s);
                onColorChange(hexToColorItem(`hsl(${hue}, ${s}%, ${lightness}%)`));
              }}
              className="w-full h-2 rounded-lg bg-[#060B16] appearance-none cursor-pointer accent-[#00D8FF]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
