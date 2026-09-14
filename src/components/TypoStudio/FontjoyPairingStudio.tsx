import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  RefreshCw,
  Lock,
  LockOpen,
  Sparkles,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Wand2,
  Send,
  Info,
} from 'lucide-react';
import {
  generateFontPairing,
  recommendedCompanions,
  allPairingFonts,
  pairingQuality,
  getFontCategory,
  PairedFontSlot,
} from '../../utils/fontPairingEngine';
import { loadGoogleFont } from '../../utils/fontUtils';
import { TypographyPairing, TypographyRoleConfig, PairingStyle } from '../../types';

interface FontjoyPairingStudioProps {
  onApplyToWorkspace: (pairing: TypographyPairing) => void;
}

type SlotRole = 'heading' | 'subheading' | 'body';

interface SlotState {
  role: SlotRole;
  family: string;
  locked: boolean;
  sample: string;
  fontSize: number;
}

const ROLE_META: Record<SlotRole, { label: string; hint: string; fontSize: number }> = {
  heading: { label: 'Heading', hint: 'Display / statement font', fontSize: 44 },
  subheading: { label: 'Subheading', hint: 'Contrasting accent font', fontSize: 24 },
  body: { label: 'Body', hint: 'Legible reading font', fontSize: 15 },
};

const DEFAULT_SAMPLES: Record<SlotRole, string> = {
  heading: 'The quick brown fox jumps',
  subheading: 'over the lazy dog',
  body: 'Typography is the craft of endowing human language with a durable visual form. Good pairings balance contrast with harmony — a bold statement font, an accent, and a quiet workhorse that disappears into reading.',
};

const ROLE_CATEGORY_BADGE: Record<string, string> = {
  serif: 'Serif',
  'sans-serif': 'Sans',
  display: 'Display',
  handwriting: 'Script',
  monospace: 'Mono',
};

