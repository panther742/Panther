import React, { useState } from 'react';
import { GeneratedMediaItem } from '../../types';
import {
  Download,
  Wand2,
  Sparkles,
  Layers,
  RefreshCw,
  Maximize2,
  Copy,
  Check,
  Trash2,
  Share2,
  ChevronDown,
  Info,
  Heart,
  Film,
  Image as ImageIcon,
  Play,
  RotateCcw,
} from 'lucide-react';

interface ImageCardProps {
  image: GeneratedMediaItem;
  onEditImage: (image: GeneratedMediaItem, tool?: any) => void;
  onRegeneratePrompt: (prompt: string, stylePreset: string) => void;
  onUpscaleImage: (image: GeneratedMediaItem) => void;
  onCreateVariation: (image: GeneratedMediaItem) => void;
  onDeleteImage?: (imageId: string) => void;
  onShareImage?: (image: GeneratedMediaItem) => void;
  onToggleFavorite?: (image: GeneratedMediaItem) => void;
  onAnimateImage?: (image: GeneratedMediaItem) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onEditImage,
  onRegeneratePrompt,
  onUpscaleImage,
  onCreateVariation,
  onDeleteImage,
  onShareImage,
  onToggleFavorite,
  onAnimateImage,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isFav, setIsFav] = useState<boolean>(Boolean(image.isFavorite));

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(image.optimizedPrompt || image.originalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFormat = (ext: string) => {
    const link = document.createElement('a');
    link.download = `panther-ai-${image.mediaType || 'media'}-${image.id}.${ext.toLowerCase()}`;
    link.href = image.url;
    link.click();
    setShowDownloadMenu(false);
  };

  const handleToggleFav = () => {
    setIsFav(!isFav);
    image.isFavorite = !isFav;
    if (onToggleFavorite) onToggleFavorite(image);
  };

  const handleShare = () => {
    if (onShareImage) {
      onShareImage(image);
      return;
    }
    if (navigator.share) {
      navigator.share({
        title: `Panther AI ${image.mediaType?.toUpperCase() || 'Media'}`,
        text: `Prompt: "${image.originalPrompt}"`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(image.originalPrompt);
      alert('Prompt copied to clipboard for sharing!');
    }
  };

  const timeFormatted = image.generationTimeMs
    ? `${(image.generationTimeMs / 1000).toFixed(1)}s`
    : undefined;

  const isVideo = image.mediaType === 'video';
  const isGif = image.mediaType === 'gif';

  return (
    <div className="group relative rounded-3xl bg-[#111C30] border border-[#00D8FF]/15 hover:border-[#00D8FF]/60 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between">
      {/* Media Preview Container */}
      <div className="relative aspect-square w-full bg-black/80 flex items-center justify-center overflow-hidden">
        {isVideo ? (
          <video
            src={image.url}
            autoPlay
            loop
            muted
            playsInline
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={image.url}
            alt={image.originalPrompt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-[#060B16]/90 backdrop-blur-md text-[#00D8FF] border border-[#00D8FF]/40 rounded-full shadow-lg flex items-center gap-1">
              {isVideo ? <Film className="w-3 h-3 text-[#00D8FF]" /> : isGif ? <RotateCcw className="w-3 h-3 text-amber-400" /> : <ImageIcon className="w-3 h-3 text-emerald-400" />}
              <span>{image.mediaType?.toUpperCase() || 'IMAGE'}</span>
            </span>

            {image.duration && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                ⏱ {image.duration}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 pointer-events-auto">
            <button
              onClick={handleToggleFav}
              className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
                isFav
                  ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30'
                  : 'bg-[#060B16]/80 text-slate-400 hover:text-rose-400 border-white/20'
              }`}
              title={isFav ? 'Remove Favorite' : 'Save Favorite'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>

            <span className="px-2 py-1 text-[10px] font-mono font-bold bg-[#060B16]/85 backdrop-blur-md text-[#C9D4E5] border border-[#00D8FF]/20 rounded-full shadow-lg">
              {image.provider || 'AI Engine'}
            </span>
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060B16]/95 via-[#060B16]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
          <div className="space-y-3">
            {/* Action Icon Buttons Grid */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => onEditImage(image, 'remove-bg')}
                className="p-2 rounded-xl bg-[#0E1628]/80 hover:bg-[#00D8FF] text-white hover:text-black border border-[#00D8FF]/20 transition-all flex flex-col items-center gap-1 text-[9px] font-bold"
                title="Remove Background"
              >
                <Layers className="w-4 h-4" />
                <span>Remove BG</span>
              </button>

              <button
                onClick={() => onUpscaleImage(image)}
                className="p-2 rounded-xl bg-[#0E1628]/80 hover:bg-[#00D8FF] text-white hover:text-black border border-[#00D8FF]/20 transition-all flex flex-col items-center gap-1 text-[9px] font-bold"
                title="Upscale Resolution"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Upscale</span>
              </button>

              <button
                onClick={() => onCreateVariation(image)}
                className="p-2 rounded-xl bg-[#0E1628]/80 hover:bg-[#00D8FF] text-white hover:text-black border border-[#00D8FF]/20 transition-all flex flex-col items-center gap-1 text-[9px] font-bold"
                title="Generate Similar"
              >
                <Sparkles className="w-4 h-4" />
                <span>Similar</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-[#0E1628]/80 hover:bg-[#00D8FF] text-white hover:text-black border border-[#00D8FF]/20 transition-all flex flex-col items-center gap-1 text-[9px] font-bold"
                title="Share Media"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            {/* Primary Action Row */}
            <div className="flex items-center gap-2">
              {onAnimateImage && !isVideo && (
                <button
                  onClick={() => onAnimateImage(image)}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all"
                  title="Animate this image into video"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Animate</span>
                </button>
              )}

              <button
                onClick={() => onEditImage(image, 'none')}
                className="flex-1 py-2.5 rounded-xl bg-[#00D8FF] hover:bg-[#5FFFF7] text-black font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Studio Editor</span>
              </button>

              {/* Download dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all flex items-center gap-1 text-xs font-bold"
                  title="Download Formats"
                >
                  <Download className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showDownloadMenu && (
                  <div className="absolute right-0 bottom-12 z-30 w-36 bg-[#0E1628] border border-[#00D8FF]/40 rounded-2xl p-2 shadow-2xl space-y-1">
                    {(isVideo
                      ? ['MP4', 'MOV', 'GIF']
                      : isGif
                      ? ['GIF', 'MP4', 'PNG']
                      : ['PNG', 'JPG', 'WEBP']
                    ).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => handleDownloadFormat(fmt)}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-200 hover:bg-[#00D8FF] hover:text-black transition-colors uppercase"
                      >
                        .{fmt} Format
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {onDeleteImage && (
                <button
                  onClick={() => onDeleteImage(image.id)}
                  className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all"
                  title="Delete Media"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Info & Details Footer */}
      <div className="p-4 space-y-3 bg-[#0E1628]">
        {/* Main Prompt */}
        <p className="text-xs text-[#C9D4E5] font-medium line-clamp-2 leading-relaxed">
          "{image.originalPrompt}"
        </p>

        {/* Detailed Metadata Toggle */}
        {showDetails && (
          <div className="p-3 rounded-xl bg-[#060B16] border border-[#00D8FF]/20 space-y-1.5 text-[10px] font-mono text-slate-300 animate-fade-in">
            <div className="flex justify-between">
              <span className="text-slate-500">Mode:</span>
              <span className="text-[#00D8FF] font-bold uppercase">{image.mediaType || 'image'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Provider:</span>
              <span className="text-emerald-400 font-bold">{image.provider}</span>
            </div>
            {image.duration && (
              <div className="flex justify-between">
                <span className="text-slate-500">Duration / FPS:</span>
                <span className="text-amber-300 font-bold">{image.duration} ({image.fps || 30} FPS)</span>
              </div>
            )}
            {timeFormatted && (
              <div className="flex justify-between">
                <span className="text-slate-500">Gen Time:</span>
                <span className="text-teal-400 font-bold">{timeFormatted}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Aspect / Res:</span>
              <span>{image.aspectRatio} ({image.resolution || `${image.width || 1024}x${image.height || 1024}`})</span>
            </div>
            {image.cameraMovement && (
              <div className="flex justify-between">
                <span className="text-slate-500">Camera Motion:</span>
                <span className="text-cyan-300">{image.cameraMovement}</span>
              </div>
            )}
            {image.particleEffect && image.particleEffect !== 'none' && (
              <div className="flex justify-between">
                <span className="text-slate-500">Particle Effect:</span>
                <span className="text-purple-300">{image.particleEffect}</span>
              </div>
            )}
            {image.seed && (
              <div className="flex justify-between">
                <span className="text-slate-500">Seed:</span>
                <span className="text-amber-400 font-bold">#{image.seed}</span>
              </div>
            )}
            {image.optimizedPrompt && (
              <div className="pt-1 border-t border-white/10">
                <span className="text-slate-500 block mb-0.5">Optimized Prompt:</span>
                <p className="text-[9px] text-[#5FFFF7] leading-tight italic">"{image.optimizedPrompt}"</p>
              </div>
            )}
          </div>
        )}

        {/* Card Actions Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1 text-[#00D8FF] hover:underline font-medium"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
            </button>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-slate-400 hover:text-[#00D8FF] transition-colors"
            >
              <Info className="w-3 h-3" />
              <span>{showDetails ? 'Hide Info' : 'Info'}</span>
            </button>
          </div>

          <button
            onClick={() => onRegeneratePrompt(image.originalPrompt, image.stylePreset)}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Regenerate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
