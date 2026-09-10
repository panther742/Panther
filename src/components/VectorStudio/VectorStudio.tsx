import React, { useState } from 'react';
import { VectorSettings } from '../../types';
import { vectorizeImageDataUrl } from '../../utils/vectorUtils';
import { ImageUploader } from './ImageUploader';
import { VectorPreview } from './VectorPreview';
import { VectorSettingsPanel } from './VectorSettings';
import { ExportVectorModal } from './ExportVectorModal';
import { Layers, Download, Loader2, ArrowLeft } from 'lucide-react';

export const VectorStudio: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<{ dataUrl: string; name: string } | null>(
    null
  );
  const [vectorResult, setVectorResult] = useState<{
    svg: string;
    pathsCount: number;
    width: number;
    height: number;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const [settings, setSettings] = useState<VectorSettings>({
    threshold: 128,
    smoothness: 2,
    nodeReduction: 5,
    cornerThreshold: 45,
    outlineWidth: 2,
    transparentBg: true,
    posterizeColors: 4,
    colorMode: 'bw',
    turnPolicy: 'minority',
    turdSize: 4,
    removeBackground: false,
  });

  const handleProcessImage = async (dataUrl: string, currentSettings: VectorSettings) => {
    setIsProcessing(true);
    try {
      const res = await vectorizeImageDataUrl(dataUrl, currentSettings);
      setVectorResult(res);
    } catch (err) {
      console.error('Vectorization error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageSelected = (dataUrl: string, name: string) => {
    setSelectedImage({ dataUrl, name });
    handleProcessImage(dataUrl, settings);
  };

  const handleReProcess = () => {
    if (selectedImage) {
      handleProcessImage(selectedImage.dataUrl, settings);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-100 min-h-screen">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Image to Vector
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Upload raster graphics and automatically extract clean SVG, DXF, EPS, PDF, and CorelDraw paths.
            </p>
          </div>
        </div>

        {selectedImage && vectorResult && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedImage(null);
                setVectorResult(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs flex items-center gap-2 transition-all shadow"
              id="upload-new-image-button"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Upload New Image</span>
            </button>

            <button
              onClick={() => setIsExportOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FACC15] to-[#9C7A1C] hover:opacity-95 text-black font-extrabold text-xs shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 transition-all"
              id="export-vector-modal-trigger"
            >
              <Download className="w-4 h-4" />
              <span>Export Vector</span>
            </button>
          </div>
        )}
      </div>

      {/* UPLOADER OR PREVIEW */}
      {!selectedImage ? (
        <ImageUploader onImageSelected={handleImageSelected} />
      ) : (
        <div className="space-y-8">
          {/* PROCESSING INDICATOR */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center gap-3 text-[#D4AF37] font-semibold text-xs animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
              <span>Tracing Bezier curves & optimizing vector nodes...</span>
            </div>
          )}

          {/* MAIN VECTOR PREVIEW */}
          {vectorResult && (
            <VectorPreview
              originalUrl={selectedImage.dataUrl}
              vectorSvg={vectorResult.svg}
              pathsCount={vectorResult.pathsCount}
            />
          )}

          {/* SETTINGS PANEL */}
          <VectorSettingsPanel
            settings={settings}
            onChangeSettings={(s) => {
              setSettings(s);
              if (selectedImage) handleProcessImage(selectedImage.dataUrl, s);
            }}
            onReProcess={handleReProcess}
            isProcessing={isProcessing}
          />
        </div>
      )}

      {/* EXPORT MODAL */}
      {vectorResult && (
        <ExportVectorModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          svgContent={vectorResult.svg}
          width={vectorResult.width}
          height={vectorResult.height}
        />
      )}
    </div>
  );
};

export default VectorStudio;

