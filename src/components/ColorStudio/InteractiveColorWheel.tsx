import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ColorItem, PaletteType } from '../../types';
import { hexToColorItem, generateHarmony } from '../../utils/colorUtils';
import { colord } from 'colord';
import {
  Sun,
  Circle,
  Triangle,
  Square,
  Sparkles,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Copy,
  Check,
  Plus,
  Compass,
  Grid,
  Layers,
  Zap,
} from 'lucide-react';

interface InteractiveColorWheelProps {
  colors: ColorItem[];
  activePaletteType: PaletteType;
  onSelectPaletteType: (type: PaletteType) => void;
  onUpdateColors: (newColors: ColorItem[]) => void;
  onAddColorToPalette: (color: ColorItem) => void;
}

export const InteractiveColorWheel: React.FC<InteractiveColorWheelProps> = ({
  colors,
  activePaletteType,
  onSelectPaletteType,
  onUpdateColors,
  onAddColorToPalette,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedNodeIndex, setDraggedNodeIndex] = useState<number | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Global Lightness modifier for wheel node generation
  const [globalLightness, setGlobalLightness] = useState<number>(50);

  // Supported 11 Harmony Modes with unique labels and visual icons
  const harmonyModes: {
    id: PaletteType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'single', label: 'Single Color', description: 'Focused single hue accent', icon: Circle },
    { id: 'complementary', label: 'Complementary', description: 'Opposite 180° high contrast pair', icon: Sun },
    { id: 'split-complementary', label: 'Split Comp', description: 'Base with dual 150°/210° accents', icon: Triangle },
    { id: 'analogous', label: 'Analogous', description: 'Adjacent 15°/30° harmonious hues', icon: Layers },
    { id: 'triadic', label: 'Triadic', description: 'Equidistant 120° 3-point triangle', icon: Triangle },
    { id: 'tetradic', label: 'Tetradic', description: 'Dual complementary 60°/180° quad', icon: Square },
    { id: 'square', label: 'Square', description: 'Equal 90° 4-point geometric mesh', icon: Square },
    { id: 'rectangle', label: 'Rectangle', description: 'Symmetrical 60°/180° rectangle', icon: Grid },
    { id: 'monochromatic', label: 'Monochromatic', description: 'Single hue with varied saturations', icon: Sliders },
    { id: 'shades', label: 'Shades', description: 'Single hue with varied lightnesses', icon: Sun },
    { id: 'custom', label: 'Custom Mode', description: 'Unrestricted free-form node positioning', icon: Compass },
  ];

  // Primary active color node
  const activeColorNode = colors[activeNodeIndex] || colors[0] || hexToColorItem('#00D8FF');

  // Convert HSL polar coordinates (hue angle in deg, saturation radius 0..1) to Canvas pixel position (x, y)
  const getCanvasPos = useCallback(
    (hue: number, sat: number, centerX: number, centerY: number, maxRadius: number) => {
      const angleRad = (hue - 90) * (Math.PI / 180);
      const r = (sat / 100) * maxRadius;
      return {
        x: centerX + r * Math.cos(angleRad),
        y: centerY + r * Math.sin(angleRad),
      };
    },
    []
  );

  // Convert Canvas pixel position (x, y) to polar coordinates { hue (0..360), sat (0..100) }
  const getPolarFromCanvasPos = useCallback(
    (x: number, y: number, centerX: number, centerY: number, maxRadius: number) => {
      const dx = x - centerX;
      const dy = y - centerY;
      let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (angleDeg < 0) angleDeg += 360;

      const distance = Math.sqrt(dx * dx + dy * dy);
      const sat = Math.min(100, Math.max(0, Math.round((distance / maxRadius) * 100)));

      return {
        hue: Math.round(angleDeg % 360),
        sat,
      };
    },
    []
  );

  // Render HTML5 Canvas Color Wheel with High DPI & Smooth Vectors
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) / 2 - 30 * dpr;
    const maxRadius = baseRadius * zoomLevel;

    // 1. Draw Background Dark Radial Mesh
    const bgGlow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, maxRadius + 20 * dpr);
    bgGlow.addColorStop(0, 'rgba(0, 216, 255, 0.04)');
    bgGlow.addColorStop(0.8, 'rgba(14, 22, 40, 0.9)');
    bgGlow.addColorStop(1, 'rgba(6, 11, 22, 1)');
    ctx.fillStyle = bgGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius + 25 * dpr, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw Wheel Radial Spectrum (360° Hues x Saturation)
    // Render using smooth arc wedges for zero latency and pristine quality
    const segments = 360;
    for (let i = 0; i < segments; i++) {
      const startAngle = ((i - 0.5 - 90) * Math.PI) / 180;
      const endAngle = ((i + 0.5 - 90) * Math.PI) / 180;

      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      grad.addColorStop(0, `hsl(${i}, 0%, ${globalLightness}%)`);
      grad.addColorStop(0.5, `hsl(${i}, 50%, ${globalLightness}%)`);
      grad.addColorStop(1, `hsl(${i}, 100%, ${globalLightness}%)`);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // 3. Wheel Grid Rings & Degree Ticks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1 * dpr;

    // Concentric Saturation Rings (25%, 50%, 75%, 100%)
    [0.25, 0.5, 0.75, 1].forEach((pct) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * pct, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Degree Spokes (12 Major Divisions)
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = ((deg - 90) * Math.PI) / 180;
      const x1 = centerX + maxRadius * 0.2 * Math.cos(rad);
      const y1 = centerY + maxRadius * 0.2 * Math.sin(rad);
      const x2 = centerX + maxRadius * Math.cos(rad);
      const y2 = centerY + maxRadius * Math.sin(rad);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = deg % 90 === 0 ? 'rgba(0, 216, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)';
      ctx.stroke();
    }

    // Outer Electric Blue Border Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#00D8FF';
    ctx.lineWidth = 2.5 * dpr;
    ctx.shadowColor = '#00D8FF';
    ctx.shadowBlur = 10 * dpr;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Draw Connecting Harmony Lines / Vector Polygon
    if (colors.length > 1) {
      const positions = colors.map((c) =>
        getCanvasPos(c.hsl.h, c.hsl.s, centerX, centerY, maxRadius)
      );

      // Polygon Fill
      ctx.beginPath();
      ctx.moveTo(positions[0].x, positions[0].y);
      for (let i = 1; i < positions.length; i++) {
        ctx.lineTo(positions[i].x, positions[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 216, 255, 0.12)';
      ctx.fill();

      // Connecting Vectors
      ctx.strokeStyle = '#00D8FF';
      ctx.lineWidth = 2 * dpr;
      ctx.setLineDash([4 * dpr, 4 * dpr]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Spoke Lines from Center to Each Node
      positions.forEach((pos) => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = 'rgba(0, 216, 255, 0.25)';
        ctx.lineWidth = 1 * dpr;
        ctx.stroke();
      });
    }

    // 5. Draw Interactive Control Point Handles (Nodes)
    colors.forEach((c, idx) => {
      const pos = getCanvasPos(c.hsl.h, c.hsl.s, centerX, centerY, maxRadius);
      const isBaseNode = idx === 0;
      const isActive = idx === activeNodeIndex;
      const nodeRadius = (isBaseNode ? 14 : 11) * dpr;

      // Outer Glow for Selected / Base Node
      if (isActive || isBaseNode) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius + 6 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = isBaseNode ? 'rgba(0, 216, 255, 0.35)' : 'rgba(255, 255, 255, 0.25)';
        ctx.fill();
      }

      // Outer Handle Ring
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = c.hex;
      ctx.fill();
      ctx.strokeStyle = isBaseNode ? '#00D8FF' : isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = (isBaseNode ? 3.5 : 2.5) * dpr;
      ctx.stroke();

      // Node Label (1, 2, 3...) or Crown for Base
      ctx.fillStyle = colord(c.hex).isLight() ? '#000000' : '#FFFFFF';
      ctx.font = `bold ${Math.round(10 * dpr)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isBaseNode ? '★' : `${idx + 1}`, pos.x, pos.y);
    });

    ctx.restore();
  }, [colors, zoomLevel, globalLightness, activeNodeIndex, getCanvasPos]);

  // Handle Canvas Resizing for High DPI
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth || 420;
    const displayHeight = canvas.clientHeight || 420;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    renderCanvas();
  }, [renderCanvas]);

  // Pointer Interaction Handler (Mouse + Touch Dragging)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const clickX = (e.clientX - rect.left) * dpr;
    const clickY = (e.clientY - rect.top) * dpr;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = (Math.min(width, height) / 2 - 30 * dpr) * zoomLevel;

    // Check if clicked near an existing node handle
    let nearestIdx = -1;
    let minDist = Infinity;

    colors.forEach((c, idx) => {
      const pos = getCanvasPos(c.hsl.h, c.hsl.s, centerX, centerY, maxRadius);
      const dist = Math.hypot(clickX - pos.x, clickY - pos.y);
      if (dist < 28 * dpr && dist < minDist) {
        minDist = dist;
        nearestIdx = idx;
      }
    });

    if (nearestIdx !== -1) {
      setActiveNodeIndex(nearestIdx);
      setDraggedNodeIndex(nearestIdx);
      setIsDragging(true);
    } else {
      // If clicked on canvas body, move active node or primary node
      const polar = getPolarFromCanvasPos(clickX, clickY, centerX, centerY, maxRadius);
      updateNodeColor(activeNodeIndex, polar.hue, polar.sat);
      setDraggedNodeIndex(activeNodeIndex);
      setIsDragging(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging || draggedNodeIndex === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const moveX = (e.clientX - rect.left) * dpr;
    const moveY = (e.clientY - rect.top) * dpr;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = (Math.min(width, height) / 2 - 30 * dpr) * zoomLevel;

    const polar = getPolarFromCanvasPos(moveX, moveY, centerX, centerY, maxRadius);
    updateNodeColor(draggedNodeIndex, polar.hue, polar.sat);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (canvasRef.current && canvasRef.current.hasPointerCapture(e.pointerId)) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    setDraggedNodeIndex(null);
  };

  // Synchronous Color Calculation Engine
  const updateNodeColor = (nodeIdx: number, newHue: number, newSat: number) => {
    if (activePaletteType === 'custom') {
      // In Custom mode: update target node independently
      const updated = colors.map((c, i) => {
        if (i === nodeIdx) {
          return hexToColorItem(`hsl(${newHue}, ${newSat}%, ${c.hsl.l}%)`, c.id);
        }
        return c;
      });
      onUpdateColors(updated);
    } else {
      // In locked Harmony modes: calculate new base hue and regenerate harmony constellation
      let baseHue = newHue;

      // If dragging a secondary node in a locked mode, calculate the offset back to base node
      if (nodeIdx > 0 && colors[0]) {
        const offset = colors[nodeIdx].hsl.h - colors[0].hsl.h;
        baseHue = (newHue - offset + 360) % 360;
      }

      const baseHex = colord({ h: baseHue, s: newSat, l: globalLightness }).toHex();
      const newHarmonies = generateHarmony(baseHex, activePaletteType);

      // Preserve locks or ids where possible
      const merged = newHarmonies.map((nc, idx) => {
        if (colors[idx] && colors[idx].isLocked) {
          return colors[idx];
        }
        return nc;
      });

      onUpdateColors(merged);
    }
  };

  // Keyboard Accessibility Shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const activeC = colors[activeNodeIndex];
    if (!activeC) return;

    let deltaH = 0;
    let deltaS = 0;
    const step = e.shiftKey ? 10 : 1;

    if (e.key === 'ArrowLeft') deltaH = -step;
    if (e.key === 'ArrowRight') deltaH = step;
    if (e.key === 'ArrowUp') deltaS = step;
    if (e.key === 'ArrowDown') deltaS = -step;

    if (e.key === 'Tab') {
      e.preventDefault();
      const nextIdx = (activeNodeIndex + (e.shiftKey ? -1 : 1) + colors.length) % colors.length;
      setActiveNodeIndex(nextIdx);
      return;
    }

    if (deltaH !== 0 || deltaS !== 0) {
      e.preventDefault();
      const nextH = (activeC.hsl.h + deltaH + 360) % 360;
      const nextS = Math.min(100, Math.max(0, activeC.hsl.s + deltaS));
      updateNodeColor(activeNodeIndex, nextH, nextS);
    }
  };

  // Copy HEX Helper
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="bg-[#111C30] border border-[#00D8FF]/20 rounded-3xl p-6 space-y-6 shadow-2xl focus:outline-none focus:border-[#00D8FF]/50"
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#00D8FF]/15">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
                Interactive Color Engine
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Panther Color Harmony Wheel</h2>
            <p className="text-xs text-[#C9D4E5]">
              Drag control points or primary handle (★) to orbit color harmonies in real time.
            </p>
          </div>
        </div>

        {/* CANVAS ZOOM & LIGHTNESS TOOLS */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#060B16] border border-[#00D8FF]/20 p-1 rounded-xl">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
              className="p-1.5 rounded-lg text-[#C9D4E5] hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom Out Wheel"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold text-[#00D8FF] px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
              className="p-1.5 rounded-lg text-[#C9D4E5] hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom In Wheel"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg text-[#C9D4E5] hover:text-white hover:bg-white/10 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* HARMONY SELECTOR BAR (11 MODES) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#C9D4E5] uppercase tracking-wider">
            Select Harmony Algorithm ({harmonyModes.length} Modes)
          </span>
          <span className="text-[#00D8FF] font-mono text-[11px]">
            Active: {harmonyModes.find((m) => m.id === activePaletteType)?.label || activePaletteType}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {harmonyModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activePaletteType === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => onSelectPaletteType(mode.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 group ${
                  isActive
                    ? 'bg-gradient-to-br from-[#00D8FF] to-[#007BFF] border-[#00D8FF] text-black shadow-lg font-bold'
                    : 'bg-[#060B16] border-[#00D8FF]/20 text-[#C9D4E5] hover:border-[#00D8FF]/50 hover:bg-[#00D8FF]/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`p-1.5 rounded-xl ${
                      isActive ? 'bg-black/20 text-black' : 'bg-white/5 text-[#00D8FF]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isActive && <Check className="w-4 h-4 text-black" />}
                </div>

                <div>
                  <h4 className="text-xs font-bold truncate">{mode.label}</h4>
                  <p
                    className={`text-[10px] truncate ${
                      isActive ? 'text-black/80' : 'text-[#C9D4E5]/70'
                    }`}
                  >
                    {mode.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* WHEEL CANVAS & REAL-TIME READOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* INTERACTIVE CANVAS WHEEL DISPLAY */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative p-4 bg-[#060B16] rounded-3xl border border-[#00D8FF]/20">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full max-w-[420px] aspect-square cursor-crosshair touch-none select-none rounded-full"
          />

          {/* Quick Keyboard Tip */}
          <div className="mt-3 text-[10px] text-[#C9D4E5]/80 font-mono flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200">Shift + Drag</span>
            <span>Smooth orbit</span>
            <span>•</span>
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200">Arrow Keys</span>
            <span>Rotate 1°</span>
          </div>
        </div>

        {/* ACTIVE NODE & NUMERIC READOUTS */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-[#060B16] border border-[#00D8FF]/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#C9D4E5] uppercase tracking-wider">
                Active Node #{activeNodeIndex + 1} ({activeNodeIndex === 0 ? 'Primary Base ★' : 'Harmonic Accent'})
              </span>
              <button
                onClick={() => onAddColorToPalette(activeColorNode)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00D8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-xs flex items-center gap-1 shadow hover:opacity-90 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Node Color</span>
              </button>
            </div>

            {/* COLOR SWATCH & HEX BAR */}
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#0E1628] border border-[#00D8FF]/20">
              <div
                className="w-14 h-14 rounded-2xl shadow-xl border-2 border-white/20 shrink-0 transition-transform hover:scale-105"
                style={{ backgroundColor: activeColorNode.hex }}
              />

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#C9D4E5]/70 font-mono uppercase">HEX Code</span>
                  <button
                    onClick={() => handleCopyHex(activeColorNode.hex)}
                    className="p-1 rounded text-[#C9D4E5] hover:text-white transition-colors"
                  >
                    {copiedHex === activeColorNode.hex ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <h3 className="text-xl font-extrabold font-mono text-white tracking-wider">
                  {activeColorNode.hex}
                </h3>
              </div>
            </div>

            {/* NUMERIC VALUES GRID */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#0E1628] border border-[#00D8FF]/10 space-y-0.5">
                <span className="text-[10px] text-[#C9D4E5]/70 block">RGB</span>
                <span className="text-white font-bold">
                  {activeColorNode.rgb.r}, {activeColorNode.rgb.g}, {activeColorNode.rgb.b}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0E1628] border border-[#00D8FF]/10 space-y-0.5">
                <span className="text-[10px] text-[#C9D4E5]/70 block">HSL</span>
                <span className="text-white font-bold">
                  {activeColorNode.hsl.h}°, {activeColorNode.hsl.s}%, {activeColorNode.hsl.l}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0E1628] border border-[#00D8FF]/10 space-y-0.5">
                <span className="text-[10px] text-[#C9D4E5]/70 block">CMYK</span>
                <span className="text-white font-bold">
                  {activeColorNode.cmyk.c}%, {activeColorNode.cmyk.m}%, {activeColorNode.cmyk.y}%, {activeColorNode.cmyk.k}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0E1628] border border-[#00D8FF]/10 space-y-0.5">
                <span className="text-[10px] text-[#C9D4E5]/70 block">HSV / HSB</span>
                <span className="text-white font-bold">
                  {activeColorNode.hsv.h}°, {activeColorNode.hsv.s}%, {activeColorNode.hsv.v}%
                </span>
              </div>
            </div>

            {/* LIGHTNESS SLIDER */}
            <div className="space-y-1.5 pt-2 border-t border-[#00D8FF]/15">
              <div className="flex justify-between text-xs text-[#C9D4E5] font-medium">
                <span>Global Lightness Spectrum</span>
                <span className="text-[#00D8FF] font-mono">{globalLightness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={globalLightness}
                onChange={(e) => {
                  const l = Number(e.target.value);
                  setGlobalLightness(l);
                  // Update all non-locked colors to new global lightness
                  const updated = colors.map((c) =>
                    hexToColorItem(`hsl(${c.hsl.h}, ${c.hsl.s}%, ${l}%)`, c.id)
                  );
                  onUpdateColors(updated);
                }}
                className="w-full h-2 rounded-lg bg-[#0E1628] appearance-none cursor-pointer accent-[#00D8FF]"
              />
            </div>
          </div>

          {/* ALL NODES QUICK PALETTE STRIP */}
          <div className="p-3 rounded-2xl bg-[#060B16] border border-[#00D8FF]/20 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9D4E5]/80 block">
              Wheel Constellation Nodes ({colors.length})
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {colors.map((c, idx) => (
                <button
                  key={c.id || idx}
                  onClick={() => setActiveNodeIndex(idx)}
                  className={`px-3 py-2 rounded-xl flex items-center gap-2 border transition-all shrink-0 ${
                    activeNodeIndex === idx
                      ? 'bg-[#00D8FF] text-black font-extrabold border-[#00D8FF] shadow'
                      : 'bg-[#0E1628] text-[#C9D4E5] border-[#00D8FF]/20 hover:bg-[#00D8FF]/10'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-white/40"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-xs font-mono">{idx === 0 ? 'Base ★' : `#${idx + 1}`}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
