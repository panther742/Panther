import React, { useState, useEffect } from 'react';
import { TypographyPairing, PairingStyle, FontRole, TypographyRoleConfig } from '../../types';
import {
  PRESET_TYPOGRAPHY_PAIRINGS,
  POPULAR_GOOGLE_FONTS,
  loadGoogleFont,
} from '../../utils/fontUtils';
import { TypographyGenerator } from './TypographyGenerator';
import { PairingStyleBar } from './PairingStyleBar';
import { LivePreviewCanvas } from './LivePreviewCanvas';
import { TypographyControlsPanel } from './TypographyControlsPanel';
import { FontPickerModal } from './FontPickerModal';
import { ExportTypoModal } from './ExportTypoModal';
import { FontDetailsModal } from './FontDetailsModal';
import { AiTypographyAssistant } from './AiTypographyAssistant';
import { BrandKitManager } from './BrandKitManager';
import { Type, Download, RefreshCw, Sparkles, Layers } from 'lucide-react';

export const TypoStudio: React.FC = () => {
  // Active Mode: 'generator' (Panther Typography Generator) vs 'pairing' (Font Pairing Workspace)
  const [activeTab, setActiveTab] = useState<'generator' | 'pairing'>('generator');

  // Current active typography pairing state
  const [currentPairing, setCurrentPairing] = useState<TypographyPairing>(
    PRESET_TYPOGRAPHY_PAIRINGS.luxury
  );

  // Modals state
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [fontPickerRole, setFontPickerRole] = useState<FontRole>('heading');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [inspectFontState, setInspectFontState] = useState<{
    isOpen: boolean;
    family: string;
    role?: FontRole;
  }>({
    isOpen: false,
    family: 'Cinzel',
    role: 'heading',
  });

  // Load Google Fonts when pairing updates
  useEffect(() => {
    Object.values(currentPairing.roles).forEach((role) => {
      const config = role as TypographyRoleConfig;
      if (config?.fontFamily) {
        loadGoogleFont(config.fontFamily);
      }
    });
  }, [currentPairing]);

  // Handle preset style change
  const handleSelectStyle = (style: PairingStyle) => {
    const preset = PRESET_TYPOGRAPHY_PAIRINGS[style];
    if (preset) {
      setCurrentPairing(preset);
    }
  };

  // AI Pair Generator Algorithm
  const handleGenerateAIPair = (promptType: string) => {
    const getRandomFont = (category?: string) => {
      const pool = category
        ? POPULAR_GOOGLE_FONTS.filter((f) => f.category === category)
        : POPULAR_GOOGLE_FONTS;
      return pool[Math.floor(Math.random() * pool.length)] || POPULAR_GOOGLE_FONTS[0];
    };

    let headingFont = getRandomFont();
    let bodyFont = getRandomFont('sans-serif');
    let subFont = getRandomFont();

    if (promptType === 'luxury') {
      headingFont = getRandomFont('serif');
      bodyFont = getRandomFont('sans-serif');
    } else if (promptType === 'minimal') {
      headingFont = getRandomFont('sans-serif');
      bodyFont = getRandomFont('sans-serif');
    } else if (promptType === 'poster') {
      headingFont = getRandomFont('display');
    } else if (promptType === 'brand') {
      headingFont = getRandomFont('serif');
    }

    loadGoogleFont(headingFont.family);
    loadGoogleFont(bodyFont.family);
    loadGoogleFont(subFont.family);

    const newPairing: TypographyPairing = {
      ...currentPairing,
      id: `ai-pair-${Date.now()}`,
      name: `AI ${promptType.toUpperCase()} Combination`,
      style: (currentPairing.style || 'modern') as PairingStyle,
      roles: {
        ...currentPairing.roles,
        heading: {
          ...currentPairing.roles.heading,
          fontFamily: headingFont.family,
        },
        subheading: {
          ...currentPairing.roles.subheading,
          fontFamily: subFont.family,
        },
        body: {
          ...currentPairing.roles.body,
          fontFamily: bodyFont.family,
        },
      },
    };

    setCurrentPairing(newPairing);
  };

  // Update specific typography role parameter
  const handleUpdateRoleConfig = (role: FontRole, updates: Partial<TypographyRoleConfig>) => {
    setCurrentPairing((prev) => ({
      ...prev,
      roles: {
        ...prev.roles,
        [role]: {
          ...prev.roles[role],
          ...updates,
        },
      },
    }));
  };

  // Open font picker for target role
  const handleOpenFontPicker = (role: FontRole) => {
    setFontPickerRole(role);
    setIsFontPickerOpen(true);
  };

  // Select font from picker
  const handleSelectFont = (fontFamily: string) => {
    loadGoogleFont(fontFamily);
    handleUpdateRoleConfig(fontPickerRole, { fontFamily });
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-[#C9D4E5] min-h-screen bg-[#060B16]">
      {/* MODE SELECTOR NAVIGATION */}
      <div className="p-2 rounded-2xl bg-[#0E1628] border border-[#00D8FF]/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black shadow-lg shadow-[#00D8FF]/25'
                : 'text-[#C9D4E5]/80 hover:text-white hover:bg-[#111C30]'
            }`}
            id="tab-panther-typography-generator"
          >
            <Sparkles className="w-4 h-4" />
            <span>Panther Typography Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('pairing')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'pairing'
                ? 'bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black shadow-lg shadow-[#00D8FF]/25'
                : 'text-[#C9D4E5]/80 hover:text-white hover:bg-[#111C30]'
            }`}
            id="tab-font-pairing-engine"
          >
            <Layers className="w-4 h-4" />
            <span>Font Pairing Workspace</span>
          </button>
        </div>

        <span className="text-[10px] font-mono font-bold text-[#00D8FF] uppercase px-3 hidden md:inline">
          Panther Studio v2.0
        </span>
      </div>

      {/* VIEW RENDER */}
      {activeTab === 'generator' ? (
        <TypographyGenerator />
      ) : (
        <div className="space-y-10">
          {/* HEADER BAR FOR PAIRING STUDIO */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#00D8FF]/15">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
                <Type className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
                    Font Pairing Workspace
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                  Panther Typo Studio
                </h1>
                <p className="text-xs text-[#C9D4E5]/80 font-medium">
                  Discover, synthesize & preview perfect font pairings for logos, branding, websites, posters & UI.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleGenerateAIPair('random')}
                className="px-4 py-2.5 rounded-xl bg-[#111C30] hover:bg-[#060B16] border border-[#00D8FF]/30 text-[#C9D4E5] font-semibold text-xs flex items-center gap-2 transition-all shadow"
                id="randomize-pair-button"
              >
                <RefreshCw className="w-4 h-4 text-[#00D8FF]" />
                <span>Randomize AI Pair</span>
              </button>

              <button
                onClick={() => setIsExportOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D8FF] via-[#28B8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-xs shadow-lg shadow-[#00D8FF]/20 flex items-center gap-2 transition-all"
                id="export-typography-modal-trigger"
              >
                <Download className="w-4 h-4" />
                <span>Export Specs & CSS</span>
              </button>
            </div>
          </div>

          {/* PAIRING STYLE & QUICK AI BAR */}
          <PairingStyleBar
            currentStyle={currentPairing.style}
            onSelectStyle={handleSelectStyle}
            onGenerateAIPair={handleGenerateAIPair}
          />

          {/* AI TYPOGRAPHY ASSISTANT & BRAND GENERATOR */}
          <AiTypographyAssistant
            currentPairing={currentPairing}
            onApplyPairing={(newPairing) => setCurrentPairing(newPairing)}
            onSelectBackground={(bgStyle) =>
              setCurrentPairing((prev) => ({ ...prev, bgColor: bgStyle }))
            }
          />

          {/* LIVE PREVIEW CANVAS */}
          <LivePreviewCanvas pairing={currentPairing} />

          {/* GRANULAR TYPOGRAPHY CONTROLS */}
          <TypographyControlsPanel
            pairing={currentPairing}
            onUpdateRoleConfig={handleUpdateRoleConfig}
            onOpenFontPicker={handleOpenFontPicker}
            onInspectFont={(role, family) => setInspectFontState({ isOpen: true, role, family })}
          />

          {/* BRAND KITS & SAVED COLLECTIONS */}
          <BrandKitManager currentPairing={currentPairing} onLoadPairing={setCurrentPairing} />

          {/* MODALS */}
          <FontPickerModal
            isOpen={isFontPickerOpen}
            onClose={() => setIsFontPickerOpen(false)}
            targetRole={fontPickerRole}
            currentFont={currentPairing.roles[fontPickerRole]?.fontFamily || 'Inter'}
            onSelectFont={handleSelectFont}
          />

          <ExportTypoModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            pairing={currentPairing}
          />

          <FontDetailsModal
            isOpen={inspectFontState.isOpen}
            onClose={() => setInspectFontState((prev) => ({ ...prev, isOpen: false }))}
            fontFamily={inspectFontState.family}
            roleName={inspectFontState.role}
          />
        </div>
      )}
    </div>
  );
};

export default TypoStudio;
