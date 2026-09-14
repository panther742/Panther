import React, { useState } from 'react';
import { TypographyDesign } from '../../types';
import { hexToColorDetails } from '../../utils/typographyPresets';
import { Download, Heart, Edit3, Sparkles, Check, Copy } from 'lucide-react';

interface TypographyCardProps {
  design: TypographyDesign;
  userText: string;
  onEdit: (design: TypographyDesign) => void;
  onDownload: (design: TypographyDesign) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}

export const TypographyCard: React.FC<TypographyCardProps> = ({
  design,
  userText,
  onEdit,
  onDownload,
  onToggleFavorite,
  isFavorite,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [showColorInfo, setShowColorInfo] = useState<boolean>(false);

  const displayText = design.customText || userText || 'Panther Studio';

  const primaryDetails = hexToColorDetails(design.palette.primaryColor);
  const secondaryDetails = hexToColorDetails(design.palette.secondaryColor);
  const accentDetails = hexToColorDetails(design.palette.accentColor);
  const bgDetails = hexToColorDetails(design.palette.backgroundColor);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // Render Layout / Branding Inspiration Gallery Concept Composition
  const renderComposition = () => {
    // ---- AUTO FONT MIX: dedicated multi-font composition ----
    // Renders 2-3 stacked parts, each with its OWN font family, weight,
    // size, transform and color — the stylish + unique + simple mix.
    if (design.mixedFonts && design.mixedFonts.length > 0) {
      const scale = 0.32; // design space 800x400 → card preview
      return (
        <div
          className="w-full relative p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 overflow-hidden"
          style={{ backgroundColor: design.palette.backgroundColor }}
        >
          {/* subtle radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 20%, ${design.palette.primaryColor}22, transparent 65%)`,
            }}
          />
          {design.mixedFonts.map((part, idx) => {
            const align = part.align || 'center';
            return (
              <span
                key={`${design.id}-mix-${idx}`}
                className="relative block leading-tight w-full px-2"
                style={{
                  fontFamily: `"${part.fontFamily}", sans-serif`,
                  fontWeight: part.fontWeight,
                  fontSize: `${Math.min(34, Math.max(9, part.fontSize * scale))}px`,
                  letterSpacing: `${part.letterSpacing * scale}px`,
                  textTransform: part.textTransform,
                  color: part.colorHex,
                  textAlign: align,
                  textShadow:
                    design.shadowBlur > 0
                      ? `${design.shadowOffsetX}px ${design.shadowOffsetY}px ${design.shadowBlur}px ${design.shadowColor}`
                      : undefined,
                }}
              >
                {part.text}
              </span>
            );
          })}

          {/* corner mix badge */}
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#00D8FF]/15 border border-[#00D8FF]/40 text-[8px] font-mono font-extrabold tracking-wider text-[#5FFFF7] uppercase">
            {design.mixedFonts.length}-Font Mix
          </span>

          {/* font chips */}
          <div className="relative mt-1 flex flex-wrap items-center justify-center gap-1">
            {design.mixedFonts.map((part, idx) => (
              <span
                key={`${design.id}-chip-${idx}`}
                className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[7px] font-mono text-white/60"
              >
                {part.fontFamily}
              </span>
            ))}
          </div>
        </div>
      );
    }

    const textStyle: React.CSSProperties = {
      fontFamily: `"${design.fontFamily}", sans-serif`,
      fontWeight: design.fontWeight,
      fontSize: `${Math.min(30, Math.max(18, design.fontSize))}px`,
      letterSpacing: `${design.letterSpacing}px`,
      wordSpacing: `${design.wordSpacing}px`,
      textTransform: design.textTransform,
      opacity: design.opacity,
      transform: `rotate(${design.rotation}deg)`,
      textAlign: design.alignment,
      color: design.gradientFill ? 'transparent' : design.palette.primaryColor,
      backgroundImage: design.gradientFill || undefined,
      WebkitBackgroundClip: design.gradientFill ? 'text' : undefined,
      WebkitTextFillColor: design.gradientFill ? 'transparent' : undefined,
      WebkitTextStroke:
        design.strokeWidth > 0 ? `${design.strokeWidth}px ${design.strokeColor}` : undefined,
      textShadow:
        design.glowRadius > 0
          ? `0 0 ${design.glowRadius}px ${design.glowColor}, ${design.shadowOffsetX}px ${design.shadowOffsetY}px ${design.shadowBlur}px ${design.shadowColor}`
          : `${design.shadowOffsetX}px ${design.shadowOffsetY}px ${design.shadowBlur}px ${design.shadowColor}`,
    };

    const secondaryTextStyle: React.CSSProperties = {
      fontFamily: `"${fontPairName}", sans-serif`,
      color: design.palette.secondaryColor,
    };

    const categoryLower = design.category.toLowerCase();
    const layoutLower = design.layout.toLowerCase();

    // Determine Gallery Concept Template Type
    let conceptType:
      | 'youtube'
      | 'magazine'
      | 'luxury'
      | 'packaging'
      | 'poster'
      | 'cyber'
      | 'instagram'
      | 'streetwear'
      | 'corporate' = 'corporate';

    if (
      categoryLower.includes('youtube') ||
      categoryLower.includes('gaming') ||
      categoryLower.includes('esports') ||
      categoryLower.includes('sports') ||
      categoryLower.includes('comic') ||
      categoryLower.includes('cartoon') ||
      layoutLower === 'neon-box' ||
      layoutLower === 'extruded-3d'
    ) {
      conceptType = 'youtube';
    } else if (
      categoryLower.includes('magazine') ||
      categoryLower.includes('fashion') ||
      categoryLower.includes('elegant') ||
      categoryLower.includes('wedding') ||
      layoutLower === 'ribbon-banner' ||
      layoutLower === 'side-lines'
    ) {
      conceptType = 'magazine';
    } else if (
      categoryLower.includes('luxury') ||
      categoryLower.includes('logo') ||
      categoryLower.includes('brand style') ||
      categoryLower.includes('gold') ||
      categoryLower.includes('chrome') ||
      categoryLower.includes('metal') ||
      layoutLower === 'crest-emblem' ||
      layoutLower === 'double-ring' ||
      layoutLower === 'circle-badge'
    ) {
      conceptType = 'luxury';
    } else if (
      categoryLower.includes('vintage') ||
      categoryLower.includes('retro') ||
      categoryLower.includes('calligraphy') ||
      categoryLower.includes('signature') ||
      layoutLower === 'arch' ||
      layoutLower === 'badge-framed' ||
      layoutLower === 'pill-wrap'
    ) {
      conceptType = 'packaging';
    } else if (
      categoryLower.includes('poster') ||
      categoryLower.includes('modern') ||
      categoryLower.includes('minimal') ||
      layoutLower === 'vertical-accent' ||
      layoutLower === 'boxed-outline'
    ) {
      conceptType = 'poster';
    } else if (
      categoryLower.includes('cyberpunk') ||
      categoryLower.includes('neon') ||
      categoryLower.includes('3d') ||
      categoryLower.includes('glass') ||
      layoutLower === 'stencil-cut' ||
      layoutLower === 'hex-badge'
    ) {
      conceptType = 'cyber';
    } else if (categoryLower.includes('instagram') || categoryLower.includes('social')) {
      conceptType = 'instagram';
    } else if (categoryLower.includes('street') || categoryLower.includes('bold')) {
      conceptType = 'streetwear';
    }

    // Badge frame wrappers
    let frameClasses = 'w-full flex flex-col items-center justify-center p-3 relative';
    if (design.badgeFrame === 'shield') {
      frameClasses += ' border border-[#00D8FF]/40 bg-[#0E1628]/80 rounded-2xl shadow-xl';
    } else if (design.badgeFrame === 'circle') {
      frameClasses += ' border border-[#5FFFF7]/40 rounded-full bg-[#0E1628]/90 shadow-2xl py-6';
    } else if (design.badgeFrame === 'pill') {
      frameClasses += ' border border-[#00D8FF]/50 rounded-full bg-[#0E1628]/80 shadow-lg px-6';
    } else if (design.badgeFrame === 'rectangle') {
      frameClasses += ' border border-[#00D8FF]/30 bg-[#111C30]/80 rounded-xl';
    } else if (design.badgeFrame === 'diamond') {
      frameClasses += ' border border-[#5FFFF7]/50 bg-[#0E1628]/90 shadow-2xl rounded-xl';
    } else if (design.badgeFrame === 'corner-accents') {
      frameClasses += ' border-x-2 border-[#00D8FF]/60 bg-[#0E1628]/80 rounded-xl';
    } else if (design.badgeFrame === 'double-ring') {
      frameClasses += ' border-2 border-[#D4AF37]/50 ring-2 ring-[#D4AF37]/20 rounded-2xl bg-[#060B16]';
    } else if (design.badgeFrame === 'hex-badge') {
      frameClasses += ' border border-[#00D8FF] bg-[#0E1628]/90 shadow-[0_0_20px_rgba(0,216,255,0.25)] rounded-2xl';
    }

    // 1. YOUTUBE THUMBNAIL TITLE CONCEPT
    if (conceptType === 'youtube') {
      return (
        <div className="w-full relative p-3 rounded-2xl bg-[#060B16]/90 border border-[#FF0055]/30 shadow-2xl flex flex-col justify-between overflow-hidden group/yt">
          {/* Action Header Tag */}
          <div className="flex items-center justify-between text-[9px] font-mono font-extrabold tracking-wider border-b border-[#FF0055]/20 pb-1.5 mb-2">
            <span className="flex items-center gap-1 text-[#FF0055] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#FF0055] animate-pulse inline-block" />
              YOUTUBE THUMBNAIL • 4K
            </span>
            <span className="text-[#C9D4E5]/70">EPISODE 01</span>
          </div>

          {/* Title Composition */}
          <div className={`${frameClasses} my-1`}>
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#00D8FF]/80 mb-1" style={secondaryTextStyle}>
              MUST WATCH NOW
            </span>
            <span style={textStyle} className="leading-tight block my-0.5">
              {displayText}
            </span>
            {design.tagline && (
              <span className="text-[10px] font-semibold text-white/90 bg-[#FF0055]/80 px-2 py-0.5 rounded mt-1.5 shadow">
                {design.tagline}
              </span>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-[8px] font-mono text-[#C9D4E5]/60 pt-1.5 border-t border-[#FF0055]/15 mt-2">
            <span>▶ 120K VIEWS</span>
            <span className="text-[#00D8FF] font-bold">1080p60 • FULL HD</span>
          </div>
        </div>
      );
    }

    // 2. EDITORIAL MAGAZINE COVER CONCEPT
    if (conceptType === 'magazine') {
      return (
        <div className="w-full relative p-3.5 rounded-2xl bg-[#0B101D]/90 border border-white/20 shadow-2xl flex flex-col justify-between">
          <div className="text-center border-b border-white/15 pb-1 mb-2">
            <span className="text-[10px] font-extrabold tracking-[0.25em] text-white uppercase block">
              VOGUE EDITORIAL
            </span>
            <span className="text-[8px] font-mono text-[#5FFFF7] tracking-widest block mt-0.5">
              ISSUE N° 42 • ART & DESIGN
            </span>
          </div>

          <div className={`${frameClasses} my-1`}>
            <span className="text-[9px] italic text-[#C9D4E5]/80 mb-1 block" style={secondaryTextStyle}>
              The New Movement in
            </span>
            <span style={textStyle} className="leading-tight block">
              {displayText}
            </span>
            <p className="text-[9px] tracking-wide text-[#C9D4E5]/70 mt-1 uppercase font-mono">
              {design.tagline || 'EXCLUSIVITY & CREATIVE DIRECTION'}
            </p>
          </div>

          <div className="flex items-center justify-between text-[8px] font-mono text-white/60 border-t border-white/10 pt-1.5 mt-2">
            <span>ISSUE 04</span>
            <span>$12.00 • BARCODE 978-0-201</span>
          </div>
        </div>
      );
    }

    // 3. LUXURY BRANDING LOGO & CREST CONCEPT
    if (conceptType === 'luxury') {
      return (
        <div className="w-full relative p-3.5 rounded-2xl bg-[#090D16]/95 border border-[#D4AF37]/40 shadow-2xl flex flex-col items-center justify-between text-center">
          <div className="flex items-center gap-1 text-[8px] font-mono text-[#D4AF37] tracking-widest uppercase mb-1">
            <span>★</span>
            <span>HAUTE COUTURE BRANDING</span>
            <span>★</span>
          </div>

          <div className={`${frameClasses} my-1`}>
            <div className="w-6 h-6 rounded-full border border-[#D4AF37]/60 flex items-center justify-center text-[10px] text-[#D4AF37] font-bold mb-1 shadow-md">
              P
            </div>
            <span style={textStyle} className="leading-tight block my-0.5">
              {displayText}
            </span>
            <span className="text-[9px] tracking-[0.2em] font-mono uppercase text-[#D4AF37]/90 mt-1" style={secondaryTextStyle}>
              {design.tagline || 'PARIS • NEW YORK • TOKYO'}
            </span>
          </div>

          <div className="text-[8px] font-mono text-[#D4AF37]/70 border-t border-[#D4AF37]/20 pt-1.5 w-full flex justify-between">
            <span>EST. 2026</span>
            <span>REGISTERED TRADEMARK ®</span>
          </div>
        </div>
      );
    }

    // 4. VINTAGE PACKAGING & LABEL CONCEPT
    if (conceptType === 'packaging') {
      return (
        <div className="w-full relative p-3 rounded-2xl bg-[#140E0A]/95 border-2 border-[#F59E0B]/40 shadow-2xl flex flex-col justify-between text-center">
          <div className="text-[8px] font-mono text-[#F59E0B] tracking-widest uppercase border-b border-[#F59E0B]/20 pb-1 mb-1.5">
            ★ ORIGINAL CRAFT LABEL ★
          </div>

          <div className={`${frameClasses} my-1`}>
            <span style={textStyle} className="leading-tight block my-0.5">
              {displayText}
            </span>
            <span className="text-[9px] font-serif text-[#FDE68A]/80 tracking-wider mt-1 block" style={secondaryTextStyle}>
              {design.tagline || '100% AUTHENTIC CRAFT EDITION'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[8px] font-mono text-[#F59E0B]/70 border-t border-[#F59E0B]/20 pt-1.5 mt-1">
            <span>350 ML / 12 FL OZ</span>
            <span>BATCH N° 884-B</span>
          </div>
        </div>
      );
    }

    // 5. EXHIBITION POSTER CONCEPT
    if (conceptType === 'poster') {
      return (
        <div className="w-full relative p-3.5 rounded-2xl bg-[#060B16] border border-[#00D8FF]/40 shadow-2xl flex flex-col justify-between text-left">
          <div className="flex justify-between items-center text-[8px] font-mono text-[#00D8FF] tracking-widest uppercase border-b border-[#00D8FF]/20 pb-1 mb-2">
            <span>EXHIBITION POSTER</span>
            <span>AUG 2026</span>
          </div>

          <div className={`${frameClasses} my-1 items-start text-left`}>
            <span className="text-[9px] font-mono font-bold text-[#5FFFF7] uppercase tracking-wider block mb-1" style={secondaryTextStyle}>
              GRAPHIC DESIGN FESTIVAL
            </span>
            <span style={{ ...textStyle, textAlign: 'left' }} className="leading-tight block">
              {displayText}
            </span>
            <p className="text-[9px] font-mono text-[#C9D4E5]/70 mt-1 uppercase">
              {design.tagline || 'METROPOLITAN GALLERY SHOW'}
            </p>
          </div>

          <div className="flex justify-between items-center text-[8px] font-mono text-white/50 border-t border-white/10 pt-1.5 mt-2">
            <span>HALL A • BOOTH 402</span>
            <span className="text-[#00D8FF]">TICKETS OPEN</span>
          </div>
        </div>
      );
    }

    // 6. CYBERPUNK & NEON LOGO CONCEPT
    if (conceptType === 'cyber') {
      return (
        <div className="w-full relative p-3 rounded-2xl bg-[#040711] border border-[#5FFFF7]/50 shadow-[0_0_25px_rgba(0,216,255,0.2)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[8px] font-mono text-[#5FFFF7] tracking-wider border-b border-[#5FFFF7]/20 pb-1 mb-2">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5FFFF7] animate-ping inline-block" />
              SYSTEM ONLINE
            </span>
            <span>v2.04</span>
          </div>

          <div className={`${frameClasses} my-1`}>
            <span style={textStyle} className="leading-tight block my-0.5">
              {displayText}
            </span>
            <span className="text-[9px] font-mono text-[#00D8FF] tracking-widest mt-1 block" style={secondaryTextStyle}>
              {design.tagline || '// DIRECT VECTOR COMPUTE ENGINE'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[8px] font-mono text-[#5FFFF7]/60 border-t border-[#5FFFF7]/15 pt-1.5 mt-2">
            <span>LATENCY: 0ms</span>
            <span>VOLTAGE: 240V</span>
          </div>
        </div>
      );
    }

    // 7. STREETWEAR BRANDING CONCEPT
    if (conceptType === 'streetwear') {
      return (
        <div className="w-full relative p-3 rounded-2xl bg-[#0B0F19] border-2 border-yellow-400/50 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[8px] font-mono font-bold text-yellow-400 tracking-wider border-b border-yellow-400/20 pb-1 mb-2">
            <span>URBAN STREETWEAR</span>
            <span>LIMITED EDITION</span>
          </div>

          <div className={`${frameClasses} my-1`}>
            <span style={textStyle} className="leading-tight block my-0.5">
              {displayText}
            </span>
            <span className="text-[9px] font-mono text-slate-300 tracking-widest uppercase mt-1 block" style={secondaryTextStyle}>
              {design.tagline || '100% HEAVYWEIGHT COTTON'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[8px] font-mono text-yellow-400/80 border-t border-yellow-400/20 pt-1.5 mt-2">
            <span>BARCODE 4 006381</span>
            <span>LOT #9042</span>
          </div>
        </div>
      );
    }

    // 8. CORPORATE BRAND IDENTITY CONCEPT (DEFAULT)
    return (
      <div className="w-full relative p-3.5 rounded-2xl bg-[#0E1628]/95 border border-[#00D8FF]/30 shadow-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-[8px] font-mono text-[#00D8FF] tracking-wider border-b border-[#00D8FF]/20 pb-1 mb-2">
          <span>BRAND SPECIFICATION</span>
          <span>48PT SPEC</span>
        </div>

        <div className={`${frameClasses} my-1`}>
          <span style={textStyle} className="leading-tight block my-0.5">
            {displayText}
          </span>
          <span className="text-[9px] font-mono text-[#5FFFF7] tracking-widest uppercase mt-1 block" style={secondaryTextStyle}>
            {design.tagline || 'PRIMARY BRANDING & LOGOTYPE SYSTEM'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[8px] font-mono text-[#C9D4E5]/60 border-t border-[#00D8FF]/15 pt-1.5 mt-2">
          <span>PANTHER DESIGN v3.0</span>
          <span>VECTOR MASTER</span>
        </div>
      </div>
    );
  };

  // Compute visual stage background based on bgRecommendation and palette
  const getStageBackground = () => {
    const bgRec = design.bgRecommendation;
    const bg = design.palette.backgroundColor;
    if (bgRec === 'Black') return { backgroundColor: '#000000' };
    if (bgRec === 'White') return { backgroundColor: '#FFFFFF', color: '#000000' };
    if (bgRec === 'Luxury Gold') return { background: `radial-gradient(circle at center, #1B150A 0%, ${bg} 100%)` };
    if (bgRec === 'Neon') return { background: `radial-gradient(circle at center, rgba(0, 216, 255, 0.18) 0%, ${bg} 85%)` };
    if (bgRec === 'Gradient') return { background: `linear-gradient(135deg, ${bg} 0%, #111C30 50%, ${bg} 100%)` };
    if (bgRec === 'Glass') return { background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`, backdropFilter: 'blur(10px)' };
    if (bgRec === 'Paper') return { background: `radial-gradient(circle at center, #1A212E 0%, ${bg} 100%)` };
    if (bgRec === 'Texture') return { background: `repeating-linear-gradient(45deg, ${bg}, ${bg} 10px, #0B101D 10px, #0B101D 20px)` };
    return { backgroundColor: bg };
  };

  // Determine font pairing text
  const fontPairName =
    design.fontFamily === 'Cinzel'
      ? 'Montserrat'
      : design.fontFamily === 'Playfair Display'
      ? 'Inter'
      : design.fontFamily === 'Bebas Neue'
      ? 'Roboto'
      : design.fontFamily === 'Unbounded'
      ? 'Space Grotesk'
      : 'Outfit';

  return (
    <div
      className="group relative rounded-[18px] bg-[#111C30]/80 border border-[#00D8FF]/20 hover:border-[#00D8FF] transition-all duration-300 shadow-xl hover:shadow-[#00D8FF]/20 overflow-hidden flex flex-col justify-between"
      id={`typo-card-${design.id}`}
    >
      {/* CARD TOP BAR */}
      <div className="p-4 border-b border-[#00D8FF]/15 flex items-center justify-between bg-[#0E1628]/60">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#00D8FF]/15 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
            {design.category}
          </span>
          <span className="text-[11px] font-semibold text-white/90 truncate max-w-[140px]" title={design.styleName}>
            {design.styleName}
          </span>
        </div>

        <button
          onClick={() => onToggleFavorite(design.id)}
          className={`p-2 rounded-xl transition-colors ${
            isFavorite
              ? 'bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/40'
              : 'bg-[#111C30] hover:bg-[#060B16] text-[#C9D4E5]/70 hover:text-white border border-[#00D8FF]/20'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          id={`fav-btn-${design.id}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#FF0055]' : ''}`} />
        </button>
      </div>

      {/* PREVIEW DISPLAY STAGE */}
      <div
        className="relative min-h-[200px] p-6 flex items-center justify-center overflow-hidden border-b border-[#00D8FF]/15 transition-all"
        style={getStageBackground()}
      >
        {renderComposition()}
      </div>

      {/* FONT & DESIGN METADATA */}
      <div className="p-4 space-y-3 bg-[#0E1628]/40">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-[#C9D4E5]/60 font-mono block">FONT FAMILY & WEIGHT</span>
            <span className="font-bold text-white block truncate">{design.fontFamily}</span>
            <span className="text-[10px] text-[#00D8FF] font-mono">
              Weight: {design.fontWeight}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#C9D4E5]/60 font-mono block">FONT PAIR</span>
            <span className="font-semibold text-[#5FFFF7] block truncate">{fontPairName}</span>
            <span className="text-[10px] text-[#C9D4E5]/70 font-mono">Secondary</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#00D8FF]/10">
          <span className="text-[10px] text-[#C9D4E5]/60 font-mono uppercase">STYLE CATEGORY</span>
          <span className="text-[11px] font-bold text-white">{design.category}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] text-[#C9D4E5]/60 font-mono uppercase">BACKGROUND REC</span>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-[#00D8FF]/10 text-[#5FFFF7] border border-[#00D8FF]/30 rounded">
            {design.bgRecommendation}
          </span>
        </div>

        {/* COLOR PALETTE SWATCHES & DETAIL ACCORDION */}
        <div className="pt-2 border-t border-[#00D8FF]/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#C9D4E5]/60 uppercase">
              AI Color Palette
            </span>
            <button
              onClick={() => setShowColorInfo(!showColorInfo)}
              className="text-[10px] font-bold text-[#00D8FF] hover:underline"
            >
              {showColorInfo ? 'Hide Details' : 'View HEX / RGB / CMYK'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[
              { label: 'Primary', hex: design.palette.primaryColor },
              { label: 'Secondary', hex: design.palette.secondaryColor },
              { label: 'Accent', hex: design.palette.accentColor },
              { label: 'Text/BG', hex: design.palette.backgroundColor },
            ].map((swatch) => (
              <div
                key={swatch.label}
                onClick={() => handleCopyHex(swatch.hex)}
                className="group/swatch relative h-8 rounded-lg border border-white/20 cursor-pointer transition-transform hover:scale-105 flex flex-col items-center justify-end p-0.5"
                style={{ backgroundColor: swatch.hex }}
                title={`Click to copy ${swatch.label}: ${swatch.hex}`}
              >
                <span className="text-[8px] font-mono font-bold bg-black/70 px-1 rounded text-white opacity-80 group-hover/swatch:opacity-100">
                  {swatch.hex}
                </span>
                <div className="opacity-0 group-hover/swatch:opacity-100 absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg text-[9px] font-mono text-white">
                  {copiedHex === swatch.hex ? <Check className="w-3.5 h-3.5 text-[#5FFFF7]" /> : swatch.hex}
                </div>
              </div>
            ))}
          </div>

          {/* DETAILED COLOR CODE EXPANSION */}
          {showColorInfo && (
            <div className="mt-3 p-3 rounded-xl bg-[#060B16] border border-[#00D8FF]/20 space-y-1.5 text-[10px] font-mono animate-fade-in">
              <div className="flex justify-between items-center text-[#C9D4E5]">
                <span>PRIMARY ({primaryDetails.hex}):</span>
                <span className="text-[#5FFFF7]">{primaryDetails.rgb}</span>
              </div>
              <div className="flex justify-between items-center text-[#C9D4E5]">
                <span>SECONDARY ({secondaryDetails.hex}):</span>
                <span className="text-[#00D8FF]">{secondaryDetails.rgb}</span>
              </div>
              <div className="flex justify-between items-center text-[#C9D4E5]">
                <span>ACCENT ({accentDetails.hex}):</span>
                <span className="text-[#28B8FF]">{accentDetails.rgb}</span>
              </div>
              <div className="flex justify-between items-center text-[#C9D4E5]">
                <span>CMYK:</span>
                <span className="text-[#00D8FF]">{primaryDetails.cmyk}</span>
              </div>
              <div className="flex justify-between items-center text-[#C9D4E5]">
                <span>HSL:</span>
                <span className="text-[#00D8FF]">{primaryDetails.hsl}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACTION FOOTER */}
      <div className="p-4 border-t border-[#00D8FF]/15 bg-[#0E1628]/80 flex items-center gap-2">
        <button
          onClick={() => onEdit(design)}
          className="flex-1 py-2.5 rounded-xl bg-[#111C30] hover:bg-[#060B16] text-[#C9D4E5] hover:text-white border border-[#00D8FF]/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          id={`edit-btn-${design.id}`}
        >
          <Edit3 className="w-3.5 h-3.5 text-[#00D8FF]" />
          <span>Live Editor</span>
        </button>

        <button
          onClick={() => onDownload(design)}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00D8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-xs shadow-md shadow-[#00D8FF]/20 flex items-center justify-center gap-1.5 transition-all"
          id={`download-btn-${design.id}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
