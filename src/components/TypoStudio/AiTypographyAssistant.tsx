import React, { useState } from 'react';
import { TypographyPairing, PairingStyle, FontRole, TypographyRoleConfig } from '../../types';
import { POPULAR_GOOGLE_FONTS, loadGoogleFont } from '../../utils/fontUtils';
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  RefreshCw,
  Info,
  Palette,
  Layout,
  Layers,
  ChevronRight,
  ShieldCheck,
  Star,
  Type,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface AiTypographyAssistantProps {
  currentPairing: TypographyPairing;
  onApplyPairing: (pairing: TypographyPairing) => void;
  onSelectBackground?: (bgStyle: string) => void;
}

// Color conversion helpers
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleanHex, 16) || 0;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function hexToCmyk(hex: string): { c: number; m: number; y: number; k: number } {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

  const c = Math.round(((1 - rNorm - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gNorm - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bNorm - k) / (1 - k)) * 100);
  const kPct = Math.round(k * 100);

  return { c, m, y, k: kPct };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export const AiTypographyAssistant: React.FC<AiTypographyAssistantProps> = ({
  currentPairing,
  onApplyPairing,
  onSelectBackground,
}) => {
  // User Input State
  const [brandName, setBrandName] = useState('Panther Studio');
  const [selectedVibe, setSelectedVibe] = useState<string>('luxury');
  const [copiedColorKey, setCopiedColorKey] = useState<string | null>(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState<number>(0);
  const [selectedBgTheme, setSelectedBgTheme] = useState<string>('Dark Luxury');

  // Industry Vibe Filters
  const vibeFilters = [
    { id: 'luxury', label: 'Luxury' },
    { id: 'modern', label: 'Modern' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'creative', label: 'Creative' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'corporate', label: 'Corporate' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'technology', label: 'Technology' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
  ];

  // Quick brand prompt seeds
  const brandSeeds = [
    { name: 'Panther Studio', vibe: 'luxury' },
    { name: 'KD Graphics', vibe: 'creative' },
    { name: 'Coffee House', vibe: 'restaurant' },
    { name: 'Royal Fashion', vibe: 'fashion' },
    { name: 'Apex Tech', vibe: 'technology' },
    { name: 'Aether Gaming', vibe: 'gaming' },
  ];

  // Recommendation presets library based on vibe & variant
  const recommendationsMap: Record<
    string,
    Array<{
      title: string;
      heading: string;
      subheading: string;
      body: string;
      caption: string;
      button: string;
      navigation: string;
      explanation: string;
      palette: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        background: string;
        highlight: string;
      };
      scores: { popularity: number; readability: number; compatibility: number };
    }>
  > = {
    luxury: [
      {
        title: 'Primary AI Pair (Royal Gold)',
        heading: 'Cinzel',
        subheading: 'Cormorant Garamond',
        body: 'Plus Jakarta Sans',
        caption: 'Montserrat',
        button: 'Outfit',
        navigation: 'Inter',
        explanation:
          'Cinzel provides a regal, sculpted serif presence for the luxury display heading, while Cormorant Garamond lends editorial elegance and Plus Jakarta Sans guarantees high legibility for body text.',
        palette: {
          primary: '#D4AF37',
          secondary: '#FACC15',
          accent: '#9C7A1C',
          text: '#F8FAFC',
          background: '#0B0B0F',
          highlight: '#E2E8F0',
        },
        scores: { popularity: 98, readability: 96, compatibility: 99 },
      },
      {
        title: 'Alternative Font Pair (Modern Chic)',
        heading: 'Bodoni Moda',
        subheading: 'Spectral',
        body: 'Inter',
        caption: 'Space Grotesk',
        button: 'Poppins',
        navigation: 'Sora',
        explanation:
          'Bodoni Moda introduces high-contrast fashion elegance, balanced by Spectral for warm subheadings and Inter for crystal-clear digital reading.',
        palette: {
          primary: '#E0E7FF',
          secondary: '#818CF8',
          accent: '#4338CA',
          text: '#FFFFFF',
          background: '#09090E',
          highlight: '#C7D2FE',
        },
        scores: { popularity: 95, readability: 98, compatibility: 97 },
      },
      {
        title: 'Premium Font Pair (Editorial Prestige)',
        heading: 'Playfair Display',
        subheading: 'Lora',
        body: 'Montserrat',
        caption: 'Work Sans',
        button: 'Cabinet Grotesk',
        navigation: 'DM Sans',
        explanation:
          'Playfair Display embodies timeless luxury publishing, paired with Lora serif rhythm and Montserrat for contemporary geometric clarity.',
        palette: {
          primary: '#F59E0B',
          secondary: '#D97706',
          accent: '#78350F',
          text: '#FEF3C7',
          background: '#120F0A',
          highlight: '#FDE68A',
        },
        scores: { popularity: 99, readability: 94, compatibility: 98 },
      },
      {
        title: 'Creative Font Pair (Artisan Gold)',
        heading: 'Prata',
        subheading: 'Libre Baskerville',
        body: 'Urbanist',
        caption: 'Outfit',
        button: 'Sora',
        navigation: 'Manrope',
        explanation:
          'Prata delivers refined artistic curves for high-end boutique branding, harmonized with Libre Baskerville and Urbanist.',
        palette: {
          primary: '#E2E8F0',
          secondary: '#CBD5E1',
          accent: '#94A3B8',
          text: '#F8FAFC',
          background: '#0F172A',
          highlight: '#38BDF8',
        },
        scores: { popularity: 92, readability: 97, compatibility: 96 },
      },
    ],
    creative: [
      {
        title: 'Primary AI Pair (Avant-Garde)',
        heading: 'Syne',
        subheading: 'Clash Display',
        body: 'Plus Jakarta Sans',
        caption: 'Space Grotesk',
        button: 'Cabinet Grotesk',
        navigation: 'Inter',
        explanation:
          'Syne offers striking wide geometry for high-impact creative direction, complemented by Clash Display and clean humanistic sans-serif body text.',
        palette: {
          primary: '#EC4899',
          secondary: '#8B5CF6',
          accent: '#3B82F6',
          text: '#F8FAFC',
          background: '#0D0914',
          highlight: '#F472B6',
        },
        scores: { popularity: 96, readability: 95, compatibility: 98 },
      },
      {
        title: 'Alternative Font Pair (Studio Modern)',
        heading: 'Cabinet Grotesk',
        subheading: 'Unbounded',
        body: 'Sora',
        caption: 'Outfit',
        button: 'Space Grotesk',
        navigation: 'Manrope',
        explanation:
          'Cabinet Grotesk delivers neo-grotesque personality, paired with Unbounded display accents and Sora for agile body typography.',
        palette: {
          primary: '#10B981',
          secondary: '#06B6D4',
          accent: '#3B82F6',
          text: '#ECFDF5',
          background: '#04130E',
          highlight: '#6EE7B7',
        },
        scores: { popularity: 94, readability: 96, compatibility: 97 },
      },
    ],
    technology: [
      {
        title: 'Primary AI Pair (Futuristic Tech)',
        heading: 'Space Grotesk',
        subheading: 'Chakra Petch',
        body: 'Inter',
        caption: 'Fira Code',
        button: 'Outfit',
        navigation: 'Sora',
        explanation:
          'Space Grotesk conveys modern technical innovation, supported by Chakra Petch modular accents and Inter for code/docs clarity.',
        palette: {
          primary: '#38BDF8',
          secondary: '#818CF8',
          accent: '#0284C7',
          text: '#F0F9FF',
          background: '#080E1A',
          highlight: '#7DD3FC',
        },
        scores: { popularity: 98, readability: 99, compatibility: 99 },
      },
    ],
  };

  // Fallback defaults for any selected vibe
  const activeVariants = recommendationsMap[selectedVibe] || recommendationsMap.luxury;
  const activeRec = activeVariants[activeVariantIndex] || activeVariants[0];

  // Load Google fonts when recommendation changes
  React.useEffect(() => {
    [
      activeRec.heading,
      activeRec.subheading,
      activeRec.body,
      activeRec.caption,
      activeRec.button,
      activeRec.navigation,
    ].forEach((fam) => loadGoogleFont(fam));
  }, [activeRec]);

  // Handle applying recommendation to main state
  const handleApply = () => {
    const updated: TypographyPairing = {
      ...currentPairing,
      id: `ai-rec-${Date.now()}`,
      name: `${brandName || 'Panther'} — ${activeRec.title}`,
      bgColor: activeRec.palette.background,
      roles: {
        heading: {
          ...currentPairing.roles.heading,
          fontFamily: activeRec.heading,
          color: activeRec.palette.primary,
        },
        subheading: {
          ...currentPairing.roles.subheading,
          fontFamily: activeRec.subheading,
          color: activeRec.palette.secondary,
        },
        body: {
          ...currentPairing.roles.body,
          fontFamily: activeRec.body,
          color: activeRec.palette.text,
        },
        caption: {
          ...currentPairing.roles.caption,
          fontFamily: activeRec.caption,
          color: activeRec.palette.accent,
        },
        button: {
          ...currentPairing.roles.button,
          fontFamily: activeRec.button,
          color: '#000000',
        },
        navigation: {
          ...currentPairing.roles.navigation,
          fontFamily: activeRec.navigation,
          color: activeRec.palette.text,
        },
      },
    };
    onApplyPairing(updated);
  };

  // Background atmosphere presets
  const backgroundPresets = [
    { name: 'Black Background', bgStyle: '#09090D' },
    { name: 'White Background', bgStyle: '#FAFAFC' },
    { name: 'Dark Luxury', bgStyle: '#0D0B14' },
    { name: 'Gold Luxury', bgStyle: '#18140B' },
    { name: 'Minimal', bgStyle: '#121216' },
    {
      name: 'Gradient',
      bgStyle: 'linear-gradient(135deg, #0F0C20 0%, #1A102F 50%, #05020B 100%)',
    },
    { name: 'Glass', bgStyle: 'rgba(18, 18, 28, 0.75)' },
    { name: 'Paper Texture', bgStyle: '#F7F4EA' },
    { name: 'Corporate', bgStyle: '#0A111E' },
    { name: 'Gaming', bgStyle: '#090312' },
  ];

  const handleCopyColor = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedColorKey(key);
    setTimeout(() => setCopiedColorKey(null), 2000);
  };

  return (
    <div className="bg-[#0D0D12] border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden">
      {/* GLOW DECORATION */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#FACC15] text-black font-extrabold shadow-lg shadow-[#D4AF37]/20">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full">
                AI Typography Assistant
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Live Synthesizer
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              AI Font Pair Generator & Brand Assistant
            </h2>
            <p className="text-xs text-slate-400">
              Input a brand name or industry vibe to generate optimized font roles, color schemes, explanations & atmosphere.
            </p>
          </div>
        </div>

        {/* APPLY BUTTON */}
        <button
          onClick={handleApply}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FACC15] to-[#9C7A1C] hover:opacity-95 text-black font-extrabold text-xs shadow-xl shadow-[#D4AF37]/20 flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Apply Pair to Studio</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* BRAND NAME & VIBE INPUT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BRAND INPUT & SEEDS */}
        <div className="lg:col-span-5 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Brand / Project Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Panther Studio, KD Graphics..."
              className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/15 focus:border-[#D4AF37] text-white font-semibold text-sm outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400">Quick Brand Examples:</span>
            <div className="flex flex-wrap gap-2">
              {brandSeeds.map((seed) => (
                <button
                  key={seed.name}
                  onClick={() => {
                    setBrandName(seed.name);
                    setSelectedVibe(seed.vibe);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors"
                >
                  {seed.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* VIBE FILTERS */}
        <div className="lg:col-span-7 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Pairing Industry & Style Filters
          </label>
          <div className="flex flex-wrap gap-2">
            {vibeFilters.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedVibe(v.id);
                  setActiveVariantIndex(0);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedVibe === v.id
                    ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VARIANT TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        <span className="text-xs font-bold uppercase text-[#D4AF37] mr-2 flex items-center gap-1">
          <Sliders className="w-4 h-4" />
          <span>AI Variations:</span>
        </span>
        {activeVariants.map((varItem, idx) => (
          <button
            key={idx}
            onClick={() => setActiveVariantIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeVariantIndex === idx
                ? 'bg-white text-black shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {varItem.title}
          </button>
        ))}
      </div>

      {/* GENERATED FONT ROLES GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Type className="w-4 h-4 text-[#D4AF37]" />
            <span>AI Recommended Font Hierarchy</span>
          </h3>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Popularity: {activeRec.scores.popularity}%</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400">Readability: {activeRec.scores.readability}%</span>
            <span>•</span>
            <span className="text-sky-400">Compatibility: {activeRec.scores.compatibility}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { role: 'Heading', font: activeRec.heading, weight: '700/800 Bold' },
            { role: 'Subheading', font: activeRec.subheading, weight: '500 Medium' },
            { role: 'Body', font: activeRec.body, weight: '400 Regular' },
            { role: 'Caption', font: activeRec.caption, weight: '600 SemiBold' },
            { role: 'Button', font: activeRec.button, weight: '700 Bold' },
            { role: 'Navigation', font: activeRec.navigation, weight: '500 Medium' },
          ].map((item) => (
            <div
              key={item.role}
              className="p-4 rounded-2xl bg-black/50 border border-white/10 hover:border-[#D4AF37]/50 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-full border border-[#D4AF37]/20">
                  {item.role}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{item.weight}</span>
              </div>
              <p
                className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate"
                style={{ fontFamily: `'${item.font}', sans-serif` }}
              >
                {item.font}
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
                <span>Google Fonts</span>
                <a
                  href={`https://fonts.google.com/specimen/${item.font.replace(/\s+/g, '+')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] flex items-center gap-1"
                >
                  <span>Specimen</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI EXPLANATION BOX */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#D4AF37]/10 via-black/40 to-[#D4AF37]/5 border border-[#D4AF37]/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
          <Info className="w-4 h-4" />
          <span>AI Harmony & Rationale</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-sans">
          {activeRec.explanation}
        </p>
      </div>

      {/* COLOR RECOMMENDATION ENGINE */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#D4AF37]" />
          <span>AI Generated Harmony Color Palette</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(activeRec.palette).map(([colorKey, hexValue]) => {
            const rgbVal = hexToRgb(hexValue);
            const cmykVal = hexToCmyk(hexValue);
            const hslVal = hexToHsl(hexValue);

            const rgbStr = `rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`;
            const cmykStr = `cmyk(${cmykVal.c}%, ${cmykVal.m}%, ${cmykVal.y}%, ${cmykVal.k}%)`;
            const hslStr = `hsl(${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%)`;

            return (
              <div
                key={colorKey}
                className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-3 relative group"
              >
                {/* COLOR SWATCH */}
                <div
                  className="w-full h-12 rounded-xl shadow-inner border border-white/20 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: hexValue }}
                />

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block capitalize">
                    {colorKey}
                  </span>
                  <span className="text-xs font-bold text-white font-mono block">{hexValue}</span>
                </div>

                {/* COPY FORMATS BUTTONS */}
                <div className="space-y-1 pt-1 border-t border-white/5 text-[10px] font-mono text-slate-400">
                  <button
                    onClick={() => handleCopyColor(`${colorKey}-hex`, hexValue)}
                    className="w-full flex items-center justify-between p-1 rounded hover:bg-white/10 text-slate-300"
                  >
                    <span>HEX</span>
                    {copiedColorKey === `${colorKey}-hex` ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500" />
                    )}
                  </button>

                  <button
                    onClick={() => handleCopyColor(`${colorKey}-rgb`, rgbStr)}
                    className="w-full flex items-center justify-between p-1 rounded hover:bg-white/10 text-slate-300 truncate"
                    title={rgbStr}
                  >
                    <span>RGB</span>
                    {copiedColorKey === `${colorKey}-rgb` ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500" />
                    )}
                  </button>

                  <button
                    onClick={() => handleCopyColor(`${colorKey}-cmyk`, cmykStr)}
                    className="w-full flex items-center justify-between p-1 rounded hover:bg-white/10 text-slate-300 truncate"
                    title={cmykStr}
                  >
                    <span>CMYK</span>
                    {copiedColorKey === `${colorKey}-cmyk` ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500" />
                    )}
                  </button>

                  <button
                    onClick={() => handleCopyColor(`${colorKey}-hsl`, hslStr)}
                    className="w-full flex items-center justify-between p-1 rounded hover:bg-white/10 text-slate-300 truncate"
                    title={hslStr}
                  >
                    <span>HSL</span>
                    {copiedColorKey === `${colorKey}-hsl` ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BACKGROUND ATMOSPHERE RECOMMENDATION */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Layout className="w-4 h-4 text-[#D4AF37]" />
          <span>Recommended Background Atmosphere</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {backgroundPresets.map((bg) => (
            <button
              key={bg.name}
              onClick={() => {
                setSelectedBgTheme(bg.name);
                if (onSelectBackground) onSelectBackground(bg.bgStyle);
              }}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedBgTheme === bg.name
                  ? 'border-[#D4AF37] ring-1 ring-[#D4AF37] scale-105'
                  : 'border-white/10 hover:border-white/30'
              }`}
              style={{ background: bg.bgStyle }}
            >
              <span className="text-xs font-bold text-white drop-shadow block">{bg.name}</span>
              <span className="text-[10px] text-slate-400 block font-mono">Atmosphere</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
