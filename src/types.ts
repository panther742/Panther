export type ActiveView = 'home' | 'color-studio' | 'vector-studio' | 'typo-studio' | 'image-studio' | 'script-studio' | 'psd-studio' | 'future-tools';

export type ScriptConversionMode = 'translation' | 'transliteration' | 'smart-brand' | 'auto-detect';

export type DesignerVariationStyle =
  | 'short'
  | 'premium'
  | 'luxury'
  | 'modern'
  | 'minimal'
  | 'poster'
  | 'logo'
  | 'thumbnail';

export interface ScriptLanguageOption {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  defaultFont: string;
  fontOptions: { name: string; family: string; category?: string }[];
}

export interface ScriptConversionResult {
  id: string;
  sourceText: string;
  sourceLang: string;
  targetLang: string;
  mode: ScriptConversionMode;
  primaryOutput: string;
  pronunciationGuide?: string;
  explanation?: string;
  designerVariations?: Record<DesignerVariationStyle, string>;
  timestamp: number;
  isFavorite?: boolean;
}

export interface ColorItem {
  id: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
  isLocked?: boolean;
  isFavorite?: boolean;
  name?: string;
}

export type PaletteType =
  | 'custom'
  | 'single'
  | 'complementary'
  | 'split-complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'square'
  | 'rectangle'
  | 'monochromatic'
  | 'shades'
  | 'pastel'
  | 'luxury'
  | 'earth-tone'
  | 'cyberpunk'
  | 'neon'
  | 'minimal';

export interface VectorSettings {
  threshold: number; // 0 to 255
  smoothness: number; // 0 to 5
  nodeReduction: number; // 0 to 10
  cornerThreshold: number; // 0 to 100
  outlineWidth: number; // 1 to 20
  transparentBg: boolean;
  posterizeColors: number; // 2 to 16
  colorMode: 'bw' | 'color';
  turnPolicy: 'minority' | 'majority' | 'white' | 'black';
  turdSize: number; // Noise removal threshold
  removeBackground: boolean;
}

export type VectorExportFormat = 'svg' | 'dxf' | 'eps' | 'pdf' | 'cdr';

export interface FutureTool {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge: string;
  category: string;
  features: string[];
}

/* TYPOGRAPHY TYPES */
export type FontRole = 'heading' | 'subheading' | 'body' | 'caption' | 'button' | 'navigation';

export type FontCategory = 'all' | 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace' | 'variable' | 'script';

export type PairingStyle =
  | 'modern'
  | 'minimal'
  | 'luxury'
  | 'corporate'
  | 'creative'
  | 'startup'
  | 'gaming'
  | 'technology'
  | 'fashion'
  | 'restaurant'
  | 'wedding'
  | 'elegant'
  | 'vintage'
  | 'bold'
  | 'magazine'
  | 'editorial';

export interface GoogleFont {
  family: string;
  category: FontCategory;
  variants: string[];
  subsets: string[];
  version?: string;
  lastModified?: string;
}

export interface TypographyRoleConfig {
  fontFamily: string;
  fontWeight: number;
  fontSize: number; // px
  letterSpacing: number; // px
  lineHeight: number;
  wordSpacing: number; // px
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  opacity: number;
  color: string;
  gradient?: string;
  shadow?: string;
}

export interface TypographyPairing {
  id: string;
  name: string;
  style: PairingStyle;
  roles: Record<FontRole, TypographyRoleConfig>;
  bgColor: string;
  isFavorite?: boolean;
  createdAt?: number;
}

/* AI IMAGE GENERATOR TYPES */
export type ImageStylePreset =
  | 'realistic'
  | 'illustration'
  | 'logo'
  | 'vector'
  | '3d'
  | 'anime'
  | 'comic'
  | 'sketch'
  | 'watercolor'
  | 'oil-painting'
  | 'flat-design'
  | 'sticker'
  | 'icon'
  | 'game-asset'
  | 'luxury'
  | 'minimal'
  | 'modern'
  | 'gaming'
  | 'corporate'
  | 'cyberpunk'
  | 'dark'
  | 'neon'
  | 'fantasy'
  | 'vintage'
  | 'photorealistic';

export type MediaMode = 'image' | 'gif' | 'video';

export type AspectRatioOption = '1:1' | '16:9' | '9:16' | '4:3' | '3:2' | '4:5' | '21:9';

export type VideoDurationOption = '3s' | '5s' | '8s' | '10s';
export type GifDurationOption = '2s' | '3s' | '5s' | '8s' | '10s';

export type CameraMovementOption =
  | 'none'
  | 'zoom-in'
  | 'zoom-out'
  | 'pan-left'
  | 'pan-right'
  | 'rotate'
  | 'cinematic'
  | 'slow-motion'
  | 'loop';

export type ParticleEffectOption = 'none' | 'rain' | 'fire' | 'smoke' | 'water' | 'snow' | 'sparks';

export type VideoQualityOption = 'HD' | 'Full HD' | '2K' | '4K';
export type MotionStrengthOption = 'low' | 'medium' | 'high' | 'dynamic';
export type VideoFpsOption = 24 | 30 | 60;

