import React from 'react';
import { Sparkles, Layers, Cpu, HelpCircle, Compass } from 'lucide-react';

interface NavbarProps {
  onOpenGuide: () => void;
  activeSection: string;
  onScrollTo: (id: string) => void;
  modelInfo?: { status: string; model: string; dimensions: number } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenGuide,
  activeSection,
  onScrollTo,
  modelInfo
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-glow-blue">
            <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Embedding Explorer
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                v1.0 • NLP Lab
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive 3D LLM Vector & Semantic Similarity Workbench
            </p>
          </div>
        </div>

        {/* Navigation Section Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-navy-900/60 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => onScrollTo('section-1')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'section-1'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            1. Sentence Embedding
          </button>
          <button
            onClick={() => onScrollTo('section-2')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'section-2'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            2. Tokenization
          </button>
          <button
            onClick={() => onScrollTo('section-3')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'section-3'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            3. 3D Visualization
          </button>
          <button
            onClick={() => onScrollTo('section-4')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'section-4'
                ? 'bg-red-600/90 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            4. Word Highlighting
          </button>
        </nav>

        {/* Right side status & guide */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[11px] text-slate-400">
              all-MiniLM-L6-v2 ({modelInfo?.dimensions || 384}-D)
            </span>
          </div>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
            title="Educational Guide for CS Students"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>CS Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
