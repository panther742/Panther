import { GoogleGenAI } from '@google/genai';

export interface ImageGenParams {
  mediaType?: 'image' | 'gif' | 'video';
  prompt: string;
  sourceImageUrl?: string;
  stylePreset?: string;
  imageCount?: number;
  aspectRatio?: string;
  duration?: string;
  cameraMovement?: string;
  particleEffect?: string;
  loopAnimation?: boolean;
  videoQuality?: string;
  fps?: number;
  provider?: string;
  apiKeys?: {
    geminiKey?: string;
    openaiKey?: string;
    stabilityKey?: string;
    replicateKey?: string;
    huggingfaceKey?: string;
    runwayKey?: string;
    lumaKey?: string;
    pikaKey?: string;
  };
}

export interface ImageGenResult {
  images: {
    id: string;
    url: string;
    mediaType?: 'image' | 'gif' | 'video';
    width: number;
    height: number;
    provider: string;
    generationTimeMs: number;
    seed: number;
    resolution: string;
    duration?: string;
    fps?: number;
    cameraMovement?: string;
    particleEffect?: string;
    loopAnimation?: boolean;
    sourceImageUrl?: string;
  }[];
  originalPrompt: string;
  optimizedPrompt: string;
  providerUsed: string;
  generationTimeMs: number;
}

export const PROVIDER_CAPABILITIES: Record<string, { name: string; supportedModes: ('image' | 'gif' | 'video')[] }> = {
  'auto': { name: 'Auto (Best Available Engine)', supportedModes: ['image', 'gif', 'video'] },
  'google-imagen': { name: 'Google Veo / Imagen 3', supportedModes: ['image', 'video'] },
  'openai-dalle': { name: 'OpenAI (DALL-E 3 / Sora)', supportedModes: ['image', 'video'] },
  'runway': { name: 'Runway (Gen-2 / Gen-3)', supportedModes: ['image', 'gif', 'video'] },
  'luma': { name: 'Luma Dream Machine', supportedModes: ['gif', 'video'] },
  'pika': { name: 'Pika Labs', supportedModes: ['gif', 'video'] },
  'pixverse': { name: 'PixVerse AI', supportedModes: ['gif', 'video'] },
  'svd': { name: 'Stable Video Diffusion', supportedModes: ['gif', 'video'] },
  'stability': { name: 'Stability AI (SDXL)', supportedModes: ['image'] },
  'pollinations': { name: 'Pollinations AI Engine', supportedModes: ['image', 'gif', 'video'] },
  'replicate': { name: 'Replicate AI Engine', supportedModes: ['image', 'gif', 'video'] },
  'huggingface': { name: 'Hugging Face Inference', supportedModes: ['image', 'gif', 'video'] },
};

// Check available API keys
export function getProviderConfig(apiKeys?: any) {
  const hasGeminiKey = Boolean(apiKeys?.geminiKey || process.env.GEMINI_API_KEY);
  const hasOpenAIKey = Boolean(apiKeys?.openaiKey || process.env.OPENAI_API_KEY);
  const hasStabilityKey = Boolean(apiKeys?.stabilityKey || process.env.STABILITY_API_KEY);
  const hasReplicateKey = Boolean(apiKeys?.replicateKey || process.env.REPLICATE_API_KEY);
  const hasHuggingFaceKey = Boolean(apiKeys?.huggingfaceKey || process.env.HUGGINGFACE_API_KEY);
  const hasRunwayKey = Boolean(apiKeys?.runwayKey || process.env.RUNWAY_API_KEY);
  const hasLumaKey = Boolean(apiKeys?.lumaKey || process.env.LUMA_API_KEY);
  const hasPikaKey = Boolean(apiKeys?.pikaKey || process.env.PIKA_API_KEY);

  const availableProviders: string[] = ['auto', 'pollinations'];
  if (hasGeminiKey) availableProviders.push('google-imagen');
  if (hasOpenAIKey) availableProviders.push('openai-dalle');
  if (hasRunwayKey) availableProviders.push('runway');
  if (hasLumaKey) availableProviders.push('luma');
  if (hasPikaKey) availableProviders.push('pika');
  availableProviders.push('pixverse', 'svd');
  if (hasStabilityKey) availableProviders.push('stability');
  if (hasReplicateKey) availableProviders.push('replicate');
  if (hasHuggingFaceKey) availableProviders.push('huggingface');

  let activeProvider = 'auto';

  return {
    activeProvider,
    isKeyConfigured: true,
    hasGeminiKey,
    hasOpenAIKey,
    hasStabilityKey,
    hasReplicateKey,
    hasHuggingFaceKey,
    hasRunwayKey,
    hasLumaKey,
    hasPikaKey,
    availableProviders,
  };
}

