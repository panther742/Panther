/**
 * Panther AI Video Engine Specifications & Types
 * Manages Real AI Video Generation parameters for Google Veo, Runway, Luma, Pika, and PixVerse.
 */

export interface VideoGenOptions {
  sourceImageUrl?: string;
  prompt: string;
  durationSeconds: number; // 3, 5, 8, 10
  fps: number; // 24, 30, 60
  cameraMovement?: string;
  particleEffect?: string;
  motionStrength?: 'low' | 'medium' | 'high' | 'dynamic';
  width: number;
  height: number;
  provider?: string;
}

export interface AIVideoProviderInfo {
  id: string;
  name: string;
  supportsImageToVideo: boolean;
  supportsTextToVideo: boolean;
  maxDuration: string;
  requiresApiKey: boolean;
  keyName: string;
}

export const SUPPORTED_AI_VIDEO_PROVIDERS: AIVideoProviderInfo[] = [
  {
    id: 'google-imagen',
    name: 'Google Veo',
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    maxDuration: '10s',
    requiresApiKey: true,
    keyName: 'GEMINI_API_KEY',
  },
  {
    id: 'runway',
    name: 'Runway Gen-4 / Gen-3',
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    maxDuration: '10s',
    requiresApiKey: true,
    keyName: 'RUNWAY_API_KEY',
  },
  {
    id: 'luma',
    name: 'Luma Dream Machine',
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    maxDuration: '5s',
    requiresApiKey: true,
    keyName: 'LUMA_API_KEY',
  },
  {
    id: 'pika',
    name: 'Pika Labs',
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    maxDuration: '5s',
    requiresApiKey: true,
    keyName: 'PIKA_API_KEY',
  },
  {
    id: 'pixverse',
    name: 'PixVerse AI',
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    maxDuration: '5s',
    requiresApiKey: true,
    keyName: 'PIXVERSE_API_KEY',
  },
  {
    id: 'replicate',
    name: 'Replicate (Wan-2.1 / SVD)',
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    maxDuration: '8s',
    requiresApiKey: true,
    keyName: 'REPLICATE_API_KEY',
  },
];

