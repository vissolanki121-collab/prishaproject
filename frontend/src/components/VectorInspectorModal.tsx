import React, { useState } from 'react';
import { VectorStats } from '../types';
import { X, Copy, Check, Search, BarChart3, Layers } from 'lucide-react';

interface VectorInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentence: string;
  embedding: number[];
  stats: VectorStats;
  dimensions: number;
}

export const VectorInspectorModal: React.FC<VectorInspectorModalProps> = ({
  isOpen,
  onClose,
  sentence,
  embedding,
  stats,
  dimensions
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(embedding, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredValues = embedding
    .map((val, idx) => ({ val, idx }))
    .filter(({ idx, val }) => {
      if (!filterQuery) return true;
      const q = filterQuery.toLowerCase();
      return (
        idx.toString().includes(q) ||
        val.toString().includes(q)
      );
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-navy-950 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-navy-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                Full 384-Dimensional Vector Inspector
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-blue-500/20 text-blue-300">
                  Float32 Tensor
                </span>
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-md">
                "{sentence}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Copied JSON' : 'Copy All 384'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="p-4 bg-navy-900/50 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs font-mono">
          <div className="bg-navy-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Dimensions</span>
            <span className="text-blue-400 font-bold">{dimensions}</span>
          </div>
          <div className="bg-navy-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">L2 Norm</span>
            <span className="text-emerald-400 font-bold">{stats.l2_norm.toFixed(4)}</span>
          </div>
          <div className="bg-navy-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Min Value</span>
            <span className="text-cyan-400 font-bold">{stats.min_val.toFixed(4)}</span>
          </div>
          <div className="bg-navy-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Mean Value</span>
            <span className="text-slate-300 font-bold">{stats.mean_val.toFixed(4)}</span>
          </div>
          <div className="bg-navy-950/80 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-slate-400 text-[10px] block">Max Value</span>
            <span className="text-indigo-400 font-bold">{stats.max_val.toFixed(4)}</span>
          </div>
        </div>

        {/* Filter input */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-3 bg-navy-900/30">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by dimension index (e.g. 42)..."
              className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredValues.length} of {dimensions} dimensions
          </span>
        </div>

        {/* Values Grid */}
        <div className="p-5 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {filteredValues.map(({ idx, val }) => {
              // Intensity calculation for visual heatmap tint
              const normalized = Math.min(1, Math.max(0, (val - stats.min_val) / (stats.max_val - stats.min_val || 1)));
              const isPositive = val >= 0;

              return (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-navy-900/80 border border-slate-800/80 font-mono text-[11px] flex flex-col justify-between hover:border-blue-500/60 transition-colors"
                >
                  <div className="flex items-center justify-between text-slate-400 text-[9px] mb-1">
                    <span>Dim #{idx}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-cyan-400' : 'bg-purple-400'}`}></span>
                  </div>
                  <div className="font-bold text-slate-100 flex items-baseline justify-between">
                    <span>{val > 0 ? `+${val.toFixed(5)}` : val.toFixed(5)}</span>
                  </div>
                  {/* Miniature bar indicator */}
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPositive ? 'bg-cyan-500' : 'bg-purple-500'}`}
                      style={{ width: `${Math.round(normalized * 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-navy-900/80 text-xs text-slate-400 flex items-center justify-between">
          <span>Sentence Transformers: PyTorch float32 dense representation</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