async function generatePollinationsImages(
  optimizedPrompt: string,
  stylePreset: string,
  count: number,
  aspectRatio: string,
  originalPrompt: string,
  startTime: number
): Promise<ImageGenResult> {
  const dimensions = getDimensionsFromRatio(aspectRatio);
  const images: any[] = [];
  const fullPrompt = `${optimizedPrompt}, ${stylePreset} style artwork`;

  console.log(`[AI Image Generator Log] Generating ${count} image(s) using Pollinations AI (FLUX.1)...`);

  for (let i = 0; i < count; i++) {
    const seed = Math.floor(Math.random() * 899999) + 100000;
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${dimensions.width}&height=${dimensions.height}&seed=${seed}&model=flux&nologo=true`;

    const res = await fetch(pollinationsUrl);
    if (!res.ok) {
      throw new Error(`Pollinations AI Engine HTTP ${res.status} ${res.statusText}`);
    }
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    images.push({
      id: `img-pollinations-${Date.now()}-${i}`,
      url: `data:image/png;base64,${base64}`,
      width: dimensions.width,
      height: dimensions.height,
      resolution: `${dimensions.width}x${dimensions.height}`,
      provider: 'Pollinations AI (FLUX.1)',
      generationTimeMs: Date.now() - startTime,
      seed,
    });
  }

  const totalTimeMs = Date.now() - startTime;
  console.log(`[AI Image Generator Success] Generated ${images.length} image(s) via Pollinations AI (FLUX.1) in ${totalTimeMs}ms`);

  return {
    images,
    originalPrompt,
    optimizedPrompt,
    providerUsed: 'Pollinations AI (FLUX.1)',
    generationTimeMs: totalTimeMs,
  };
}

// Enhance prompt with AI via Gemini - PROMPT UNDERSTANDING ENGINE V2
export function translateHinglishLocally(rawPrompt: string): string {
  let p = rawPrompt.trim();
  if (!p) return rawPrompt;

  // Local phrase replacements for Hinglish / Roman Hindi / Gujarati / Hindi
  const replacements: [RegExp, string][] = [
    [/\bek\b/gi, 'a'],
    [/\bye image ko animate karo\b/gi, 'animate this reference image'],
    [/\bis image ko animate karo\b/gi, 'animate this reference image'],
    [/\bis image ko\b/gi, 'this reference image'],
    [/\bye image ko\b/gi, 'this reference image'],
    [/\bek ladki\b/gi, 'a stylish girl'],
    [/\bek ladka\b/gi, 'a stylish boy'],
    [/\bblack panther\b/gi, 'majestic black panther'],
    [/\bsher\b/gi, 'majestic lion'],
    [/\bshir\b/gi, 'majestic lion'],
    [/\bgaadi\b/gi, 'sleek sports car'],
    [/\bcar ko\b/gi, 'sports car'],
    [/\bfast race karte hue dikhao\b/gi, 'racing fast at dynamic high speed with motion blur'],
    [/\bfast race karte hue\b/gi, 'racing fast at dynamic high speed'],
    [/\bwalk kar rahi hai\b/gi, 'walking smoothly'],
    [/\bwalk kar raha hai\b/gi, 'walking smoothly'],
    [/\bwalk kar raha ho\b/gi, 'walking smoothly'],
    [/\bchal raha ho\b/gi, 'walking gracefully'],
    [/\bchal raha hai\b/gi, 'walking gracefully'],
    [/\bchal rahi hai\b/gi, 'walking gracefully'],
    [/\brunning kare\b/gi, 'running fast with intense motion'],
    [/\bdhor raha hai\b/gi, 'running fast with intense motion'],
    [/\bdheere dheere\b/gi, 'slowly and majestically'],
    [/\bcamera ki taraf aaye\b/gi, 'approaching directly towards the camera'],
    [/\bcamera ki taraf aana\b/gi, 'approaching directly towards the camera'],
    [/\bcamera zoom in kare\b/gi, 'with cinematic smooth camera zoom in'],
    [/\baup camera zoom in\b/gi, 'with cinematic smooth camera zoom in'],
    [/\beyes glow kare\b/gi, 'with intensely glowing vibrant eyes'],
    [/\baankhen glow kare\b/gi, 'with intensely glowing vibrant eyes'],
    [/\bhalka smoke nikle\b/gi, 'with subtle ethereal smoke wisps rising softly'],
    [/\bsmoke nikle\b/gi, 'with atmospheric smoke wisps rising'],
    [/\bhalka\b/gi, 'subtle ethereal'],
    [/\bke sath\b/gi, 'with'],
    [/\baup piche\b/gi, 'and in the background'],
    [/\baur piche\b/gi, 'and in the background'],
    [/\bsunset ho\b/gi, 'a golden glowing sunset over the horizon'],
    [/\bbarish me\b/gi, 'in heavy atmospheric rain with realistic droplets'],
    [/\brain me\b/gi, 'in heavy atmospheric rain with realistic droplets'],
    [/\bjungle me\b/gi, 'in a lush green dense tropical jungle'],
    [/\bcity me\b/gi, 'in a vibrant neon urban city street'],
    [/\bpahad me\b/gi, 'in epic misty mountain range'],
    [/\bdikhao\b/gi, 'showcasing'],
    [/\bbanao\b/gi, 'creating artwork of'],
    [/\baur\b/gi, 'and'],
    [/\bme\b/gi, 'in'],
    [/\bmein\b/gi, 'in'],
  ];

  let translated = p;
  for (const [regex, replacement] of replacements) {
    translated = translated.replace(regex, replacement);
  }

  // Clean up extra spaces
  translated = translated.replace(/\s+/g, ' ').trim();
  return translated;
}

export const STANDARD_NEGATIVE_PROMPT =
  'Negative prompt: Low quality, Blurry, Deformed, Extra fingers, Bad anatomy, Text artifacts, Watermark, Noise, Compression.';

export interface PromptAnalysisV2 {
  entityDetected: string;
  actionDetected: string;
  environmentDetected: string;
  optimizedPrompt: string;
}

/**
 * PROMPT UNDERSTANDING ENGINE V2 - Local Intelligent Analyzer
 * Analyzes entities, actions, environments and expands prompts while preserving brands/objects strictly.
 */
export function analyzeAndExpandPromptLocallyV2(rawPrompt: string, stylePreset?: string): PromptAnalysisV2 {
  const translated = translateHinglishLocally(rawPrompt);
  const pLower = translated.toLowerCase();

  // STEP 1: Entity & Brand Detection (Never replace objects or substitute brands)
  let entity = 'Subject';
  let refinedEntity = translated;

  if (pLower.includes('mustang shelby') || pLower.includes('shelby gt500') || pLower.includes('shelby')) {
    entity = 'Ford Mustang Shelby GT500';
    refinedEntity = 'Ford Mustang Shelby GT500';
  } else if (pLower.includes('mustang')) {
    entity = 'Ford Mustang';
    refinedEntity = 'Ford Mustang GT';
  } else if (pLower.includes('ferrari sf90') || pLower.includes('ferrari')) {
    entity = 'Ferrari SF90 Stradale';
    refinedEntity = 'Ferrari SF90 Stradale supercar';
  } else if (pLower.includes('bmw m4') || pLower.includes('m4 competition')) {
    entity = 'BMW M4 Competition';
    refinedEntity = 'BMW M4 Competition sports coupe';
  } else if (pLower.includes('bmw')) {
    entity = 'BMW';
    refinedEntity = 'high performance BMW sports sedan';
  } else if (pLower.includes('porsche 911') || pLower.includes('porsche')) {
    entity = 'Porsche 911 GT3 RS';
    refinedEntity = 'Porsche 911 GT3 RS sports car';
  } else if (pLower.includes('lamborghini')) {
    entity = 'Lamborghini Aventador SVJ';
    refinedEntity = 'Lamborghini Aventador SVJ supercar';
  } else if (pLower.includes('bugatti')) {
    entity = 'Bugatti Chiron Super Sport';
    refinedEntity = 'Bugatti Chiron Super Sport hypercar';
  } else if (pLower.includes('photoshop')) {
    entity = 'Graphic Design Software';
    refinedEntity = 'Adobe Photoshop creative digital graphic design workspace';
  } else if (pLower.includes('panther') || pLower.includes('black panther')) {
    entity = 'Black Panther';
    refinedEntity = 'majestic Black Panther with glowing coat and muscular build';
  } else if (pLower.includes('lion') || pLower.includes('sher')) {
    entity = 'Lion';
    refinedEntity = 'majestic male lion with full mane';
  } else if (pLower.includes('tiger')) {
    entity = 'Tiger';
    refinedEntity = 'royal Bengal tiger with vivid stripes';
  }

  // STEP 2: Action Understanding
  let action = 'dynamic position';
  let actionPhrase = 'positioned dynamically';

  if (pLower.includes('running on racetrack') || pLower.includes('race') || pLower.includes('racing') || pLower.includes('racetrack')) {
    action = 'High-speed racing';
    actionPhrase = 'racing at dynamic high speed with motion blur and spinning wheels';
  } else if (pLower.includes('drifting') || pLower.includes('drift')) {
    action = 'Tire smoke drift';
    actionPhrase = 'performing a dramatic high-speed drift with tire smoke and skid marks';
  } else if (pLower.includes('jumping') || pLower.includes('airborne') || pLower.includes('flying')) {
    action = 'Airborne motion';
    actionPhrase = 'captured airborne in high-speed motion mid-air';
  } else if (pLower.includes('parked') || pLower.includes('standing') || pLower.includes('static')) {
    action = 'Static display';
    actionPhrase = 'parked elegantly in a pristine beauty shot stance';
  } else if (pLower.includes('walking') || pLower.includes('walk') || pLower.includes('chal')) {
    action = 'Graceful locomotion';
    actionPhrase = 'walking gracefully forward with smooth natural motion';
  } else if (pLower.includes('running') || pLower.includes('run') || pLower.includes('bhag')) {
    action = 'Fast running';
    actionPhrase = 'running fast at high speed with intense dynamic stride';
  }

  // STEP 3: Environment Analysis
  let environment = 'Cinematic background';
  let environmentPhrase = 'in a cinematic atmospheric setting';

  if (pLower.includes('racetrack') || pLower.includes('track') || pLower.includes('circuit')) {
    environment = 'Professional Race Circuit';
    environmentPhrase = 'on a professional asphalt Grand Prix racing circuit with red and white apex curbing';
  } else if (pLower.includes('forest') || pLower.includes('jungle')) {
    environment = 'Dense Tropical Forest';
    environmentPhrase = 'in a dense lush green tropical forest with volumetric sunbeams filtering through leaves';
  } else if (pLower.includes('city') || pLower.includes('street') || pLower.includes('cyberpunk')) {
    environment = 'Neon Urban Street';
    environmentPhrase = 'on a vibrant neon-lit modern urban city street with rainy wet asphalt reflections';
  } else if (pLower.includes('desert') || pLower.includes('sand')) {
    environment = 'Expansive Sand Dunes';
    environmentPhrase = 'across vast golden desert sand dunes under an intense sun';
  } else if (pLower.includes('snow') || pLower.includes('winter') || pLower.includes('baraf')) {
    environment = 'Snowy Winter Landscape';
    environmentPhrase = 'in a crisp alpine snow-covered mountain terrain';
  } else if (pLower.includes('rain') || pLower.includes('barish')) {
    environment = 'Atmospheric Rain';
    environmentPhrase = 'in heavy atmospheric rain with realistic water droplets and misty haze';
  }

  // STEP 4: Expand Prompt Internally
  const styleModifier = stylePreset && stylePreset !== 'realistic' ? `, ${stylePreset} style` : '';
  const expandedPrompt = `Ultra realistic ${refinedEntity} ${actionPhrase} ${environmentPhrase}${styleModifier}, aggressive cinematic camera angle, professional volumetric lighting, natural colors, highly detailed material textures, accurate object anatomy, 8k resolution, photorealistic masterpiece rendering. ${STANDARD_NEGATIVE_PROMPT}`;

  return {
    entityDetected: entity,
    actionDetected: action,
    environmentDetected: environment,
    optimizedPrompt: expandedPrompt,
  };
}

export async function enhancePromptWithAI(
  rawPrompt: string,
  stylePreset?: string,
  userGeminiKey?: string
): Promise<{ originalPrompt: string; optimizedPrompt: string }> {
  const apiKey = userGeminiKey || process.env.GEMINI_API_KEY;
  const localAnalysis = analyzeAndExpandPromptLocallyV2(rawPrompt, stylePreset);

  if (!apiKey) {
    return { originalPrompt: rawPrompt, optimizedPrompt: localAnalysis.optimizedPrompt };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const systemInstruction = `You are Panther Studio's PROMPT UNDERSTANDING ENGINE V2.
Your mandate is to intelligently analyze, understand, and expand user prompts (in English, Hinglish, Hindi, Gujarati, Roman Hindi, or mixed languages) into ultra-realistic, photorealistic 8K diffusion and video generation prompts.

YOU MUST EXECUTIVELY FOLLOW THIS 4-STEP ANALYSIS IN ORDER:

STEP 1: ENTITY & BRAND DETECTION
- Identify all primary objects, vehicles, animals, characters, or software in the user prompt.
- Detect exact brand names, models, and specifications without EVER changing or substituting them.
  - "Mustang Shelby" -> "Ford Mustang Shelby GT500"
  - "Ferrari" -> "Ferrari SF90 Stradale"
  - "BMW M4" -> "BMW M4 Competition"
  - "Photoshop" -> "Adobe Photoshop Graphic Design Interface"
  - "Lion" -> "Majestic Male Lion"
  - "Panther" -> "Majestic Black Panther"
- STRICT MANDATE: NEVER replace objects, never invent another car, never ignore brand names.
  If user requests Mustang, generate Mustang. If Ferrari, generate Ferrari. Do NOT substitute vehicles.

STEP 2: ACTION & MOTION UNDERSTANDING
- Analyze what the entity is doing:
  - "running on racetrack" -> high-speed racing with motion blur
  - "drifting" -> tire smoke and skid marks
  - "jumping" -> airborne motion
  - "parked" -> static beauty shot
  - "walking" -> smooth graceful gait

STEP 3: ENVIRONMENT & ATMOSPHERE ANALYSIS
- Analyze the setting:
  - "racetrack" -> professional race circuit with curbing and asphalt detail
  - "forest" -> dense trees with volumetric light rays
  - "desert" -> sand dunes under intense lighting
  - "snow" -> winter environment

STEP 4: PROMPT EXPANSION & QUALITY PARAMETERS
- Construct a single, ultra-detailed, photorealistic prompt incorporating the exact detected entity, action, environment, cinematic composition, professional lighting, natural colors, high detail, and 8K photorealistic quality.
- MANDATORY NEGATIVE PROMPT: Always append:
  "${STANDARD_NEGATIVE_PROMPT}"

Return strictly JSON with schema:
{
  "entityDetected": string,
  "actionDetected": string,
  "environmentDetected": string,
  "optimizedPrompt": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `User Prompt: "${rawPrompt}". Style Requested: "${stylePreset || 'realistic'}".
Analyze entities, action, environment and expand into ultra-realistic 8K photorealistic prompt with negative prompts.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const rawText = (response.text || '').trim();
    let parsed: any = {};
    try {
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      const match = rawText.match(/"optimizedPrompt"\s*:\s*"([^"]+)"/);
      if (match) {
        parsed = { optimizedPrompt: match[1] };
      }
    }

    let finalOptimized = parsed.optimizedPrompt || rawText || localAnalysis.optimizedPrompt;

    // Ensure negative prompt is present
    if (!finalOptimized.toLowerCase().includes('negative prompt')) {
      finalOptimized = `${finalOptimized}, ultra realistic, photorealistic, cinematic lighting, high detail, natural colors, professional lighting, 8k resolution. ${STANDARD_NEGATIVE_PROMPT}`;
    }

    return {
      originalPrompt: rawPrompt,
      optimizedPrompt: finalOptimized,
    };
  } catch (err: any) {
    console.error('[Prompt Optimizer Log] Enhancement error:', err?.message || err);
    return {
      originalPrompt: rawPrompt,
      optimizedPrompt: localAnalysis.optimizedPrompt,
    };
  }
}

// Conversational Image Prompt Enhancement
export async function enhanceConversationalPromptWithAI(
  userEditMessage: string,
  previousPrompt: string,
  stylePreset?: string,
  userGeminiKey?: string
): Promise<{ originalPrompt: string; optimizedPrompt: string }> {
  const apiKey = userGeminiKey || process.env.GEMINI_API_KEY;
  const translatedEdit = translateHinglishLocally(userEditMessage);

  if (!apiKey) {
    const merged = `Updated scene: based on previous scene "${previousPrompt}", apply edit: "${translatedEdit}". Photorealistic, cinematic lighting, high detail, natural colors, professional lighting, 8k resolution. ${STANDARD_NEGATIVE_PROMPT}`;
    return { originalPrompt: userEditMessage, optimizedPrompt: merged };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const systemInstruction = `You are Panther Studio's Conversational AI Image Director. The user is iteratively editing a previously generated image or animation.
They may use English, Hinglish ("Eyes glow kare", "rain add karo", "piche sunset dikhao"), Hindi, Gujarati, or Roman Hindi.

Your task:
1. Translate the user's modification command into English.
2. Merge it seamlessly into the previous scene prompt while keeping the primary subject.
3. Include photorealistic, cinematic lighting, high detail, natural colors, and sharp focus parameters.
4. Mandatory: Append "${STANDARD_NEGATIVE_PROMPT}" at the end.

Return strictly JSON with string field "optimizedPrompt".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Previous Scene Description: "${previousPrompt}"
User Edit Command: "${userEditMessage}"
Target Style: "${stylePreset || 'realistic'}"
Construct the updated complete image prompt.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const rawText = (response.text || '').trim();
    let parsed: any = {};
    try {
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      const match = rawText.match(/"optimizedPrompt"\s*:\s*"([^"]+)"/);
      if (match) {
        parsed = { optimizedPrompt: match[1] };
      }
    }

    let finalOptimized = parsed.optimizedPrompt || `${previousPrompt}, modified with: ${translatedEdit}`;
    if (!finalOptimized.toLowerCase().includes('negative prompt')) {
      finalOptimized = `${finalOptimized}. ${STANDARD_NEGATIVE_PROMPT}`;
    }

    return {
      originalPrompt: userEditMessage,
      optimizedPrompt: finalOptimized,
    };
  } catch (err: any) {
    console.error('[Conversational Prompt Error]:', err?.message || err);
    return {
      originalPrompt: userEditMessage,
      optimizedPrompt: `${previousPrompt}, modified with: ${translatedEdit}. ${STANDARD_NEGATIVE_PROMPT}`,
    };
  }
}

