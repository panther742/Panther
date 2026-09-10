import React, { useState, useEffect, useMemo } from 'react';
import { TypographyCategory, TypographyDesign } from '../../types';
import { TYPOGRAPHY_CATEGORIES, generateTypographyDesigns } from '../../utils/typographyPresets';
import { TypographyCard } from './TypographyCard';
import { TypographyLiveEditor } from './TypographyLiveEditor';
import { TypographyExportModal } from './TypographyExportModal';
import {
  Type,
  Search,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Heart,
  Grid,
  Zap,
} from 'lucide-react';

export const TypographyGenerator: React.FC = () => {
  const [inputText, setInputText] = useState<string>('Panther Studio');
  const [targetCount, setTargetCount] = useState<number>(50);
  const [selectedCategory, setSelectedCategory] = useState<TypographyCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  // Active Modals
  const [editingDesign, setEditingDesign] = useState<TypographyDesign | null>(null);
  const [downloadingDesign, setDownloadingDesign] = useState<TypographyDesign | null>(null);

  // Generate Typography Designs based on text, target count, category, search
  const generatedDesigns = useMemo(() => {
    return generateTypographyDesigns(inputText, targetCount, selectedCategory, searchQuery);
  }, [inputText, targetCount, selectedCategory, searchQuery]);

  // Filtered designs including favorites toggle
  const displayedDesigns = useMemo(() => {
    if (showOnlyFavorites) {
      return generatedDesigns.filter((d) => favorites.has(d.id));
    }
    return generatedDesigns;
  }, [generatedDesigns, showOnlyFavorites, favorites]);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSaveEditedDesign = (updatedDesign: TypographyDesign) => {
    // Override the design in active memory
    setEditingDesign(null);
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#C9D4E5]">
      {/* TOOL HERO HEADER */}
      <div className="p-6 sm:p-8 rounded-[18px] bg-gradient-to-r from-[#0E1628] via-[#111C30] to-[#0E1628] border border-[#00D8FF]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D8FF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-[#00D8FF]/15 border border-[#00D8FF]/40 text-[#00D8FF] shadow-lg shadow-[#00D8FF]/20">
                <Type className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Panther Typography Generator
                  </h1>
                  <span className="px-3 py-1 text-[10px] font-extrabold tracking-widest bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black rounded-full uppercase shadow-md shadow-[#00D8FF]/20">
                    AI DESIGN ENGINE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#C9D4E5]/80 mt-1 font-medium">
                  Enter any text to generate hundreds of premium, ready-to-use typography logo &
                  poster styles with distinct layouts, compositions, and color palettes.
                </p>
              </div>
            </div>

            {/* GENERATION COUNT SELECTOR */}
            <div className="flex items-center gap-2 bg-[#060B16] p-1.5 rounded-2xl border border-[#00D8FF]/30">
              <span className="text-[10px] font-mono font-bold text-[#00D8FF] px-2 uppercase">
                Count:
              </span>
              {[50, 100, 200].map((count) => (
                <button
                  key={count}
                  onClick={() => setTargetCount(count)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    targetCount === count
                      ? 'bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black shadow-md shadow-[#00D8FF]/30'
                      : 'text-[#C9D4E5]/70 hover:text-white'
                  }`}
                  id={`count-btn-${count}`}
                >
                  {count} Styles
                </button>
              ))}
            </div>
          </div>

          {/* INPUT BAR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#00D8FF] block mb-1.5">
                Type Your Text (Updates Instantly)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your text... (e.g. Panther Studio, Coffee House, Royal Fashion)"
                  className="w-full px-4 py-3.5 pl-11 rounded-xl bg-[#060B16] border-2 border-[#00D8FF]/40 text-white font-bold text-base placeholder-[#C9D4E5]/40 focus:outline-none focus:border-[#00D8FF] focus:ring-2 focus:ring-[#00D8FF]/20 transition-all shadow-inner"
                  id="typography-text-input"
                />
                <Type className="w-5 h-5 text-[#00D8FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#00D8FF] block mb-1.5">
                Search Styles & Keywords
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Luxury, Gaming, Minimal, Wedding..."
                  className="w-full px-4 py-3.5 pl-10 rounded-xl bg-[#060B16] border border-[#00D8FF]/30 text-white text-xs placeholder-[#C9D4E5]/40 focus:outline-none focus:border-[#00D8FF] transition-all"
                  id="typography-search-input"
                />
                <Search className="w-4 h-4 text-[#C9D4E5]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* STYLE CATEGORY PILLS BAR */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] uppercase font-mono font-bold text-[#00D8FF] tracking-wider">
                Style Categories ({TYPOGRAPHY_CATEGORIES.length - 1})
              </span>
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  showOnlyFavorites
                    ? 'bg-[#FF0055]/20 border-[#FF0055] text-[#FF0055]'
                    : 'bg-[#060B16] border-[#00D8FF]/20 text-[#C9D4E5]/80 hover:text-white'
                }`}
                id="favorites-filter-toggle"
              >
                <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-[#FF0055]' : ''}`} />
                <span>Favorites ({favorites.size})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#00D8FF]/20">
              {TYPOGRAPHY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? 'bg-[#00D8FF] text-black border-[#00D8FF] shadow-md shadow-[#00D8FF]/20'
                      : 'bg-[#060B16] text-[#C9D4E5]/80 border-[#00D8FF]/20 hover:border-[#00D8FF]/50 hover:text-white'
                  }`}
                  id={`cat-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS BAR */}
      <div className="flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-2 text-[#C9D4E5]/80">
          <Zap className="w-4 h-4 text-[#00D8FF]" />
          <span>
            Generated <strong className="text-white font-bold">{displayedDesigns.length}</strong>{' '}
            unique typography compositions for "{inputText}"
          </span>
        </div>

        <span className="text-[11px] font-mono text-[#5FFFF7] hidden sm:inline">
          Category: <strong className="text-white">{selectedCategory}</strong>
        </span>
      </div>

      {/* GENERATED DESIGNS GRID */}
      {displayedDesigns.length === 0 ? (
        <div className="p-12 text-center rounded-[18px] bg-[#111C30]/50 border border-[#00D8FF]/20 space-y-3">
          <Sparkles className="w-8 h-8 text-[#00D8FF] mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-white">No Typography Designs Found</h3>
          <p className="text-xs text-[#C9D4E5]/70 max-w-md mx-auto">
            Try adjusting your search query or selecting "All" categories to view generated
            styles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedDesigns.map((design) => (
            <TypographyCard
              key={design.id}
              design={design}
              userText={inputText}
              onEdit={(d) => setEditingDesign(d)}
              onDownload={(d) => setDownloadingDesign(d)}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.has(design.id)}
            />
          ))}
        </div>
      )}

      {/* LIVE EDITOR MODAL */}
      {editingDesign && (
        <TypographyLiveEditor
          design={editingDesign}
          userText={inputText}
          onSave={handleSaveEditedDesign}
          onClose={() => setEditingDesign(null)}
        />
      )}

      {/* EXPORT MODAL */}
      {downloadingDesign && (
        <TypographyExportModal
          design={downloadingDesign}
          userText={inputText}
          onClose={() => setDownloadingDesign(null)}
        />
      )}
    </div>
  );
};
