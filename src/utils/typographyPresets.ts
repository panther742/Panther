import { TypographyCategory, TypographyDesign, BgRecommendation, LayoutCompositionType } from '../types';
import { loadGoogleFont } from './fontUtils';

export const TYPOGRAPHY_CATEGORIES: TypographyCategory[] = [
  'All',
  'Modern',
  'Luxury',
  'Minimal',
  'Vintage',
  'Retro',
  'Gaming',
  'Cyberpunk',
  'Neon',
  'Street',
  'Bold',
  'Elegant',
  'Signature',
  'Calligraphy',
  'Wedding',
  'Fashion',
  'Corporate',
  'Luxury Gold',
  'Chrome',
  'Metal',
  'Glass',
  '3D',
  'Gradient',
  'Comic',
  'Cartoon',
  'Sports',
  'Esports',
  'Instagram',
  'YouTube',
  'Logo Style',
  'Brand Style',
  'Poster Style',
];

// Rich set of curated Google Fonts with weights and categories
const DESIGN_FONTS = [
  { name: 'Cinzel', family: 'Cinzel', weights: [400, 700, 900], category: 'Luxury' },
  { name: 'Playfair Display', family: 'Playfair Display', weights: [400, 700, 900], category: 'Elegant' },
  { name: 'Unbounded', family: 'Unbounded', weights: [400, 700, 900], category: 'Cyberpunk' },
  { name: 'Syne', family: 'Syne', weights: [400, 700, 800], category: 'Modern' },
  { name: 'Bebas Neue', family: 'Bebas Neue', weights: [400], category: 'Bold' },
  { name: 'Chakra Petch', family: 'Chakra Petch', weights: [400, 700], category: 'Gaming' },
  { name: 'Great Vibes', family: 'Great Vibes', weights: [400], category: 'Calligraphy' },
  { name: 'Righteous', family: 'Righteous', weights: [400], category: 'Retro' },
  { name: 'Space Grotesk', family: 'Space Grotesk', weights: [400, 700], category: 'Minimal' },
  { name: 'Abril Fatface', family: 'Abril Fatface', weights: [400], category: 'Vintage' },
  { name: 'Outfit', family: 'Outfit', weights: [400, 700, 900], category: 'Modern' },
  { name: 'Bodoni Moda', family: 'Bodoni Moda', weights: [400, 700, 900], category: 'Fashion' },
  { name: 'Russo One', family: 'Russo One', weights: [400], category: 'Esports' },
  { name: 'Dancing Script', family: 'Dancing Script', weights: [400, 700], category: 'Signature' },
  { name: 'Montserrat', family: 'Montserrat', weights: [300, 600, 800, 900], category: 'Corporate' },
  { name: 'Bungee', family: 'Bungee', weights: [400], category: 'Cartoon' },
  { name: 'Alex Brush', family: 'Alex Brush', weights: [400], category: 'Wedding' },
  { name: 'Clash Display', family: 'Clash Display', weights: [400, 600, 700], category: 'Logo Style' },
  { name: 'Urbanist', family: 'Urbanist', weights: [300, 600, 800], category: 'Instagram' },
  { name: 'JetBrains Mono', family: 'JetBrains Mono', weights: [400, 700], category: 'Cyberpunk' },
  { name: 'Ultra', family: 'Ultra', weights: [400], category: 'Street' },
  { name: 'Cormorant Garamond', family: 'Cormorant Garamond', weights: [400, 700], category: 'Luxury Gold' },
  { name: 'Prata', family: 'Prata', weights: [400], category: 'Brand Style' },
  { name: 'Cabinet Grotesk', family: 'Cabinet Grotesk', weights: [400, 800, 900], category: 'Poster Style' },
  { name: 'Staatliches', family: 'Staatliches', weights: [400], category: 'Sports' },
];

// Helper to convert hex to RGB/CMYK/HSL
export function hexToColorDetails(hex: string) {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;

  // HSL
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

  // CMYK
  let k = 1 - Math.max(rNorm, gNorm, bNorm);
  let c = (1 - rNorm - k) / (1 - k) || 0;
  let m = (1 - gNorm - k) / (1 - k) || 0;
  let y = (1 - bNorm - k) / (1 - k) || 0;
  if (isNaN(c)) c = 0;
  if (isNaN(m)) m = 0;
  if (isNaN(y)) y = 0;
  if (isNaN(k)) k = 1;

  return {
    hex: `#${cleanHex.toUpperCase()}`,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
    cmyk: `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`,
  };
}

