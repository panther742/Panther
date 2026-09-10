import React, { useState } from 'react';
import { ColorItem, PaletteType } from '../../types';
import { hexToColorItem, generateHarmony } from '../../utils/colorUtils';
import { InteractiveColorWheel } from './InteractiveColorWheel';
import { ColorCanvas } from './ColorCanvas';
import { PaletteCards } from './PaletteCards';
import { HarmoniesAndPresets } from './HarmoniesAndPresets';
import { ColorPreviews } from './ColorPreviews';
import { GradientStudio } from './GradientStudio';
import { AiPaletteGenerator } from './AiPaletteGenerator';
import { ExportPaletteModal } from './ExportPaletteModal';
import { Download, RefreshCw, Palette } from 'lucide-react';

export const ColorStudio: React.FC = () => {
  // Initial default palette in Panther Electric Blue theme
  const [colors, setColors] = useState<ColorItem[]>([
    hexToColorItem('#060B16', 'c1'),
    hexToColorItem('#00D8FF', 'c2'),
    hexToColorItem('#28B8FF', 'c3'),
    hexToColorItem('#5FFFF7', 'c4'),
    hexToColorItem('#111C30', 'c5'),
  ]);

  const [activeColor, setActiveColor] = useState<ColorItem>(colors[1] || hexToColorItem('#00D8FF'));
  const [activePaletteType, setActivePaletteType] = useState<PaletteType>('custom');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const handleToggleLock = (id: string) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isLocked: !c.isLocked } : c))
    );
  };

  const handleToggleFavorite = (id: string) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  const handleRemoveColor = (id: string) => {
    if (colors.length <= 2) return;
    setColors((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddColorToPalette = (newColor: ColorItem) => {
    if (colors.length >= 10) return;
    setColors((prev) => [...prev, newColor]);
  };

  const handleSelectType = (type: PaletteType) => {
    setActivePaletteType(type);
    const newHarmonyColors = generateHarmony(activeColor.hex, type);
    // Keep locked colors
    setColors((prev) => {
      return newHarmonyColors.map((newC, idx) => {
        if (prev[idx] && prev[idx].isLocked) {
          return prev[idx];
        }
        return newC;
      });
    });
  };

  const handleRandomize = () => {
    const randomBaseHex = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`;
    const newBase = hexToColorItem(randomBaseHex);
    setActiveColor(newBase);
    const newHarmonyColors = generateHarmony(randomBaseHex, activePaletteType);
    setColors((prev) => {
      return newHarmonyColors.map((newC, idx) => {
        if (prev[idx] && prev[idx].isLocked) {
          return prev[idx];
        }
        return newC;
      });
    });
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-[#C9D4E5] min-h-screen bg-[#060B16]">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#00D8FF]/15">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                AI Color Studio
              </h1>
              <p className="text-xs text-[#C9D4E5]/80 font-medium">
                Create original color harmonies, test accessibility, preview UI mockups, and export ASE/GPL swatches.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRandomize}
            className="px-4 py-2.5 rounded-xl bg-[#111C30] hover:bg-[#0E1628] border border-[#00D8FF]/30 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-all shadow"
            id="randomize-color-palette-top-button"
          >
            <RefreshCw className="w-4 h-4 text-[#00D8FF]" />
            <span>Randomize</span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D8FF] via-[#28B8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-xs shadow-lg shadow-[#00D8FF]/20 flex items-center gap-2 transition-all"
            id="export-color-palette-modal-trigger"
          >
            <Download className="w-4 h-4" />
            <span>Export Palette</span>
          </button>
        </div>
      </div>

      {/* GEMINI AI PROMPT SYNTHESIZER */}
      <AiPaletteGenerator
        onApplyGeneratedColors={(newColors) => {
          setColors(newColors);
          if (newColors[0]) setActiveColor(newColors[0]);
        }}
      />

      {/* INTERACTIVE COLOR HARMONY WHEEL */}
      <InteractiveColorWheel
        colors={colors}
        activePaletteType={activePaletteType}
        onSelectPaletteType={handleSelectType}
        onUpdateColors={(newColors) => {
          setColors(newColors);
          if (newColors[0]) setActiveColor(newColors[0]);
        }}
        onAddColorToPalette={handleAddColorToPalette}
      />

      {/* ACTIVE PALETTE CARDS */}
      <PaletteCards
        colors={colors}
        onToggleLock={handleToggleLock}
        onToggleFavorite={handleToggleFavorite}
        onRemoveColor={handleRemoveColor}
        onSelectColor={(c) => setActiveColor(c)}
      />

      {/* CANVAS & HARMONIES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ColorCanvas
          currentColor={activeColor}
          onColorChange={(c) => setActiveColor(c)}
          onAddColorToPalette={handleAddColorToPalette}
        />

        <HarmoniesAndPresets
          activeType={activePaletteType}
          onSelectType={handleSelectType}
          onRandomize={handleRandomize}
        />
      </div>

      {/* DYNAMIC GRADIENT STUDIO */}
      <GradientStudio colors={colors} />

      {/* LIVE PREVIEWS & ACCESSIBILITY CHECKER */}
      <ColorPreviews colors={colors} />

      {/* EXPORT MODAL */}
      <ExportPaletteModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        colors={colors}
      />
    </div>
  );
};

export default ColorStudio;

