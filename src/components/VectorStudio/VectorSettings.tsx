import React from 'react';
import { VectorSettings } from '../../types';
import { Sliders, Sparkles, RefreshCw, Scissors, Palette } from 'lucide-react';

interface VectorSettingsProps {
  settings: VectorSettings;
  onChangeSettings: (newSettings: VectorSettings) => void;
  onReProcess: () => void;
  isProcessing: boolean;
}

export const VectorSettingsPanel: React.FC<VectorSettingsProps> = ({
  settings,
  onChangeSettings,
  onReProcess,
  isProcessing,
}) => {
  const updateSetting = <K extends keyof VectorSettings>(key: K, value: VectorSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onChangeSettings(updated);
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/40">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Advanced Curve & Vector Controls</h3>
            <p className="text-xs text-slate-400">Fine-tune edge detection, curve smoothness, and node optimization.</p>
          </div>
        </div>

        <button
          onClick={onReProcess}
          disabled={isProcessing}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 flex items-center gap-2 transition-all disabled:opacity-50"
          id="reprocess-vector-button"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>Re-Trace Vector</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color Mode & Background Removal */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Vector Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSetting('colorMode', 'bw')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  settings.colorMode === 'bw'
                    ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>Black & White</span>
              </button>
              <button
                onClick={() => updateSetting('colorMode', 'color')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  settings.colorMode === 'color'
                    ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>Multi-Color</span>
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="text-xs font-semibold text-slate-200">Remove Background</span>
              <input
                type="checkbox"
                checked={settings.removeBackground}
                onChange={(e) => updateSetting('removeBackground', e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="text-xs font-semibold text-slate-200">Transparent Background</span>
              <input
                type="checkbox"
                checked={settings.transparentBg}
                onChange={(e) => updateSetting('transparentBg', e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {/* Threshold */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Threshold Sensitivity</span>
              <span className="font-mono text-purple-400 font-bold">{settings.threshold}</span>
            </div>
            <input
              type="range"
              min={10}
              max={240}
              value={settings.threshold}
              onChange={(e) => updateSetting('threshold', Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Smoothness / Curve Tightness */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Smoothness & Curves</span>
              <span className="font-mono text-purple-400 font-bold">{settings.smoothness}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              value={settings.smoothness}
              onChange={(e) => updateSetting('smoothness', Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Node Reduction */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Node Reduction & Optimization</span>
              <span className="font-mono text-purple-400 font-bold">{settings.nodeReduction}</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={settings.nodeReduction}
              onChange={(e) => updateSetting('nodeReduction', Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Posterize Color Count */}
          {settings.colorMode === 'color' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Color Layer Separation</span>
                <span className="font-mono text-purple-400 font-bold">{settings.posterizeColors} Colors</span>
              </div>
              <input
                type="range"
                min={2}
                max={16}
                value={settings.posterizeColors}
                onChange={(e) => updateSetting('posterizeColors', Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
