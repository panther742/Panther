/**
 * Panther Studio — human-readable style phrases for image-generation presets.
 *
 * Shared by the SERVER prompt engines and the BROWSER direct engine, so a
 * style id like 'blog-editorial' always becomes a proper descriptive prompt
 * fragment instead of an ugly hyphenated token.
 */

export const IMAGE_STYLE_PHRASES: Record<string, string> = {
  realistic: 'ultra realistic photography',
  photorealistic: 'photorealistic 8k studio photography',
  luxury: 'premium luxury aesthetic, black and gold, elegant high-end branding',
  logo: 'vector logo mark emblem design',
  vector: 'clean flat vector illustration',
  illustration: 'artistic digital illustration',
  '3d': '3D render, octane render, isometric style',
  anime: 'vibrant Japanese anime art',
  comic: 'comic book art style',
  sketch: 'pencil sketch drawing',
  watercolor: 'soft watercolor painting',
  'oil-painting': 'classical oil painting',
  'flat-design': 'flat design style',
  sticker: 'cute sticker design',
  icon: 'minimal app icon design',
  'game-asset': 'video game asset art',
  minimal: 'minimalist design, clean typography, negative space',
  modern: 'modern contemporary design',
  gaming: 'gaming aesthetic, fantasy UI',
  corporate: 'corporate brand identity design',
  cyberpunk: 'cyberpunk, neon lighting, sci-fi',
  dark: 'dark moody aesthetic',
  neon: 'neon glow aesthetic',
  fantasy: 'fantasy epic art',
  vintage: 'vintage retro aesthetic',
  'blog-editorial':
    'elegant editorial blog typography layout with a bold serif headline, italic subtitle, clean sans-serif body text, generous white space, refined magazine article design',
  'magazine-cover':
    'magazine cover design with large impactful typography masthead, editorial photography, bold type hierarchy, professional publishing layout',
  'typography-poster':
    'modern typography poster design mixing multiple fonts, bold type composition, stylish hierarchy, graphic design artwork',
};

export function stylePhrase(stylePreset?: string): string {
  if (!stylePreset) return 'realistic';
  return IMAGE_STYLE_PHRASES[stylePreset] || `${stylePreset} style`;
}
