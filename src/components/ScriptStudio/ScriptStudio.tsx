import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../lib/apiClient';
import {
  Type,
  Languages,
  ArrowRightLeft,
  Sparkles,
  Copy,
  Check,
  Volume2,
  Download,
  Trash2,
  Wand2,
  Star,
  Search,
  History,
  FileText,
  FileCode,
  Sliders,
  Share2,
  Crown,
  Tag,
  HelpCircle,
  Eye,
  CheckCircle2,
  RotateCcw,
  Sparkle,
  Zap,
  Bookmark,
  ShieldAlert,
} from 'lucide-react';
import {
  ScriptConversionMode,
  DesignerVariationStyle,
  ScriptConversionResult,
  ScriptLanguageOption,
} from '../../types';
import { SUPPORTED_LANGUAGES, FEATURED_LANGUAGES, loadGoogleFontForScript } from './languagesData';

const VARIATION_LABELS: Record<DesignerVariationStyle, { label: string; icon: string; desc: string }> = {
  short: { label: 'Short Version', icon: '⚡', desc: 'Punchy & compact for app icons or badges' },
  premium: { label: 'Premium Version', icon: '👑', desc: 'Sophisticated phrasing for high-end branding' },
  luxury: { label: 'Luxury Version', icon: '🏛️', desc: 'Heritage & royal formulation for premium labels' },
  modern: { label: 'Modern Version', icon: '🚀', desc: 'Sleek, tech-forward phrasing' },
  minimal: { label: 'Minimal Version', icon: '🎯', desc: 'Clean, stripped-down core words' },
  poster: { label: 'Poster Friendly', icon: '🖼️', desc: 'High impact headline version for print posters' },
  logo: { label: 'Logo Friendly', icon: '🏷️', desc: 'Balanced symmetrical phrasing for brand marks' },
  thumbnail: { label: 'Thumbnail Friendly', icon: '🎬', desc: 'High contrast catchy text for YouTube/social' },
};

const QUICK_FIXES = [
  { id: 'grammar', label: 'Grammar Fix', icon: '🪄' },
  { id: 'spelling', label: 'Spelling Fix', icon: '✨' },
  { id: 'smart-rewrite', label: 'Smart Rewrite', icon: '⚡' },
  { id: 'brand-safe', label: 'Brand-Safe Conversion', icon: '🏷️' },
  { id: 'poster-safe', label: 'Poster-Safe Headline', icon: '🖼️' },
  { id: 'typography-safe', label: 'Typography Glyphs', icon: '🔤' },
];

