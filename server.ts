import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import potrace from 'potrace';
import {
  getProviderConfig,
  enhancePromptWithAI,
  enhanceConversationalPromptWithAI,
  generateImagesWithAdapter,
} from './src/server/imageGenService';
import { convertScriptWithAI } from './src/server/scriptConverterService';
import { reconstructImageToPSDBlueprint } from './src/server/psdReconstructionService';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory Server Cache for rapid repeated requests
const serverCache = new Map<string, { data: any; expiry: number }>();
const getCachedResponse = (key: string) => {
  const item = serverCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    serverCache.delete(key);
    return null;
  }
  return item.data;
};
const setCachedResponse = (key: string, data: any, ttlMs = 15 * 60 * 1000) => {
  if (serverCache.size > 200) {
    const oldestKey = serverCache.keys().next().value;
    if (oldestKey) serverCache.delete(oldestKey);
  }
  serverCache.set(key, { data, expiry: Date.now() + ttlMs });
};

// Server-side Gemini API client
const getGeminiClient = (customKey?: string) => {
  const apiKey = (customKey && customKey.trim() !== '')
    ? customKey.trim()
    : (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '')
    ? process.env.GEMINI_API_KEY.trim()
    : undefined;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Script Converter API Route with Caching
app.post('/api/script-converter', async (req, res) => {
  try {
    const { sourceText, sourceLang, targetLang, mode, designerMode, quickFixAction, apiKey } = req.body;
    if (!sourceText) {
      return res.status(400).json({ error: 'sourceText is required' });
    }
    if (!targetLang) {
      return res.status(400).json({ error: 'targetLang is required' });
    }

    const cacheKey = `script:${sourceText.trim()}:${sourceLang}:${targetLang}:${mode}:${designerMode}:${quickFixAction || ''}`;
    const cachedResult = getCachedResponse(cacheKey);
    if (cachedResult) {
      return res.json({ success: true, result: cachedResult, cached: true });
    }

    const result = await convertScriptWithAI(
      {
        sourceText,
        sourceLang,
        targetLang,
        mode,
        designerMode,
        quickFixAction,
      },
      apiKey
    );

    if (result) {
      setCachedResponse(cacheKey, result);
    }

    res.json({ success: true, result });
  } catch (err: any) {
    console.error('Script Converter Error:', err);
    res.status(500).json({
      error: 'Script conversion failed',
      details: err?.message || String(err),
    });
  }
});

// AI Image to Editable PSD Reconstruction API Route
app.post('/api/psd/reconstruct', async (req, res) => {
  try {
    const { imageDataUrl, options, apiKey, imageWidth, imageHeight, sessionId } = req.body;
    if (!imageDataUrl) {
      return res.status(400).json({ error: 'imageDataUrl is required' });
    }

    console.log(`[PSD Session ${sessionId || 'isolated'}] Starting fresh zero-assumption image analysis (${imageWidth}x${imageHeight})...`);

    const result = await reconstructImageToPSDBlueprint(
      imageDataUrl,
      options || {},
      apiKey,
      imageWidth || 1920,
      imageHeight || 1080
    );

    res.json({ success: true, blueprint: result, sessionId });
  } catch (err: any) {
    console.error('PSD Reconstruction Error:', err);
    res.status(500).json({
      error: 'PSD Reconstruction failed',
      details: err?.message || String(err),
    });
  }
});

// AI Color Palette Generation via Gemini API with Caching
app.post('/api/colors/ai-generate', async (req, res) => {
  try {
    const { prompt, paletteType } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const cacheKey = `colors:${prompt.trim().toLowerCase()}:${paletteType || 'balanced'}`;
    const cachedResult = getCachedResponse(cacheKey);
    if (cachedResult) {
      return res.json({ success: true, data: cachedResult, cached: true });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are Panther Studio's expert AI Colorist. Generate a harmonized, professional color palette of 5 distinct colors based on the user's prompt or concept. Return JSON containing an array of 5 hex color codes and a title.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate a 5-color palette for the topic: "${prompt}". Style/Harmonies requested: "${paletteType || 'balanced'}".`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            colors: {
              type: Type.ARRAY,
              items: { type: Type.STRING, description: 'Hex color string e.g. #7C3AED' },
            },
          },
          required: ['title', 'colors'],
        },
      },
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);

    if (parsed && parsed.colors) {
      setCachedResponse(cacheKey, parsed);
    }

    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Gemini Color Generation Error:', err);
    res.status(500).json({
      error: 'Failed to generate palette via AI',
      details: err.message || 'Unknown error',
    });
  }
});

// Server-side Image Vectorization processing
app.post('/api/vectorize', (req, res) => {
  try {
    const { imageBase64, settings } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const traceOptions = {
      threshold: settings?.threshold || 128,
      turnPolicy: (potrace as any).POTRACE_TURNPOLICY_MINORITY || 'minority',
      turdSize: settings?.turdSize || 4,
      optCurve: true,
      optTolerance: 0.4,
      blackOnWhite: !settings?.transparentBg,
      color: settings?.colorMode === 'bw' ? '#0F172A' : '#7C3AED',
      background: settings?.transparentBg ? 'transparent' : '#FFFFFF',
    };

    const tracer = new potrace.Potrace(traceOptions);
    tracer.loadImage(imageBase64, (err: any) => {
      if (err) {
        return res.status(500).json({ error: 'Vectorization failed', details: err?.message || String(err) });
      }
      const svg = tracer.getSVG();
      res.json({ success: true, svg });
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Image Generation API Endpoints
app.post('/api/image-gen/config', (req, res) => {
  const { apiKeys } = req.body || {};
  const config = getProviderConfig(apiKeys);
  res.json({ success: true, config });
});

app.get('/api/image-gen/config', (req, res) => {
  const config = getProviderConfig();
  res.json({ success: true, config });
});

app.post('/api/image-gen/enhance-prompt', async (req, res) => {
  try {
    const { prompt, stylePreset, apiKeys } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const geminiKey = apiKeys?.geminiKey;
    const result = await enhancePromptWithAI(prompt, stylePreset, geminiKey);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to enhance prompt' });
  }
});

app.post('/api/image-gen/generate', async (req, res) => {
  try {
    const {
      mediaType,
      prompt,
      sourceImageUrl,
      stylePreset,
      imageCount,
      aspectRatio,
      duration,
      cameraMovement,
      particleEffect,
      loopAnimation,
      videoQuality,
      fps,
      provider,
      apiKeys,
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required and must not be empty.' });
    }

    console.log('[Server Media Route] POST /api/image-gen/generate:', {
      mediaType: mediaType || 'image',
      prompt,
      provider,
      imageCount,
      aspectRatio,
      duration,
      cameraMovement,
      particleEffect,
      hasCustomKeys: Boolean(apiKeys),
    });

    const result = await generateImagesWithAdapter({
      mediaType: mediaType || 'image',
      prompt: prompt.trim(),
      sourceImageUrl,
      stylePreset,
      imageCount: Number(imageCount) || 1,
      aspectRatio,
      duration,
      cameraMovement,
      particleEffect,
      loopAnimation: loopAnimation !== false,
      videoQuality,
      fps: Number(fps) || 30,
      provider,
      apiKeys,
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[Server Media Route Error]:', err?.message || err);
    const statusCode = err?.message?.includes('not configured') || err?.message?.includes('does not support') ? 400 : 500;
    res.status(statusCode).json({ error: err.message || 'Media generation failed' });
  }
});

// Conversational Image Editing API Route
app.post('/api/image-gen/conversational', async (req, res) => {
  try {
    const { chatPrompt, previousPrompt, stylePreset, aspectRatio, provider, apiKeys } = req.body;
    if (!chatPrompt || typeof chatPrompt !== 'string') {
      return res.status(400).json({ error: 'chatPrompt is required' });
    }

    const geminiKey = apiKeys?.geminiKey;
    const { originalPrompt, optimizedPrompt } = await enhanceConversationalPromptWithAI(
      chatPrompt,
      previousPrompt || '',
      stylePreset,
      geminiKey
    );

    const result = await generateImagesWithAdapter({
      prompt: optimizedPrompt,
      stylePreset,
      imageCount: 1,
      aspectRatio: aspectRatio || '1:1',
      provider: provider || 'auto',
      apiKeys,
    });

    res.json({
      success: true,
      userInstruction: chatPrompt,
      originalPrompt,
      optimizedPrompt,
      ...result,
    });
  } catch (err: any) {
    console.error('[Conversational Route Error]:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Conversational image generation failed' });
  }
});

// AI Advanced Image Editing Suite (Inpainting, Outpainting, BG Removal/Replacement, Style Transfer, Upscaling)
app.post('/api/image-gen/edit', async (req, res) => {
  try {
    const { action, imageBase64, prompt, stylePreset, provider, apiKeys } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'Edit action is required' });
    }

    console.log(`[AI Image Edit] Action requested: "${action}", Prompt: "${prompt || 'N/A'}"`);

    let editPrompt = '';
    switch (action) {
      case 'inpaint':
      case 'object-addition':
        editPrompt = `Inpaint and seamlessly add object "${prompt}" matching the exact camera angle, lighting, shadows, and perspective of the image.`;
        break;
      case 'object-removal':
      case 'erase':
        editPrompt = `Remove object "${prompt}" cleanly, filling the background seamlessly with surrounding ambient lighting and texture.`;
        break;
      case 'outpaint':
        editPrompt = `Outpaint and extend canvas bounds smoothly continuing the environment, studio background lighting, and atmosphere.`;
        break;
      case 'face-enhancement':
        editPrompt = `Masterpiece photo face restoration, hyper-detailed skin texture, realistic sharp eyes, natural studio lighting, 8k resolution.`;
        break;
      case 'bg-replacement':
        editPrompt = `Replace background with "${prompt || 'luxury dark neon studio'}", isolating subject cleanly with professional depth of field and rim lighting.`;
        break;
      case 'color-replacement':
        editPrompt = `Transform color scheme to "${prompt || 'vibrant golden blue'}" while preserving exact crisp outline and lighting structure.`;
        break;
      case 'style-transfer':
        editPrompt = `Re-render scene in ${stylePreset || prompt || 'cyberpunk'} style, preserving original silhouette and composition in 8k quality.`;
        break;
      case 'upscale':
        editPrompt = `Ultra high-definition 4k upscale, fine texture detail, ultra-sharp edges, noise-free studio clarity.`;
        break;
      default:
        editPrompt = prompt || `Refined studio quality artwork, ${action}`;
        break;
    }

    const result = await generateImagesWithAdapter({
      prompt: editPrompt,
      stylePreset: stylePreset || 'realistic',
      imageCount: 1,
      aspectRatio: '1:1',
      provider: provider || 'auto',
      apiKeys,
    });

    res.json({ success: true, action, ...result });
  } catch (err: any) {
    console.error('[Image Edit Error]:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Image edit failed' });
  }
});

async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Panther Studio server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
