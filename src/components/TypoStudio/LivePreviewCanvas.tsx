import React, { useState, useRef } from 'react';
import { TypographyPairing, FontRole } from '../../types';
import {
  Monitor,
  Hexagon,
  CreditCard,
  Image as ImageIcon,
  Package,
  Layers,
  Layout,
  Instagram,
  FileText,
  Copy,
  Check,
  Edit3,
  Smartphone,
  Video,
  Shirt,
} from 'lucide-react';

interface LivePreviewCanvasProps {
  pairing: TypographyPairing;
  onUpdateSampleText?: (role: FontRole, text: string) => void;
}

export const LivePreviewCanvas: React.FC<LivePreviewCanvasProps> = ({ pairing }) => {
  const [activeTab, setActiveTab] = useState<
    | 'custom'
    | 'website'
    | 'mobile-app'
    | 'logo'
    | 'business-card'
    | 'poster'
    | 'instagram'
    | 'youtube-thumbnail'
    | 'packaging'
    | 'banner'
    | 't-shirt'
    | 'ui-design'
  >('custom');

  // Live editable state
  const [sampleTexts, setSampleTexts] = useState({
    heading: 'Panther Typo Studio',
    subheading: 'Master the Art of Intelligent Font Combinations & Visual Hierarchy',
    body: 'Elevate your brand, digital products, and print design with AI-synthesized typography pairings crafted for luxury, modern websites, logos, and editorial posters.',
    caption: 'CURATED GOOGLE FONTS • PANTHER STUDIO V3.0',
    button: 'Explore Font Specs',
    navigation: 'OVERVIEW • SPECIMENS • PAIRINGS • EXPORT',
  });

  const [copiedRole, setCopiedRole] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleTextChange = (role: keyof typeof sampleTexts, value: string) => {
    setSampleTexts((prev) => ({ ...prev, [role]: value }));
  };

  const copyFontRule = (role: FontRole) => {
    const config = pairing.roles[role];
    if (!config) return;
    const rule = `font-family: '${config.fontFamily}', sans-serif; font-weight: ${config.fontWeight}; font-size: ${config.fontSize}px;`;
    navigator.clipboard.writeText(rule);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const mockups = [
    { id: 'custom', label: 'Custom Specimen', icon: Edit3 },
    { id: 'website', label: 'Website', icon: Monitor },
    { id: 'mobile-app', label: 'Mobile App', icon: Smartphone },
    { id: 'logo', label: 'Logo', icon: Hexagon },
    { id: 'business-card', label: 'Business Card', icon: CreditCard },
    { id: 'poster', label: 'Poster', icon: ImageIcon },
    { id: 'instagram', label: 'Instagram Post', icon: Instagram },
    { id: 'youtube-thumbnail', label: 'YouTube Thumbnail', icon: Video },
    { id: 'packaging', label: 'Packaging', icon: Package },
    { id: 'banner', label: 'Banner', icon: Layout },
    { id: 't-shirt', label: 'T-Shirt', icon: Shirt },
    { id: 'ui-design', label: 'UI Design System', icon: Layers },
  ];

  // Utility to build CSS style object for a role
  const getStyleForRole = (role: FontRole): React.CSSProperties => {
    const config = pairing.roles[role];
    if (!config) return {};

    return {
      fontFamily: `'${config.fontFamily}', sans-serif`,
      fontWeight: config.fontWeight,
      fontSize: `${config.fontSize}px`,
      letterSpacing: `${config.letterSpacing}px`,
      lineHeight: config.lineHeight,
      wordSpacing: `${config.wordSpacing}px`,
      textAlign: config.textAlign,
      textTransform: config.textTransform,
      fontStyle: config.fontStyle,
      textDecoration: config.textDecoration,
      opacity: config.opacity,
      color: config.gradient ? 'transparent' : config.color,
      backgroundImage: config.gradient ? config.gradient : undefined,
      WebkitBackgroundClip: config.gradient ? 'text' : undefined,
      backgroundClip: config.gradient ? 'text' : undefined,
      textShadow: config.shadow || undefined,
    };
  };

  return (
    <div className="space-y-6">
      {/* MOCKUP TAB SELECTOR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
        {mockups.map((m) => {
          const Icon = m.icon;
          const isActive = activeTab === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-extrabold'
                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* PREVIEW CONTAINER */}
      <div
        ref={canvasRef}
        className="relative bg-[#07070A] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[500px] flex flex-col justify-center overflow-hidden transition-all duration-300"
        style={{ backgroundColor: pairing.bgColor || '#07070A' }}
      >
        {/* 1. CUSTOM SPECIMEN VIEW */}
        {activeTab === 'custom' && (
          <div className="space-y-8 max-w-4xl mx-auto w-full">
            {/* Nav Role Preview */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <input
                type="text"
                value={sampleTexts.navigation}
                onChange={(e) => handleTextChange('navigation', e.target.value)}
                style={getStyleForRole('navigation')}
                className="bg-transparent focus:outline-none w-full hover:bg-white/5 px-2 py-1 rounded transition-colors"
              />
              <button
                onClick={() => copyFontRule('navigation')}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Copy CSS for Nav"
              >
                {copiedRole === 'navigation' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Caption Role Preview */}
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={sampleTexts.caption}
                onChange={(e) => handleTextChange('caption', e.target.value)}
                style={getStyleForRole('caption')}
                className="bg-transparent focus:outline-none w-full hover:bg-white/5 px-2 py-1 rounded transition-colors"
              />
              <button
                onClick={() => copyFontRule('caption')}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Copy CSS for Caption"
              >
                {copiedRole === 'caption' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Heading Role Preview */}
            <div className="relative group">
              <textarea
                value={sampleTexts.heading}
                onChange={(e) => handleTextChange('heading', e.target.value)}
                rows={2}
                style={getStyleForRole('heading')}
                className="bg-transparent focus:outline-none w-full resize-none hover:bg-white/5 p-2 rounded transition-colors"
              />
              <button
                onClick={() => copyFontRule('heading')}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                title="Copy CSS for Heading"
              >
                {copiedRole === 'heading' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Subheading Role Preview */}
            <div className="relative group">
              <textarea
                value={sampleTexts.subheading}
                onChange={(e) => handleTextChange('subheading', e.target.value)}
                rows={2}
                style={getStyleForRole('subheading')}
                className="bg-transparent focus:outline-none w-full resize-none hover:bg-white/5 p-2 rounded transition-colors"
              />
              <button
                onClick={() => copyFontRule('subheading')}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                title="Copy CSS for Subheading"
              >
                {copiedRole === 'subheading' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Body Role Preview */}
            <div className="relative group">
              <textarea
                value={sampleTexts.body}
                onChange={(e) => handleTextChange('body', e.target.value)}
                rows={3}
                style={getStyleForRole('body')}
                className="bg-transparent focus:outline-none w-full resize-none hover:bg-white/5 p-2 rounded transition-colors"
              />
              <button
                onClick={() => copyFontRule('body')}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                title="Copy CSS for Body"
              >
                {copiedRole === 'body' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Button Role Preview */}
            <div className="pt-4 flex justify-center">
              <button
                style={{
                  ...getStyleForRole('button'),
                  backgroundColor: '#D4AF37',
                  padding: '12px 32px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(212, 175, 55, 0.3)',
                }}
                className="hover:scale-105 transition-transform"
              >
                {sampleTexts.button}
              </button>
            </div>
          </div>
        )}

        {/* 2. WEBSITE MOCKUP */}
        {activeTab === 'website' && (
          <div className="w-full max-w-4xl mx-auto border border-white/10 rounded-2xl bg-black/60 overflow-hidden shadow-2xl">
            {/* Browser Header Bar */}
            <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-[11px] text-slate-400 bg-white/5 px-4 py-1 rounded-full font-mono">
                https://pantherstudio.ai
              </div>
              <div className="w-12" />
            </div>

            {/* Web Body */}
            <div className="p-8 space-y-8 text-center">
              <p style={getStyleForRole('navigation')}>{sampleTexts.navigation}</p>
              <h1 style={getStyleForRole('heading')}>{sampleTexts.heading}</h1>
              <p style={getStyleForRole('subheading')} className="max-w-2xl mx-auto">
                {sampleTexts.subheading}
              </p>
              <p style={getStyleForRole('body')} className="max-w-xl mx-auto">
                {sampleTexts.body}
              </p>
              <div>
                <button
                  style={{
                    ...getStyleForRole('button'),
                    backgroundColor: '#D4AF37',
                    padding: '12px 28px',
                    borderRadius: '12px',
                  }}
                >
                  {sampleTexts.button}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. LOGO MOCKUP */}
        {activeTab === 'logo' && (
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/40 shadow-2xl">
              <Hexagon className="w-20 h-20 text-[#D4AF37]" />
            </div>
            <h2 style={getStyleForRole('heading')} className="text-5xl font-extrabold tracking-widest uppercase">
              PANTHER
            </h2>
            <p style={getStyleForRole('caption')} className="text-sm font-semibold tracking-widest">
              LUXURY CREATIVE STUDIO
            </p>
          </div>
        )}

        {/* 4. BUSINESS CARD MOCKUP */}
        {activeTab === 'business-card' && (
          <div className="flex justify-center items-center py-8">
            <div className="w-full max-w-md aspect-[1.75/1] bg-gradient-to-br from-[#0B0B0F] via-[#15151D] to-[#0B0B0F] border border-[#D4AF37]/40 rounded-2xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h3 style={getStyleForRole('heading')} className="text-2xl font-bold">
                    Panther Studio
                  </h3>
                  <p style={getStyleForRole('caption')} className="text-xs">
                    Creative Typography Director
                  </p>
                </div>
                <Hexagon className="w-8 h-8 text-[#D4AF37]" />
              </div>

              <div className="space-y-1">
                <p style={getStyleForRole('body')} className="text-xs opacity-90">
                  hello@pantherstudio.ai
                </p>
                <p style={getStyleForRole('body')} className="text-xs opacity-90">
                  +1 (800) 555-PANTHER
                </p>
                <p style={getStyleForRole('caption')} className="text-[10px]">
                  www.pantherstudio.ai
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. POSTER MOCKUP */}
        {activeTab === 'poster' && (
          <div className="max-w-md mx-auto aspect-[3/4] bg-black border border-white/20 rounded-2xl p-8 flex flex-col justify-between text-center shadow-2xl relative">
            <p style={getStyleForRole('caption')}>{sampleTexts.caption}</p>
            <div className="space-y-4 my-auto">
              <h1 style={getStyleForRole('heading')} className="text-4xl font-extrabold">
                {sampleTexts.heading}
              </h1>
              <p style={getStyleForRole('subheading')} className="text-base">
                {sampleTexts.subheading}
              </p>
            </div>
            <p style={getStyleForRole('body')} className="text-xs">
              {sampleTexts.body}
            </p>
          </div>
        )}

        {/* 6. INSTAGRAM POST */}
        {activeTab === 'instagram' && (
          <div className="max-w-md mx-auto aspect-square bg-gradient-to-br from-[#0D0D12] to-[#181822] border border-[#D4AF37]/30 rounded-3xl p-8 flex flex-col justify-between text-center shadow-2xl">
            <span style={getStyleForRole('caption')}>@PANTHERSTUDIO.AI</span>
            <div className="space-y-4 my-auto">
              <h2 style={getStyleForRole('heading')} className="text-3xl font-bold">
                {sampleTexts.heading}
              </h2>
              <p style={getStyleForRole('body')} className="text-sm">
                {sampleTexts.subheading}
              </p>
            </div>
            <button
              style={{
                ...getStyleForRole('button'),
                backgroundColor: '#D4AF37',
                padding: '10px 20px',
                borderRadius: '12px',
                margin: '0 auto',
              }}
            >
              Swipe Up
            </button>
          </div>
        )}

        {/* 7. PACKAGING MOCKUP */}
        {activeTab === 'packaging' && (
          <div className="max-w-md mx-auto bg-gradient-to-b from-[#14141C] to-[#0A0A0E] border-2 border-[#D4AF37] rounded-3xl p-10 flex flex-col justify-between text-center shadow-2xl relative">
            <div className="w-12 h-1 bg-[#D4AF37] mx-auto mb-4 rounded-full" />
            <p style={getStyleForRole('caption')} className="text-xs">
              PREMIUM ESSENCES • EST. 2026
            </p>
            <h1 style={getStyleForRole('heading')} className="text-4xl my-6">
              PANTHER NOIR
            </h1>
            <p style={getStyleForRole('body')} className="text-xs max-w-xs mx-auto">
              {sampleTexts.body}
            </p>
            <div className="mt-8 pt-4 border-t border-white/10 text-[10px] text-[#D4AF37]">
              50 ML e 1.7 FL. OZ.
            </div>
          </div>
        )}

        {/* 8. BANNER */}
        {activeTab === 'banner' && (
          <div className="w-full max-w-3xl mx-auto bg-gradient-to-r from-[#0B0B0F] via-[#1A1A24] to-[#0B0B0F] border border-white/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-left">
              <span style={getStyleForRole('caption')}>LIMITED EDITION BANNER</span>
              <h2 style={getStyleForRole('heading')} className="text-3xl">
                {sampleTexts.heading}
              </h2>
              <p style={getStyleForRole('subheading')} className="text-sm">
                {sampleTexts.subheading}
              </p>
            </div>
            <button
              style={{
                ...getStyleForRole('button'),
                backgroundColor: '#D4AF37',
                padding: '14px 28px',
                borderRadius: '14px',
                whiteSpace: 'nowrap',
              }}
            >
              Claim Pass
            </button>
          </div>
        )}

        {/* MOBILE APP MOCKUP */}
        {activeTab === 'mobile-app' && (
          <div className="max-w-xs mx-auto aspect-[9/18] bg-[#0A0A0E] border-4 border-slate-700/80 rounded-[40px] p-6 flex flex-col justify-between text-center shadow-2xl relative overflow-hidden ring-1 ring-white/10">
            {/* Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-b-2xl mx-auto mb-4" />
            <div className="space-y-3 my-auto">
              <span style={getStyleForRole('caption')} className="text-[10px]">
                {sampleTexts.caption}
              </span>
              <h2 style={getStyleForRole('heading')} className="text-2xl font-bold">
                {sampleTexts.heading}
              </h2>
              <p style={getStyleForRole('subheading')} className="text-xs">
                {sampleTexts.subheading}
              </p>
              <p style={getStyleForRole('body')} className="text-[11px] leading-relaxed opacity-80">
                {sampleTexts.body}
              </p>
            </div>
            <button
              style={{
                ...getStyleForRole('button'),
                backgroundColor: '#D4AF37',
                padding: '10px 18px',
                borderRadius: '12px',
                width: '100%',
              }}
            >
              {sampleTexts.button}
            </button>
          </div>
        )}

        {/* YOUTUBE THUMBNAIL MOCKUP */}
        {activeTab === 'youtube-thumbnail' && (
          <div className="w-full max-w-2xl mx-auto aspect-[16/9] bg-gradient-to-br from-[#0D0518] via-[#1A0B2E] to-[#07020C] border-2 border-[#D4AF37]/50 rounded-2xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span style={getStyleForRole('caption')} className="px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] rounded-full text-xs font-bold uppercase">
                VIRAL TYPOGRAPHY
              </span>
              <span className="text-xs font-mono text-slate-400">4K ULTRA HD</span>
            </div>
            <div className="space-y-2 my-auto text-left">
              <h1 style={getStyleForRole('heading')} className="text-4xl sm:text-5xl font-extrabold uppercase drop-shadow-lg">
                {sampleTexts.heading}
              </h1>
              <p style={getStyleForRole('subheading')} className="text-lg text-amber-300">
                {sampleTexts.subheading}
              </p>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span style={getStyleForRole('body')}>{sampleTexts.caption}</span>
              <span className="px-2 py-1 bg-red-600 text-white font-bold rounded">10:24</span>
            </div>
          </div>
        )}

        {/* T-SHIRT MOCKUP */}
        {activeTab === 't-shirt' && (
          <div className="max-w-md mx-auto aspect-[4/5] bg-[#121218] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative">
            <div className="w-28 h-8 border-b-2 border-dashed border-white/20 rounded-b-full mb-8" />
            <div className="max-w-xs space-y-4 p-6 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
              <p style={getStyleForRole('caption')} className="text-[10px] tracking-widest text-amber-400">
                PANTHER APPAREL
              </p>
              <h1 style={getStyleForRole('heading')} className="text-3xl font-extrabold uppercase">
                {sampleTexts.heading}
              </h1>
              <p style={getStyleForRole('subheading')} className="text-sm">
                {sampleTexts.subheading}
              </p>
            </div>
            <span className="mt-8 text-[10px] text-slate-500 font-mono">SILKSCREEN PRINT SPECIMEN</span>
          </div>
        )}

        {/* 9. UI DESIGN SYSTEM */}
        {activeTab === 'ui-design' && (
          <div className="w-full max-w-3xl mx-auto space-y-6 text-left">
            <div className="pb-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-[#D4AF37] uppercase">Typographic Scale & Hierarchy Specimen</span>
              <span className="text-xs text-slate-400">Design System Tokens</span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">H1 Display Heading</span>
                <h1 style={getStyleForRole('heading')}>Display Heading - Panther Studio</h1>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">H2 Subheading</span>
                <h2 style={getStyleForRole('subheading')}>Subheading Level 2 - Intelligent Typographic Pairings</h2>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Body Paragraph</span>
                <p style={getStyleForRole('body')}>{sampleTexts.body}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Caption & Meta Label</span>
                <p style={getStyleForRole('caption')}>{sampleTexts.caption}</p>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">Button CTA</span>
                  <button
                    style={{
                      ...getStyleForRole('button'),
                      backgroundColor: '#D4AF37',
                      padding: '10px 20px',
                      borderRadius: '10px',
                    }}
                  >
                    {sampleTexts.button}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