// Preset Blueprints for diversity across 32 categories
interface StyleBlueprint {
  styleName: string;
  category: TypographyCategory;
  fontFamily: string;
  fontWeight: number;
  layout: LayoutCompositionType;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing: number;
  wordSpacing: number;
  curveAngle: number;
  strokeWidth: number;
  strokeColor: string;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  glowColor: string;
  glowRadius: number;
  gradientFill?: string;
  opacity: number;
  rotation: number;
  alignment: 'left' | 'center' | 'right';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  bgRecommendation: BgRecommendation;
  badgeFrame?: 'none' | 'shield' | 'circle' | 'pill' | 'rectangle' | 'diamond' | 'ribbon' | 'corner-accents' | 'double-ring' | 'hex-badge';
  tagline?: string;
}

const STYLE_BLUEPRINTS: StyleBlueprint[] = [
  // LUXURY BLUE & CYAN
  {
    styleName: 'Imperial Electric Crest',
    category: 'Luxury Gold',
    fontFamily: 'Cinzel',
    fontWeight: 900,
    layout: 'crest-emblem',
    textTransform: 'uppercase',
    letterSpacing: 6,
    wordSpacing: 2,
    curveAngle: 0,
    strokeWidth: 1,
    strokeColor: '#5FFFF7',
    shadowColor: 'rgba(0, 216, 255, 0.4)',
    shadowBlur: 15,
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    glowColor: '#00D8FF',
    glowRadius: 10,
    gradientFill: 'linear-gradient(135deg, #5FFFF7 0%, #00D8FF 50%, #0055FF 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#5FFFF7',
    accentColor: '#28B8FF',
    backgroundColor: '#060B16',
    textColor: '#FFFFFF',
    bgRecommendation: 'Luxury Gold',
    badgeFrame: 'double-ring',
    tagline: 'EST. 2026 • ELECTRIC EDITION',
  },
  {
    styleName: 'Monarch Cyan Serif',
    category: 'Luxury',
    fontFamily: 'Playfair Display',
    fontWeight: 900,
    layout: 'ribbon-banner',
    textTransform: 'uppercase',
    letterSpacing: 4,
    wordSpacing: 1,
    curveAngle: 0,
    strokeWidth: 0,
    strokeColor: 'transparent',
    shadowColor: 'rgba(0, 216, 255, 0.3)',
    shadowBlur: 20,
    shadowOffsetX: 0,
    shadowOffsetY: 6,
    glowColor: '#00D8FF',
    glowRadius: 12,
    gradientFill: 'linear-gradient(135deg, #00E5FF 0%, #009DFF 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#5FFFF7',
    accentColor: '#28B8FF',
    backgroundColor: '#0A0F1D',
    textColor: '#FFFFFF',
    bgRecommendation: 'Dark',
    badgeFrame: 'corner-accents',
    tagline: 'PREMIUM BRANDING STUDIO',
  },

  // CYBERPUNK & NEON
  {
    styleName: 'Cyberpunk Neon Pulse',
    category: 'Cyberpunk',
    fontFamily: 'Unbounded',
    fontWeight: 900,
    layout: 'neon-box',
    textTransform: 'uppercase',
    letterSpacing: 3,
    wordSpacing: 2,
    curveAngle: 0,
    strokeWidth: 2,
    strokeColor: '#00D8FF',
    shadowColor: '#00D8FF',
    shadowBlur: 25,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    glowColor: '#5FFFF7',
    glowRadius: 20,
    gradientFill: 'linear-gradient(90deg, #5FFFF7 0%, #00D8FF 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#5FFFF7',
    accentColor: '#FF0055',
    backgroundColor: '#040711',
    textColor: '#FFFFFF',
    bgRecommendation: 'Neon',
    badgeFrame: 'hex-badge',
    tagline: 'SYSTEM ONLINE • v2.0',
  },
  {
    styleName: 'Tokyo Street Neon',
    category: 'Neon',
    fontFamily: 'Chakra Petch',
    fontWeight: 700,
    layout: 'stacked',
    textTransform: 'uppercase',
    letterSpacing: 5,
    wordSpacing: 3,
    curveAngle: 0,
    strokeWidth: 1,
    strokeColor: '#FF007F',
    shadowColor: '#FF007F',
    shadowBlur: 30,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    glowColor: '#FF007F',
    glowRadius: 25,
    gradientFill: 'linear-gradient(135deg, #FF007F 0%, #00D8FF 100%)',
    opacity: 1,
    rotation: -2,
    alignment: 'center',
    primaryColor: '#FF007F',
    secondaryColor: '#00D8FF',
    accentColor: '#5FFFF7',
    backgroundColor: '#060B16',
    textColor: '#FFFFFF',
    bgRecommendation: 'Black',
    badgeFrame: 'rectangle',
    tagline: 'FUTURE SOUND & LIGHT',
  },

  // 3D & CHROME & METAL
  {
    styleName: 'Liquid Chrome Metallic',
    category: 'Chrome',
    fontFamily: 'Syne',
    fontWeight: 800,
    layout: 'extruded-3d',
    textTransform: 'uppercase',
    letterSpacing: 2,
    wordSpacing: 1,
    curveAngle: 0,
    strokeWidth: 2,
    strokeColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.8)',
    shadowBlur: 10,
    shadowOffsetX: 4,
    shadowOffsetY: 8,
    glowColor: '#00D8FF',
    glowRadius: 8,
    gradientFill: 'linear-gradient(180deg, #FFFFFF 0%, #94A3B8 50%, #1E293B 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#E2E8F0',
    accentColor: '#28B8FF',
    backgroundColor: '#080E1B',
    textColor: '#FFFFFF',
    bgRecommendation: 'Dark',
    badgeFrame: 'shield',
    tagline: 'HIGH GLOSS FINISH',
  },
  {
    styleName: 'Industrial Heavy Metal',
    category: 'Metal',
    fontFamily: 'Russo One',
    fontWeight: 400,
    layout: 'boxed-outline',
    textTransform: 'uppercase',
    letterSpacing: 4,
    wordSpacing: 2,
    curveAngle: 0,
    strokeWidth: 3,
    strokeColor: '#00D8FF',
    shadowColor: 'rgba(0, 216, 255, 0.5)',
    shadowBlur: 12,
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    glowColor: '#00D8FF',
    glowRadius: 10,
    gradientFill: 'linear-gradient(135deg, #E2E8F0 0%, #64748B 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#64748B',
    accentColor: '#5FFFF7',
    backgroundColor: '#0B1220',
    textColor: '#FFFFFF',
    bgRecommendation: 'Glass',
    badgeFrame: 'rectangle',
    tagline: 'PRECISION CNC & CUT',
  },

  // VINTAGE & RETRO
  {
    styleName: 'Vintage Barber Stamp',
    category: 'Vintage',
    fontFamily: 'Abril Fatface',
    fontWeight: 400,
    layout: 'circle-badge',
    textTransform: 'uppercase',
    letterSpacing: 3,
    wordSpacing: 1,
    curveAngle: 15,
    strokeWidth: 1,
    strokeColor: '#00D8FF',
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowBlur: 8,
    shadowOffsetX: 2,
    shadowOffsetY: 4,
    glowColor: 'transparent',
    glowRadius: 0,
    gradientFill: undefined,
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#28B8FF',
    accentColor: '#5FFFF7',
    backgroundColor: '#0E1628',
    textColor: '#F8FAFC',
    bgRecommendation: 'Paper',
    badgeFrame: 'circle',
    tagline: 'QUALITY GUARANTEED',
  },
  {
    styleName: '80s Synthwave Retro',
    category: 'Retro',
    fontFamily: 'Righteous',
    fontWeight: 400,
    layout: 'arch',
    textTransform: 'uppercase',
    letterSpacing: 4,
    wordSpacing: 2,
    curveAngle: -20,
    strokeWidth: 2,
    strokeColor: '#FF007F',
    shadowColor: '#00D8FF',
    shadowBlur: 15,
    shadowOffsetX: 4,
    shadowOffsetY: 4,
    glowColor: '#FF007F',
    glowRadius: 15,
    gradientFill: 'linear-gradient(180deg, #5FFFF7 0%, #FF007F 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#FF007F',
    secondaryColor: '#5FFFF7',
    accentColor: '#00D8FF',
    backgroundColor: '#060B16',
    textColor: '#FFFFFF',
    bgRecommendation: 'Gradient',
    badgeFrame: 'pill',
    tagline: 'RETRO FUTURE WAVE',
  },

  // GAMING & ESPORTS
  {
    styleName: 'Apex Esports Emblem',
    category: 'Esports',
    fontFamily: 'Bebas Neue',
    fontWeight: 400,
    layout: 'badge-framed',
    textTransform: 'uppercase',
    letterSpacing: 6,
    wordSpacing: 2,
    curveAngle: 0,
    strokeWidth: 3,
    strokeColor: '#00D8FF',
    shadowColor: '#00D8FF',
    shadowBlur: 20,
    shadowOffsetX: 0,
    shadowOffsetY: 5,
    glowColor: '#5FFFF7',
    glowRadius: 15,
    gradientFill: 'linear-gradient(135deg, #00D8FF 0%, #0055FF 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#5FFFF7',
    accentColor: '#FF0055',
    backgroundColor: '#080E1B',
    textColor: '#FFFFFF',
    bgRecommendation: 'Dark',
    badgeFrame: 'shield',
    tagline: 'PRO DIVISION LEAGUE',
  },
  {
    styleName: 'Pixel Gaming Arcade',
    category: 'Gaming',
    fontFamily: 'Chakra Petch',
    fontWeight: 700,
    layout: 'side-lines',
    textTransform: 'uppercase',
    letterSpacing: 3,
    wordSpacing: 1,
    curveAngle: 0,
    strokeWidth: 1,
    strokeColor: '#5FFFF7',
    shadowColor: '#00D8FF',
    shadowBlur: 12,
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    glowColor: '#00D8FF',
    glowRadius: 10,
    gradientFill: 'linear-gradient(90deg, #5FFFF7 0%, #00D8FF 50%, #3B82F6 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#5FFFF7',
    accentColor: '#A855F7',
    backgroundColor: '#060B16',
    textColor: '#FFFFFF',
    bgRecommendation: 'Neon',
    badgeFrame: 'pill',
    tagline: 'PRESS START TO PLAY',
  },

  // MINIMAL & MODERN
  {
    styleName: 'Swiss Minimal Grid',
    category: 'Minimal',
    fontFamily: 'Space Grotesk',
    fontWeight: 700,
    layout: 'standard',
    textTransform: 'none',
    letterSpacing: -1,
    wordSpacing: 0,
    curveAngle: 0,
    strokeWidth: 0,
    strokeColor: 'transparent',
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    glowColor: 'transparent',
    glowRadius: 0,
    gradientFill: undefined,
    opacity: 1,
    rotation: 0,
    alignment: 'left',
    primaryColor: '#00D8FF',
    secondaryColor: '#C9D4E5',
    accentColor: '#5FFFF7',
    backgroundColor: '#0B1220',
    textColor: '#FFFFFF',
    bgRecommendation: 'Minimal',
    badgeFrame: 'none',
    tagline: 'ARCHITECTURE & DESIGN',
  },
  {
    styleName: 'Avant-Garde Studio',
    category: 'Modern',
    fontFamily: 'Outfit',
    fontWeight: 800,
    layout: 'split-tone',
    textTransform: 'uppercase',
    letterSpacing: 4,
    wordSpacing: 1,
    curveAngle: 0,
    strokeWidth: 1,
    strokeColor: '#00D8FF',
    shadowColor: 'rgba(0, 216, 255, 0.2)',
    shadowBlur: 10,
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    glowColor: '#00D8FF',
    glowRadius: 5,
    gradientFill: 'linear-gradient(135deg, #FFFFFF 0%, #00D8FF 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#FFFFFF',
    accentColor: '#5FFFF7',
    backgroundColor: '#080E1B',
    textColor: '#FFFFFF',
    bgRecommendation: 'Glass',
    badgeFrame: 'rectangle',
    tagline: 'CREATIVE LABS 2026',
  },

  // ELEGANT, SIGNATURE & CALLIGRAPHY
  {
    styleName: 'Royal Silk Signature',
    category: 'Signature',
    fontFamily: 'Dancing Script',
    fontWeight: 700,
    layout: 'underline-flourish',
    textTransform: 'capitalize',
    letterSpacing: 2,
    wordSpacing: 1,
    curveAngle: 0,
    strokeWidth: 0,
    strokeColor: 'transparent',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowBlur: 10,
    shadowOffsetX: 2,
    shadowOffsetY: 4,
    glowColor: '#5FFFF7',
    glowRadius: 8,
    gradientFill: 'linear-gradient(135deg, #5FFFF7 0%, #00D8FF 100%)',
    opacity: 1,
    rotation: -3,
    alignment: 'center',
    primaryColor: '#5FFFF7',
    secondaryColor: '#00D8FF',
    accentColor: '#28B8FF',
    backgroundColor: '#0A0F1D',
    textColor: '#FFFFFF',
    bgRecommendation: 'Glass',
    badgeFrame: 'none',
    tagline: 'Haute Couture Edition',
  },
  {
    styleName: 'Grand Calligraphy Monogram',
    category: 'Calligraphy',
    fontFamily: 'Great Vibes',
    fontWeight: 400,
    layout: 'circle-badge',
    textTransform: 'capitalize',
    letterSpacing: 3,
    wordSpacing: 2,
    curveAngle: 10,
    strokeWidth: 0,
    strokeColor: 'transparent',
    shadowColor: 'rgba(0, 216, 255, 0.3)',
    shadowBlur: 15,
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    glowColor: '#00D8FF',
    glowRadius: 10,
    gradientFill: 'linear-gradient(135deg, #FFFFFF 0%, #00D8FF 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#FFFFFF',
    accentColor: '#5FFFF7',
    backgroundColor: '#060B16',
    textColor: '#FFFFFF',
    bgRecommendation: 'Luxury Gold',
    badgeFrame: 'circle',
    tagline: 'Handcrafted Perfection',
  },
  {
    styleName: 'Romantic Wedding Bliss',
    category: 'Wedding',
    fontFamily: 'Alex Brush',
    fontWeight: 400,
    layout: 'crest-emblem',
    textTransform: 'capitalize',
    letterSpacing: 2,
    wordSpacing: 1,
    curveAngle: 0,
    strokeWidth: 0,
    strokeColor: 'transparent',
    shadowColor: 'rgba(0, 216, 255, 0.3)',
    shadowBlur: 10,
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    glowColor: '#00D8FF',
    glowRadius: 6,
    gradientFill: 'linear-gradient(135deg, #FFF 0%, #5FFFF7 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#5FFFF7',
    accentColor: '#28B8FF',
    backgroundColor: '#0B101D',
    textColor: '#FFFFFF',
    bgRecommendation: 'White',
    badgeFrame: 'double-ring',
    tagline: 'Save The Date • 2026',
  },

  // STREET, BOLD & POSTER
  {
    styleName: 'Street Underground Stencil',
    category: 'Street',
    fontFamily: 'Ultra',
    fontWeight: 400,
    layout: 'stencil-cut',
    textTransform: 'uppercase',
    letterSpacing: 4,
    wordSpacing: 2,
    curveAngle: 0,
    strokeWidth: 2,
    strokeColor: '#00D8FF',
    shadowColor: '#000000',
    shadowBlur: 8,
    shadowOffsetX: 5,
    shadowOffsetY: 5,
    glowColor: '#00D8FF',
    glowRadius: 12,
    gradientFill: 'linear-gradient(180deg, #00D8FF 0%, #0055FF 100%)',
    opacity: 1,
    rotation: -4,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#0055FF',
    accentColor: '#5FFFF7',
    backgroundColor: '#050914',
    textColor: '#FFFFFF',
    bgRecommendation: 'Dark',
    badgeFrame: 'pill',
    tagline: 'URBAN CULTURE & ARTS',
  },
  {
    styleName: 'Impact Headline Heavy',
    category: 'Bold',
    fontFamily: 'Bebas Neue',
    fontWeight: 400,
    layout: 'stacked',
    textTransform: 'uppercase',
    letterSpacing: 5,
    wordSpacing: 2,
    curveAngle: 0,
    strokeWidth: 0,
    strokeColor: 'transparent',
    shadowColor: 'rgba(0, 216, 255, 0.4)',
    shadowBlur: 15,
    shadowOffsetX: 4,
    shadowOffsetY: 4,
    glowColor: '#00D8FF',
    glowRadius: 10,
    gradientFill: 'linear-gradient(135deg, #00D8FF 0%, #5FFFF7 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#5FFFF7',
    accentColor: '#3B82F6',
    backgroundColor: '#080E1B',
    textColor: '#FFFFFF',
    bgRecommendation: 'Black',
    badgeFrame: 'corner-accents',
    tagline: 'WORLDWIDE RELEASE',
  },

  // SPORTS & COMIC & CARTOON
  {
    styleName: 'Slam Dunk Varsity Sports',
    category: 'Sports',
    fontFamily: 'Staatliches',
    fontWeight: 400,
    layout: 'arch',
    textTransform: 'uppercase',
    letterSpacing: 6,
    wordSpacing: 2,
    curveAngle: -15,
    strokeWidth: 2,
    strokeColor: '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.8)',
    shadowBlur: 10,
    shadowOffsetX: 4,
    shadowOffsetY: 6,
    glowColor: '#00D8FF',
    glowRadius: 8,
    gradientFill: 'linear-gradient(180deg, #00D8FF 0%, #0088FF 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#FFFFFF',
    accentColor: '#28B8FF',
    backgroundColor: '#070D1A',
    textColor: '#FFFFFF',
    bgRecommendation: 'Dark',
    badgeFrame: 'shield',
    tagline: 'CHAMPIONS LEAGUE 2026',
  },
  {
    styleName: 'Bouncy Pop Cartoon',
    category: 'Cartoon',
    fontFamily: 'Bungee',
    fontWeight: 400,
    layout: 'pill-wrap',
    textTransform: 'uppercase',
    letterSpacing: 2,
    wordSpacing: 1,
    curveAngle: 0,
    strokeWidth: 3,
    strokeColor: '#060B16',
    shadowColor: '#00D8FF',
    shadowBlur: 0,
    shadowOffsetX: 5,
    shadowOffsetY: 5,
    glowColor: '#5FFFF7',
    glowRadius: 10,
    gradientFill: 'linear-gradient(135deg, #5FFFF7 0%, #00D8FF 100%)',
    opacity: 1,
    rotation: 2,
    alignment: 'center',
    primaryColor: '#5FFFF7',
    secondaryColor: '#00D8FF',
    accentColor: '#FF007F',
    backgroundColor: '#0E1628',
    textColor: '#060B16',
    bgRecommendation: 'Gradient',
    badgeFrame: 'pill',
    tagline: 'FUN & PLAYFUL ADVENTURES',
  },

  // LOGO STYLE, BRAND STYLE & POSTER STYLE
  {
    styleName: 'Monogram Brand Emblem',
    category: 'Logo Style',
    fontFamily: 'Clash Display',
    fontWeight: 700,
    layout: 'badge-framed',
    textTransform: 'uppercase',
    letterSpacing: 5,
    wordSpacing: 2,
    curveAngle: 0,
    strokeWidth: 1,
    strokeColor: '#00D8FF',
    shadowColor: 'rgba(0, 216, 255, 0.25)',
    shadowBlur: 16,
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    glowColor: '#00D8FF',
    glowRadius: 10,
    gradientFill: 'linear-gradient(135deg, #00D8FF 0%, #5FFFF7 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#5FFFF7',
    accentColor: '#3B82F6',
    backgroundColor: '#080E1B',
    textColor: '#FFFFFF',
    bgRecommendation: 'Glass',
    badgeFrame: 'diamond',
    tagline: 'ORIGINAL BRAND IDENTITIES',
  },
  {
    styleName: 'Vogue Fashion Brand',
    category: 'Fashion',
    fontFamily: 'Bodoni Moda',
    fontWeight: 900,
    layout: 'vertical-accent',
    textTransform: 'uppercase',
    letterSpacing: 8,
    wordSpacing: 3,
    curveAngle: 0,
    strokeWidth: 0,
    strokeColor: 'transparent',
    shadowColor: 'rgba(0,0,0,0.6)',
    shadowBlur: 12,
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    glowColor: 'transparent',
    glowRadius: 0,
    gradientFill: undefined,
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#FFFFFF',
    secondaryColor: '#00D8FF',
    accentColor: '#28B8FF',
    backgroundColor: '#060B16',
    textColor: '#FFFFFF',
    bgRecommendation: 'Minimal',
    badgeFrame: 'corner-accents',
    tagline: 'PARIS • MILAN • NEW YORK',
  },
  {
    styleName: 'Poster Headline Display',
    category: 'Poster Style',
    fontFamily: 'Cabinet Grotesk',
    fontWeight: 900,
    layout: 'stacked',
    textTransform: 'uppercase',
    letterSpacing: 2,
    wordSpacing: 1,
    curveAngle: 0,
    strokeWidth: 2,
    strokeColor: '#00D8FF',
    shadowColor: 'rgba(0, 216, 255, 0.4)',
    shadowBlur: 20,
    shadowOffsetX: 0,
    shadowOffsetY: 6,
    glowColor: '#00D8FF',
    glowRadius: 15,
    gradientFill: 'linear-gradient(180deg, #FFFFFF 0%, #00D8FF 100%)',
    opacity: 1,
    rotation: 0,
    alignment: 'center',
    primaryColor: '#00D8FF',
    secondaryColor: '#FFFFFF',
    accentColor: '#5FFFF7',
    backgroundColor: '#080E1B',
    textColor: '#FFFFFF',
    bgRecommendation: 'Dark',
    badgeFrame: 'rectangle',
    tagline: 'LIVE IN CONCERT 2026',
  },
];