export interface GeneratedMediaItem {
  id: string;
  url: string; // Base64 or Data URL or video/gif URL
  mediaType: MediaMode; // 'image' | 'gif' | 'video'
  originalPrompt: string;
  optimizedPrompt: string;
  stylePreset: ImageStylePreset;
  aspectRatio: AspectRatioOption;
  createdAt: number;
  provider: string;
  width?: number;
  height?: number;
  duration?: string; // e.g. "5s"
  fps?: number; // e.g. 24, 30, 60
  resolution?: string; // e.g. "1080p", "4K", "1024x1024"
  cameraMovement?: string;
  particleEffect?: string;
  motionStrength?: MotionStrengthOption;
  loopAnimation?: boolean;
  sourceImageUrl?: string; // If Image -> Video
  isFavorite?: boolean;
  generationTimeMs?: number;
  seed?: number;
  isTransparent?: boolean;
  isUpscaled?: boolean;
  tags?: string[];
}

export type GeneratedImage = GeneratedMediaItem;

export interface MediaPromptHistory {
  id: string;
  mediaType: MediaMode;
  originalPrompt: string;
  optimizedPrompt: string;
  stylePreset: ImageStylePreset;
  aspectRatio: AspectRatioOption;
  imageCount?: number;
  duration?: string;
  provider?: string;
  timestamp: number;
  createdAt?: number;
  items: GeneratedMediaItem[];
  images?: GeneratedMediaItem[]; // For backward compatibility
}

export type ImagePromptHistory = MediaPromptHistory;

export interface UserApiKeys {
  geminiKey?: string;
  openaiKey?: string;
  stabilityKey?: string;
  replicateKey?: string;
  huggingfaceKey?: string;
  runwayKey?: string;
  lumaKey?: string;
  pikaKey?: string;
}

export interface ProviderConfig {
  activeProvider: string;
  isKeyConfigured: boolean;
  hasGeminiKey: boolean;
  hasOpenAIKey: boolean;
  hasStabilityKey: boolean;
  hasReplicateKey: boolean;
  hasHuggingFaceKey: boolean;
  hasRunwayKey?: boolean;
  hasLumaKey?: boolean;
  hasPikaKey?: boolean;
  availableProviders: string[];
}

/* TYPOGRAPHY GENERATOR TYPES */
export type TypographyCategory =
  | 'All'
  | 'Modern'
  | 'Luxury'
  | 'Minimal'
  | 'Vintage'
  | 'Retro'
  | 'Gaming'
  | 'Cyberpunk'
  | 'Neon'
  | 'Street'
  | 'Bold'
  | 'Elegant'
  | 'Signature'
  | 'Calligraphy'
  | 'Wedding'
  | 'Fashion'
  | 'Corporate'
  | 'Luxury Gold'
  | 'Chrome'
  | 'Metal'
  | 'Glass'
  | '3D'
  | 'Gradient'
  | 'Comic'
  | 'Cartoon'
  | 'Sports'
  | 'Esports'
  | 'Instagram'
  | 'YouTube'
  | 'Logo Style'
  | 'Brand Style'
  | 'Poster Style';

export type LayoutCompositionType =
  | 'standard'
  | 'stacked'
  | 'arch'
  | 'badge-framed'
  | 'pill-wrap'
  | 'ribbon-banner'
  | 'split-tone'
  | 'underline-flourish'
  | 'boxed-outline'
  | 'circle-badge'
  | 'extruded-3d'
  | 'vertical-accent'
  | 'side-lines'
  | 'crest-emblem'
  | 'neon-box'
  | 'stencil-cut';

export type BgRecommendation =
  | 'White'
  | 'Black'
  | 'Luxury Gold'
  | 'Gradient'
  | 'Glass'
  | 'Paper'
  | 'Texture'
  | 'Neon'
  | 'Dark'
  | 'Minimal';

export interface TypographyPalette {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface TypographyDesign {
  id: string;
  styleName: string;
  category: TypographyCategory;
  fontName: string;
  fontFamily: string;
  fontWeight: number;
  layout: LayoutCompositionType;
  fontSize: number; // px
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing: number; // px
  wordSpacing: number; // px
  curveAngle: number; // degrees for arching (-45 to 45)
  strokeWidth: number; // px
  strokeColor: string;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  glowColor: string;
  glowRadius: number;
  gradientFill?: string;
  opacity: number;
  rotation: number; // degrees
  alignment: 'left' | 'center' | 'right';
  palette: TypographyPalette;
  bgRecommendation: BgRecommendation;
  badgeFrame?: 'none' | 'shield' | 'circle' | 'pill' | 'rectangle' | 'diamond' | 'ribbon' | 'corner-accents' | 'double-ring' | 'hex-badge';
  tagline?: string;
  isFavorite?: boolean;
  customText?: string;
}

export type TypographyExportFormat = 'png' | 'svg' | 'pdf' | 'psd' | 'ai' | 'eps' | 'dxf' | 'cdr';



