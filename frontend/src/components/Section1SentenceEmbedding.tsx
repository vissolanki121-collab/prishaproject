import React from 'react';
import { SentenceEmbedResponse } from '../types';
import {
  Sparkles,
  Cpu,
  Layers,
  Eye,
  Info,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface Section1Props {
  sentence1: string;
  setSentence1: (val: string) => void;
  onGenerateEmbedding: () => void;
  isLoading: boolean;
  data: SentenceEmbedResponse | null;
  onOpenInspector: () => void;
}

export const Section1SentenceEmbedding: React.FC<Section1Props> = ({
  sentence1,
  setSentence1,
  onGenerateEmbedding,
  isLoading,
  data,
  onOpenInspector
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data.embedding));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="section-1" className="scroll-mt-20 mb-12">
      <div className="glass-panel glass-panel-glow-blue rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 font-extrabold text-base">
              01
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                  Sentence Embedding Generator
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Sentence 1
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Convert natural language into a dense, continuous mathematical vector representation using the pretrained <code className="text-blue-300 font-mono">all-MiniLM-L6-v2</code> transformer.
              </p>
            </div>
          </div>

          {/* Model Dimension Pill */}
          <div className="flex items-center gap-2 bg-navy-900/90 border border-blue-500/30 px-3.5 py-2 rounded-xl text-xs font-mono self-start sm:self-auto">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300">Dimensions:</span>
            <span className="font-bold text-blue-400">384 Values (Float32)</span>
          </div>
        </div>

        {/* Input Text Area */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Enter First Sentence:
            </label>
            <div className="relative">
              <textarea
                value={sentence1}
                onChange={(e) => setSentence1(e.target.value)}
                placeholder="e.g. The quick brown fox jumps over the lazy dog."
                rows={3}
                className="w-full glass-input rounded-2xl p-4 text-slate-100 placeholder-slate-500 text-sm sm:text-base resize-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute bottom-3 right-3 text-xs font-mono text-slate-400">
                {sentence1.length} chars
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>
                Computed via PyTorch transformer inference on CPU. Normalized with <code className="text-slate-300 font-mono">L2 Norm = 1.0</code>.
              </span>
            </div>

            <button
              onClick={onGenerateEmbedding}
              disabled={isLoading || !sentence1.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing Neural Embedding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Generate Embedding</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Display Container */}
        {data && (
          <div className="mt-7 pt-6 border-t border-slate-800/80 animate-fade-in space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Real Numerical Embedding Vector (384 Dimensions)
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-xs font-mono rounded-lg bg-navy-900 border border-slate-700 hover:border-slate-600 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied 384 Values' : 'Copy Vector JSON'}</span>
                </button>

                <button
                  onClick={onOpenInspector}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Inspect All 384 Dimensions</span>
                </button>
              </div>
            </div>

            {/* Vector Stats Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-navy-900/80 rounded-xl p-3 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Vector Length</span>
                <span className="text-sm font-bold text-blue-400 font-mono">{data.dimensions} dims</span>
              </div>
              <div className="bg-navy-900/80 rounded-xl p-3 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">L2 Norm (Unit)</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{data.stats.l2_norm.toFixed(4)}</span>
              </div>
              <div className="bg-navy-900/80 rounded-xl p-3 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Mean Value</span>
                <span className="text-sm font-bold text-slate-200 font-mono">{data.stats.mean_val.toFixed(4)}</span>
              </div>
              <div className="bg-navy-900/80 rounded-xl p-3 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Min Value</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">{data.stats.min_val.toFixed(4)}</span>
              </div>
              <div className="bg-navy-900/80 rounded-xl p-3 border border-slate-800 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Max Value</span>
                <span className="text-sm font-bold text-indigo-400 font-mono">{data.stats.max_val.toFixed(4)}</span>
              </div>
            </div>

            {/* Formatted Vector Array Preview Box */}
            <div className="bg-navy-950/90 rounded-2xl p-4 border border-slate-800/90 font-mono text-xs overflow-x-auto">
              <div className="text-slate-400 mb-2 flex items-center justify-between">
                <span>Vector Array Preview [0 ... 383]:</span>
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  dense float array
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px] leading-relaxed max-h-36 overflow-y-auto p-1 text-slate-300">
                {data.embedding.slice(0, 32).map((val, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-blue-200 hover:border-blue-500/50 hover:bg-blue-900/30 transition-colors"
                    title={`Index ${idx}: ${val}`}
                  >
                    <span className="text-slate-500 text-[9px] mr-1">#{idx}</span>
                    {val > 0 ? `+${val.toFixed(4)}` : val.toFixed(4)}
                  </span>
                ))}
                <span className="px-2 py-0.5 text-slate-500 italic">
                  ... +352 more dimensions (click "Inspect All" to view full tensor)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
