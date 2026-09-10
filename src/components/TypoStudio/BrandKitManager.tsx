import React, { useState, useEffect } from 'react';
import { TypographyPairing } from '../../types';
import { Bookmark, History, Trash2, Check, Sparkles, FolderPlus } from 'lucide-react';

interface BrandKitManagerProps {
  currentPairing: TypographyPairing;
  onLoadPairing: (pairing: TypographyPairing) => void;
}

export const BrandKitManager: React.FC<BrandKitManagerProps> = ({ currentPairing, onLoadPairing }) => {
  const [favorites, setFavorites] = useState<TypographyPairing[]>([]);
  const [history, setHistory] = useState<TypographyPairing[]>([]);
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');
  const [isSaved, setIsSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('panther_typo_favs');
      const savedHist = localStorage.getItem('panther_typo_hist');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      if (savedHist) setHistory(JSON.parse(savedHist));
    } catch (e) {
      console.warn('Failed loading typography storage', e);
    }
  }, []);

  // Sync favorites & history
  const saveToFavorites = () => {
    const exists = favorites.some((f) => f.id === currentPairing.id);
    let updated: TypographyPairing[];

    if (exists) {
      updated = favorites.filter((f) => f.id !== currentPairing.id);
      setIsSaved(false);
    } else {
      updated = [{ ...currentPairing, isFavorite: true, createdAt: Date.now() }, ...favorites];
      setIsSaved(true);
    }

    setFavorites(updated);
    localStorage.setItem('panther_typo_favs', JSON.stringify(updated));
  };

  const removeFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('panther_typo_favs', JSON.stringify(updated));
  };

  return (
    <div className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#D4AF37]" />
            <span>Brand Kits & Favorites</span>
          </h3>
          <p className="text-xs text-slate-400">Save custom font combinations to local brand storage</p>
        </div>

        <button
          onClick={saveToFavorites}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow ${
            isSaved
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-gradient-to-r from-[#D4AF37] to-[#9C7A1C] text-black hover:opacity-95'
          }`}
        >
          {isSaved ? <Check className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
          <span>{isSaved ? 'Saved to Brand Kits' : 'Save Current Brand Kit'}</span>
        </button>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-4 text-xs font-bold border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-1.5 pb-2 transition-colors ${
            activeTab === 'favorites' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Favorites ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 pb-2 transition-colors ${
            activeTab === 'history' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Recent History ({history.length})</span>
        </button>
      </div>

      {/* ITEMS LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTab === 'favorites' &&
          favorites.map((item) => (
            <div
              key={item.id}
              onClick={() => onLoadPairing(item)}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] font-mono">
                  {item.style}
                </span>
                <button
                  onClick={(e) => removeFavorite(item.id, e)}
                  className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-400 truncate mt-1">
                  H: {item.roles.heading?.fontFamily} • B: {item.roles.body?.fontFamily}
                </p>
              </div>
            </div>
          ))}

        {activeTab === 'favorites' && favorites.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500 text-xs space-y-2">
            <Sparkles className="w-6 h-6 text-[#D4AF37] mx-auto opacity-50" />
            <p>No saved brand kits yet. Click "Save Current Brand Kit" above to store your pairing!</p>
          </div>
        )}

        {activeTab === 'history' &&
          history.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onLoadPairing(item)}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer space-y-2 group"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {item.style}
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                {item.name}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                {item.roles.heading?.fontFamily} / {item.roles.body?.fontFamily}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};
