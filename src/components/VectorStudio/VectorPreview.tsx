import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Eye, Layers, Split, RefreshCw } from 'lucide-react';

interface VectorPreviewProps {
  originalUrl: string;
  vectorSvg: string;
  pathsCount: number;
}

export const VectorPreview: React.FC<VectorPreviewProps> = ({
  originalUrl,
  vectorSvg,
  pathsCount,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'vector' | 'original'>('split');
  const [splitPos, setSplitPos] = useState<number>(50);
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (viewMode !== 'split' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percent = (x / rect.width) * 100;
    setSplitPos(percent);
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 p-6 bg-slate-950 flex flex-col justify-between' : ''}`}>
      {/* Top Preview Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Vector Preview Engine</span>
          </span>
          <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800/40 rounded-full">
            {pathsCount} Vector Paths
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'split' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Split Curtain</span>
          </button>
          <button
            onClick={() => setViewMode('vector')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'vector' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Vector SVG</span>
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'original' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original</span>
          </button>
        </div>

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(20, z - 20))}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-bold text-purple-400 px-2">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(500, z + 20))}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas / Split Area */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative h-[480px] w-full rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center select-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <div
          className="transition-transform duration-100 flex items-center justify-center max-w-full max-h-full p-6"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {viewMode === 'original' && (
            <img src={originalUrl} alt="Original raster" className="max-h-[400px] object-contain rounded-xl shadow-2xl" />
          )}

          {viewMode === 'vector' && (
            <div
              className="max-h-[400px] flex items-center justify-center [&>svg]:max-h-[400px] [&>svg]:w-auto"
              dangerouslySetInnerHTML={{ __html: vectorSvg }}
            />
          )}

          {viewMode === 'split' && (
            <div className="relative max-h-[400px] w-auto flex items-center justify-center">
              {/* Vector Layer (Right / Full) */}
              <div
                className="max-h-[400px] flex items-center justify-center [&>svg]:max-h-[400px] [&>svg]:w-auto"
                dangerouslySetInnerHTML={{ __html: vectorSvg }}
              />

              {/* Original Layer Clipped (Left) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${splitPos}%` }}
              >
                <img
                  src={originalUrl}
                  alt="Original clipped"
                  className="max-h-[400px] object-contain"
                />
              </div>

              {/* Split Curtain Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-purple-500 shadow-xl cursor-ew-resize flex items-center justify-center"
                style={{ left: `${splitPos}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shadow-lg border border-white/40">
                  ↔
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
