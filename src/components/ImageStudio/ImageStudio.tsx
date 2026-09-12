import React, { useState, useEffect, useRef } from 'react';
import {
  GeneratedMediaItem,
  ImagePromptHistory,
  ImageStylePreset,
  AspectRatioOption,
  ProviderConfig,
  UserApiKeys,
  MediaMode,
  GifDurationOption,
  VideoDurationOption,
  CameraMovementOption,
  ParticleEffectOption,
  VideoQualityOption,
  MotionStrengthOption,
  VideoFpsOption,
} from '../../types';
import { ImageCard } from './ImageCard';
import { ImageEditorModal } from './ImageEditorModal';
import { HistoryDrawer } from './HistoryDrawer';
import { ProviderSetupModal } from './ProviderSetupModal';
import { apiClient } from '../../lib/apiClient';
import {
  Sparkles,
  Wand2,
  Shuffle,
  History,
  ImageIcon,
  RefreshCw,
  AlertTriangle,
  Key,
  MessageSquare,
  Copy,
  Check,
  Download,
  Film,
  RotateCcw,
  Upload,
  Heart,
  SlidersHorizontal,
  CheckCircle2,
  Send,
  X,
  Play,
  Sliders,
  Layers,
  Sparkle,
} from 'lucide-react';

const RANDOM_PROMPTS = [
  'ek black panther rain me chal raha ho',
  'Panther jungle me running kare',
  'Blue eyes ke sath realistic tiger',
  'Cyberpunk city me ek ladki walk kar rahi hai',
  'car ko fast race karte hue dikhao',
  'Sher dheere dheere camera ki taraf aaye aur piche sunset ho',
  'Luxury coffee logo with golden geometric panther emblem',
  'Futuristic cyberpunk neon metropolis at night with rainy reflections',
  'Minimalist black business card with gold foil embossed typography',
  'Cute panther mascot wearing a futuristic shiny space helmet',
];