// Generate media (Image, GIF, Video) via Real Provider Adapter
export async function generateImagesWithAdapter(params: ImageGenParams): Promise<ImageGenResult> {
  const startTime = Date.now();
  const {
    mediaType = 'image',
    prompt,
    sourceImageUrl,
    stylePreset = 'realistic',
    imageCount = 1,
    aspectRatio = '1:1',
    duration = mediaType === 'gif' ? '3s' : '5s',
    cameraMovement = mediaType === 'gif' ? 'zoom-in' : 'cinematic',
    particleEffect = 'none',
    loopAnimation = true,
    videoQuality = 'Full HD',
    fps = 30,
    provider = 'auto',
    apiKeys,
  } = params;

  console.log('[AI Media Studio Log] Request received:', {
    mediaType,
    prompt,
    stylePreset,
    imageCount,
    aspectRatio,
    duration,
    cameraMovement,
    particleEffect,
    providerRequested: provider,
    timestamp: new Date().toISOString(),
  });

  // Step 1: Check provider keys
  const config = getProviderConfig(apiKeys);

  // Determine active provider
  let selectedProvider = provider !== 'auto' ? provider : 'pollinations';
  if (provider === 'auto') {
    if (mediaType === 'image' && config.hasGeminiKey) selectedProvider = 'google-imagen';
    else if (mediaType === 'video' && config.hasGeminiKey) selectedProvider = 'google-imagen';
    else if (mediaType === 'video' && config.hasOpenAIKey) selectedProvider = 'openai-dalle';
    else selectedProvider = 'pollinations';
  }

  // Step 2: Validate provider capability for requested media mode
  const caps = PROVIDER_CAPABILITIES[selectedProvider];
  if (caps && !caps.supportedModes.includes(mediaType)) {
    console.warn(`[AI Media Studio Warning] Provider "${selectedProvider}" does not support media type "${mediaType}".`);
    throw new Error('This provider does not support this feature. Please select a compatible provider.');
  }

  // Step 3: Optimize prompt with AI
  const geminiKey = apiKeys?.geminiKey || process.env.GEMINI_API_KEY;
  const { originalPrompt, optimizedPrompt } = await enhancePromptWithAI(prompt, stylePreset, geminiKey);

  const count = mediaType === 'image' ? Math.min(Math.max(imageCount, 1), 4) : 1;
  const dimensions = getDimensionsFromRatio(aspectRatio);

  console.log(`[AI Media Studio Log] Routing mode "${mediaType}" to provider: "${selectedProvider}"`);

  // --- REAL AI VIDEO GENERATION ENGINE ---
  if (mediaType === 'gif' || mediaType === 'video') {
    const isGif = mediaType === 'gif';
    const resolutionLabel = mediaType === 'video' ? `${videoQuality} (${dimensions.width}x${dimensions.height})` : `${dimensions.width}x${dimensions.height}`;

    // Construct motion prompt incorporating motion directives and negative prompt
    let motionModifiers = [];
    if (cameraMovement && cameraMovement !== 'none') motionModifiers.push(`${cameraMovement} camera movement`);
    if (particleEffect && particleEffect !== 'none') motionModifiers.push(`atmospheric ${particleEffect} particle effects`);
    if (isGif) motionModifiers.push('seamless looping animated video');
    else motionModifiers.push(`cinematic realistic AI video, smooth motion, natural physics, ${duration}`);

    let fullMotionPrompt = `${optimizedPrompt}, ${motionModifiers.join(', ')}`;
    if (!fullMotionPrompt.toLowerCase().includes('negative prompt')) {
      fullMotionPrompt = `${fullMotionPrompt}. ${STANDARD_NEGATIVE_PROMPT}`;
    }

    // Determine available real AI Video Providers
    const geminiKey = apiKeys?.geminiKey || process.env.GEMINI_API_KEY;
    const runwayKey = apiKeys?.runwayKey || process.env.RUNWAY_API_KEY;
    const lumaKey = apiKeys?.lumaKey || process.env.LUMA_API_KEY;
    const pikaKey = apiKeys?.pikaKey || process.env.PIKA_API_KEY;
    const replicateKey = apiKeys?.replicateKey || process.env.REPLICATE_API_KEY;

    let videoProviderToUse = selectedProvider;
    if (videoProviderToUse === 'auto' || videoProviderToUse === 'pollinations') {
      if (geminiKey) videoProviderToUse = 'google-imagen';
      else if (runwayKey) videoProviderToUse = 'runway';
      else if (lumaKey) videoProviderToUse = 'luma';
      else if (pikaKey) videoProviderToUse = 'pika';
      else if (replicateKey) videoProviderToUse = 'replicate';
    }

    let generatedVideoUrl: string | null = null;
    let providerUsedLabel = 'Google Veo';

    // 1. Google Veo / Gemini API Video Generation
    if ((videoProviderToUse === 'google-imagen' || videoProviderToUse === 'veo') && geminiKey) {
      providerUsedLabel = 'Google Veo AI Video';
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });

        // Request Google Veo / Gemini Video Generation model
        const response = await ai.models.generateContent({
          model: 'veo-2.0-generate-001',
          contents: sourceImageUrl
            ? [
                {
                  role: 'user',
                  parts: [
                    { text: `Image to Video generation: Use provided source image as frame 0 initial frame. Predict and generate realistic motion: ${fullMotionPrompt}` },
                    { inlineData: { mimeType: 'image/jpeg', data: sourceImageUrl.replace(/^data:image\/\w+;base64,/, '') } }
                  ]
                }
              ]
            : `Text to Video generation: ${fullMotionPrompt}`,
        });

        const resText = response.text || '';
        if (resText.includes('http') || resText.includes('data:video')) {
          const match = resText.match(/https?:\/\/[^\s"]+\.(mp4|webm|mov)/i) || resText.match(/data:video\/[a-zA-Z0-9_-]+;base64,[A-Za-z0-9+/=]+/);
          if (match) {
            generatedVideoUrl = match[0];
          }
        }
      } catch (err: any) {
        console.warn('[Google Veo Log] Veo API notice:', err?.message || err);
      }
    }

    // 2. Runway Gen-4 / Gen-3 API
    if (!generatedVideoUrl && (videoProviderToUse === 'runway' || runwayKey)) {
      providerUsedLabel = 'Runway Gen-4 / Gen-3';
      try {
        const rwRes = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${runwayKey}`,
            'Content-Type': 'application/json',
            'X-Runway-Version': '2024-11-06',
          },
          body: JSON.stringify({
            promptImage: sourceImageUrl || undefined,
            promptText: fullMotionPrompt,
            model: 'gen3a_turbo',
            duration: parseInt(duration.replace('s', ''), 10) || 5,
            ratio: aspectRatio === '16:9' ? '1280:720' : aspectRatio === '9:16' ? '720:1280' : '1024:1024',
          }),
        });
        if (rwRes.ok) {
          const rwData = await rwRes.json();
          if (rwData.outputUrl || rwData.id) {
            generatedVideoUrl = rwData.outputUrl || rwData.url;
          }
        }
      } catch (e) {
        console.warn('[Runway Log] Runway API notice:', e);
      }
    }

    // 3. Luma Dream Machine API
    if (!generatedVideoUrl && (videoProviderToUse === 'luma' || lumaKey)) {
      providerUsedLabel = 'Luma Dream Machine';
      try {
        const lumaRes = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lumaKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: fullMotionPrompt,
            key_frames: sourceImageUrl
              ? { frame_0: { type: 'image', url: sourceImageUrl } }
              : undefined,
            aspect_ratio: aspectRatio === '16:9' ? '16:9' : aspectRatio === '9:16' ? '9:16' : '1:1',
          }),
        });
        if (lumaRes.ok) {
          const lumaData = await lumaRes.json();
          if (lumaData.assets?.video || lumaData.video_url) {
            generatedVideoUrl = lumaData.assets?.video || lumaData.video_url;
          }
        }
      } catch (e) {
        console.warn('[Luma Log] Luma API notice:', e);
      }
    }

    // 4. Replicate AI Video API (Wan-2.1 / SVD)
    if (!generatedVideoUrl && (videoProviderToUse === 'replicate' || replicateKey)) {
      providerUsedLabel = 'Replicate Wan-2.1 / SVD';
      try {
        const modelVersion = sourceImageUrl
          ? 'stability-ai/stable-video-diffusion:3f0457e4619da25d21e92f8b2b06871131e3d118b62828ff77380230761c7a31'
          : 'wavespeedai/wan-2.1-t2v-480p';

        const repRes = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${replicateKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: modelVersion,
            input: {
              prompt: fullMotionPrompt,
              input_image: sourceImageUrl || undefined,
              frames_per_second: fps,
            },
          }),
        });
        if (repRes.ok) {
          const repData = await repRes.json();
          if (repData.output) {
            generatedVideoUrl = Array.isArray(repData.output) ? repData.output[0] : repData.output;
          }
        }
      } catch (e) {
        console.warn('[Replicate Log] Replicate Video API notice:', e);
      }
    }

    // STRICT MANDATE:
    // If real AI video generation cannot be produced, show:
    // "Real AI Video Generation is unavailable with the current provider."
    // Do NOT generate fake videos.
    if (!generatedVideoUrl) {
      throw new Error('Real AI Video Generation is unavailable with the current provider.');
    }

    const totalTimeMs = Date.now() - startTime;
    const seed = Math.floor(Math.random() * 899999) + 100000;

    return {
      images: [
        {
          id: `media-${mediaType}-${Date.now()}`,
          url: generatedVideoUrl,
          mediaType: 'video',
          width: dimensions.width,
          height: dimensions.height,
          resolution: resolutionLabel,
          provider: providerUsedLabel,
          generationTimeMs: totalTimeMs,
          seed,
          duration,
          fps,
          cameraMovement,
          particleEffect,
          loopAnimation,
          sourceImageUrl,
        },
      ],
      originalPrompt,
      optimizedPrompt: fullMotionPrompt,
      providerUsed: providerUsedLabel,
      generationTimeMs: totalTimeMs,
    };
  }

  // --- ADAPTER 0: Pollinations FLUX (Free AI Engine) ---
  if (selectedProvider === 'pollinations' || selectedProvider === 'pollinations-flux') {
    return generatePollinationsImages(optimizedPrompt, stylePreset, count, aspectRatio, originalPrompt, startTime);
  }

  // --- ADAPTER 1: Google Imagen / Gemini Image Generation ---
  if (selectedProvider === 'google-imagen') {
    const key = apiKeys?.geminiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      if (provider === 'auto') {
        console.log('[AI Image Generator Log] Gemini API key missing. Auto fallback to Pollinations FLUX.');
        return generatePollinationsImages(optimizedPrompt, stylePreset, count, aspectRatio, originalPrompt, startTime);
      }
      throw new Error('Google Gemini API key is missing. Please configure GEMINI_API_KEY in Provider Keys.');
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });
      const fullPrompt = `High quality artwork: ${optimizedPrompt}. Style: ${stylePreset}.`;

      const modelsToTry = ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];
      let imageBase64List: string[] = [];
      let lastError: any = null;
      let successfulModel = '';

      for (const modelName of modelsToTry) {
        try {
          console.log(`[AI Image Generator Log] Trying Google Gemini Image model: ${modelName}`);
          const configObj: any = {
            imageConfig: {
              aspectRatio: (aspectRatio as any) || '1:1',
            },
          };
          if (modelName === 'gemini-3.1-flash-image') {
            configObj.imageConfig.imageSize = '1K';
          }

          const response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts: [{ text: fullPrompt }],
            },
            config: configObj,
          });

          const candidates = response.candidates || [];
          if (candidates.length > 0 && candidates[0].content?.parts) {
            for (const part of candidates[0].content.parts) {
              if (part.inlineData?.data) {
                imageBase64List.push(part.inlineData.data);
              }
            }
          }

          if (imageBase64List.length > 0) {
            successfulModel = modelName;
            break;
          } else {
            console.warn(`[AI Image Generator Log] Model ${modelName} returned candidate response without inline image data.`);
          }
        } catch (err: any) {
          console.warn(`[AI Image Generator Log] Google Gemini model ${modelName} failed:`, err?.message || err);
          lastError = err;
        }
      }

      if (imageBase64List.length === 0) {
        const errStr = String(lastError?.message || lastError || '');
        const isQuotaErr = errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('Quota exceeded') || errStr.includes('limit: 0');

        if (isQuotaErr && provider === 'auto') {
          console.warn('[AI Image Generator Log] Google Gemini free tier quota exceeded. Auto mode falling back to Pollinations FLUX.');
          return generatePollinationsImages(optimizedPrompt, stylePreset, count, aspectRatio, originalPrompt, startTime);
        }

        const errMsg = isQuotaErr
          ? 'Google Gemini free tier API key has 0 image generation quota. Please configure a custom billing-enabled Gemini API key in "Configure Provider Keys", or select Pollinations FLUX / OpenAI / Stability in Provider Settings.'
          : (lastError?.message || 'Google Gemini API returned no inline image data.');

        console.error('[AI Image Generator Error] Google Gemini Image generation failed:', errMsg);
        throw new Error(`Google Gemini Image API Error: ${errMsg}`);
      }

      const totalTimeMs = Date.now() - startTime;
      const dimensions = getDimensionsFromRatio(aspectRatio);

      const images = imageBase64List.slice(0, count).map((b64, idx) => ({
        id: `img-google-${Date.now()}-${idx}`,
        url: `data:image/png;base64,${b64}`,
        width: dimensions.width,
        height: dimensions.height,
        resolution: `${dimensions.width}x${dimensions.height}`,
        provider: `Google Gemini (${successfulModel})`,
        generationTimeMs: totalTimeMs,
        seed: Math.floor(Math.random() * 899999) + 100000,
      }));

      console.log(`[AI Image Generator Success] Generated ${images.length} image(s) via Google Gemini (${successfulModel}) in ${totalTimeMs}ms`);

      return {
        images,
        originalPrompt,
        optimizedPrompt,
        providerUsed: `Google Gemini (${successfulModel})`,
        generationTimeMs: totalTimeMs,
      };
    } catch (err: any) {
      const errStr = String(err?.message || err);
      const isQuotaErr = errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('Quota exceeded') || errStr.includes('limit: 0');

      if (isQuotaErr && provider === 'auto') {
        console.warn('[AI Image Generator Log] Google Gemini free tier quota exceeded. Auto mode falling back to Pollinations FLUX.');
        return generatePollinationsImages(optimizedPrompt, stylePreset, count, aspectRatio, originalPrompt, startTime);
      }

      console.error('[AI Image Generator Error] Google Gemini Image generation failed:', err?.message || err);
      throw new Error(err?.message || 'Google Gemini Image API Error');
    }
  }

  // --- ADAPTER 2: OpenAI DALL-E 3 ---
  if (selectedProvider === 'openai-dalle') {
    const key = apiKeys?.openaiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key is missing. Please configure OPENAI_API_KEY.');
    }

    try {
      const size = aspectRatio === '16:9' ? '1792x1024' : aspectRatio === '9:16' ? '1024x1792' : '1024x1024';

      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: optimizedPrompt,
          n: 1,
          size,
          response_format: 'b64_json',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `OpenAI HTTP ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const totalTimeMs = Date.now() - startTime;
      const dimensions = getDimensionsFromRatio(aspectRatio);

      const images = data.data.map((item: any, idx: number) => ({
        id: `img-dalle-${Date.now()}-${idx}`,
        url: `data:image/png;base64,${item.b64_json}`,
        width: dimensions.width,
        height: dimensions.height,
        resolution: size,
        provider: 'OpenAI DALL-E 3',
        generationTimeMs: totalTimeMs,
        seed: Math.floor(Math.random() * 899999) + 100000,
      }));

      console.log(`[AI Image Generator Success] Generated image via OpenAI DALL-E 3 in ${totalTimeMs}ms`);

      return {
        images,
        originalPrompt,
        optimizedPrompt,
        providerUsed: 'OpenAI DALL-E 3',
        generationTimeMs: totalTimeMs,
      };
    } catch (err: any) {
      console.error('[AI Image Generator Error] OpenAI DALL-E 3 failed:', err?.message || err);
      throw new Error(`OpenAI DALL-E 3 API Error: ${err?.message || 'Failed to generate image'}`);
    }
  }

  // --- ADAPTER 3: Stability AI ---
  if (selectedProvider === 'stability') {
    const key = apiKeys?.stabilityKey || process.env.STABILITY_API_KEY;
    if (!key) {
      throw new Error('Stability AI key is missing. Please configure STABILITY_API_KEY.');
    }

    try {
      const dimensions = getDimensionsFromRatio(aspectRatio);
      const res = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: optimizedPrompt, weight: 1 }],
          cfg_scale: 7,
          height: dimensions.height,
          width: dimensions.width,
          steps: 30,
          samples: count,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.message || `Stability HTTP ${res.status}`);
      }

      const data = await res.json();
      const totalTimeMs = Date.now() - startTime;

      const images = data.artifacts.map((art: any, idx: number) => ({
        id: `img-stability-${Date.now()}-${idx}`,
        url: `data:image/png;base64,${art.base64}`,
        width: dimensions.width,
        height: dimensions.height,
        resolution: `${dimensions.width}x${dimensions.height}`,
        provider: 'Stability SDXL',
        generationTimeMs: totalTimeMs,
        seed: art.seed || Math.floor(Math.random() * 899999) + 100000,
      }));

      return {
        images,
        originalPrompt,
        optimizedPrompt,
        providerUsed: 'Stability SDXL',
        generationTimeMs: totalTimeMs,
      };
    } catch (err: any) {
      console.error('[AI Image Generator Error] Stability AI failed:', err?.message || err);
      throw new Error(`Stability AI Error: ${err?.message || 'Failed to generate image'}`);
    }
  }

  // --- ADAPTER 4: Replicate (FLUX) ---
  if (selectedProvider === 'replicate') {
    const key = apiKeys?.replicateKey || process.env.REPLICATE_API_KEY;
    if (!key) {
      throw new Error('Replicate API key is missing. Please configure REPLICATE_API_KEY.');
    }

    try {
      const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          Prefer: 'wait',
        },
        body: JSON.stringify({
          input: {
            prompt: optimizedPrompt,
            aspect_ratio: aspectRatio === '16:9' ? '16:9' : aspectRatio === '9:16' ? '9:16' : '1:1',
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.detail || `Replicate HTTP ${res.status}`);
      }

      const data = await res.json();
      const outputUrl = Array.isArray(data.output) ? data.output[0] : data.output;
      if (!outputUrl) {
        throw new Error('Replicate returned empty image output.');
      }

      const totalTimeMs = Date.now() - startTime;
      const dimensions = getDimensionsFromRatio(aspectRatio);

      return {
        images: [
          {
            id: `img-replicate-${Date.now()}`,
            url: outputUrl,
            width: dimensions.width,
            height: dimensions.height,
            resolution: `${dimensions.width}x${dimensions.height}`,
            provider: 'Replicate (FLUX.1)',
            generationTimeMs: totalTimeMs,
            seed: Math.floor(Math.random() * 899999) + 100000,
          },
        ],
        originalPrompt,
        optimizedPrompt,
        providerUsed: 'Replicate (FLUX.1)',
        generationTimeMs: totalTimeMs,
      };
    } catch (err: any) {
      console.error('[AI Image Generator Error] Replicate failed:', err?.message || err);
      throw new Error(`Replicate API Error: ${err?.message || 'Failed to generate image'}`);
    }
  }

  // --- ADAPTER 5: Hugging Face Inference API ---
  if (selectedProvider === 'huggingface') {
    const key = apiKeys?.huggingfaceKey || process.env.HUGGINGFACE_API_KEY;
    if (!key) {
      throw new Error('Hugging Face token is missing. Please configure HUGGINGFACE_API_KEY.');
    }

    try {
      const res = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: optimizedPrompt }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Hugging Face HTTP ${res.status}: ${errText}`);
      }

      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const totalTimeMs = Date.now() - startTime;
      const dimensions = getDimensionsFromRatio(aspectRatio);

      return {
        images: [
          {
            id: `img-hf-${Date.now()}`,
            url: `data:image/png;base64,${base64}`,
            width: dimensions.width,
            height: dimensions.height,
            resolution: `${dimensions.width}x${dimensions.height}`,
            provider: 'Hugging Face (FLUX.1)',
            generationTimeMs: totalTimeMs,
            seed: Math.floor(Math.random() * 899999) + 100000,
          },
        ],
        originalPrompt,
        optimizedPrompt,
        providerUsed: 'Hugging Face (FLUX.1)',
        generationTimeMs: totalTimeMs,
      };
    } catch (err: any) {
      console.error('[AI Image Generator Error] Hugging Face failed:', err?.message || err);
      throw new Error(`Hugging Face API Error: ${err?.message || 'Failed to generate image'}`);
    }
  }

  throw new Error(`Selected provider "${selectedProvider}" is not configured with an API key.`);
}

function getDimensionsFromRatio(aspectRatio?: string): { width: number; height: number } {
  switch (aspectRatio) {
    case '16:9':
      return { width: 1280, height: 720 };
    case '9:16':
      return { width: 720, height: 1280 };
    case '4:3':
      return { width: 1024, height: 768 };
    case '3:2':
      return { width: 1080, height: 720 };
    case '4:5':
      return { width: 1080, height: 1350 };
    case '21:9':
      return { width: 1680, height: 720 };
    default:
      return { width: 1024, height: 1024 };
  }
}
