/**
 * Shared PSD reconstruction types + bounding-box utilities.
 * Kept dependency-free so BOTH the server (Node) and the browser bundle
 * (PSDStudio / psdBuilder) can import from here without pulling in
 * server-only modules (Jimp, @google/genai).
 */

// Clamp bounding box values into the safe 0-1000 normalized space
export function clampBBox(bbox: [number, number, number, number]): [number, number, number, number] {
  const [ymin, xmin, ymax, xmax] = bbox;
  const cYmin = Math.max(0, Math.min(1000, ymin));
  const cXmin = Math.max(0, Math.min(1000, xmin));
  const cYmax = Math.max(cYmin + 1, Math.min(1000, ymax));
  const cXmax = Math.max(cXmin + 1, Math.min(1000, xmax));
  return [cYmin, cXmin, cYmax, cXmax];
}

// Utility helper to robustly parse and normalize bounding boxes from AI JSON or fallback models
export function normalizeBBox(
  raw: any,
  fallback: [number, number, number, number] = [0, 0, 1000, 1000]
): [number, number, number, number] {
  if (!raw) return fallback;

  // 1. Array case: e.g. [ymin, xmin, ymax, xmax]
  if (Array.isArray(raw)) {
    if (raw.length >= 4) {
      const n0 = Number(raw[0]);
      const n1 = Number(raw[1]);
      const n2 = Number(raw[2]);
      const n3 = Number(raw[3]);
      if (!isNaN(n0) && !isNaN(n1) && !isNaN(n2) && !isNaN(n3)) {
        return clampBBox([n0, n1, n2, n3]);
      }
    }
    return fallback;
  }

  // 2. Object case: e.g. { ymin: 10, xmin: 20, ymax: 100, xmax: 200 } or { top, left, bottom, right }
  if (typeof raw === 'object') {
    if (Array.isArray(raw.box_2d)) {
      return normalizeBBox(raw.box_2d, fallback);
    }
    if (Array.isArray(raw.bbox)) {
      return normalizeBBox(raw.bbox, fallback);
    }
    const ymin = raw.ymin ?? raw.top ?? raw.y1 ?? raw.y ?? fallback[0];
    const xmin = raw.xmin ?? raw.left ?? raw.x1 ?? raw.x ?? fallback[1];
    const ymax = raw.ymax ?? raw.bottom ?? raw.y2 ?? (raw.height !== undefined ? Number(ymin) + Number(raw.height) : fallback[2]);
    const xmax = raw.xmax ?? raw.right ?? raw.x2 ?? (raw.width !== undefined ? Number(xmin) + Number(raw.width) : fallback[3]);

    const n0 = Number(ymin);
    const n1 = Number(xmin);
    const n2 = Number(ymax);
    const n3 = Number(xmax);

    if (!isNaN(n0) && !isNaN(n1) && !isNaN(n2) && !isNaN(n3)) {
      return clampBBox([n0, n1, n2, n3]);
    }
  }

  // 3. String case: e.g. "[10, 20, 100, 200]" or "10,20,100,200"
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed) {
        return normalizeBBox(parsed, fallback);
      }
    } catch {
      const split = raw.replace(/[\[\]]/g, '').split(',').map((s) => Number(s.trim()));
      if (split.length >= 4) {
        const n0 = split[0];
        const n1 = split[1];
        const n2 = split[2];
        const n3 = split[3];
        if (!isNaN(n0) && !isNaN(n1) && !isNaN(n2) && !isNaN(n3)) {
          return clampBBox([n0, n1, n2, n3]);
        }
      }
    }
  }

  return fallback;
}

export interface PSDReconstructionOptions {
  superResolutionScale?: 1 | 2 | 4 | 8 | 16;
  exportDPI?: 72 | 150 | 300 | 600;
  qualityMode?: boolean;
  deblockingAndDenoising?: boolean;
  faceRestoration?: boolean;
  vectorMathReconstruction?: boolean;
  removeBackground?: boolean;
  replaceMissingFonts?: boolean;
  rebuildBrokenElements?: boolean;
  upscaleImages?: boolean;
  vectorizeLogos?: boolean;
  recreateMissingShapes?: boolean;
  autoAlignLayers?: boolean;
  autoGroupLayers?: boolean;
  generateEditableMasks?: boolean;
  targetLayerDetail?: number; // 5, 10, 15, 20, 30, 50, or custom layer budget
  selectedLayerIds?: string[]; // Optional user selection filter for export
  exportFormat?: 'psd' | 'psb' | 'zip';
}

export interface AnalysisPassInfo {
  passNumber: number;
  name: string;
  category: string;
  status: 'completed' | 'in_progress' | 'pending';
  confidencePercent: number;
  detectedCount: number;
  details: string;
}

export interface MultiPassReport {
  totalPassesCompleted: number;
  reanalyzedRegionsCount: number;
  visualSimilarityPercentage: number;
  layoutAccuracyPercent: number;
  colorMatchAccuracyPercent: number;
  typographyFidelityPercent: number;
  passes: AnalysisPassInfo[];
}

