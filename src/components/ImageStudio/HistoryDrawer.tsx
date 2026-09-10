import React, { useState } from 'react';
import { ImagePromptHistory } from '../../types';
import { History, Search, Trash2, X, RefreshCw, Sparkles, Clock, Calendar } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ImagePromptHistory[];
  onSelectHistoryItem: (item: ImagePromptHistory) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filtered = history.filter(
    (h) =>
      h.originalPrompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.stylePreset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-fade-in">
      <div className="bg-[#0E1628] border-l border-[#00D8FF]/30 max-w-md w-full h-full p-6 space-y-6 flex flex-col justify-between shadow-2xl relative text-[#C9D4E5]">
        {/* Drawer Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#00D8FF]/15">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Generation History</h3>
                <p className="text-xs text-[#C9D4E5]/70">{history.length} Saved Generations</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search history by prompt or style..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#060B16] border border-[#00D8FF]/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D8FF]"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 space-y-3 text-slate-500">
              <Clock className="w-8 h-8 mx-auto opacity-40 text-[#00D8FF]" />
              <p className="text-xs">No generation history matching "{searchTerm}"</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="group p-3.5 rounded-2xl bg-[#111C30] border border-[#00D8FF]/15 hover:border-[#00D8FF]/50 cursor-pointer transition-all space-y-2 hover:bg-[#111C30]/80"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded-full bg-[#00D8FF]/10 text-[#5FFFF7] font-bold uppercase">
                    {item.stylePreset}
                  </span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <p className="text-xs text-[#C9D4E5] font-medium line-clamp-2 group-hover:text-[#00D8FF] transition-colors">
                  "{item.originalPrompt}"
                </p>

                {/* Thumbnails */}
                {item.images && item.images.length > 0 && (
                  <div className="flex gap-1.5 pt-1 overflow-x-auto">
                    {item.images.slice(0, 4).map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt="thumb"
                        className="w-10 h-10 object-cover rounded-lg border border-[#00D8FF]/20"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {history.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={onClearHistory}
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
