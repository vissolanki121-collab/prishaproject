import React from 'react';
import { PresetItem } from '../types';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

interface PresetsSelectorProps {
  presets: PresetItem[];
  selectedPresetId?: string;
  onSelectPreset: (preset: PresetItem) => void;
  isLoading: boolean;
}

export const PresetsSelector: React.FC<PresetsSelectorProps> = ({
  presets,
  selectedPresetId,
  onSelectPreset,
  isLoading
}) => {
  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Instant Demonstration Presets
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                Click to load & analyze
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Select curated sentence pairs to explore semantic distance, tokenization nuances, and high-dimensional clustering.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {presets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              disabled={isLoading}
              className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between group ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 shadow-glow-blue'
                  : 'bg-navy-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div>
                <span className="text-[11px] font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1 block mb-1">
                  {preset.title.split('(')[0]}
                </span>
                <span className="text-[10px] text-slate-400 line-clamp-2 block mb-2 leading-relaxed">
                  "{preset.sentence1}"
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-mono text-cyan-400">
                <span>Word: "{preset.searchTerm}"</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
