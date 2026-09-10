import React, { useState } from 'react';
import { FutureTool, ActiveView } from '../types';
import {
  Bell,
  Check,
} from 'lucide-react';

interface FutureToolsProps {
  setActiveView: (view: ActiveView) => void;
}

export const FutureTools: React.FC<FutureToolsProps> = ({ setActiveView }) => {
  const [notifiedTools, setNotifiedTools] = useState<Record<string, boolean>>({});

  const futureTools: FutureTool[] = [
    {
      id: 'bg-remover',
      title: 'Background Remover',
      description: 'AI object isolation and hair/transparent boundary extraction.',
      iconName: 'Scissors',
      badge: 'Coming Soon',
      category: 'AI Isolation',
      features: ['Alpha Matte', 'Hair Edge Fine-tuning', 'Batch PNG Export'],
    },
    {
      id: 'logo-gen',
      title: 'Logo Maker AI',
      description: 'Synthesize geometric brand marks and minimalist icons from text prompts.',
      iconName: 'Hexagon',
      badge: 'Coming Soon',
      category: 'Branding',
      features: ['Geometric Grid Alignment', 'Monogram Builder', 'Brand Guide Export'],
    },
    {
      id: 'mockup-gen',
      title: 'Mockup Generator',
      description: 'Place your vector graphics onto photorealistic 3D device frames and apparel.',
      iconName: 'Frame',
      badge: 'Coming Soon',
      category: '3D Mockups',
      features: ['Device Frames', 'T-Shirt & Packaging', '4K Canvas Export'],
    },
    {
      id: 'svg-cleaner',
      title: 'SVG Cleaner',
      description: 'Remove redundant XML tags, optimize paths, and compress SVG file sizes by up to 80%.',
      iconName: 'Sparkles',
      badge: 'Coming Soon',
      category: 'Vector Optimization',
      features: ['Precision Truncation', 'Unused Group Removal', 'SVGO Engine'],
    },
    {
      id: 'gradient-gen',
      title: 'Gradient Generator',
      description: 'Create multi-stop mesh gradients and CSS linear/radial color transitions.',
      iconName: 'Palette',
      badge: 'Coming Soon',
      category: 'Color Tools',
      features: ['Mesh Gradients', 'Angle Rotation', 'Tailwind Class Export'],
    },
    {
      id: 'pattern-gen',
      title: 'Pattern Generator',
      description: 'Seamless vector tile generator for background textures and apparel design.',
      iconName: 'Grid',
      badge: 'Coming Soon',
      category: 'Texture Engine',
      features: ['Seamless Repeat', 'Isometric Grid', 'SVG Tile Output'],
    },
    {
      id: 'qr-gen',
      title: 'QR Generator',
      description: 'Custom stylized vector QR codes with logo embedding and rounded corners.',
      iconName: 'QrCode',
      badge: 'Coming Soon',
      category: 'Utility',
      features: ['Logo Center Overlay', 'Dot Shape Customization', 'Vector SVG Output'],
    },
    {
      id: 'upscaler',
      title: 'Image Upscaler',
      description: '4x AI super-resolution for sharpening low-res raster images before vectorization.',
      iconName: 'Maximize',
      badge: 'Coming Soon',
      category: 'AI Enhancement',
      features: ['Super-Resolution', 'Detail Sharpening', '4K Output'],
    },
    {
      id: 'dxf-opt',
      title: 'DXF Optimizer',
      description: 'Clean AutoCAD polylines for laser cutting and CNC router paths.',
      iconName: 'Sliders',
      badge: 'Coming Soon',
      category: 'CAD / CNC',
      features: ['Double-Line Removal', 'Closed Polyline Check', 'Toolhead Arc Pathing'],
    },
    {
      id: 'font-pair',
      title: 'Panther Typo Studio',
      description: 'AI-curated typography pairings, 1500+ Google Fonts, live multi-view mockups and CSS exports.',
      iconName: 'Type',
      badge: 'LIVE NOW',
      category: 'Typography Engine',
      features: ['1500+ Google Fonts', 'AI Pair Synthesizer', 'Multi-Mockup Canvas', 'CSS & Specimen Export'],
    },
    {
      id: 'brand-kit',
      title: 'Brand Kit Generator',
      description: 'Generate full brand guidelines, color palettes, and typographic scales.',
      iconName: 'Sticker',
      badge: 'Coming Soon',
      category: 'Branding',
      features: ['Brand Token Export', 'PDF Style Guide', 'Logo Assets'],
    },
  ];

  const handleNotifyMe = (id: string) => {
    setNotifiedTools((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-fade-in text-[#C9D4E5] min-h-screen bg-[#060B16]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#00D8FF]/15">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#00D8FF]/15 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
              Coming Soon Suite
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 tracking-tight">
            Upcoming AI Design Tools
          </h1>
          <p className="text-xs text-[#C9D4E5]/80 mt-1 max-w-xl">
            11 specialized creative modules currently in development for Panther Studio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('color-studio')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-xs shadow-md"
          >
            Open Color Studio
          </button>
          <button
            onClick={() => setActiveView('vector-studio')}
            className="px-4 py-2 rounded-xl bg-[#111C30] hover:bg-[#0E1628] border border-[#00D8FF]/30 text-white font-bold text-xs shadow-md"
          >
            Open Vector Engine
          </button>
        </div>
      </div>

      {/* TOOLS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {futureTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => {
              if (tool.id === 'font-pair') setActiveView('typo-studio');
            }}
            className={`group relative p-6 rounded-[18px] bg-[#111C30]/70 border border-[#00D8FF]/20 hover:border-[#00D8FF] transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4 ${
              tool.badge === 'LIVE NOW' ? 'cursor-pointer ring-1 ring-[#00D8FF]/50' : ''
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00D8FF] font-mono">
                  {tool.category}
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
                  {tool.badge}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-[#00D8FF] transition-colors">
                {tool.title}
              </h3>
              <p className="text-xs text-[#C9D4E5]/80 leading-relaxed">{tool.description}</p>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {tool.features.map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 text-[10px] font-medium bg-[#0E1628] border border-[#00D8FF]/20 text-[#C9D4E5] rounded-md"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#00D8FF]/15 flex items-center justify-between">
              <span className="text-[11px] text-[#C9D4E5]/60 font-medium">Panther Roadmap</span>
              <button
                onClick={() => handleNotifyMe(tool.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                  notifiedTools[tool.id]
                    ? 'bg-[#00D8FF]/20 text-[#5FFFF7] border-[#00D8FF]/40'
                    : 'bg-[#0E1628] hover:bg-[#111C30] text-[#C9D4E5] border-[#00D8FF]/20'
                }`}
                id={`notify-${tool.id}-btn`}
              >
                {notifiedTools[tool.id] ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#5FFFF7]" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5 text-[#00D8FF]" />
                    <span>Notify Me</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FutureTools;