/**
 * Main AI Generator Function
 * Generates 50, 100, or 200 completely unique typography design compositions!
 */
export function generateTypographyDesigns(
  userText: string = 'Panther Studio',
  targetCount: number = 50,
  selectedCategory: TypographyCategory = 'All',
  searchQuery: string = ''
): TypographyDesign[] {
  const normalizedText = userText.trim() || 'Panther Studio';
  const query = searchQuery.trim().toLowerCase();

  const generatedList: TypographyDesign[] = [];

  // Generate varied compositions up to targetCount
  for (let i = 0; i < targetCount; i++) {
    const blueprintIndex = i % STYLE_BLUEPRINTS.length;
    const baseBP = STYLE_BLUEPRINTS[blueprintIndex];
    const fontObj = DESIGN_FONTS[i % DESIGN_FONTS.length];

    // Load font dynamically
    loadGoogleFont(fontObj.family, fontObj.weights);

    // Dynamic variation algorithms
    const layoutVariations: LayoutCompositionType[] = [
      'standard',
      'stacked',
      'arch',
      'badge-framed',
      'pill-wrap',
      'ribbon-banner',
      'split-tone',
      'underline-flourish',
      'boxed-outline',
      'circle-badge',
      'extruded-3d',
      'vertical-accent',
      'side-lines',
      'crest-emblem',
      'neon-box',
      'stencil-cut',
    ];
    const computedLayout = layoutVariations[i % layoutVariations.length];

    const badges: Array<StyleBlueprint['badgeFrame']> = [
      'none',
      'shield',
      'circle',
      'pill',
      'rectangle',
      'diamond',
      'ribbon',
      'corner-accents',
      'double-ring',
      'hex-badge',
    ];
    const computedBadge = badges[i % badges.length];

    // 20+ Distinct Professional Color Combinations as requested
    const COLOR_COMBINATIONS = [
      // Black + Cyan
      { primary: '#00D8FF', secondary: '#5FFFF7', accent: '#007BFF', bg: '#060B16', text: '#FFFFFF', bgRec: 'Dark' },
      // White + Blue
      { primary: '#38BDF8', secondary: '#00D8FF', accent: '#60A5FA', bg: '#0A1128', text: '#FFFFFF', bgRec: 'Gradient' },
      // Gold + Black
      { primary: '#D4AF37', secondary: '#FDE68A', accent: '#9C7A1C', bg: '#090D16', text: '#FFFFFF', bgRec: 'Luxury Gold' },
      // Purple + Pink
      { primary: '#E056FD', secondary: '#FF79C6', accent: '#BD93F9', bg: '#0D0714', text: '#FFFFFF', bgRec: 'Neon' },
      // Orange + White
      { primary: '#FF7A00', secondary: '#FFB800', accent: '#FFD600', bg: '#0F0C08', text: '#FFFFFF', bgRec: 'Paper' },
      // Red + White
      { primary: '#FF2A5F', secondary: '#FF6B8B', accent: '#FF80A0', bg: '#0F0A0D', text: '#FFFFFF', bgRec: 'Black' },
      // Green + Black
      { primary: '#00E676', secondary: '#69F0AE', accent: '#00B0FF', bg: '#050F0A', text: '#FFFFFF', bgRec: 'Dark' },
      // Blue + White
      { primary: '#2979FF', secondary: '#80D8FF', accent: '#A7F3D0', bg: '#080E1B', text: '#FFFFFF', bgRec: 'Glass' },
      // Silver + Dark Gray
      { primary: '#E2E8F0', secondary: '#94A3B8', accent: '#CBD5E1', bg: '#0F172A', text: '#FFFFFF', bgRec: 'Minimal' },
      // Emerald + Gold
      { primary: '#10B981', secondary: '#F59E0B', accent: '#34D399', bg: '#06120E', text: '#FFFFFF', bgRec: 'Luxury Gold' },
      // Sunset Coral
      { primary: '#FF5252', secondary: '#FF7A00', accent: '#FFD700', bg: '#140A0D', text: '#FFFFFF', bgRec: 'Texture' },
      // Midnight Chrome
      { primary: '#5FFFF7', secondary: '#E2E8F0', accent: '#818CF8', bg: '#0B0F19', text: '#FFFFFF', bgRec: 'Glass' },
      // Crimson Gold
      { primary: '#EF4444', secondary: '#F59E0B', accent: '#FCA5A5', bg: '#18090C', text: '#FFFFFF', bgRec: 'Dark' },
      // Cyber Neon
      { primary: '#00F0FF', secondary: '#FF007F', accent: '#FFE600', bg: '#060512', text: '#FFFFFF', bgRec: 'Neon' },
      // Royal Violet
      { primary: '#8B5CF6', secondary: '#A78BFA', accent: '#F472B6', bg: '#0F0B1A', text: '#FFFFFF', bgRec: 'Gradient' },
      // Electric Indigo
      { primary: '#6366F1', secondary: '#A5B4FC', accent: '#38BDF8', bg: '#0A0D1B', text: '#FFFFFF', bgRec: 'Dark' },
      // Champagne Luxe
      { primary: '#F59E0B', secondary: '#FDE68A', accent: '#D4AF37', bg: '#120E09', text: '#FFFFFF', bgRec: 'Luxury Gold' },
      // Rose Gold
      { primary: '#FB7185', secondary: '#FECDD3', accent: '#F43F5E', bg: '#160B0E', text: '#FFFFFF', bgRec: 'Minimal' },
      // Mint Turquoise
      { primary: '#2DD4BF', secondary: '#99F6E4', accent: '#38BDF8', bg: '#061213', text: '#FFFFFF', bgRec: 'Glass' },
      // Obsidian Diamond
      { primary: '#F8FAFC', secondary: '#E2E8F0', accent: '#00D8FF', bg: '#080C14', text: '#FFFFFF', bgRec: 'Black' },
    ];

    const combo = COLOR_COMBINATIONS[i % COLOR_COMBINATIONS.length];
    const primaryColor = combo.primary;
    const secondaryColor = combo.secondary;
    const accentColor = combo.accent;
    const backgroundColor = combo.bg;
    const textColor = combo.text;
    const computedBgRec = (combo.bgRec as BgRecommendation) || 'Dark';

    const designCategory = TYPOGRAPHY_CATEGORIES[(i % (TYPOGRAPHY_CATEGORIES.length - 1)) + 1];

    const getCategoryTagline = (cat: string, index: number) => {
      const c = cat.toLowerCase();
      if (c.includes('youtube') || c.includes('gaming') || c.includes('esports')) {
        const tags = ['MUST WATCH NOW • 1080p60', 'EPISODE 01 • OFFICIAL THUMBNAIL', '4K GAMING TITLE • SEASON 05', 'EPIC TRAILER TITLE • 4K HD'];
        return tags[index % tags.length];
      }
      if (c.includes('magazine') || c.includes('fashion') || c.includes('editorial') || c.includes('elegant')) {
        const tags = ['SUMMER EDITORIAL ISSUE', 'HAUTE ART DIRECTION 2026', 'EXCLUSIVITY & CULTURE', 'THE NEW DESIGN MOVEMENT'];
        return tags[index % tags.length];
      }
      if (c.includes('luxury') || c.includes('gold') || c.includes('brand')) {
        const tags = ['PARIS • NEW YORK • MILAN', 'HAUTE COUTURE BRANDING', 'EST. 2026 • ROYAL EDITION', 'REGISTERED TRADEMARK ®'];
        return tags[index % tags.length];
      }
      if (c.includes('poster') || c.includes('modern') || c.includes('minimal')) {
        const tags = ['METROPOLITAN GALLERY SHOW', 'INTERNATIONAL GRAPHIC FESTIVAL', 'AUGUST 15–30 • TICKETS LIVE', 'ABSTRACT ART DIRECTION'];
        return tags[index % tags.length];
      }
      if (c.includes('cyber') || c.includes('neon') || c.includes('3d')) {
        const tags = ['SYSTEM ONLINE • v2.04', '// DIRECT VECTOR COMPUTE ENGINE', 'HIGH VOLTAGE • MATRIX CORE', 'CYBERNETIC INTERFACE'];
        return tags[index % tags.length];
      }
      if (c.includes('vintage') || c.includes('retro') || c.includes('packaging')) {
        const tags = ['100% AUTHENTIC CRAFT EDITION', 'SMALL BATCH TRADITIONAL', 'FINEST INGREDIENTS • EST 2026', 'ORIGINAL BRANDING LABEL'];
        return tags[index % tags.length];
      }
      if (c.includes('instagram') || c.includes('social')) {
        const tags = ['@panther.studio • SHARE & SAVE', 'CAROUSEL 01/05 • SWIPE UP', 'DAILY TYPOGRAPHIC INSPIRATION', 'CREATIVE COMMUNITY'];
        return tags[index % tags.length];
      }
      if (c.includes('street') || c.includes('bold')) {
        const tags = ['HEAVYWEIGHT APPAREL LABELS', '100% COMBED COTTON • TOKYO', 'URBAN STREETWEAR CO.', 'LIMITED EDITION DROP'];
        return tags[index % tags.length];
      }
      const defaultTags = ['PRIMARY BRANDING & LOGOTYPE', 'VECTOR MASTER DESIGN SYSTEM', 'CREATIVE TYPOGRAPHY SPEC', 'PREMIUM BRAND IDENTITY'];
      return defaultTags[index % defaultTags.length];
    };

    const design: TypographyDesign = {
      id: `typo-gen-${i + 1}-${Date.now()}`,
      styleName: `${designCategory} ${fontObj.name} #${i + 1}`,
      category: designCategory,
      fontName: fontObj.name,
      fontFamily: fontObj.family,
      fontWeight: fontObj.weights[(i + Math.floor(i / 3)) % fontObj.weights.length],
      layout: computedLayout,
      fontSize: 36 + (i % 24),
      textTransform: i % 3 === 0 ? 'uppercase' : i % 3 === 1 ? 'capitalize' : 'none',
      letterSpacing: (i % 8) * 1.5,
      wordSpacing: (i % 4) * 1,
      curveAngle: computedLayout === 'arch' ? (i % 2 === 0 ? 20 : -20) : 0,
      strokeWidth: i % 4 === 0 ? 2 : 0,
      strokeColor: primaryColor,
      shadowColor: 'rgba(0, 216, 255, 0.35)',
      shadowBlur: (i % 5) * 4 + 4,
      shadowOffsetX: (i % 3) * 2,
      shadowOffsetY: (i % 3) * 3 + 2,
      glowColor: i % 2 === 0 ? primaryColor : 'transparent',
      glowRadius: (i % 4) * 5,
      gradientFill:
        i % 2 === 0
          ? `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`
          : undefined,
      opacity: 1,
      rotation: i % 11 === 0 ? (i % 2 === 0 ? 3 : -3) : 0,
      alignment: i % 4 === 0 ? 'left' : 'center',
      palette: {
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
      },
      bgRecommendation: computedBgRec,
      badgeFrame: computedBadge,
      tagline: getCategoryTagline(designCategory, i),
      customText: normalizedText,
    };

    // Filter matching
    const matchesCategory =
      selectedCategory === 'All' ||
      design.category.toLowerCase() === selectedCategory.toLowerCase() ||
      baseBP.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      !query ||
      design.styleName.toLowerCase().includes(query) ||
      design.category.toLowerCase().includes(query) ||
      design.fontName.toLowerCase().includes(query) ||
      design.layout.toLowerCase().includes(query) ||
      design.bgRecommendation.toLowerCase().includes(query);

    if (matchesCategory && matchesSearch) {
      generatedList.push(design);
    }
  }

  return generatedList;
}
