import React, { useState, useRef, useEffect } from 'react';
import { GeneratedImage } from '../../types';
import { apiClient } from '../../lib/apiClient';
import {
  X,
  Download,
  Scissors,
  Maximize2,
  Eraser,
  Sparkles,
  Layers,
  ZoomOut,
  Check,
  RefreshCw,
  Wand2,
  UserCheck,
  Palette,
  ImagePlus,
  Paintbrush,
  Sliders,
  PaintBucket,
} from 'lucide-react';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: GeneratedImage | null;
  onSaveEditedImage: (editedUrl: string) => void;
  initialTool?: string;
  userKeys?: any;
}

type EditToolType =
  | 'remove-bg'
  | 'bg-replacement'
  | 'inpaint'
  | 'outpaint'
  | 'object-removal'
  | 'object-addition'
  | 'face-enhancement'
  | 'color-replacement'
  | 'style-transfer'
  | 'resize';

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  image,
  onSaveEditedImage,
  initialTool = 'remove-bg',
  userKeys,
}) => {
  const [activeTool, setActiveTool] = useState<EditToolType>((initialTool as EditToolType) || 'remove-bg');

  const [promptText, setPromptText] = useState<string>('');
  const [targetWidth, setTargetWidth] = useState<number>(1024);
  const [targetHeight, setTargetHeight] = useState<number>(1024);
  const [outpaintPadding, setOutpaintPadding] = useState<number>(100);
  const [selectedStyle, setSelectedStyle] = useState<string>('cyberpunk');
  const [format, setFormat] = useState<'png' | 'jpg' | 'webp' | 'transparent-png'>('png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingMsg, setProcessingMsg] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string>('');

  useEffect(() => {
    if (image) {
      setEditedUrl(image.url);
      setTargetWidth(image.width || 1024);
      setTargetHeight(image.height || 1024);
    }
  }, [image]);

  useEffect(() => {
    if (initialTool && initialTool !== 'none') {
      setActiveTool(initialTool as EditToolType);
    }
  }, [initialTool]);

  if (!isOpen || !image) return null;

  // Execute AI Backend Image Editing Route
  const handleRunAiEdit = async (actionName: string, customPrompt?: string) => {
    setIsProcessing(true);
    setProcessingMsg(`Running AI ${actionName.replace('-', ' ')}...`);
    setEditError(null);

    // Send the image as a real data URL whenever possible so the AI can
    // actually edit the uploaded pixels (remote URLs are converted client-side).
    let sourceDataUrl = editedUrl;
    if (editedUrl && !editedUrl.startsWith('data:image/') && /^https?:\/\//i.test(editedUrl)) {
      try {
        const canvas = await urlToDataUrlCanvas(editedUrl);
        sourceDataUrl = canvas;
      } catch {
        // keep the remote URL — the server will fall back to text-driven regeneration
      }
    }

    try {
      const data = await apiClient.fetchWithCache<{
        success: boolean;
        images?: any[];
        error?: string;
      }>('/api/image-gen/edit', {
        method: 'POST',
        body: JSON.stringify({
          action: actionName,
          imageBase64: sourceDataUrl,
          prompt: customPrompt || promptText || image.originalPrompt,
          stylePreset: selectedStyle,
          apiKeys: userKeys,
        }),
      }, 0, 0, 300000);

      if (data.success && data.images && data.images.length > 0) {
        setEditedUrl(data.images[0].url);
      } else {
        throw new Error(data.error || 'Edit returned no output');
      }
    } catch (err: any) {
      console.warn('[AI Editor Canvas Fallback]:', err?.message);
      // Fallback local canvas effect if API fails
      if (actionName === 'face-enhancement') {
        runCanvasSharpnessEnhance();
        setEditError('AI enhancement unavailable — applied local sharpness boost instead.');
      } else if (actionName === 'color-replacement') {
        runCanvasColorShift();
        setEditError('AI color shift unavailable — applied local color adjustment instead.');
      } else if (actionName === 'remove-bg') {
        handleRemoveBackgroundCanvas();
        setEditError('AI background removal unavailable — applied local alpha extraction instead.');
      } else {
        setEditError(err?.message || `AI ${actionName} failed. Please check provider keys and try again.`);
      }
    } finally {
      setIsProcessing(false);
      setProcessingMsg('');
    }
  };

  // Helper: convert a remote image URL into a local data URL via canvas
  const urlToDataUrlCanvas = (url: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const cvs = document.createElement('canvas');
          cvs.width = img.naturalWidth || img.width;
          cvs.height = img.naturalHeight || img.height;
          const ctx = cvs.getContext('2d');
          if (!ctx) return reject(new Error('No canvas context'));
          ctx.drawImage(img, 0, 0);
          resolve(cvs.toDataURL('image/png'));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = url;
    });

  // Canvas Alpha Background Removal Fallback
  const handleRemoveBackgroundCanvas = () => {
    setIsProcessing(true);
    setProcessingMsg('Extracting subject alpha channels...');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cvs = document.createElement('canvas');
      cvs.width = img.width;
      cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imgData.data;

      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      const threshold = 40;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

        if (dist < threshold || (r < 25 && g < 25 && b < 25)) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setEditedUrl(cvs.toDataURL('image/png'));
      setFormat('transparent-png');
      setIsProcessing(false);
      setProcessingMsg('');
    };
    img.src = editedUrl;
  };

  // Canvas Sharpness / Face Enhance Fallback
  const runCanvasSharpnessEnhance = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cvs = document.createElement('canvas');
      cvs.width = img.width;
      cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      if (!ctx) return;
      ctx.filter = 'contrast(112%) saturate(108%) brightness(102%)';
      ctx.drawImage(img, 0, 0);
      setEditedUrl(cvs.toDataURL('image/png'));
      setIsProcessing(false);
    };
    img.src = editedUrl;
  };

  // Canvas Color Shift Fallback
  const runCanvasColorShift = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cvs = document.createElement('canvas');
      cvs.width = img.width;
      cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      if (!ctx) return;
      ctx.filter = 'hue-rotate(90deg) saturate(120%)';
      ctx.drawImage(img, 0, 0);
      setEditedUrl(cvs.toDataURL('image/png'));
      setIsProcessing(false);
    };
    img.src = editedUrl;
  };

  // Apply Outpaint Padding
  const handleApplyOutpaint = () => {
    setIsProcessing(true);
    setProcessingMsg('Expanding Outpaint canvas boundary...');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const pad = outpaintPadding;
      const cvs = document.createElement('canvas');
      cvs.width = img.width + pad * 2;
      cvs.height = img.height + pad * 2;
      const ctx = cvs.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#060B16';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        ctx.drawImage(img, pad, pad);
        setEditedUrl(cvs.toDataURL('image/png'));
      }
      setIsProcessing(false);
      setProcessingMsg('');
    };
    img.src = editedUrl;
  };

  // Apply Resize
  const handleApplyResize = () => {
    setIsProcessing(true);
    setProcessingMsg('Scaling high quality resolution...');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cvs = document.createElement('canvas');
      cvs.width = targetWidth;
      cvs.height = targetHeight;
      const ctx = cvs.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        setEditedUrl(cvs.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`));
      }
      setIsProcessing(false);
      setProcessingMsg('');
    };
    img.src = editedUrl;
  };

  const handleDownloadExport = () => {
    const link = document.createElement('a');
    link.download = `panther-ai-edited-${Date.now()}.${format === 'jpg' ? 'jpg' : 'png'}`;
    link.href = editedUrl;
    link.click();
  };

  const handleSaveToGallery = () => {
    onSaveEditedImage(editedUrl);
    onClose();
  };

  const EDIT_TOOLS: { id: EditToolType; label: string; icon: any }[] = [
    { id: 'remove-bg', label: 'Remove BG', icon: Layers },
    { id: 'bg-replacement', label: 'Replace BG', icon: PaintBucket },
    { id: 'inpaint', label: 'Inpainting', icon: Paintbrush },
    { id: 'outpaint', label: 'Outpaint Bounds', icon: ZoomOut },
    { id: 'object-removal', label: 'Remove Object', icon: Eraser },
    { id: 'object-addition', label: 'Add Object', icon: ImagePlus },
    { id: 'face-enhancement', label: 'Face Enhance', icon: UserCheck },
    { id: 'color-replacement', label: 'Color Shift', icon: Palette },
    { id: 'style-transfer', label: 'Style Transfer', icon: Wand2 },
    { id: 'resize', label: 'Resize & Scale', icon: Maximize2 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
      <div className="bg-[#0E1628] border border-[#00D8FF]/40 rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#C9D4E5] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#00D8FF]/15">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Panther AI Image Editing Suite</h3>
              <p className="text-xs text-[#C9D4E5]/80 truncate max-w-md">"{image.originalPrompt}"</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editing Tools Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          {EDIT_TOOLS.map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTool === tool.id
                    ? 'bg-[#00D8FF] text-black shadow-lg shadow-[#00D8FF]/20'
                    : 'bg-[#060B16] hover:bg-[#111C30] text-[#C9D4E5] border border-[#00D8FF]/20'
                }`}
              >
                <ToolIcon className="w-3.5 h-3.5" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Edit Error Notice */}
        {editError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <span className="leading-relaxed">{editError}</span>
            <button
              onClick={() => setEditError(null)}
              className="ml-auto text-rose-300 hover:text-white text-xs font-bold shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Canvas Display */}
          <div className="lg:col-span-8 bg-[#060B16] border border-[#00D8FF]/20 rounded-2xl p-4 flex items-center justify-center min-h-[380px] relative overflow-hidden">
            <img
              src={editedUrl}
              alt="Editing Canvas"
              className="max-h-[440px] max-w-full object-contain rounded-xl shadow-2xl transition-all"
              style={{
                backgroundImage: format === 'transparent-png' ? 'radial-gradient(#ffffff22 1px, transparent 0)' : 'none',
                backgroundSize: '16px 16px',
              }}
            />

            {isProcessing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30">
                <RefreshCw className="w-8 h-8 text-[#00D8FF] animate-spin" />
                <span className="text-xs font-bold text-[#00D8FF]">{processingMsg || 'Processing Image AI...'}</span>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="lg:col-span-4 bg-[#111C30] border border-[#00D8FF]/20 rounded-2xl p-5 space-y-5">
            {/* Action 1: Remove BG */}
            {activeTool === 'remove-bg' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#00D8FF]" />
                  <span>AI Background Isolation</span>
                </h4>
                <p className="text-xs text-[#C9D4E5]/80 leading-relaxed">
                  Extract main subject and render background 100% transparent PNG.
                </p>
                <button
                  onClick={() => handleRemoveBackgroundCanvas()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00D8FF] to-[#007BFF] hover:from-[#7DF9FF] text-black font-extrabold text-xs shadow-lg flex items-center justify-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Isolate Subject (Transparent PNG)</span>
                </button>
              </div>
            )}

            {/* Action 2: Background Replacement */}
            {activeTool === 'bg-replacement' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <PaintBucket className="w-4 h-4 text-[#00D8FF]" />
                  <span>Background Replacement</span>
                </h4>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">New Background Description</label>
                  <input
                    type="text"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="e.g. Futuristic cyberpunk neon alley at night"
                    className="w-full px-3 py-2 rounded-xl bg-[#060B16] border border-[#00D8FF]/30 text-white text-xs"
                  />
                </div>
                <button
                  onClick={() => handleRunAiEdit('bg-replacement')}
                  className="w-full py-3 rounded-xl bg-[#00D8FF] text-black font-extrabold text-xs shadow-md"
                >
                  Replace Background
                </button>
              </div>
            )}

            {/* Action 3: Inpainting */}
            {activeTool === 'inpaint' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Paintbrush className="w-4 h-4 text-[#00D8FF]" />
                  <span>AI Inpainting</span>
                </h4>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Inpaint Region Replacement</label>
                  <input
                    type="text"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="e.g. Add golden futuristic crown on top"
                    className="w-full px-3 py-2 rounded-xl bg-[#060B16] border border-[#00D8FF]/30 text-white text-xs"
                  />
                </div>
                <button
                  onClick={() => handleRunAiEdit('inpaint')}
                  className="w-full py-3 rounded-xl bg-[#00D8FF] text-black font-extrabold text-xs shadow-md"
                >
                  Apply AI Inpaint
                </button>
              </div>
            )}

            {/* Action 4: Outpaint */}
            {activeTool === 'outpaint' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ZoomOut className="w-4 h-4 text-[#00D8FF]" />
                  <span>Outpaint & Canvas Expansion</span>
                </h4>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Margin Padding ({outpaintPadding}px)</label>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={outpaintPadding}
                    onChange={(e) => setOutpaintPadding(Number(e.target.value))}
                    className="w-full accent-[#00D8FF]"
                  />
                </div>
                <button
                  onClick={handleApplyOutpaint}
                  className="w-full py-2.5 rounded-xl bg-[#00D8FF] text-black font-extrabold text-xs shadow-md"
                >
                  Expand Canvas Bounds
                </button>
              </div>
            )}

            {/* Action 5: Object Removal */}
            {activeTool === 'object-removal' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eraser className="w-4 h-4 text-[#00D8FF]" />
                  <span>Object Removal</span>
                </h4>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Specify Object to Remove</label>
                  <input
                    type="text"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="e.g. Remove the car in background"
                    className="w-full px-3 py-2 rounded-xl bg-[#060B16] border border-[#00D8FF]/30 text-white text-xs"
                  />
                </div>
                <button
                  onClick={() => handleRunAiEdit('object-removal')}
                  className="w-full py-3 rounded-xl bg-[#00D8FF] text-black font-extrabold text-xs shadow-md"
                >
                  Remove Object Cleanly
                </button>
              </div>
            )}

            {/* Action 6: Object Addition */}
            {activeTool === 'object-addition' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImagePlus className="w-4 h-4 text-[#00D8FF]" />
                  <span>Object Addition</span>
                </h4>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Object to Insert</label>
                  <input
                    type="text"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="e.g. Add a glowing laser sword in hand"
                    className="w-full px-3 py-2 rounded-xl bg-[#060B16] border border-[#00D8FF]/30 text-white text-xs"
                  />
                </div>
                <button
                  onClick={() => handleRunAiEdit('object-addition')}
                  className="w-full py-3 rounded-xl bg-[#00D8FF] text-black font-extrabold text-xs shadow-md"
                >
                  Add Object
                </button>
              </div>
            )}

            {/* Action 7: Face Enhancement */}
            {activeTool === 'face-enhancement' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#00D8FF]" />
                  <span>Face & Skin Enhancement</span>
                </h4>
                <p className="text-xs text-[#C9D4E5]/80 leading-relaxed">
                  Enhance facial sharpness, smooth skin texture, crisp eye rendering, and studio lighting.
                </p>
                <button
                  onClick={() => handleRunAiEdit('face-enhancement')}
                  className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs shadow-md"
                >
                  Enhance Face & Detail
                </button>
              </div>
            )}

            {/* Action 8: Color Replacement */}
            {activeTool === 'color-replacement' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#00D8FF]" />
                  <span>Color Shift & Replacement</span>
                </h4>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Target Color Palette</label>
                  <input
                    type="text"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="e.g. Shift from red to deep sapphire blue"
                    className="w-full px-3 py-2 rounded-xl bg-[#060B16] border border-[#00D8FF]/30 text-white text-xs"
                  />
                </div>
                <button
                  onClick={() => handleRunAiEdit('color-replacement')}
                  className="w-full py-3 rounded-xl bg-[#00D8FF] text-black font-extrabold text-xs shadow-md"
                >
                  Apply Color Shift
                </button>
              </div>
            )}

            {/* Action 9: Style Transfer */}
            {activeTool === 'style-transfer' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-[#00D8FF]" />
                  <span>Style Transfer</span>
                </h4>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Art Style Preset</label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#060B16] border border-[#00D8FF]/30 text-white text-xs"
                  >
                    <option value="cyberpunk">Cyberpunk Neon</option>
                    <option value="luxury">Luxury Gold & Marble</option>
                    <option value="watercolor">Soft Watercolor</option>
                    <option value="anime">Japanese Anime</option>
                    <option value="oil-painting">Classic Oil Painting</option>
                    <option value="3d-render">3D Octane Render</option>
                  </select>
                </div>
                <button
                  onClick={() => handleRunAiEdit('style-transfer')}
                  className="w-full py-3 rounded-xl bg-[#00D8FF] text-black font-extrabold text-xs shadow-md"
                >
                  Transfer Art Style
                </button>
              </div>
            )}

            {/* Action 10: Resize */}
            {activeTool === 'resize' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-[#00D8FF]" />
                  <span>Dimension Resize</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={targetWidth}
                      onChange={(e) => setTargetWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#060B16] border border-[#00D8FF]/20 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={targetHeight}
                      onChange={(e) => setTargetHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#060B16] border border-[#00D8FF]/20 text-white text-xs font-mono"
                    />
                  </div>
                </div>
                <button
                  onClick={handleApplyResize}
                  className="w-full py-2.5 rounded-xl bg-[#00D8FF] text-black font-extrabold text-xs shadow-md"
                >
                  Apply Resize
                </button>
              </div>
            )}

            {/* Format Selection */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <label className="text-xs font-bold uppercase text-slate-400 block">Export Format</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold font-mono">
                {(['png', 'jpg', 'webp', 'transparent-png'] as const).map((fmtOption) => (
                  <button
                    key={fmtOption}
                    onClick={() => setFormat(fmtOption)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      format === fmtOption
                        ? 'bg-[#00D8FF] text-black border-[#00D8FF]'
                        : 'bg-[#060B16] text-[#C9D4E5] border-[#00D8FF]/20 hover:bg-[#0E1628]'
                    }`}
                  >
                    {fmtOption.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Save & Export */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleSaveToGallery}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save to Image History</span>
              </button>

              <button
                onClick={handleDownloadExport}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download {format.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