const STYLE_PRESETS: { id: ImageStylePreset; label: string; desc: string }[] = [
  { id: 'luxury', label: 'Luxury Gold', desc: 'Premium black & gold aesthetic' },
  { id: 'realistic', label: 'Photorealistic', desc: '8k studio photography' },
  { id: 'logo', label: 'Logo Mark', desc: 'Vector brand emblems' },
  { id: 'vector', label: 'Vector Style', desc: 'Clean paths & flat fills' },
  { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Neon lighting & sci-fi' },
  { id: 'minimal', label: 'Minimalist', desc: 'Clean typography & negative space' },
  { id: 'illustration', label: 'Illustration', desc: 'Artistic digital drawing' },
  { id: '3d', label: '3D Render', desc: 'Octane render isometric style' },
  { id: 'anime', label: 'Anime Style', desc: 'Vibrant Japanese animation art' },
  { id: 'gaming', label: 'Game Asset', desc: 'Fantasy UI & character icons' },
];

const PROVIDER_OPTIONS = [
  { id: 'auto', label: 'Auto (Best Available Engine)' },
  { id: 'google-imagen', label: 'Google Veo / Imagen 3' },
  { id: 'openai-dalle', label: 'OpenAI (DALL-E 3 / Sora Video)' },
  { id: 'runway', label: 'Runway (Gen-2 / Gen-3 Alpha)' },
  { id: 'luma', label: 'Luma Dream Machine' },
  { id: 'pika', label: 'Pika Labs AI' },
  { id: 'stability', label: 'Stability AI (SDXL)' },
  { id: 'pollinations', label: 'FLUX.1 (Pollinations AI Engine)' },
  { id: 'replicate', label: 'Replicate AI Engine' },
  { id: 'huggingface', label: 'Hugging Face AI Engine' },
];

const VIDEO_ANIMATION_PROMPTS = [
  { emoji: '🐆', text: 'ek black panther rain me chal raha ho' },
  { emoji: '🐅', text: 'Panther jungle me running kare' },
  { emoji: '🦁', text: 'Sher dheere dheere camera ki taraf aaye aur piche sunset ho' },
  { emoji: '✨', text: 'Eyes glow kare aur halka smoke nikle' },
  { emoji: '🏙️', text: 'Cyberpunk city me ek ladki walk kar rahi hai' },
  { emoji: '🏎️', text: 'car ko fast race karte hue dikhao' },
  { emoji: '🔍', text: 'ye image ko animate karo aur camera zoom in kare' },
  { emoji: '👧', text: 'Make the girl smile naturally and wave her hand smoothly.' },
];

export type GenerationTab = 'image' | 'gif' | 'video';

interface ChatTurn {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
  imageUrl?: string;
  originalPrompt?: string;
  optimizedPrompt?: string;
  timestamp: number;
}

export const ImageStudio: React.FC = () => {
  const [activeStudioTab, setActiveStudioTab] = useState<'studio' | 'conversational'>('studio');
  const [generationTab, setGenerationTab] = useState<GenerationTab>('image');

  // Prompts & Optimizations
  const [prompt, setPrompt] = useState<string>('');
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [optimizedPrompt, setOptimizedPrompt] = useState<string>('');
  const [showPromptOptimization, setShowPromptOptimization] = useState<boolean>(false);

  // Common Settings
  const [selectedStyle, setSelectedStyle] = useState<ImageStylePreset>('luxury');
  const [selectedProvider, setSelectedProvider] = useState<string>('auto');
  const [imageCount, setImageCount] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('1:1');

  // Video Settings
  const [videoDuration, setVideoDuration] = useState<VideoDurationOption>('5s');
  const [videoFps, setVideoFps] = useState<VideoFpsOption>(30);
  const [videoQuality, setVideoQuality] = useState<VideoQualityOption>('Full HD');
  const [cameraMovement, setCameraMovement] = useState<CameraMovementOption>('cinematic');
  const [particleEffect, setParticleEffect] = useState<ParticleEffectOption>('none');

  // GIF Settings
  const [gifDuration, setGifDuration] = useState<GifDurationOption>('3s');
  const [loopAnimation, setLoopAnimation] = useState<boolean>(true);

  // Source Image Upload
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  // Loading States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  const [loadingStepText, setLoadingStepText] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Conversational Chat
  const [chatInput, setChatInput] = useState<string>('');
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([]);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // User Keys & Persistence
  const [userKeys, setUserKeys] = useState<UserApiKeys>(() => {
    try {
      const saved = localStorage.getItem('panther_user_api_keys');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [currentImages, setCurrentImages] = useState<GeneratedMediaItem[]>([]);
  const [history, setHistory] = useState<ImagePromptHistory[]>(() => {
    try {
      const saved = localStorage.getItem('panther_image_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState<boolean>(false);
  const [providerConfig, setProviderConfig] = useState<ProviderConfig | null>(null);

  // Editor Modal
  const [editingImage, setEditingImage] = useState<GeneratedMediaItem | null>(null);
  const [editorInitialTool, setEditorInitialTool] = useState<string>('remove-bg');
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Load config
  useEffect(() => {
    fetchProviderConfig();
  }, []);

  // Timer
  useEffect(() => {
    let timer: any = null;
    if (isGenerating) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 0.1);
      }, 100);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatTurns]);

  // Save history
  useEffect(() => {
    try {
      localStorage.setItem('panther_image_history', JSON.stringify(history));
    } catch (e) {
      console.warn('LocalStorage history save failed:', e);
    }
  }, [history]);

  const handleSwitchToAuto = () => {
    setSelectedProvider('auto');
    setGenerationError(null);
  };

  const handleSaveKeys = (keys: UserApiKeys) => {
    setUserKeys(keys);
    try {
      localStorage.setItem('panther_user_api_keys', JSON.stringify(keys));
    } catch (e) {
      console.warn('Failed to save API keys to local storage:', e);
    }
    fetchProviderConfig();
  };

  const fetchProviderConfig = async () => {
    try {
      const data = await apiClient.fetchWithCache<{ config: ProviderConfig }>('/api/image-gen/config', {
        method: 'POST',
        body: JSON.stringify({ apiKeys: userKeys }),
      });
      if (data?.config) {
        setProviderConfig(data.config);
      }
    } catch (err) {
      console.warn('Failed to fetch image gen config:', err);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    setGenerationError(null);
    try {
      const data = await apiClient.fetchWithCache<{ originalPrompt: string; optimizedPrompt: string }>(
        '/api/image-gen/enhance-prompt',
        {
          method: 'POST',
          body: JSON.stringify({ prompt, stylePreset: selectedStyle, apiKeys: userKeys, mediaType: generationTab }),
        }
      );

      setOriginalPrompt(data.originalPrompt || prompt);
      setOptimizedPrompt(data.optimizedPrompt || prompt);
      setShowPromptOptimization(true);
    } catch (err: any) {
      console.error('Enhance prompt failed:', err);
      setOriginalPrompt(prompt);
      setOptimizedPrompt(`${prompt}, ultra detailed, high quality, cinematic composition.`);
      setShowPromptOptimization(true);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleRandomPrompt = () => {
    const random = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    setPrompt(random);
    setGenerationError(null);
  };

  // Image File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImageUrl(event.target?.result as string);
        setUploadedFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImageUrl(event.target?.result as string);
        setUploadedFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearUploadedImage = () => {
    setSourceImageUrl(null);
    setUploadedFileName(null);
  };

  // Main Generation Action
  const handleGenerateMedia = async (overridePrompt?: string) => {
    const promptToUse = overridePrompt || optimizedPrompt || prompt;

    // Validation
    if (generationTab === 'gif' && !sourceImageUrl) {
      setGenerationError('Please upload an image to animate into a GIF.');
      return;
    }

    if (!promptToUse.trim()) {
      setGenerationError('Please enter a descriptive prompt.');
      return;
    }

    setGenerationError(null);
    setIsGenerating(true);

    const isVideo = generationTab === 'video';
    const isGif = generationTab === 'gif';
    const isImageToVideo = isVideo && Boolean(sourceImageUrl);
    const isTextToVideo = isVideo && !sourceImageUrl;

    const steps = isVideo
      ? [
          isImageToVideo ? '1. Analyzing Uploaded Image & Prompt...' : '1. Analyzing Text Prompt...',
          '2. Initializing AI Video Engine...',
          '3. Synthesizing Motion Frames & Keyframes...',
          '4. Rendering High FPS Video Stream...',
          '5. Finalizing Video Asset...',
        ]
      : isGif
      ? [
          '1. Loading Source Image...',
          '2. Initializing GIF Animation Pipeline...',
          '3. Applying Motion Frames...',
          '4. Compiling Animated GIF...',
          '5. Ready!',
        ]
      : [
          '1. Analyzing Prompt Details...',
          '2. Contacting AI Diffusion Engine...',
          '3. Generating Image Composition...',
          '4. Enhancing Resolution & Lighting...',
          '5. Asset Complete!',
        ];

    setLoadingStepIndex(0);
    setLoadingStepText(steps[0]);

    try {
      await new Promise((r) => setTimeout(r, 200));
      setLoadingStepIndex(1);
      setLoadingStepText(steps[1]);

      const activeDuration = isVideo ? videoDuration : isGif ? gifDuration : undefined;

      // Call Backend API
      const data = await apiClient.fetchWithCache<any>(
        '/api/image-gen/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            prompt: promptToUse,
            mediaType: generationTab,
            stylePreset: selectedStyle,
            imageCount: isVideo || isGif ? 1 : imageCount,
            aspectRatio,
            provider: selectedProvider,
            duration: activeDuration,
            cameraMovement,
            particleEffect,
            loopAnimation,
            fps: videoFps,
            videoQuality,
            sourceImageUrl: sourceImageUrl || undefined,
            apiKeys: userKeys,
          }),
        },
        0, // ttlMs = 0 → never cache one-shot generations
        0, // no auto-retry (regeneration is user-initiated)
        300000 // AI engines can take up to 5 minutes
      );

      setLoadingStepIndex(2);
      setLoadingStepText(steps[2]);
      await new Promise((r) => setTimeout(r, 200));

      setLoadingStepIndex(3);
      setLoadingStepText(steps[3]);

      let finalMediaUrl = data.images?.[0]?.url;

      setLoadingStepIndex(4);
      setLoadingStepText(steps[4]);

      if (finalMediaUrl) {
        const generatedList: GeneratedMediaItem[] = [
          {
            id: `media-${Date.now()}`,
            url: finalMediaUrl,
            mediaType: generationTab,
            originalPrompt: data.originalPrompt || promptToUse,
            optimizedPrompt: data.optimizedPrompt || promptToUse,
            stylePreset: selectedStyle,
            aspectRatio,
            createdAt: Date.now(),
            provider: isVideo
              ? isImageToVideo
                ? 'Panther AI (Image → Video)'
                : 'Panther AI (Text → Video)'
              : isGif
              ? 'Panther AI (Image → GIF)'
              : data.providerUsed || 'Panther AI',
            width: data.images?.[0]?.width || 1024,
            height: data.images?.[0]?.height || 1024,
            resolution: videoQuality,
            generationTimeMs: data.generationTimeMs || 2500,
            seed: data.images?.[0]?.seed || Math.floor(Math.random() * 899999) + 100000,
            duration: activeDuration,
            fps: videoFps,
            cameraMovement,
            particleEffect,
            loopAnimation,
            sourceImageUrl: sourceImageUrl || undefined,
          },
        ];

        setCurrentImages(generatedList);
        setOriginalPrompt(data.originalPrompt || promptToUse);
        setOptimizedPrompt(data.optimizedPrompt || promptToUse);
        setShowPromptOptimization(true);

        // Save to History
        const newHistoryItem: ImagePromptHistory = {
          id: `hist-${Date.now()}`,
          mediaType: generationTab,
          originalPrompt: data.originalPrompt || promptToUse,
          optimizedPrompt: data.optimizedPrompt || promptToUse,
          stylePreset: selectedStyle,
          imageCount: 1,
          aspectRatio,
          timestamp: Date.now(),
          createdAt: Date.now(),
          items: generatedList,
          images: generatedList,
        };
        setHistory((prev) => [newHistoryItem, ...prev]);

        if (chatTurns.length === 0) {
          setChatTurns([
            {
              id: `turn-init-${Date.now()}`,
              sender: 'user',
              message: promptToUse,
              timestamp: Date.now(),
            },
            {
              id: `turn-res-${Date.now()}`,
              sender: 'assistant',
              message: `Generated ${(generationTab || 'image').toUpperCase()} asset.`,
              imageUrl: finalMediaUrl,
              originalPrompt: data.originalPrompt || promptToUse,
              optimizedPrompt: data.optimizedPrompt || promptToUse,
              timestamp: Date.now() + 1,
            },
          ]);
        }
      } else {
        throw new Error('Failed to generate media output.');
      }
    } catch (err: any) {
      console.error('[AI Media Generator Error]:', err?.message || err);
      setGenerationError(err?.message || 'Failed to generate media asset.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Conversational Edit Handler
  const handleSendConversationalEdit = async (customCmd?: string) => {
    const cmd = customCmd || chatInput;
    if (!cmd.trim() || isGenerating) return;

    setChatInput('');
    setGenerationError(null);
    setIsGenerating(true);

    const activeImage = currentImages[0];
    const previousPromptToUse = activeImage?.optimizedPrompt || activeImage?.originalPrompt || prompt;

    const userTurn: ChatTurn = {
      id: `turn-${Date.now()}`,
      sender: 'user',
      message: cmd,
      timestamp: Date.now(),
    };
    setChatTurns((prev) => [...prev, userTurn]);

    setLoadingStepIndex(0);
    setLoadingStepText('Analyzing Command...');

    try {
      await new Promise((r) => setTimeout(r, 300));
      setLoadingStepIndex(1);
      setLoadingStepText('Applying Transformation...');

      const data = await apiClient.fetchWithCache<any>(
        '/api/image-gen/conversational',
        {
          method: 'POST',
          body: JSON.stringify({
            chatPrompt: cmd,
            previousPrompt: previousPromptToUse,
            stylePreset: selectedStyle,
            aspectRatio,
            provider: selectedProvider,
            apiKeys: userKeys,
            mediaType: generationTab,
          }),
        },
        0,
        0,
        300000
      );

      setLoadingStepIndex(2);
      setLoadingStepText('Rendering Updated Asset...');

      if (data.images && data.images.length > 0) {
        const newImg: GeneratedMediaItem = {
          id: data.images[0].id,
          url: data.images[0].url,
          mediaType: generationTab,
          originalPrompt: data.userInstruction || cmd,
          optimizedPrompt: data.optimizedPrompt || cmd,
          stylePreset: selectedStyle,
          aspectRatio,
          createdAt: Date.now(),
          provider: data.providerUsed || 'AI Model',
          width: data.images[0].width,
          height: data.images[0].height,
          resolution: data.images[0].resolution,
          generationTimeMs: data.generationTimeMs,
          seed: data.images[0].seed,
        };

        setCurrentImages([newImg, ...currentImages]);

        const assistantTurn: ChatTurn = {
          id: `turn-ai-${Date.now()}`,
          sender: 'assistant',
          message: `Updated media: "${cmd}"`,
          imageUrl: newImg.url,
          originalPrompt: cmd,
          optimizedPrompt: data.optimizedPrompt,
          timestamp: Date.now(),
        };
        setChatTurns((prev) => [...prev, assistantTurn]);
      } else {
        throw new Error(data.error || 'Conversational edit failed.');
      }
    } catch (err: any) {
      console.error('[Conversational Edit Error]:', err);
      setGenerationError(err?.message || 'Failed conversational edit.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = (p: string) => {
    navigator.clipboard.writeText(p);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownloadMedia = (media: GeneratedMediaItem) => {
    const ext = media.mediaType === 'video' ? 'mp4' : media.mediaType === 'gif' ? 'gif' : 'png';
    const a = document.createElement('a');
    a.download = `panther-ai-${media.mediaType || 'media'}-${Date.now()}.${ext}`;
    a.href = media.url;
    a.click();
  };

  // Smart Video Mode helper variables
  const isVideoTab = generationTab === 'video';
  const isGifTab = generationTab === 'gif';
  const isImageTab = generationTab === 'image';
  const hasUploadedImage = Boolean(sourceImageUrl);

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 min-h-[calc(100vh-160px)] flex flex-col justify-between text-slate-100 font-sans">
      <div className="space-y-8">
        {/* Top Header & Settings Bar */}
        <div className="bg-[#0E1628] border border-[#00D8FF]/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 z-10">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#00D8FF]/20 to-[#007BFF]/20 border border-[#00D8FF]/40 text-[#00D8FF] shadow-lg">
              <Film className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
                  Panther AI Studio
                </h1>
                <span className="px-3 py-1 text-[10px] font-extrabold tracking-widest uppercase bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
                  Image • GIF • Smart Video
                </span>
              </div>
              <p className="text-xs text-[#C9D4E5] mt-1 max-w-xl">
                Unified AI creative platform for generating ultra-high resolution images, animated GIFs, and smart AI video clips.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end z-10">
            <div className="flex items-center p-1 bg-[#060B16] border border-[#00D8FF]/20 rounded-2xl">
              <button
                onClick={() => setActiveStudioTab('studio')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeStudioTab === 'studio'
                    ? 'bg-[#00D8FF] text-black shadow-lg shadow-[#00D8FF]/20'
                    : 'text-[#C9D4E5] hover:text-white'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Media Studio</span>
              </button>

              <button
                onClick={() => setActiveStudioTab('conversational')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeStudioTab === 'conversational'
                    ? 'bg-[#00D8FF] text-black shadow-lg shadow-[#00D8FF]/20'
                    : 'text-[#C9D4E5] hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Conversational AI</span>
              </button>
            </div>

            <button
              onClick={() => setIsProviderModalOpen(true)}
              className="p-3 rounded-2xl bg-[#060B16] hover:bg-[#111C30] text-[#00D8FF] border border-[#00D8FF]/30 transition-all flex items-center gap-2 text-xs font-bold shadow-md"
              title="Provider Keys & Settings"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Provider Keys</span>
            </button>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-3 rounded-2xl bg-[#060B16] hover:bg-[#111C30] text-slate-300 hover:text-white border border-[#00D8FF]/20 transition-all flex items-center gap-2 text-xs font-bold"
              title="Generation History"
            >
              <History className="w-4 h-4 text-[#00D8FF]" />
            </button>
          </div>
        </div>

        {/* Studio Generator View */}
        {activeStudioTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Control Panel */}
            <div className="lg:col-span-7 bg-[#0E1628] border border-[#00D8FF]/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
              {/* EXACT 3 GENERATION TABS ONLY */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00D8FF] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Generation Tab</span>
                </label>

                <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#060B16] rounded-2xl border border-[#00D8FF]/20">
                  <button
                    onClick={() => {
                      setGenerationTab('image');
                      setGenerationError(null);
                    }}
                    className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                      generationTab === 'image'
                        ? 'bg-[#00D8FF] text-black shadow-lg shadow-[#00D8FF]/25 scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>🖼 Text → Image</span>
                  </button>

                  <button
                    onClick={() => {
                      setGenerationTab('gif');
                      setGenerationError(null);
                    }}
                    className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                      generationTab === 'gif'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-lg shadow-amber-500/25 scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>🖌 Image → GIF</span>
                  </button>

                  <button
                    onClick={() => {
                      setGenerationTab('video');
                      setGenerationError(null);
                    }}
                    className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                      generationTab === 'video'
                        ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    <span>🎬 Video</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: TEXT -> IMAGE */}
              {isImageTab && (
                <div className="space-y-6">
                  {/* Prompt */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-[#00D8FF] flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Prompt</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleRandomPrompt}
                          className="px-2.5 py-1 rounded-xl bg-[#060B16] hover:bg-[#111C30] text-[11px] font-bold text-slate-300 border border-[#00D8FF]/20 transition-all flex items-center gap-1.5"
                        >
                          <Shuffle className="w-3 h-3 text-[#00D8FF]" />
                          <span>Random</span>
                        </button>

                        <button
                          onClick={handleEnhancePrompt}
                          disabled={isEnhancing || !prompt.trim()}
                          className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>{isEnhancing ? 'Optimizing...' : 'AI Enhance'}</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={4}
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value);
                        setShowPromptOptimization(false);
                      }}
                      placeholder="Describe your image vision in detail (e.g., A luxury coffee logo with golden geometric panther emblem on black marble)..."
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#060B16] border border-[#00D8FF]/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00D8FF] transition-all resize-none font-sans"
                    />
                  </div>

                  {/* Style Presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
                      Art Style Preset
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {STYLE_PRESETS.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => setSelectedStyle(st.id)}
                          className={`p-2.5 rounded-2xl border text-left transition-all ${
                            selectedStyle === st.id
                              ? 'bg-[#00D8FF] text-black border-[#00D8FF] font-bold shadow-lg shadow-[#00D8FF]/20'
                              : 'bg-[#060B16] hover:bg-[#111C30] text-[#C9D4E5] border-[#00D8FF]/20'
                          }`}
                        >
                          <span className="block text-xs font-bold truncate">{st.label}</span>
                          <span className="block text-[9px] opacity-75 truncate">{st.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">AI Engine</label>
                      <select
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#060B16] border border-[#00D8FF]/30 text-white text-xs font-bold"
                      >
                        {PROVIDER_OPTIONS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Aspect Ratio</label>
                      <div className="grid grid-cols-4 gap-1">
                        {(['1:1', '16:9', '9:16', '4:3'] as AspectRatioOption[]).map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                              aspectRatio === ratio
                                ? 'bg-[#00D8FF] text-black border-[#00D8FF]'
                                : 'bg-[#060B16] text-[#C9D4E5] border-[#00D8FF]/20'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Output Count</label>
                      <div className="grid grid-cols-4 gap-1">
                        {[1, 2, 3, 4].map((num) => (
                          <button
                            key={num}
                            onClick={() => setImageCount(num)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              imageCount === num
                                ? 'bg-[#00D8FF] text-black border-[#00D8FF]'
                                : 'bg-[#060B16] text-[#C9D4E5] border-[#00D8FF]/20'
                            }`}
                          >
                            {num}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IMAGE -> GIF */}
              {isGifTab && (
                <div className="space-y-6">
                  {/* Upload Source Image */}
                  <div className="p-5 rounded-2xl bg-[#060B16] border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>Source Image to Animate into GIF</span>
                      </label>
                      {hasUploadedImage && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Image Loaded
                        </span>
                      )}
                    </div>

                    {hasUploadedImage ? (
                      <div className="relative aspect-video max-h-52 rounded-2xl overflow-hidden border border-amber-500/40 bg-black group">
                        <img src={sourceImageUrl!} alt="Source for GIF" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label className="px-3.5 py-2 rounded-xl bg-amber-400 text-black font-extrabold text-xs cursor-pointer hover:bg-amber-300 transition-all shadow-lg">
                            Change Image
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                          </label>
                          <button
                            onClick={handleClearUploadedImage}
                            className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-extrabold text-xs hover:bg-rose-500 transition-all shadow-lg"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                        onDragLeave={() => setIsDraggingFile(false)}
                        onDrop={handleFileDrop}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                          isDraggingFile
                            ? 'border-amber-400 bg-amber-500/10'
                            : 'border-amber-500/30 hover:border-amber-400 bg-[#0E1628]/50'
                        }`}
                      >
                        <div className="p-3.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Drag & drop source image or click to browse</p>
                          <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, WEBP</p>
                        </div>
                        <label className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs cursor-pointer shadow-lg transition-all">
                          Select Image
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Motion Prompt */}
                  <div className="space-y-3">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      <span>GIF Motion Prompt</span>
                    </label>

                    <textarea
                      rows={3}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe GIF animation motion (e.g., 'Animate smooth water wave reflection', 'Gentle camera zoom with floating sparkles')..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#060B16] border border-amber-500/30 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition-all resize-none"
                    />
                  </div>

                  {/* GIF Settings */}
                  <div className="p-4 rounded-2xl bg-[#060B16] border border-amber-500/20 space-y-4">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-amber-400 block border-b border-amber-500/20 pb-2">
                      GIF Settings
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">GIF Duration</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['2s', '3s', '5s'] as GifDurationOption[]).map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setGifDuration(d)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                gifDuration === d
                                  ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                                  : 'bg-[#0E1628] text-slate-300 border-amber-500/20'
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Loop Mode</label>
                        <button
                          type="button"
                          onClick={() => setLoopAnimation(!loopAnimation)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            loopAnimation
                              ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                              : 'bg-[#0E1628] text-slate-400 border-amber-500/20'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{loopAnimation ? 'Infinite Seamless Loop ON' : 'Single Play'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SMART VIDEO MODE */}
              {isVideoTab && (
                <div className="space-y-6">
                  {/* AUTOMATIC SMART MODE DETECTOR BADGE */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-indigo-950/80 border border-[#00D8FF]/40 shadow-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#00D8FF]/20 text-[#00D8FF] border border-[#00D8FF]/40">
                        <Film className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400">
                            Smart Video Detection:
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase flex items-center gap-1.5 ${
                              hasUploadedImage
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-md'
                                : 'bg-[#00D8FF] text-black shadow-md'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            {hasUploadedImage ? 'Image + Prompt → Video' : 'Text → Video'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#C9D4E5] mt-0.5">
                          {hasUploadedImage
                            ? 'Detected source image. Video will animate your image using prompt motion instructions.'
                            : 'No source image uploaded. Video will generate a complete motion scene from your text prompt.'}
                        </p>
                      </div>
                    </div>

                    {hasUploadedImage && (
                      <button
                        onClick={handleClearUploadedImage}
                        className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove Image (Switch to Text → Video)</span>
                      </button>
                    )}
                  </div>

                  {/* Optional Source Image Uploader for Video */}
                  <div className="p-4 rounded-2xl bg-[#060B16] border border-[#00D8FF]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-[#00D8FF] flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>Source Image (Optional for Image → Video)</span>
                      </label>

                      {hasUploadedImage ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Image Attached
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Upload image to run Image → Video
                        </span>
                      )}
                    </div>

                    {hasUploadedImage ? (
                      <div className="relative aspect-video max-h-48 rounded-2xl overflow-hidden border border-[#00D8FF]/40 bg-black group">
                        <img src={sourceImageUrl!} alt="Source for Video" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label className="px-3.5 py-2 rounded-xl bg-[#00D8FF] text-black font-extrabold text-xs cursor-pointer hover:bg-[#5FFFF7] transition-all shadow-lg">
                            Change Image
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                          </label>
                          <button
                            onClick={handleClearUploadedImage}
                            className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-extrabold text-xs hover:bg-rose-500 transition-all shadow-lg"
                          >
                            Remove Image
                          </button>
                        </div>
                        {uploadedFileName && (
                          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 text-[10px] text-slate-300 border border-white/10 font-mono">
                            📁 {uploadedFileName}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                        onDragLeave={() => setIsDraggingFile(false)}
                        onDrop={handleFileDrop}
                        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer ${
                          isDraggingFile
                            ? 'border-[#00D8FF] bg-[#00D8FF]/10'
                            : 'border-[#00D8FF]/30 hover:border-[#00D8FF]/60 bg-[#0E1628]/50'
                        }`}
                      >
                        <div className="p-3 rounded-full bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Drag & drop image here to run Image → Video</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Or leave empty to run Text → Video</p>
                        </div>
                        <label className="px-3.5 py-1.5 rounded-xl bg-[#00D8FF] hover:bg-[#5FFFF7] text-black font-extrabold text-xs cursor-pointer shadow-lg transition-all">
                          Upload Image
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Video Prompt */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-[#00D8FF] flex items-center gap-2">
                        <Wand2 className="w-4 h-4" />
                        <span>Video Motion Prompt</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleEnhancePrompt}
                        disabled={isEnhancing || !prompt.trim()}
                        className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{isEnhancing ? 'Optimizing...' : 'AI Enhance'}</span>
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={
                        hasUploadedImage
                          ? "Describe movement for uploaded image (e.g., 'Make the girl smile naturally and wave', 'Car driving through rain with reflections')..."
                          : "Describe full video scene (e.g., 'Cinematic panther running through a glowing neon cyber forest in slow motion')..."
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-[#060B16] border border-[#00D8FF]/30 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#00D8FF] transition-all resize-none font-sans"
                    />

                    {/* Quick Motion Examples */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Quick Examples:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {VIDEO_ANIMATION_PROMPTS.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPrompt(item.text)}
                            className="px-2.5 py-1 rounded-xl bg-[#060B16] hover:bg-[#00D8FF]/20 text-[#C9D4E5] hover:text-white border border-[#00D8FF]/20 text-[10px] font-bold transition-all flex items-center gap-1.5"
                          >
                            <span>{item.emoji}</span>
                            <span>"{item.text}"</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* EXACT SUPPORTED SETTINGS FOR VIDEO */}
                  <div className="p-5 rounded-2xl bg-[#060B16] border border-cyan-500/30 space-y-4">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 block border-b border-cyan-500/20 pb-2">
                      Supported Video Settings
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Duration: 3 sec, 5 sec, 8 sec, 10 sec */}
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">
                          Duration
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                          {(['3s', '5s', '8s', '10s'] as VideoDurationOption[]).map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setVideoDuration(d)}
                              className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                                videoDuration === d
                                  ? 'bg-[#00D8FF] text-black border-[#00D8FF] shadow-md'
                                  : 'bg-[#0E1628] text-slate-300 border-[#00D8FF]/20'
                              }`}
                            >
                              {d.replace('s', ' sec')}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Aspect Ratio: 1:1, 16:9, 9:16 */}
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">
                          Aspect Ratio
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {(['1:1', '16:9', '9:16'] as AspectRatioOption[]).map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setAspectRatio(ratio)}
                              className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                                aspectRatio === ratio
                                  ? 'bg-[#00D8FF] text-black border-[#00D8FF]'
                                  : 'bg-[#0E1628] text-slate-300 border-[#00D8FF]/20'
                              }`}
                            >
                              {ratio}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* FPS: 24, 30, 60 */}
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">
                          Frame Rate (FPS)
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {([24, 30, 60] as VideoFpsOption[]).map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => setVideoFps(f)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                videoFps === f
                                  ? 'bg-[#00D8FF] text-black border-[#00D8FF]'
                                  : 'bg-[#0E1628] text-slate-300 border-[#00D8FF]/20'
                              }`}
                            >
                              {f} FPS
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quality: HD, Full HD, 2K, 4K */}
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">
                          Video Quality
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                          {(['HD', 'Full HD', '2K', '4K'] as VideoQualityOption[]).map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => setVideoQuality(q)}
                              className={`py-2 rounded-xl text-[10px] font-extrabold border transition-all ${
                                videoQuality === q
                                  ? 'bg-[#00D8FF] text-black border-[#00D8FF]'
                                  : 'bg-[#0E1628] text-slate-300 border-[#00D8FF]/20'
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Camera Movement & Particle Effects */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-cyan-500/20">
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Camera Motion</label>
                        <select
                          value={cameraMovement}
                          onChange={(e) => setCameraMovement(e.target.value as CameraMovementOption)}
                          className="w-full px-3 py-2 rounded-xl bg-[#0E1628] border border-[#00D8FF]/30 text-white text-xs font-bold"
                        >
                          <option value="cinematic">Cinematic Pan & Tilt</option>
                          <option value="zoom-in">Slow Zoom In</option>
                          <option value="zoom-out">Slow Zoom Out</option>
                          <option value="pan-left">Pan Left</option>
                          <option value="pan-right">Pan Right</option>
                          <option value="rotate">Subtle Rotate</option>
                          <option value="slow-motion">Slow Motion Motion</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Particle Overlay</label>
                        <select
                          value={particleEffect}
                          onChange={(e) => setParticleEffect(e.target.value as ParticleEffectOption)}
                          className="w-full px-3 py-2 rounded-xl bg-[#0E1628] border border-[#00D8FF]/30 text-white text-xs font-bold"
                        >
                          <option value="none">Auto / None</option>
                          <option value="rain">Heavy Rain & Water</option>
                          <option value="fire">Fire & Embers</option>
                          <option value="sparks">Golden Sparks</option>
                          <option value="snow">Falling Snow</option>
                          <option value="smoke">Atmospheric Smoke</option>
                          <option value="water">Flowing Water</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {generationError && (
                <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span className="font-semibold leading-relaxed">{generationError}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => setIsProviderModalOpen(true)}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black text-[11px] font-bold shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Configure API Keys</span>
                    </button>
                    <button
                      onClick={handleSwitchToAuto}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold"
                    >
                      Use Auto Engine
                    </button>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => handleGenerateMedia()}
                disabled={isGenerating}
                className={`w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-2xl ${
                  isGenerating
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : isVideoTab
                    ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white hover:brightness-110 shadow-cyan-500/25'
                    : isGifTab
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110 shadow-amber-500/25'
                    : 'bg-[#00D8FF] hover:bg-[#5FFFF7] text-black shadow-[#00D8FF]/30 scale-[1.01]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing ({elapsedSeconds.toFixed(1)}s)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>
                      {isVideoTab
                        ? hasUploadedImage
                          ? 'Generate Image + Prompt → Video'
                          : 'Generate Text → Video'
                        : isGifTab
                        ? 'Generate Image → GIF'
                        : 'Generate Image'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Right Output Gallery & Preview Panel */}
            <div className="lg:col-span-5 space-y-6">
              {/* Output Preview Card */}
              <div className="bg-[#0E1628] border border-[#00D8FF]/20 rounded-3xl p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-[#00D8FF]/15 pb-4">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#00D8FF] flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    <span>Output Media Preview</span>
                  </h2>

                  {currentImages.length > 0 && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                      {(currentImages[0]?.mediaType || 'IMAGE').toUpperCase()} READY
                    </span>
                  )}
                </div>

                {/* Progress / Loading Indicator */}
                {isGenerating && (
                  <div className="p-8 rounded-2xl bg-[#060B16] border border-[#00D8FF]/30 text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-[#00D8FF]/20 border-t-[#00D8FF] animate-spin" />
                      <Film className="w-6 h-6 text-[#00D8FF]" />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-white">{loadingStepText}</p>
                      <p className="text-[11px] font-mono text-[#00D8FF] mt-1">
                        Elapsed: {elapsedSeconds.toFixed(1)}s
                      </p>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#00D8FF] to-blue-500 h-full transition-all duration-300"
                        style={{ width: `${((loadingStepIndex + 1) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Media Preview Player */}
                {!isGenerating && currentImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border border-[#00D8FF]/40 bg-black aspect-square flex items-center justify-center group">
                      {currentImages[0].mediaType === 'video' ? (
                        <video
                          src={currentImages[0].url}
                          controls
                          autoPlay
                          loop
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src={currentImages[0].url}
                          alt="Generated Media"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    {/* Output Control Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleDownloadMedia(currentImages[0])}
                        className="py-2.5 px-3 rounded-xl bg-[#00D8FF] hover:bg-[#5FFFF7] text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download {(currentImages[0]?.mediaType || 'MEDIA').toUpperCase()}</span>
                      </button>

                      <button
                        onClick={() => handleGenerateMedia()}
                        className="py-2.5 px-3 rounded-xl bg-[#060B16] hover:bg-[#111C30] text-slate-200 border border-[#00D8FF]/30 font-bold text-xs transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4 text-[#00D8FF]" />
                        <span>Regenerate</span>
                      </button>

                      {(currentImages[0]?.mediaType === 'image' || !currentImages[0]?.mediaType) && (
                        <button
                          onClick={() => {
                            setEditingImage(currentImages[0]);
                            setEditorInitialTool('remove-bg');
                            setIsEditorOpen(true);
                          }}
                          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          <Sliders className="w-4 h-4" />
                          <span>AI Edit Image</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyPrompt(currentImages[0].originalPrompt)}
                        className="py-2.5 px-3 rounded-xl bg-[#060B16] hover:bg-[#111C30] text-slate-200 border border-[#00D8FF]/30 font-bold text-xs transition-all flex items-center justify-center gap-2"
                      >
                        {copiedPrompt ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#00D8FF]" />
                        )}
                        <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsHistoryOpen(true);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-[#060B16] hover:bg-[#111C30] text-slate-200 border border-[#00D8FF]/30 font-bold text-xs transition-all flex items-center justify-center gap-2"
                      >
                        <History className="w-4 h-4 text-[#00D8FF]" />
                        <span>View Gallery</span>
                      </button>
                    </div>
                  </div>
                )}

                {!isGenerating && currentImages.length === 0 && (
                  <div className="p-12 rounded-2xl bg-[#060B16] border border-dashed border-[#00D8FF]/20 text-center space-y-3">
                    <div className="p-4 rounded-full bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/20 w-16 h-16 mx-auto flex items-center justify-center">
                      <Film className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">No media generated yet</p>
                    <p className="text-[11px] text-slate-500">
                      Select your mode on the left and click Generate to produce high quality media.
                    </p>
                  </div>
                )}
              </div>

              {/* History Quick Gallery Grid */}
              {history.length > 0 && (
                <div className="bg-[#0E1628] border border-[#00D8FF]/20 rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#00D8FF]/15 pb-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#00D8FF] flex items-center gap-2">
                      <History className="w-4 h-4" />
                      <span>Saved Gallery History ({history.length})</span>
                    </h3>
                    <button
                      onClick={() => setIsHistoryOpen(true)}
                      className="text-[11px] text-[#00D8FF] hover:underline font-bold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {history.slice(0, 6).map((hItem) => {
                      const itemMedia = hItem.items?.[0] || hItem.images?.[0];
                      if (!itemMedia) return null;
                      return (
                        <div
                          key={hItem.id}
                          onClick={() => setCurrentImages([itemMedia])}
                          className="relative aspect-square rounded-xl overflow-hidden border border-[#00D8FF]/20 hover:border-[#00D8FF] cursor-pointer group bg-black"
                        >
                          {itemMedia.mediaType === 'video' ? (
                            <video src={itemMedia.url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={itemMedia.url} alt="History" className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[9px] font-mono font-bold text-white uppercase bg-black/80 px-2 py-1 rounded">
                              {itemMedia.mediaType}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversational AI View */}
        {activeStudioTab === 'conversational' && (
          <div className="bg-[#0E1628] border border-[#00D8FF]/20 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#00D8FF]/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#00D8FF]/20 text-[#00D8FF] border border-[#00D8FF]/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white">Conversational AI Media Editor</h2>
                  <p className="text-xs text-slate-400">Transform images & videos in natural dialogue.</p>
                </div>
              </div>
            </div>

            {/* Chat History Container */}
            <div
              ref={chatScrollRef}
              className="h-[450px] overflow-y-auto space-y-4 p-4 rounded-2xl bg-[#060B16] border border-[#00D8FF]/20"
            >
              {chatTurns.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                  <MessageSquare className="w-10 h-10 text-[#00D8FF]/50" />
                  <p className="text-xs font-bold text-slate-300">Start conversational media editing</p>
                  <p className="text-[11px] max-w-sm text-slate-500">
                    Type instructions like "Make lighting cinematic neon blue", "Add rain reflections", or "Animate zoom in".
                  </p>
                </div>
              )}

              {chatTurns.map((turn) => (
                <div
                  key={turn.id}
                  className={`flex flex-col ${turn.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
                >
                  <div
                    className={`max-w-xl p-4 rounded-2xl text-xs ${
                      turn.sender === 'user'
                        ? 'bg-[#00D8FF] text-black font-extrabold shadow-lg'
                        : 'bg-[#111C30] text-slate-200 border border-[#00D8FF]/30'
                    }`}
                  >
                    <p>{turn.message}</p>
                    {turn.imageUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-white/20 max-w-sm">
                        <img src={turn.imageUrl} alt="Result" className="w-full h-auto object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendConversationalEdit()}
                placeholder="Type your edit instruction (e.g., 'Make background darker and add heavy rain')..."
                className="flex-1 px-4 py-3.5 rounded-2xl bg-[#060B16] border border-[#00D8FF]/30 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#00D8FF]"
              />
              <button
                onClick={() => handleSendConversationalEdit()}
                disabled={isGenerating || !chatInput.trim()}
                className="px-6 py-3.5 rounded-2xl bg-[#00D8FF] hover:bg-[#5FFFF7] text-black font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Provider Setup Modal */}
      {isProviderModalOpen && (
        <ProviderSetupModal
          isOpen={isProviderModalOpen}
          onClose={() => setIsProviderModalOpen(false)}
          config={providerConfig}
          onRefreshConfig={fetchProviderConfig}
          userKeys={userKeys}
          onSaveKeys={handleSaveKeys}
        />
      )}

      {/* History Drawer */}
      {isHistoryOpen && (
        <HistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onSelectHistoryItem={(item) => {
            const media = item.items?.[0] || item.images?.[0];
            if (media) {
              setCurrentImages([media]);
              setIsHistoryOpen(false);
            }
          }}
          onClearHistory={() => {
            setHistory([]);
            localStorage.removeItem('panther_image_history');
          }}
        />
      )}

      {/* Image Editor Modal */}
      {isEditorOpen && editingImage && (
        <ImageEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          image={editingImage}
          initialTool={editorInitialTool}
          userKeys={userKeys}
          onSaveEditedImage={(editedUrl) => {
            const newMedia: GeneratedMediaItem = {
              ...editingImage,
              id: `edit-${Date.now()}`,
              url: editedUrl,
            };
            setCurrentImages([newMedia, ...currentImages]);
            setIsEditorOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ImageStudio;
