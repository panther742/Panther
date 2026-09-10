import React, { useState, useEffect } from 'react';
import { ProviderConfig, UserApiKeys } from '../../types';
import { ShieldCheck, Cpu, Key, CheckCircle2, AlertCircle, X, ExternalLink, Sparkles, Save, Check } from 'lucide-react';

interface ProviderSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProviderConfig | null;
  onRefreshConfig: () => void;
  userKeys?: UserApiKeys;
  onSaveKeys?: (keys: UserApiKeys) => void;
}

export const ProviderSetupModal: React.FC<ProviderSetupModalProps> = ({
  isOpen,
  onClose,
  config,
  onRefreshConfig,
  userKeys,
  onSaveKeys,
}) => {
  const [keys, setKeys] = useState<UserApiKeys>(userKeys || {});
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (userKeys) {
      setKeys(userKeys);
    }
  }, [userKeys]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      localStorage.setItem('panther_user_api_keys', JSON.stringify(keys));
      if (onSaveKeys) onSaveKeys(keys);
      if (onRefreshConfig) onRefreshConfig();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to save API keys:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-[#0E1628] border border-[#00D8FF]/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#C9D4E5] my-8">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D8FF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#00D8FF]/15">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Media Studio Provider Settings</h3>
              <p className="text-xs text-slate-400">Configure AI provider adapters for Image, GIF, and Video generation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Card */}
        <div className={`p-4 rounded-2xl border ${config?.isKeyConfigured ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-amber-950/30 border-amber-500/40'} space-y-2`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300">Provider Status</span>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1 ${config?.isKeyConfigured ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
              {config?.isKeyConfigured ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{config?.isKeyConfigured ? 'Ready to Generate' : 'No API Key Connected'}</span>
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {config?.isKeyConfigured
              ? `Connected active provider: ${config.activeProvider}. Real AI images will be returned from configured models.`
              : 'Please enter at least one API key below (Google Gemini/Imagen, OpenAI, Stability AI, Replicate, or Hugging Face) to enable real AI image generation.'}
          </p>
        </div>

        {/* API Key Form */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#00D8FF] flex items-center gap-1.5">
            <Key className="w-4 h-4" />
            <span>Connect API Keys (Stored Securely)</span>
          </h4>

          <div className="space-y-3 text-xs">
            {/* Google Gemini / Imagen */}
            <div className="p-3.5 rounded-2xl bg-[#111C30] border border-[#00D8FF]/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <span>Google Gemini / Imagen Key</span>
                  <span className="text-[10px] font-mono text-slate-400">(GEMINI_API_KEY)</span>
                </label>
                {config?.hasGeminiKey && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              <input
                type="password"
                value={keys.geminiKey || ''}
                onChange={(e) => setKeys({ ...keys, geminiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full p-2.5 rounded-xl bg-[#060B16] border border-[#00D8FF]/15 focus:border-[#00D8FF] text-white font-mono text-xs focus:outline-none"
              />
            </div>

            {/* OpenAI */}
            <div className="p-3.5 rounded-2xl bg-[#111C30] border border-[#00D8FF]/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <span>OpenAI API Key (DALL-E 3)</span>
                  <span className="text-[10px] font-mono text-slate-400">(OPENAI_API_KEY)</span>
                </label>
                {config?.hasOpenAIKey && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              <input
                type="password"
                value={keys.openaiKey || ''}
                onChange={(e) => setKeys({ ...keys, openaiKey: e.target.value })}
                placeholder="sk-proj-..."
                className="w-full p-2.5 rounded-xl bg-[#060B16] border border-[#00D8FF]/15 focus:border-[#00D8FF] text-white font-mono text-xs focus:outline-none"
              />
            </div>

            {/* Stability AI */}
            <div className="p-3.5 rounded-2xl bg-[#111C30] border border-[#00D8FF]/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <span>Stability AI Key (Stable Diffusion)</span>
                  <span className="text-[10px] font-mono text-slate-400">(STABILITY_API_KEY)</span>
                </label>
                {config?.hasStabilityKey && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              <input
                type="password"
                value={keys.stabilityKey || ''}
                onChange={(e) => setKeys({ ...keys, stabilityKey: e.target.value })}
                placeholder="sk-..."
                className="w-full p-2.5 rounded-xl bg-[#060B16] border border-[#00D8FF]/15 focus:border-[#00D8FF] text-white font-mono text-xs focus:outline-none"
              />
            </div>

            {/* Replicate */}
            <div className="p-3.5 rounded-2xl bg-[#111C30] border border-[#00D8FF]/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <span>Replicate API Key (FLUX / SDXL)</span>
                  <span className="text-[10px] font-mono text-slate-400">(REPLICATE_API_KEY)</span>
                </label>
                {config?.hasReplicateKey && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              <input
                type="password"
                value={keys.replicateKey || ''}
                onChange={(e) => setKeys({ ...keys, replicateKey: e.target.value })}
                placeholder="r8_..."
                className="w-full p-2.5 rounded-xl bg-[#060B16] border border-[#00D8FF]/15 focus:border-[#00D8FF] text-white font-mono text-xs focus:outline-none"
              />
            </div>

            {/* Hugging Face */}
            <div className="p-3.5 rounded-2xl bg-[#111C30] border border-[#00D8FF]/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <span>Hugging Face Token</span>
                  <span className="text-[10px] font-mono text-slate-400">(HUGGINGFACE_API_KEY)</span>
                </label>
                {config?.hasHuggingFaceKey && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              <input
                type="password"
                value={keys.huggingfaceKey || ''}
                onChange={(e) => setKeys({ ...keys, huggingfaceKey: e.target.value })}
                placeholder="hf_..."
                className="w-full p-2.5 rounded-xl bg-[#060B16] border border-[#00D8FF]/15 focus:border-[#00D8FF] text-white font-mono text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#00D8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Keys Saved & Connected!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-black" />
                <span>Save API Keys</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
