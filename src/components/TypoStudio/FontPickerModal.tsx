import React, { useState, useEffect, useMemo } from 'react';
import { GoogleFont, FontCategory, FontRole } from '../../types';

// UI filter categories in the picker (superset of raw Google Font categories)
type FontPickerCategory =
  | FontCategory
  | 'modern'
  | 'luxury'
  | 'minimal'
  | 'corporate'
  | 'creative'
  | 'technology'
  | 'gaming'
  | 'fashion'
  | 'editorial'
  | 'magazine'
  | 'wedding'
  | 'restaurant';
import { POPULAR_GOOGLE_FONTS, loadGoogleFont } from '../../utils/fontUtils';
import { Search, X, Check, Type, Sparkles } from 'lucide-react';

interface FontPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: FontRole;
  currentFont: string;
  onSelectFont: (fontFamily: string) => void;
}

export const FontPickerModal: React.FC<FontPickerModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  currentFont,
  onSelectFont,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FontPickerCategory>('all');
  const [customPreviewText, setCustomPreviewText] = useState('Panther Typography');
  const [previewSize, setPreviewSize] = useState<number>(24);

  // Category mapping helper
  const categoryMap: Record<string, string[]> = {
    luxury: ['serif', 'script'],
    modern: ['sans-serif', 'display'],
    minimal: ['sans-serif', 'monospace'],
    corporate: ['serif', 'sans-serif'],
    creative: ['display', 'script', 'handwriting'],
    technology: ['sans-serif', 'monospace'],
    gaming: ['display', 'monospace'],
    fashion: ['serif', 'display'],
    editorial: ['serif', 'display'],
    magazine: ['serif', 'sans-serif'],
    wedding: ['script', 'handwriting', 'serif'],
    restaurant: ['serif', 'script', 'display'],
  };

  // Load fonts when rendering results
  const filteredFonts = useMemo(() => {
    return POPULAR_GOOGLE_FONTS.filter((font) => {
      const matchesSearch = font.family.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCategory = false;
      if (selectedCategory === 'all') {
        matchesCategory = true;
      } else if (categoryMap[selectedCategory]) {
        matchesCategory = categoryMap[selectedCategory].includes(font.category);
      } else {
        matchesCategory = font.category === selectedCategory;
      }

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Load fonts dynamically as user scrolls/views
  useEffect(() => {
    if (isOpen) {
      filteredFonts.slice(0, 30).forEach((f) => loadGoogleFont(f.family));
    }
  }, [isOpen, filteredFonts]);

  if (!isOpen) return null;

  const categories: { id: FontPickerCategory; label: string }[] = [
    { id: 'all', label: 'All Fonts' },
    { id: 'serif', label: 'Serif' },
    { id: 'sans-serif', label: 'Sans Serif' },
    { id: 'display', label: 'Display' },
    { id: 'script', label: 'Script' },
    { id: 'handwriting', label: 'Handwriting' },
    { id: 'monospace', label: 'Monospace' },
    { id: 'modern', label: 'Modern' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'corporate', label: 'Corporate' },
    { id: 'creative', label: 'Creative' },
    { id: 'technology', label: 'Technology' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'editorial', label: 'Editorial' },
    { id: 'magazine', label: 'Magazine' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'restaurant', label: 'Restaurant' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0D0D12] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Select Font for <span className="capitalize text-[#D4AF37]">{targetRole}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Search & preview 1500+ Google Fonts in real time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="p-6 border-b border-white/10 space-y-4 bg-black/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search font family name (e.g. Playfair, Inter, Cinzel)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Custom Preview Text */}
            <div>
              <input
                type="text"
                value={customPreviewText}
                onChange={(e) => setCustomPreviewText(e.target.value)}
                placeholder="Custom sample text..."
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#D4AF37] text-black shadow-md font-bold'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FONT LIST GRID */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2">
            <span>Showing {filteredFonts.length} Google Fonts</span>
            <span>Click any font to select</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredFonts.map((font) => {
              const isSelected = font.family.toLowerCase() === currentFont.toLowerCase();
              return (
                <div
                  key={font.family}
                  onClick={() => {
                    loadGoogleFont(font.family);
                    onSelectFont(font.family);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                    isSelected
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                      : 'bg-white/[0.02] border-white/10 hover:border-[#D4AF37]/50 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                        {font.family}
                      </h4>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        {font.category}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="p-1 rounded-full bg-[#D4AF37] text-black">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Sample Text Render */}
                  <p
                    className="text-slate-200 truncate py-1"
                    style={{
                      fontFamily: `'${font.family}', sans-serif`,
                      fontSize: `${previewSize}px`,
                    }}
                  >
                    {customPreviewText || font.family}
                  </p>
                </div>
              );
            })}
          </div>

          {filteredFonts.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto opacity-50" />
              <p className="text-sm">No fonts found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
