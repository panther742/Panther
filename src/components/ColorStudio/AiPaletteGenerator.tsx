import React, { useState } from 'react';
import { ColorItem } from '../../types';
import { hexToColorItem } from '../../utils/colorUtils';
import { synthesizeLocalPalette } from '../../utils/localPaletteGenerator';
import { apiClient } from '../../lib/apiClient';
import { Sparkles, Wand2, Loader2, ArrowRight } from 'lucide-react';

interface AiPaletteGeneratorProps {
  onApplyGeneratedColors: (colors: ColorItem[]) => void;
}

export const AiPaletteGenerator: React.FC<AiPaletteGeneratorProps> = ({
  onApplyGeneratedColors,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const samplePrompts = [
    'Cyberpunk rainy Tokyo street',
    'Warm autumn sunset in Kyoto',
    'Luxury velvet and brushed gold',
    'Nordic minimalist spa lounge',
    'Neon arcade 80s synthwave',
  ];

  const handleGenerate = async (queryPrompt?: string) => {
    const textToUse = queryPrompt || prompt;
    if (!textToUse.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiClient.fetchWithCache<{ success: boolean; data: any }>(
        '/api/colors/ai-generate',
        {
          method: 'POST',
          body: JSON.stringify({ prompt: textToUse }),
        },
        10 * 60 * 1000,
        1,
        90000
      );

      if (!data.success) {
        throw new Error('Failed to generate palette');
      }

      if (Array.isArray(data.data?.colors) && data.data.colors.length > 0) {
        const colorItems = data.data.colors.map((hex: string) => hexToColorItem(hex));
        onApplyGeneratedColors(colorItems);
      }
    } catch (err: any) {
      console.warn('AI Palette request failed — using built-in local synthesizer:', err?.message || err);
      // Standalone / offline mode: synthesize a professional palette locally
      // instead of showing a dead-end error.
      try {
        const local = synthesizeLocalPalette(textToUse, 'balanced');
        onApplyGeneratedColors(local.colors.map((hex: string) => hexToColorItem(hex)));
        setErrorMessage(null);
      } catch {
        setErrorMessage(err.message || 'Could not connect to AI palette generator');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0E1628] via-[#111C30] to-[#0E1628] border border-[#00D8FF]/30 shadow-2xl space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-[#00D8FF] text-black shadow-lg shadow-[#00D8FF]/20">
          <Wand2 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Gemini AI Palette Synthesizer</span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#00D8FF]/20 text-[#00D8FF] rounded-full border border-[#00D8FF]/30">
              Gemini 2.5 Flash
            </span>
          </h3>
          <p className="text-xs text-[#C9D4E5]/80">
            Type any mood, aesthetic concept, or photo prompt to synthesize a custom 5-color palette.
          </p>
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerate();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Cyberpunk rainy Tokyo alley, Tuscan olive grove, Minimalist luxury interior..."
            className="w-full px-4 py-3 text-xs bg-[#060B16] border border-[#00D8FF]/30 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00D8FF] font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00D8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-xs shadow-lg shadow-[#00D8FF]/20 flex items-center gap-2 disabled:opacity-50 transition-all shrink-0"
          id="generate-ai-palette-submit-button"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Synthesize</span>
        </button>
      </form>

      {/* Quick Prompts */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-bold text-slate-400">Try Prompts:</span>
        {samplePrompts.map((sp) => (
          <button
            key={sp}
            type="button"
            onClick={() => {
              setPrompt(sp);
              handleGenerate(sp);
            }}
            className="px-2.5 py-1 text-[11px] font-semibold bg-[#060B16] hover:bg-[#00D8FF]/10 border border-[#00D8FF]/20 hover:border-[#00D8FF]/50 text-[#C9D4E5] rounded-lg transition-colors"
          >
            {sp}
          </button>
        ))}
      </div>

      {errorMessage && (
        <p className="text-xs text-red-400 font-mono bg-red-950/60 p-2 rounded-xl border border-red-800/40">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
