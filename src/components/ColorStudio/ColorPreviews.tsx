import React, { useState } from 'react';
import { ColorItem } from '../../types';
import { calculateContrast } from '../../utils/colorUtils';
import { PantherLogo } from '../PantherLogo';
import { ShieldCheck, Layout, Image, Check, AlertTriangle, Eye, Sparkles } from 'lucide-react';

interface ColorPreviewsProps {
  colors: ColorItem[];
}

export const ColorPreviews: React.FC<ColorPreviewsProps> = ({ colors }) => {
  const [activeTab, setActiveTab] = useState<'brand' | 'ui' | 'poster' | 'accessibility'>('brand');

  const c1 = colors[0]?.hex || '#0F172A';
  const c2 = colors[1]?.hex || '#7C3AED';
  const c3 = colors[2]?.hex || '#38BDF8';
  const c4 = colors[3]?.hex || '#EC4899';
  const c5 = colors[4]?.hex || '#FACC15';

  // Contrast calculations for accessibility
  const contrast12 = calculateContrast(c1, c2);
  const contrast13 = calculateContrast(c1, c3);
  const contrastBgText = calculateContrast(c1, '#FFFFFF');

  return (
    <div className="p-6 rounded-3xl bg-[#111C30] border border-[#00D8FF]/20 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#00D8FF]/15">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#00D8FF]" />
            <span>Live Color Applications & Preview</span>
          </h3>
          <p className="text-xs text-[#C9D4E5]/80">
            Real-time preview of your palette applied across branding, UI dashboard layout, posters, and accessibility matrix.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#060B16] rounded-xl border border-[#00D8FF]/20">
          <button
            onClick={() => setActiveTab('brand')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'brand' ? 'bg-[#00D8FF] text-black font-bold shadow' : 'text-[#C9D4E5] hover:text-white'
            }`}
          >
            Brand
          </button>
          <button
            onClick={() => setActiveTab('ui')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'ui' ? 'bg-[#00D8FF] text-black font-bold shadow' : 'text-[#C9D4E5] hover:text-white'
            }`}
          >
            UI Preview
          </button>
          <button
            onClick={() => setActiveTab('poster')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'poster' ? 'bg-[#00D8FF] text-black font-bold shadow' : 'text-[#C9D4E5] hover:text-white'
            }`}
          >
            Poster
          </button>
          <button
            onClick={() => setActiveTab('accessibility')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'accessibility' ? 'bg-[#00D8FF] text-black font-bold shadow' : 'text-[#C9D4E5] hover:text-white'
            }`}
          >
            Accessibility
          </button>
        </div>
      </div>

      {/* BRAND PREVIEW TAB */}
      {activeTab === 'brand' && (
        <div className="p-8 rounded-2xl border border-slate-800 space-y-6 transition-all" style={{ backgroundColor: c1 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg" style={{ backgroundColor: c2, color: c1 }}>
                P
              </div>
              <span className="font-extrabold text-xl tracking-tight" style={{ color: c3 }}>
                AURA DIGITAL
              </span>
            </div>
            <span className="px-3 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: c3, color: c1 }}>
              Official Mark
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black leading-tight" style={{ color: '#FFFFFF' }}>
              Designed with Precision & Purpose
            </h2>
            <p className="text-sm opacity-80 max-w-lg" style={{ color: c3 }}>
              Elevate your visual identity with harmonized color contrast, elegant typography pairings, and clean aesthetic structure.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg" style={{ backgroundColor: c2, color: '#FFFFFF' }}>
              Primary Action
            </button>
            <button className="px-5 py-2.5 rounded-xl font-bold text-xs border" style={{ borderColor: c3, color: c3 }}>
              Secondary Outline
            </button>
          </div>
        </div>
      )}

      {/* UI DASHBOARD PREVIEW TAB */}
      {activeTab === 'ui' && (
        <div className="p-6 rounded-2xl border border-slate-800 space-y-4" style={{ backgroundColor: c1 }}>
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <span className="font-bold text-xs uppercase tracking-wider" style={{ color: c3 }}>
              Studio Analytics Dashboard
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c4 }} />
              <span className="text-[11px] font-mono" style={{ color: '#FFFFFF' }}>
                Live Feed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <span className="text-[10px] font-bold uppercase" style={{ color: c3 }}>
                Total Revenue
              </span>
              <h4 className="text-xl font-black mt-1" style={{ color: c2 }}>
                $128,450
              </h4>
              <span className="text-[10px] font-semibold" style={{ color: c5 }}>
                +24% vs last month
              </span>
            </div>

            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <span className="text-[10px] font-bold uppercase" style={{ color: c3 }}>
                Active Vectors
              </span>
              <h4 className="text-xl font-black mt-1" style={{ color: c4 }}>
                1,892 Paths
              </h4>
              <span className="text-[10px] font-semibold" style={{ color: c3 }}>
                Optimized
              </span>
            </div>

            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <span className="text-[10px] font-bold uppercase" style={{ color: c3 }}>
                Efficiency Index
              </span>
              <h4 className="text-xl font-black mt-1" style={{ color: c5 }}>
                99.8%
              </h4>
              <span className="text-[10px] font-semibold" style={{ color: c2 }}>
                Grade A+
              </span>
            </div>
          </div>
        </div>
      )}

      {/* POSTER PREVIEW TAB */}
      {activeTab === 'poster' && (
        <div
          className="h-64 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden border border-slate-800"
          style={{ background: `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c4} 100%)` }}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold tracking-widest text-white/80">POSTER SPECIMEN // 2026</span>
            <div className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center font-bold text-xs text-white">
              P
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
              VECTOR SPECTRUM
            </h1>
            <p className="text-xs text-white/90 font-medium mt-2 max-w-sm">
              An exploration of geometry, color harmony, and digital aesthetics.
            </p>
          </div>
        </div>
      )}

      {/* ACCESSIBILITY TAB */}
      {activeTab === 'accessibility' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#060B16] border border-[#00D8FF]/20 space-y-1">
              <span className="text-xs text-[#C9D4E5]">Color 1 vs Color 2 Contrast</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black font-mono text-[#00D8FF]">{contrast12.toFixed(2)}:1</span>
                {contrast12 >= 4.5 ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded">
                    WCAG AA Pass
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800/40 rounded">
                    Low Contrast
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#060B16] border border-[#00D8FF]/20 space-y-1">
              <span className="text-xs text-[#C9D4E5]">Color 1 vs Color 3 Contrast</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black font-mono text-[#28B8FF]">{contrast13.toFixed(2)}:1</span>
                {contrast13 >= 4.5 ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded">
                    WCAG AA Pass
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800/40 rounded">
                    Low Contrast
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#060B16] border border-[#00D8FF]/20 space-y-1">
              <span className="text-xs text-[#C9D4E5]">Background vs White Text</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black font-mono text-[#5FFFF7]">{contrastBgText.toFixed(2)}:1</span>
                {contrastBgText >= 7.0 ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded">
                    WCAG AAA Pass
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded">
                    WCAG AA Pass
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