export const FontjoyPairingStudio: React.FC<FontjoyPairingStudioProps> = ({ onApplyToWorkspace }) => {
  const [slots, setSlots] = useState<SlotState[]>([
    { role: 'heading', family: 'Playfair Display', locked: false, sample: DEFAULT_SAMPLES.heading, fontSize: 44 },
    { role: 'subheading', family: 'Montserrat', locked: false, sample: DEFAULT_SAMPLES.subheading, fontSize: 24 },
    { role: 'body', family: 'Inter', locked: false, sample: DEFAULT_SAMPLES.body, fontSize: 15 },
  ]);
  const [contrast, setContrast] = useState<number>(50); // 0 similar … 100 contrast
  const [openPicker, setOpenPicker] = useState<SlotRole | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pickerTab, setPickerTab] = useState<'recommended' | 'all'>('recommended');
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 1e9));
  const [history, setHistory] = useState<PairedFontSlot[][]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Load fonts whenever the trio changes
  useEffect(() => {
    slots.forEach((s) => loadGoogleFont(s.family, [400, 500, 600, 700, 800]));
  }, [slots]);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpenPicker(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const generate = (fromHistory?: PairedFontSlot[]) => {
    if (fromHistory) {
      setSlots((prev) =>
        prev.map((slot) => {
          const found = fromHistory.find((h) => h.role === slot.role);
          return found ? { ...slot, family: found.family } : slot;
        })
      );
      return;
    }
    const locked = slots.map((s) => ({ family: s.locked ? s.family : null, role: s.role as SlotRole }));
    const trio = generateFontPairing(locked, contrast / 100, seed);
    setSeed((s) => s + 7919);
    setHistory((h) => [trio, ...h].slice(0, 20));
    setSlots((prev) =>
      prev.map((slot) => {
        const found = trio.find((t) => t.role === slot.role);
        return found ? { ...slot, family: found.family } : slot;
      })
    );
  };

  const toggleLock = (role: SlotRole) => {
    setSlots((prev) => prev.map((s) => (s.role === role ? { ...s, locked: !s.locked } : s)));
  };

  const setFamily = (role: SlotRole, family: string) => {
    setSlots((prev) => prev.map((s) => (s.role === role ? { ...s, family } : s)));
    setOpenPicker(null);
    setSearchQuery('');
  };

  const currentTrio: PairedFontSlot[] = useMemo(
    () =>
      slots.map((s) => ({ role: s.role, family: s.family, category: getFontCategory(s.family) })) as PairedFontSlot[],
    [slots]
  );

  const quality = useMemo(() => pairingQuality(currentTrio), [currentTrio]);

  // Recommended companions for the open picker's slot
  const pickerSlot = slots.find((s) => s.role === openPicker);
  const recommendations = useMemo(() => {
    if (!pickerSlot) return [];
    return recommendedCompanions(pickerSlot.family, contrast / 100, 10);
  }, [pickerSlot, contrast]);

  const allFonts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = allPairingFonts();
    return q ? list.filter((f) => f.family.toLowerCase().includes(q)) : list;
  }, [searchQuery]);

  const applyToWorkspace = () => {
    const heading = slots.find((s) => s.role === 'heading')!;
    const subheading = slots.find((s) => s.role === 'subheading')!;
    const body = slots.find((s) => s.role === 'body')!;

    const mkRole = (
      family: string,
      fontSize: number,
      fontWeight: number,
      extra?: Partial<TypographyRoleConfig>
    ): TypographyRoleConfig => ({
      fontFamily: family,
      fontWeight,
      fontSize,
      letterSpacing: 0,
      lineHeight: 1.25,
      wordSpacing: 0,
      textAlign: 'left' as const,
      textTransform: 'none',
      fontStyle: 'normal',
      textDecoration: 'none',
      opacity: 1,
      color: '#FFFFFF',
      ...extra,
    });

    const style: PairingStyle = 'editorial';
    const pairing: TypographyPairing = {
      id: `pair-fontjoy-${Date.now()}`,
      name: `${heading.family} × ${subheading.family}`,
      style,
      roles: {
        heading: mkRole(heading.family, 56, 700),
        subheading: mkRole(subheading.family, 28, 500, { color: '#5FFFF7' }),
        body: mkRole(body.family, 16, 400, { lineHeight: 1.6 }),
        caption: mkRole(body.family, 11, 600, { letterSpacing: 2, textTransform: 'uppercase' }),
        button: mkRole(subheading.family, 14, 600),
        navigation: mkRole(body.family, 13, 500, { letterSpacing: 0.5 }),
      },
      bgColor: '#060B16',
      isFavorite: false,
      createdAt: Date.now(),
    };
    onApplyToWorkspace(pairing);
  };

  const contrastLabel =
    contrast < 20 ? 'Very Similar' : contrast < 40 ? 'Similar' : contrast < 60 ? 'Balanced' : contrast < 80 ? 'Contrast' : 'High Contrast';

  return (
    <div className="rounded-[18px] bg-gradient-to-r from-[#0E1628] via-[#111C30] to-[#0E1628] border border-[#00D8FF]/30 shadow-2xl overflow-hidden">
      {/* HEADER */}
      <div className="p-4 sm:p-5 border-b border-[#00D8FF]/15 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">AI Font Pairing Engine</h2>
              <span className="px-2.5 py-0.5 text-[9px] font-extrabold tracking-widest bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black rounded-full uppercase">
                Fontjoy-style
              </span>
            </div>
            <p className="text-xs text-[#C9D4E5]/75 mt-0.5 font-medium">
              Visual font vectors pick balanced-contrast combos — one click, lock what you like, slide for contrast.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* CONTRAST SLIDER */}
          <div className="flex-1 lg:flex-none lg:w-64">
            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-[#00D8FF] uppercase tracking-wider mb-1.5">
              <span>Similar</span>
              <span className="text-[#5FFFF7]">{contrastLabel}</span>
              <span>Contrast</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-[#00D8FF]"
              id="fontjoy-contrast-slider"
            />
          </div>

          <button
            onClick={() => generate()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D8FF] via-[#28B8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-xs shadow-lg shadow-[#00D8FF]/25 flex items-center gap-2 transition-all self-start"
            id="fontjoy-generate-button"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0">
        {/* LEFT: SLOT LIST */}
        <div className="p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-[#00D8FF]/15 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#00D8FF]">
              Pairing Slots
            </span>
            <span className="text-[10px] font-mono text-[#C9D4E5]/60 flex items-center gap-1">
              <Info className="w-3 h-3" />
              balance {Math.round(quality.balanceAvg * 100)}%
            </span>
          </div>

          {slots.map((slot) => (
            <div
              key={slot.role}
              className="p-3 rounded-xl bg-[#060B16]/80 border border-[#00D8FF]/20 hover:border-[#00D8FF]/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-[#00D8FF]">
                    {ROLE_META[slot.role].label}
                  </span>
                  <span className="block text-[10px] text-[#C9D4E5]/50">{ROLE_META[slot.role].hint}</span>
                </div>
                <button
                  onClick={() => toggleLock(slot.role)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    slot.locked
                      ? 'bg-[#FF0055]/15 border-[#FF0055]/60 text-[#FF0055]'
                      : 'bg-[#111C30] border-[#00D8FF]/20 text-[#C9D4E5]/60 hover:text-white'
                  }`}
                  id={`fontjoy-lock-${slot.role}`}
                  title={slot.locked ? 'Unlock this font' : 'Lock this font'}
                >
                  {slot.locked ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="relative mt-2">
                <button
                  onClick={() => {
                    setOpenPicker(openPicker === slot.role ? null : slot.role);
                    setSearchQuery('');
                    setPickerTab('recommended');
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#111C30] border border-[#00D8FF]/25 hover:border-[#00D8FF]/60 text-left flex items-center justify-between gap-2 transition-colors"
                  id={`fontjoy-font-${slot.role}`}
                >
                  <span className="text-sm font-bold text-white truncate">{slot.family}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className="px-1.5 py-0.5 rounded bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[9px] font-mono text-[#5FFFF7] uppercase">
                      {ROLE_CATEGORY_BADGE[getFontCategory(slot.family)] || getFontCategory(slot.family)}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#C9D4E5]/60" />
                  </span>
                </button>

                {/* FONT PICKER DROPDOWN */}
                {openPicker === slot.role && (
                  <div
                    ref={pickerRef}
                    className="absolute left-0 right-0 top-full mt-2 z-40 rounded-xl bg-[#0E1628] border border-[#00D8FF]/40 shadow-2xl overflow-hidden"
                  >
                    <div className="p-2 border-b border-[#00D8FF]/15 space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#C9D4E5]/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search fonts..."
                          className="w-full px-3 py-2 pl-8 rounded-lg bg-[#060B16] border border-[#00D8FF]/25 text-white text-xs placeholder-[#C9D4E5]/40 focus:outline-none focus:border-[#00D8FF]"
                          autoFocus
                        />
                      </div>
                      {!searchQuery && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setPickerTab('recommended')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              pickerTab === 'recommended'
                                ? 'bg-[#00D8FF] text-black'
                                : 'bg-[#111C30] text-[#C9D4E5]/70'
                            }`}
                          >
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            Recommended
                          </button>
                          <button
                            onClick={() => setPickerTab('all')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              pickerTab === 'all'
                                ? 'bg-[#00D8FF] text-black'
                                : 'bg-[#111C30] text-[#C9D4E5]/70'
                            }`}
                          >
                            All Fonts ({allFonts.length})
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="max-h-56 overflow-y-auto p-2 space-y-1">
                      {(searchQuery || pickerTab === 'all'
                        ? allFonts.map((f) => f.family)
                        : recommendations.map((r) => r.family)
                      ).map((family) => {
                        const rec = recommendations.find((r) => r.family === family);
                        return (
                          <button
                            key={family}
                            onClick={() => setFamily(slot.role, family)}
                            className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between gap-2 transition-colors ${
                              slot.family === family
                                ? 'bg-[#00D8FF]/20 border border-[#00D8FF]/60'
                                : 'bg-[#111C30] hover:bg-[#060B16] border border-transparent'
                            }`}
                          >
                            <span
                              className="text-xs font-semibold text-white truncate"
                              style={{ fontFamily: `"${family}", sans-serif` }}
                            >
                              {family}
                            </span>
                            <span className="flex items-center gap-1.5 shrink-0">
                              {rec && (
                                <span className="text-[9px] font-mono text-[#5FFFF7]">
                                  {Math.round(rec.score * 100)}%
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 rounded bg-black/30 text-[8px] font-mono text-[#C9D4E5]/60 uppercase">
                                {ROLE_CATEGORY_BADGE[getFontCategory(family)] || getFontCategory(family)}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* EDITABLE SAMPLE TEXT */}
              <input
                type="text"
                value={slot.sample}
                onChange={(e) =>
                  setSlots((prev) => prev.map((s) => (s.role === slot.role ? { ...s, sample: e.target.value } : s)))
                }
                className="mt-2 w-full px-3 py-1.5 rounded-lg bg-transparent border border-[#00D8FF]/10 focus:border-[#00D8FF]/40 text-[11px] text-[#C9D4E5]/80 focus:outline-none transition-colors"
              />
            </div>
          ))}

          {/* ACTIONS */}
          <div className="pt-2 space-y-2">
            <button
              onClick={applyToWorkspace}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FDE68A] hover:from-[#FDE68A] hover:to-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/20"
              id="fontjoy-apply-workspace"
            >
              <Send className="w-4 h-4" />
              <span>Use in Pairing Workspace</span>
            </button>

            {history.length > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <SlidersHorizontal className="w-3 h-3 text-[#C9D4E5]/50" />
                <span className="text-[9px] font-mono text-[#C9D4E5]/50 uppercase">Recent:</span>
                {history.slice(1, 6).map((trio, idx) => (
                  <button
                    key={idx}
                    onClick={() => generate(trio)}
                    className="px-2 py-0.5 rounded bg-[#111C30] border border-[#00D8FF]/20 text-[9px] font-mono text-[#C9D4E5]/80 hover:text-[#5FFFF7] hover:border-[#00D8FF]/50 transition-colors"
                  >
                    {trio.map((t) => t.family.split(' ')[0]).join(' · ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="p-4 sm:p-5">
          <div className="rounded-xl overflow-hidden border border-[#00D8FF]/20">
            <div
              className="p-6 sm:p-8 min-h-[420px] flex flex-col justify-center gap-5"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 0%, rgba(0,216,255,0.08), transparent 60%), linear-gradient(180deg, #0A1120 0%, #060B16 100%)',
              }}
            >
              {slots.map((slot) => (
                <div key={slot.role} className="space-y-1">
                  {slot.role === 'body' && (
                    <div className="w-16 h-px bg-[#00D8FF]/40 mb-3" />
                  )}
                  <span
                    className="block text-white"
                    style={{
                      fontFamily: `"${slot.family}", sans-serif`,
                      fontWeight: slot.role === 'heading' ? 700 : slot.role === 'subheading' ? 500 : 400,
                      fontSize: `${slot.fontSize}px`,
                      lineHeight: slot.role === 'body' ? 1.65 : 1.2,
                      letterSpacing: slot.role === 'subheading' ? '0.5px' : '0px',
                      color:
                        slot.role === 'heading' ? '#FFFFFF' : slot.role === 'subheading' ? '#5FFFF7' : '#C9D4E5',
                    }}
                  >
                    {slot.sample}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* QUALITY READOUT */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {[
              { label: 'H↔S cosine', value: quality.cosineHeadingSub },
              { label: 'H↔B cosine', value: quality.cosineHeadingBody },
              { label: 'S↔B cosine', value: quality.cosineSubBody },
              { label: 'Contrast balance', value: quality.balanceAvg },
            ].map((q) => (
              <div key={q.label} className="px-2 py-1.5 rounded-lg bg-[#060B16]/80 border border-[#00D8FF]/15">
                <span className="block text-[8px] font-mono uppercase tracking-wider text-[#C9D4E5]/50">
                  {q.label}
                </span>
                <span className="text-[11px] font-mono font-bold text-[#5FFFF7]">{q.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
