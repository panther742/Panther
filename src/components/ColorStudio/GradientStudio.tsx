import React, { useState } from 'react';
import { ColorItem } from '../../types';
import { Copy, Check, Sliders, Code2 } from 'lucide-react';

interface GradientStudioProps {
  colors: ColorItem[];
}

export const GradientStudio: React.FC<GradientStudioProps> = ({ colors }) => {
  const [angle, setAngle] = useState<number>(135);
  const [copied, setCopied] = useState<boolean>(false);

  const stops = colors.map((c) => c.hex).join(', ');
  const gradientCss = `linear-gradient(${angle}deg, ${stops})`;

  const handleCopyCss = () => {
    navigator.clipboard.writeText(`background: ${gradientCss};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="p-6 rounded-3xl bg-[#111C30] border border-[#00D8FF]/20 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Dynamic Gradient Studio</h3>
        </div>

        <button
          onClick={handleCopyCss}
          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#00D8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold shadow-md flex items-center gap-1.5 transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'CSS Copied!' : 'Copy CSS'}</span>
        </button>
      </div>

      {/* Large Gradient Canvas Preview */}
      <div
        className="h-32 rounded-2xl border border-[#00D8FF]/20 shadow-2xl flex items-end p-4 transition-all"
        style={{ background: gradientCss }}
      >
        <div className="px-3 py-1.5 rounded-xl bg-[#060B16]/80 backdrop-blur-md font-mono text-xs text-white">
          {angle}° Angle Gradient
        </div>
      </div>

      {/* Angle Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-[#C9D4E5] font-medium">
          <span>Gradient Angle</span>
          <span className="font-mono text-[#00D8FF] font-bold">{angle}°</span>
        </div>
        <input
          type="range"
          min={0}
          max={360}
          value={angle}
          onChange={(e) => setAngle(Number(e.target.value))}
          className="w-full h-2 rounded-lg bg-[#060B16] appearance-none cursor-pointer accent-[#00D8FF]"
        />
      </div>

      {/* CSS Code Snippet */}
      <div className="p-3 rounded-xl bg-[#060B16] border border-[#00D8FF]/20 font-mono text-xs text-[#C9D4E5] overflow-x-auto flex items-center justify-between">
        <code>background: {gradientCss};</code>
      </div>
    </div>
  );
};
