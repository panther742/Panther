import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (dataUrl: string, name: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sampleImages = [
    {
      name: 'Geometric Panther Logo',
      dataUrl:
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230F172A"/><path d="M20 20 L50 80 L80 20 L50 50 Z" fill="%237C3AED"/><circle cx="50" cy="50" r="15" fill="%2338BDF8"/></svg>',
    },
    {
      name: 'Minimal Crest Icon',
      dataUrl:
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231E1B4B"/><polygon points="50,15 85,85 15,85" fill="%23EC4899"/><polygon points="50,35 70,75 30,75" fill="%23FACC15"/></svg>',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageSelected(event.target.result as string, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageSelected(event.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="group relative p-12 rounded-2xl border-2 border-dashed border-slate-700 hover:border-purple-500/60 bg-slate-950/60 hover:bg-slate-950 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-4"
        id="image-vector-dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp, image/bmp, image/tiff"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="p-4 rounded-2xl bg-purple-950/80 border border-purple-500/30 text-purple-300 group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
            Drop your image here, or click to upload
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Supports PNG, JPG, JPEG, WEBP, BMP, TIFF (Up to 50MB)
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center pt-2 text-[10px] text-slate-400 font-mono">
          <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
            Auto Noise Removal
          </span>
          <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
            Curve Smoothing
          </span>
          <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
            Edge Detection
          </span>
        </div>
      </div>

      {/* Preset Sample Images */}
      <div className="space-y-2 pt-2 border-t border-slate-800/60">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Or Try Sample Raster Images</span>
        </span>

        <div className="flex flex-wrap gap-3">
          {sampleImages.map((img) => (
            <button
              key={img.name}
              onClick={() => onImageSelected(img.dataUrl, img.name)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2 transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{img.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