export const ScriptStudio: React.FC = () => {
  // Main State
  const [sourceText, setSourceText] = useState<string>('Panther Studio');
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('hi');
  const [mode, setMode] = useState<ScriptConversionMode>('smart-brand');
  const [designerMode, setDesignerMode] = useState<boolean>(true);

  // Results State
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<ScriptConversionResult | null>(null);
  const [activeOutput, setActiveOutput] = useState<string>('पैंथर स्टूडियो');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Typography Preview Controls
  const [selectedFont, setSelectedFont] = useState<string>('Noto Sans Devanagari');
  const [fontSize, setFontSize] = useState<number>(38);
  const [fontWeight, setFontWeight] = useState<number>(700);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [textColor, setTextColor] = useState<string>('#00D8FF');
  const [previewBgColor, setPreviewBgColor] = useState<string>('#0E1628');

  // History & Search
  const [history, setHistory] = useState<ScriptConversionResult[]>([]);
  const [historySearch, setHistorySearch] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [favoriteOnly, setFavoriteOnly] = useState<boolean>(false);

  // Dropdowns & Search
  const [sourceSearch, setSourceSearch] = useState<string>('');
  const [targetSearch, setTargetSearch] = useState<string>('');
  const [showSourceDropdown, setShowSourceDropdown] = useState<boolean>(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load History from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('panther_script_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.warn('Failed to parse script history:', e);
    }
  }, []);

  // Save History to localStorage
  const saveHistoryItem = (newItem: ScriptConversionResult) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.id !== newItem.id);
      const updated = [newItem, ...filtered].slice(0, 50);
      try {
        localStorage.setItem('panther_script_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save script history:', e);
      }
      return updated;
    });
  };

  // Target Lang Object & Fonts update
  const currentTargetLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) ||
    SUPPORTED_LANGUAGES.find((l) => l.code === 'hi')!;

  useEffect(() => {
    if (currentTargetLangObj) {
      if (currentTargetLangObj.fontOptions && currentTargetLangObj.fontOptions.length > 0) {
        const defaultF = currentTargetLangObj.fontOptions[0].name;
        setSelectedFont(defaultF);
        loadGoogleFontForScript(defaultF);
      }
    }
  }, [targetLang]);

  useEffect(() => {
    if (selectedFont) {
      loadGoogleFontForScript(selectedFont);
    }
  }, [selectedFont]);

  // Handle Close Dropdowns outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSourceDropdown(false);
        setShowTargetDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform Script Conversion
  const handleConvert = async (overrideQuickFix?: string) => {
    if (!sourceText.trim()) return;
    setIsConverting(true);
    setConversionError(null);

    try {
      const data = await apiClient.fetchWithCache<{ success: boolean; result: any }>(
        '/api/script-converter',
        {
          method: 'POST',
          body: JSON.stringify({
            sourceText,
            sourceLang,
            targetLang,
            mode,
            designerMode,
            quickFixAction: overrideQuickFix,
          }),
        },
        10 * 60 * 1000,
        1,
        90000
      );

      if (data.success && data.result) {
        const res: ScriptConversionResult = {
          id: `conv-${Date.now()}`,
          sourceText,
          sourceLang,
          targetLang,
          mode,
          primaryOutput: data.result.primaryOutput || sourceText,
          pronunciationGuide: data.result.pronunciationGuide,
          explanation: data.result.explanation,
          designerVariations: data.result.designerVariations,
          timestamp: Date.now(),
          isFavorite: false,
        };

        setCurrentResult(res);
        setActiveOutput(res.primaryOutput);
        saveHistoryItem(res);
      } else {
        setConversionError('Conversion returned no result. Please try again.');
      }
    } catch (err: any) {
      console.error('Script conversion request error:', err);
      setConversionError(
        err?.message || 'AI script conversion failed. Please check your network connection and try again.'
      );
    } finally {
      setIsConverting(false);
    }
  };

  // Initial Auto Convert on Mount
  useEffect(() => {
    handleConvert();
  }, []);

  // Swap Languages
  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  // Copy Helper
  const handleCopy = (text: string, idStr: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idStr);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Speech TTS Audio Output
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang === 'hi' ? 'hi-IN' : targetLang === 'gu' ? 'gu-IN' : 'en-US';
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Downloads
  const handleDownloadFile = (type: 'txt' | 'docx' | 'pdf' | 'svg') => {
    if (!activeOutput) return;

    const filename = `panther-script-${targetLang}-${Date.now()}`;

    if (type === 'txt') {
      const blob = new Blob([activeOutput], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.txt`;
      link.click();
    } else if (type === 'svg') {
      const fontObj = currentTargetLangObj.fontOptions.find((f) => f.name === selectedFont);
      const fontFamilyStr = fontObj ? fontObj.family : `'${selectedFont}', sans-serif`;

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" width="1000" height="400">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=${selectedFont.replace(/\s+/g, '+')}:wght@700&amp;display=swap');
      .script-text {
        font-family: ${fontFamilyStr};
        font-size: ${fontSize * 1.5}px;
        font-weight: ${fontWeight};
        fill: ${textColor};
        letter-spacing: ${letterSpacing}px;
        text-anchor: middle;
        dominant-baseline: middle;
      }
      .watermark {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 12px;
        fill: #00D8FF;
        opacity: 0.6;
      }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="${previewBgColor}" rx="24"/>
  <text x="500" y="200" class="script-text">${activeOutput}</text>
  <text x="960" y="380" text-anchor="end" class="watermark">Created with Panther Studio AI Script Converter</text>
</svg>`;

      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.svg`;
      link.click();
    } else if (type === 'docx') {
      const docxHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Panther Studio Export</title>
      <style>
        body { font-family: '${selectedFont}', Arial, sans-serif; font-size: 24pt; color: #111827; }
        .meta { font-size: 10pt; color: #6B7280; margin-bottom: 20px; }
      </style>
      </head>
      <body>
        <div class="meta">Panther Studio AI Script Converter Export | Language: ${currentTargetLangObj.name} | Mode: ${mode}</div>
        <div>${activeOutput}</div>
      </body>
      </html>`;

      const blob = new Blob([docxHtml], { type: 'application/msword;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.doc`;
      link.click();
    } else if (type === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Panther Studio Script Export</title>
              <link href="https://fonts.googleapis.com/css2?family=${selectedFont.replace(/\s+/g, '+')}:wght@700&display=swap" rel="stylesheet">
              <style>
                body { font-family: '${selectedFont}', sans-serif; background: #060B16; color: #00D8FF; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                h1 { font-size: 48px; margin-bottom: 16px; }
                p { color: #94A3B8; font-size: 14px; font-family: sans-serif; }
              </style>
            </head>
            <body>
              <h1>${activeOutput}</h1>
              <p>Exported via Panther Studio AI Script Converter (${currentTargetLangObj.name})</p>
              <script>window.onload = function() { window.print(); window.close(); }</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // Toggle Favorite in History
  const toggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  // Filtered Source/Target lists for dropdown search
  const filteredSourceLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const filteredTargetLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.code !== 'auto' &&
      (l.name.toLowerCase().includes(targetSearch.toLowerCase()) ||
        l.nativeName.toLowerCase().includes(targetSearch.toLowerCase()))
  );

  return (
    <div className="relative min-h-screen bg-[#060B16] text-slate-100 pb-24 px-4 sm:px-6 lg:px-8 pt-6 selection:bg-[#00D8FF] selection:text-black">
      {/* BACKGROUND GLOW ACCENTS */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#00D8FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10" ref={dropdownRef}>
        {/* HEADER TITLE BAR */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0E1628]/80 backdrop-blur-2xl border border-[#00D8FF]/30 shadow-[0_10px_40px_rgba(0,216,255,0.1)]">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#00D8FF]/20 to-blue-600/20 border border-[#00D8FF]/40 text-[#00D8FF] shadow-lg shadow-[#00D8FF]/20">
              <Type className="w-8 h-8 text-[#00D8FF] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  AI Script Converter
                </h1>
                <span className="px-3 py-1 text-[10px] font-mono font-extrabold tracking-widest uppercase bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black rounded-full shadow-md shadow-[#00D8FF]/20">
                  DESIGNER PRO
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#C9D4E5]/80 font-medium mt-1">
                Phonetic script conversion, smart brand protection, & typography engine for 150+ scripts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#111C30] border border-[#00D8FF]/30 text-[#00D8FF] hover:bg-[#00D8FF]/10 transition-all duration-200 shadow-md"
            >
              <History className="w-4 h-4 text-[#00D8FF]" />
              <span>Conversion History ({history.length})</span>
            </button>
          </div>
        </div>

        {/* TOP BAR: LANGUAGE SELECTOR & SWAP */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-4 rounded-2xl bg-[#0E1628]/90 border border-[#00D8FF]/25 shadow-xl">
          {/* Source Language Selector */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              From Language
            </label>
            <button
              onClick={() => {
                setShowSourceDropdown(!showSourceDropdown);
                setShowTargetDropdown(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#060B16] border border-[#00D8FF]/30 text-slate-100 hover:border-[#00D8FF] transition-all duration-200 text-sm font-semibold"
            >
              <span className="flex items-center gap-2 truncate">
                <GlobeIcon className="w-4 h-4 text-[#00D8FF]" />
                {SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang)?.name || 'Auto Detect'}
                <span className="text-xs text-slate-400 font-normal">
                  ({SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang)?.nativeName})
                </span>
              </span>
              <span className="text-[10px] text-[#00D8FF] bg-[#00D8FF]/10 px-2 py-0.5 rounded-md border border-[#00D8FF]/30">
                {sourceLang.toUpperCase()}
              </span>
            </button>

            {/* Source Dropdown Menu */}
            {showSourceDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 p-3 rounded-2xl bg-[#0E1628] border border-[#00D8FF]/40 shadow-2xl backdrop-blur-2xl max-h-80 overflow-y-auto space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search 150+ languages..."
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060B16] border border-[#00D8FF]/20 text-white focus:outline-none focus:border-[#00D8FF]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {filteredSourceLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSourceLang(lang.code);
                        setShowSourceDropdown(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all text-left ${
                        sourceLang === lang.code
                          ? 'bg-[#00D8FF] text-black font-extrabold'
                          : 'text-slate-300 hover:bg-[#00D8FF]/10 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{lang.name}</span>
                      <span className="text-[10px] opacity-75">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center py-1 md:py-0">
            <button
              onClick={handleSwapLanguages}
              disabled={sourceLang === 'auto'}
              title="Swap Languages"
              className="p-3 rounded-xl bg-[#111C30] border border-[#00D8FF]/30 text-[#00D8FF] hover:bg-[#00D8FF] hover:text-black hover:scale-110 active:scale-95 transition-all duration-200 shadow-md disabled:opacity-40 disabled:hover:bg-[#111C30] disabled:hover:text-[#00D8FF]"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Target Language Selector */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              To Target Script / Language
            </label>
            <button
              onClick={() => {
                setShowTargetDropdown(!showTargetDropdown);
                setShowSourceDropdown(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#060B16] border border-[#00D8FF]/30 text-slate-100 hover:border-[#00D8FF] transition-all duration-200 text-sm font-semibold"
            >
              <span className="flex items-center gap-2 truncate">
                <GlobeIcon className="w-4 h-4 text-[#00D8FF]" />
                {currentTargetLangObj.name}
                <span className="text-xs text-slate-400 font-normal">
                  ({currentTargetLangObj.nativeName})
                </span>
              </span>
              <span className="text-[10px] text-[#00D8FF] bg-[#00D8FF]/10 px-2 py-0.5 rounded-md border border-[#00D8FF]/30 font-bold">
                {currentTargetLangObj.script}
              </span>
            </button>

            {/* Target Dropdown Menu */}
            {showTargetDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 p-3 rounded-2xl bg-[#0E1628] border border-[#00D8FF]/40 shadow-2xl backdrop-blur-2xl max-h-80 overflow-y-auto space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search 150+ target scripts..."
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060B16] border border-[#00D8FF]/20 text-white focus:outline-none focus:border-[#00D8FF]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {filteredTargetLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setTargetLang(lang.code);
                        setShowTargetDropdown(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all text-left ${
                        targetLang === lang.code
                          ? 'bg-[#00D8FF] text-black font-extrabold'
                          : 'text-slate-300 hover:bg-[#00D8FF]/10 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{lang.name}</span>
                      <span className="text-[10px] opacity-75">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QUICK FEATURED LANGUAGE CHIPS */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Zap className="w-3.5 h-3.5 text-[#00D8FF]" /> Quick Preset:
          </span>
          {FEATURED_LANGUAGES.map((langCode) => {
            const lObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
            if (!lObj) return null;
            const isSel = targetLang === langCode;
            return (
              <button
                key={langCode}
                onClick={() => setTargetLang(langCode)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all duration-200 ${
                  isSel
                    ? 'bg-[#00D8FF] text-black border-[#00D8FF] shadow-lg shadow-[#00D8FF]/20 scale-105'
                    : 'bg-[#0E1628] text-slate-300 border-[#00D8FF]/20 hover:border-[#00D8FF] hover:text-white'
                }`}
              >
                {lObj.name} <span className="opacity-70 text-[10px]">({lObj.nativeName})</span>
              </button>
            );
          })}
        </div>

        {/* CORE WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT PANEL: INPUT & CONTROLS */}
          <div className="lg:col-span-5 space-y-6">
            {/* MODE SELECTION TABS */}
            <div className="p-4 rounded-3xl bg-[#0E1628]/80 border border-[#00D8FF]/20 shadow-xl space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-widest text-[#00D8FF] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00D8FF]" /> Select Conversion Mode
              </label>

              <div className="grid grid-cols-2 gap-2">
                {/* Mode 1: Smart Brand Mode */}
                <button
                  onClick={() => setMode('smart-brand')}
                  className={`relative p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    mode === 'smart-brand'
                      ? 'bg-gradient-to-br from-[#00D8FF]/20 via-blue-900/30 to-[#060B16] border-[#00D8FF] shadow-lg shadow-[#00D8FF]/20 text-white'
                      : 'bg-[#060B16] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black flex items-center gap-1.5 text-white">
                      🏷️ Smart Brand
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#00D8FF] text-black rounded-full">
                      MUST USE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    Preserves brand names phonetically (Panther Studio → पैंथर स्टूडियो, NOT तेंदुआ).
                  </p>
                </button>

                {/* Mode 2: Transliteration */}
                <button
                  onClick={() => setMode('transliteration')}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    mode === 'transliteration'
                      ? 'bg-gradient-to-br from-[#00D8FF]/20 to-[#060B16] border-[#00D8FF] shadow-lg shadow-[#00D8FF]/20 text-white'
                      : 'bg-[#060B16] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-extrabold text-white mb-1 block">
                    🗣️ Transliteration
                  </span>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    Converts pronunciation phonetically into target native script.
                  </p>
                </button>

                {/* Mode 3: Translation */}
                <button
                  onClick={() => setMode('translation')}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    mode === 'translation'
                      ? 'bg-gradient-to-br from-[#00D8FF]/20 to-[#060B16] border-[#00D8FF] shadow-lg shadow-[#00D8FF]/20 text-white'
                      : 'bg-[#060B16] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-extrabold text-white mb-1 block">
                    🌐 Translation
                  </span>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    Translates actual semantic meaning (Good Morning → सुप्रभात).
                  </p>
                </button>

                {/* Mode 4: Auto Detect */}
                <button
                  onClick={() => setMode('auto-detect')}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    mode === 'auto-detect'
                      ? 'bg-gradient-to-br from-[#00D8FF]/20 to-[#060B16] border-[#00D8FF] shadow-lg shadow-[#00D8FF]/20 text-white'
                      : 'bg-[#060B16] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-extrabold text-white mb-1 block">
                    🪄 AI Auto Detect
                  </span>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    Automatically detects brand titles vs full sentence semantics.
                  </p>
                </button>
              </div>
            </div>

            {/* INPUT TEXTAREA CARD */}
            <div className="p-5 rounded-3xl bg-[#0E1628]/80 border border-[#00D8FF]/25 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00D8FF] flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-[#00D8FF]" /> Input Text / Brand Name
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const clipText = await navigator.clipboard.readText();
                        if (clipText) setSourceText(clipText);
                      } catch (e) {
                        console.warn('Clipboard read error:', e);
                      }
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#111C30] border border-[#00D8FF]/30 text-slate-300 hover:text-white hover:border-[#00D8FF] transition-all"
                  >
                    Paste
                  </button>
                  <button
                    onClick={() => setSourceText('')}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#111C30] border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Type or paste brand name, title, or sentence (e.g. Panther Studio, Coffee House, Royal Fashion, Good Morning)..."
                className="w-full p-4 rounded-2xl bg-[#060B16] border border-[#00D8FF]/30 text-white font-medium text-base sm:text-lg focus:outline-none focus:border-[#00D8FF] focus:ring-1 focus:ring-[#00D8FF] transition-all placeholder:text-slate-600 resize-none shadow-inner"
              />

              {/* Character & Word Count */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-[#00D8FF]/15">
                <span>
                  Chars: <strong className="text-white">{sourceText.length}</strong> | Words:{' '}
                  <strong className="text-white">
                    {sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0}
                  </strong>
                </span>

                <div className="flex items-center gap-3">
                  {/* Designer Mode Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={designerMode}
                      onChange={(e) => setDesignerMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 rounded-full bg-slate-800 peer-checked:bg-[#00D8FF] relative transition-colors">
                      <div className="w-3 h-3 rounded-full bg-white absolute top-0.5 left-0.5 peer-checked:translate-x-4 transition-transform" />
                    </div>
                    <span className="text-xs font-bold text-[#00D8FF]">Designer Variations</span>
                  </label>
                </div>
              </div>

              {/* AI QUICK ENHANCEMENT BUTTONS */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  AI Quick Refinements:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_FIXES.map((fix) => (
                    <button
                      key={fix.id}
                      onClick={() => handleConvert(fix.id)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-xl bg-[#111C30] border border-[#00D8FF]/20 text-slate-300 hover:border-[#00D8FF] hover:text-[#00D8FF] transition-all duration-200 flex items-center gap-1"
                    >
                      <span>{fix.icon}</span>
                      <span>{fix.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CONVERT ACTION CTA BUTTON */}
              <button
                onClick={() => handleConvert()}
                disabled={isConverting || !sourceText.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00D8FF] via-[#28B8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-base shadow-2xl shadow-[#00D8FF]/30 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isConverting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Converting Script with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-black" />
                    <span>Convert Script Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: CONVERTED OUTPUT & TYPOGRAPHY PREVIEW */}
          <div className="lg:col-span-7 space-y-6">
            {/* CONVERSION ERROR BANNER */}
            {conversionError && (
              <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-start justify-between gap-3 shadow-xl">
                <span className="leading-relaxed">{conversionError}</span>
                <button
                  onClick={() => setConversionError(null)}
                  className="text-rose-300 hover:text-white font-bold shrink-0"
                >
                  ✕
                </button>
              </div>
            )}

            {/* PRIMARY CONVERTED RESULT CARD */}
            <div className="p-6 rounded-3xl bg-[#0E1628]/90 border border-[#00D8FF]/30 shadow-2xl space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#00D8FF]/20 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#00D8FF]/15 text-[#00D8FF] border border-[#00D8FF]/30 text-xs font-bold uppercase tracking-wider">
                    {currentTargetLangObj.name} Script ({currentTargetLangObj.script})
                  </span>
                  {mode === 'smart-brand' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      ✓ Brand Safe
                    </span>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(activeOutput, 'primary')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111C30] border border-[#00D8FF]/30 text-[#00D8FF] hover:bg-[#00D8FF] hover:text-black transition-all text-xs font-bold"
                  >
                    {copiedId === 'primary' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSpeak(activeOutput)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      isSpeaking
                        ? 'bg-[#00D8FF] text-black border-[#00D8FF] animate-pulse'
                        : 'bg-[#111C30] border-[#00D8FF]/30 text-[#00D8FF] hover:bg-[#00D8FF] hover:text-black'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Speak</span>
                  </button>

                  {/* Export Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111C30] border border-[#00D8FF]/30 text-[#00D8FF] hover:bg-[#00D8FF] hover:text-black transition-all text-xs font-bold">
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 p-2 rounded-2xl bg-[#0E1628] border border-[#00D8FF]/40 shadow-2xl w-40 space-y-1">
                      <button
                        onClick={() => handleDownloadFile('txt')}
                        className="w-full text-left px-3 py-1.5 text-xs rounded-xl hover:bg-[#00D8FF]/15 text-slate-200 hover:text-white"
                      >
                        TXT File (.txt)
                      </button>
                      <button
                        onClick={() => handleDownloadFile('docx')}
                        className="w-full text-left px-3 py-1.5 text-xs rounded-xl hover:bg-[#00D8FF]/15 text-slate-200 hover:text-white"
                      >
                        Word Doc (.doc)
                      </button>
                      <button
                        onClick={() => handleDownloadFile('pdf')}
                        className="w-full text-left px-3 py-1.5 text-xs rounded-xl hover:bg-[#00D8FF]/15 text-slate-200 hover:text-white"
                      >
                        PDF Document (.pdf)
                      </button>
                      <button
                        onClick={() => handleDownloadFile('svg')}
                        className="w-full text-left px-3 py-1.5 text-xs rounded-xl hover:bg-[#00D8FF]/15 text-emerald-400 font-bold"
                      >
                        Vector SVG Text (.svg)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONVERTED TEXT HUGE DISPLAY AREA */}
              <div
                className="p-6 rounded-2xl bg-[#060B16] border border-[#00D8FF]/20 text-center space-y-2 min-h-[140px] flex flex-col justify-center items-center shadow-inner"
                style={{
                  fontFamily: `'${selectedFont}', sans-serif`,
                }}
              >
                <div
                  className="text-3xl sm:text-5xl font-black text-white tracking-wide transition-all leading-relaxed"
                  style={{
                    color: textColor,
                    letterSpacing: `${letterSpacing}px`,
                    fontWeight,
                  }}
                >
                  {activeOutput}
                </div>

                {currentResult?.pronunciationGuide && (
                  <div className="text-xs font-mono text-slate-400 pt-2 flex items-center justify-center gap-1.5">
                    <span className="text-[#00D8FF]">Pronunciation:</span>
                    <span className="text-slate-200 bg-[#0E1628] px-2.5 py-0.5 rounded-full border border-[#00D8FF]/20">
                      "{currentResult.pronunciationGuide}"
                    </span>
                  </div>
                )}
              </div>

              {/* Design Explanation Note */}
              {currentResult?.explanation && (
                <div className="p-3.5 rounded-2xl bg-[#111C30]/80 border border-[#00D8FF]/20 text-xs text-slate-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#00D8FF] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-bold">Designer AI Insight:</strong>
                    <span>{currentResult.explanation}</span>
                  </div>
                </div>
              )}
            </div>

            {/* DESIGNER VARIATIONS GRID */}
            {designerMode && currentResult?.designerVariations && (
              <div className="p-6 rounded-3xl bg-[#0E1628]/80 border border-[#00D8FF]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#00D8FF]" />
                    <h3 className="text-base font-extrabold text-white">
                      Graphic Designer Font-Ready Variations
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">Click to set as primary preview</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(
                    Object.keys(currentResult.designerVariations) as DesignerVariationStyle[]
                  ).map((key) => {
                    const val = currentResult.designerVariations![key];
                    const meta = VARIATION_LABELS[key];
                    if (!val) return null;

                    return (
                      <div
                        key={key}
                        onClick={() => setActiveOutput(val)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                          activeOutput === val
                            ? 'bg-[#00D8FF]/15 border-[#00D8FF] shadow-lg shadow-[#00D8FF]/20'
                            : 'bg-[#060B16] border-[#00D8FF]/15 hover:border-[#00D8FF]/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#00D8FF] flex items-center gap-1">
                              <span>{meta.icon}</span>
                              <span>{meta.label}</span>
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(val, key);
                              }}
                              className="p-1 rounded-lg bg-[#0E1628] border border-[#00D8FF]/20 text-slate-300 hover:text-[#00D8FF]"
                            >
                              {copiedId === key ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div
                            className="text-lg font-bold text-white tracking-wide truncate my-1"
                            style={{ fontFamily: `'${selectedFont}', sans-serif` }}
                          >
                            {val}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{meta.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LIVE FONT & TYPOGRAPHY CANVAS PREVIEW */}
            <div className="p-6 rounded-3xl bg-[#0E1628]/80 border border-[#00D8FF]/20 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#00D8FF]/20 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#00D8FF]" />
                  <h3 className="text-base font-extrabold text-white">
                    Live Typography & Google Web Font Preview
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const cssStr = `font-family: '${selectedFont}', sans-serif;\nfont-size: ${fontSize}px;\nfont-weight: ${fontWeight};\nletter-spacing: ${letterSpacing}px;\ncolor: ${textColor};`;
                      handleCopy(cssStr, 'css-snippet');
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#111C30] border border-[#00D8FF]/30 text-[#00D8FF] hover:bg-[#00D8FF] hover:text-black transition-all"
                  >
                    {copiedId === 'css-snippet' ? 'Copied Font CSS!' : 'Copy Font CSS'}
                  </button>
                </div>
              </div>

              {/* FONT CONTROLS BAR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#060B16] p-4 rounded-2xl border border-[#00D8FF]/15">
                {/* Font Selector */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Native Font
                  </label>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-[#0E1628] border border-[#00D8FF]/30 text-white focus:outline-none focus:border-[#00D8FF]"
                  >
                    {currentTargetLangObj.fontOptions.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size Slider */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min={18}
                    max={80}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-[#00D8FF]"
                  />
                </div>

                {/* Font Weight */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Weight: {fontWeight}
                  </label>
                  <select
                    value={fontWeight}
                    onChange={(e) => setFontWeight(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl bg-[#0E1628] border border-[#00D8FF]/30 text-white focus:outline-none focus:border-[#00D8FF]"
                  >
                    <option value={400}>400 Regular</option>
                    <option value={500}>500 Medium</option>
                    <option value={600}>600 SemiBold</option>
                    <option value={700}>700 Bold</option>
                    <option value={800}>800 ExtraBold</option>
                    <option value={900}>900 Black</option>
                  </select>
                </div>

                {/* Text Color Picker */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl bg-[#0E1628] border border-[#00D8FF]/30 text-white uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* LIVE CANVAS MOCKUP DISPLAY */}
              <div
                className="p-10 rounded-2xl border border-[#00D8FF]/30 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl transition-all min-h-[200px]"
                style={{
                  backgroundColor: previewBgColor,
                  fontFamily: `'${selectedFont}', sans-serif`,
                }}
              >
                <div
                  style={{
                    fontSize: `${fontSize}px`,
                    fontWeight,
                    color: textColor,
                    letterSpacing: `${letterSpacing}px`,
                  }}
                  className="leading-tight transition-all"
                >
                  {activeOutput}
                </div>
                <div className="text-[10px] text-slate-400 font-sans tracking-widest uppercase">
                  Google Font: {selectedFont} | Script: {currentTargetLangObj.script}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl p-6 rounded-3xl bg-[#0E1628] border border-[#00D8FF]/40 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#00D8FF]/20 pb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#00D8FF]" />
                <h3 className="text-lg font-bold text-white">Conversion History</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-3 py-1 rounded-xl bg-[#111C30] text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060B16] border border-[#00D8FF]/30 text-white"
                />
              </div>

              <button
                onClick={() => setFavoriteOnly(!favoriteOnly)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border ${
                  favoriteOnly
                    ? 'bg-[#00D8FF] text-black border-[#00D8FF]'
                    : 'bg-[#111C30] text-slate-300 border-[#00D8FF]/30'
                }`}
              >
                ★ Favorites Only
              </button>

              <button
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('panther_script_history');
                }}
                className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                title="Clear History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No conversion history stored yet.
                </div>
              ) : (
                history
                  .filter((item) => (!favoriteOnly || item.isFavorite) &&
                    (item.sourceText.toLowerCase().includes(historySearch.toLowerCase()) ||
                     item.primaryOutput.toLowerCase().includes(historySearch.toLowerCase())))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#060B16] border border-[#00D8FF]/20 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#00D8FF]">{item.sourceText}</span>
                          <span className="text-[10px] text-slate-500">→</span>
                          <span className="text-xs font-bold text-white">{item.primaryOutput}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>Target: {item.targetLang?.toUpperCase() || 'EN'}</span>
                          <span>•</span>
                          <span>Mode: {item.mode}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className={`p-1.5 rounded-lg border ${
                            item.isFavorite
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-[#0E1628] text-slate-400 border-slate-700'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <button
                          onClick={() => {
                            setSourceText(item.sourceText);
                            setTargetLang(item.targetLang);
                            setActiveOutput(item.primaryOutput);
                            setShowHistoryModal(false);
                          }}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#00D8FF] text-black"
                        >
                          Reload
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

export default ScriptStudio;