export interface QualityAuditCheck {
  id: string;
  name: string;
  status: 'passed' | 'warning' | 'info';
  details: string;
}

export interface QualityAuditReport {
  overallScorePercent: number;
  resolutionLabel: string;
  sharpnessScore: number;
  edgeFeatheringQuality: string;
  vectorPrecision: string;
  deblockingLevel: string;
  colorShiftDeltaE: string;
  faceRestorationStatus: string;
  checks: QualityAuditCheck[];
}

export interface DetectedTextLayer {
  id: string;
  name: string;
  text: string;
  role: 'title' | 'headline' | 'subheading' | 'body' | 'button' | 'badge' | 'caption' | 'logo-text' | 'price';
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax] relative 0-1000 scale
  fontFamily: string;
  matchedGoogleFont: string;
  fontWeight: 'bold' | 'semibold' | 'medium' | 'regular' | 'light';
  fontSizePx: number;
  colorHex: string;
  letterSpacingPx: number;
  textAlign: 'left' | 'center' | 'right';
  confidenceScorePercent?: number;
  reanalysisPasses?: number;
  effects?: {
    dropShadow?: { color: string; blur: number; offsetX: number; offsetY: number };
    stroke?: { color: string; width: number };
    glow?: { color: string; radius: number };
    gradient?: string;
  };
}

export interface DetectedShapeLayer {
  id: string;
  name: string;
  type: 'rectangle' | 'rounded-rect' | 'circle' | 'pill' | 'badge' | 'line' | 'star' | 'card' | 'frame' | 'wave' | 'ribbon' | 'blob' | 'polygon' | 'triangle' | 'brush' | string;
  bbox: [number, number, number, number];
  fill: string;
  gradient?: { type: 'linear' | 'radial'; colors: string[]; angle: number };
  borderRadiusPx: number;
  border?: { width: number; color: string };
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number };
  glow?: { color: string; radius: number };
  confidenceScorePercent?: number;
  reanalysisPasses?: number;
}

export interface DetectedObjectLayer {
  id: string;
  name: string;
  category: 'photo' | 'person' | 'product' | 'logo' | 'illustration' | 'icon' | 'badge' | 'decoration' | 'texture' | 'shadow' | 'cutout';
  bbox: [number, number, number, number];
  isSmartObject: boolean;
  vectorize: boolean;
  description: string;
  confidenceScorePercent?: number;
  reanalysisPasses?: number;
}

export interface DetectedBackground {
  type: 'solid' | 'gradient' | 'image' | 'mesh' | 'glass';
  primaryColorHex: string;
  secondaryColorHex?: string;
  gradientAngle?: number;
  blurRadiusPx?: number;
  glassOpacity?: number;
  hasSubtlePattern?: boolean;
}

export interface ColorPaletteSummary {
  primary: string[];
  accent: string[];
  neutral: string[];
  background: string;
}

export interface ManifestElement {
  id: string;
  name: string;
  type: 'background' | 'person' | 'product' | 'object' | 'text' | 'shape' | 'logo' | 'icon' | 'decoration' | 'effect' | 'photo';
  category: 'background' | 'people' | 'typography' | 'shapes' | 'objects' | 'logos' | 'decorations' | 'effects' | 'photos';
  assetFilename: string; // e.g., "Person_01.png", "Heading_01.png", "Shape_01.svg", "Background.png"
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000 scale
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex: number;
  opacity: number;
  // Type-specific properties:
  textData?: {
    text: string;
    fontFamily?: string;
    matchedGoogleFont: string;
    fontWeight: string;
    fontSizePx: number;
    colorHex: string;
    textAlign: 'left' | 'center' | 'right';
    letterSpacingPx?: number;
    lineHeight?: number;
    effects?: any;
  };
  shapeData?: {
    shapeType: string;
    fill: string;
    gradient?: { type: string; colors: string[]; angle: number };
    borderRadiusPx?: number;
    border?: { width: number; color: string };
    shadow?: any;
    glow?: any;
  };
  objectData?: {
    description: string;
    isSmartObject: boolean;
    hasTransparency: boolean;
  };
  backgroundData?: {
    bgType: 'solid' | 'gradient' | 'photo' | 'pattern' | 'mesh';
    primaryColorHex: string;
    secondaryColorHex?: string;
    gradientAngle?: number;
  };
}

export interface PSDReconstructionBlueprint {
  width: number;
  height: number;
  title: string;
  inputType: string;
  manifest: {
    elements: ManifestElement[];
  };
  colorPalette: ColorPaletteSummary;
  background: DetectedBackground;
  textLayers: DetectedTextLayer[];
  shapeLayers: DetectedShapeLayer[];
  objectLayers: DetectedObjectLayer[];
  folderGroups: {
    name: string;
    description: string;
    layerIds: string[];
  }[];
  fontReport: {
    detectedFonts: { original: string; matchedGoogleFont: string; category: string; downloadUrl: string }[];
    missingFontsReplacedCount: number;
  };
  qualityAudit?: QualityAuditReport;
  multiPassReport?: MultiPassReport;
  reconstructionTimeMs: number;
  summary: string;
}
