import React from 'react';
import { SearchResult, TokenItem } from '../types';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

interface Section4Props {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  searchResult: SearchResult | null;
  sentence1: string;
  sentence2: string;
  s1Tokens: TokenItem[];
  s2Tokens: TokenItem[];
}

export const Section4WordSearch: React.FC<Section4Props> = ({
  searchTerm,
  setSearchTerm,
  onSearch,
  isLoading,
  searchResult,
  sentence1,
  sentence2,
  s1Tokens,
  s2Tokens
}) => {
  // Helper to render sentence text with highlighted substrings
  const renderHighlightedText = (
    text: string,
    ranges: [number, number][],
    accentColor: string
  ) => {
    if (!text || ranges.length === 0) {
      return <span>{text}</span>;
    }

    // Sort ranges by start index
    const sortedRanges = [...ranges].sort((a, b) => a[0] - b[0]);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedRanges.forEach(([start, end], idx) => {
      // Clamping to text bounds
      const s = Math.max(0, Math.min(start, text.length));
      const e = Math.max(s, Math.min(end, text.length));

      if (s > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>{text.slice(lastIndex, s)}</span>
        );
      }

      elements.push(
        <mark
          key={`mark-${idx}`}
          className="bg-red-500/30 text-white font-bold px-1 py-0.5 rounded border border-red-500 shadow-glow-red animate-pulse"
        >
          {text.slice(s, e)}
        </mark>
      );

      lastIndex = e;
    });

    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">{text.slice(lastIndex)}</span>
      );
    }

    return elements;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <section id="section-4" className="scroll-mt-20 mb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border-red-500/30">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24"></div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 font-extrabold text-base">
              04
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                  Word Search & Dynamic Token Highlighting
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  Red Accent Target
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Pinpoint token subword mappings across both sentences and watch them highlight in vibrant RED in both the raw sentences and the 3D semantic coordinate space.
              </p>
            </div>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Enter Word or Substring to Search:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. dog, canine, space, bank, token..."
                  className="w-full glass-input rounded-2xl pl-12 pr-4 py-3.5 text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                onClick={onSearch}
                disabled={isLoading || !searchTerm.trim()}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm shadow-glow-red transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Matching Tokens...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search & Highlight</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results Display */}
        {searchResult && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-4 animate-fade-in">
            {/* Notification Banner */}
            <div
              className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${
                searchResult.found_in_s1 || searchResult.found_in_s2
                  ? 'bg-red-950/20 border-red-500/40 text-red-200'
                  : 'bg-slate-900/80 border-slate-700/80 text-slate-300'
              }`}
            >
              {searchResult.found_in_s1 || searchResult.found_in_s2 ? (
                <CheckCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <span className="font-semibold">{searchResult.message}</span>
                {searchResult.search_term && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Matching points in Section 3 are rendered with glowing RED crosses (★) and highlighted chips in Section 2.
                  </p>
                )}
              </div>
            </div>

            {/* Side-by-Side Sentence Highlighting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sentence 1 Highlighting */}
              <div className="bg-navy-900/80 rounded-2xl p-4 border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    Sentence 1 Highlight
                  </span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      searchResult.found_in_s1
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {searchResult.s1_match_count} matches
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-navy-950/90 border border-slate-800/80 text-sm leading-relaxed text-slate-200 min-h-[60px]">
                  {renderHighlightedText(
                    sentence1,
                    searchResult.s1_highlighted_ranges,
                    'blue'
                  )}
                </div>
                <div className="mt-2 text-[11px] text-slate-400 font-mono">
                  Matched token indices: [
                  {searchResult.s1_matched_token_indices.join(', ') || 'none'}
                  ]
                </div>
              </div>

              {/* Sentence 2 Highlighting */}
              <div className="bg-navy-900/80 rounded-2xl p-4 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    Sentence 2 Highlight
                  </span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      searchResult.found_in_s2
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {searchResult.s2_match_count} matches
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-navy-950/90 border border-slate-800/80 text-sm leading-relaxed text-slate-200 min-h-[60px]">
                  {renderHighlightedText(
                    sentence2,
                    searchResult.s2_highlighted_ranges,
                    'green'
                  )}
                </div>
                <div className="mt-2 text-[11px] text-slate-400 font-mono">
                  Matched token indices: [
                  {searchResult.s2_matched_token_indices.join(', ') || 'none'}
                  ]
                </div>
              </div>
            </div>

            {/* Educational Panel: Sentence-Level vs Token-Level Embeddings */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/20 via-navy-900/80 to-purple-950/20 border border-red-500/30 text-xs text-slate-300 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-100">
                  Educational Concept: Sentence-Level vs. Token-Level Embeddings
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-navy-950/60 border border-slate-800">
                  <span className="font-bold text-blue-300 block mb-1">
                    1. Sentence Embedding (Pooled Global Vector)
                  </span>
                  <p className="text-slate-400">
                    A sentence embedding is a single unified vector (e.g. 384 numbers) representing the <em>holistic meaning</em> of the entire phrase. It is created by taking all contextual token vectors and performing <strong>Mean Pooling</strong> (averaging them weighted by attention), followed by unit L2 normalization. It is not just an average of isolated dictionary words: it captures syntax, intent, and relationships.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-navy-950/60 border border-slate-800">
                  <span className="font-bold text-red-400 block mb-1">
                    2. Token-Level Embeddings (Contextual Hidden States)
                  </span>
                  <p className="text-slate-400">
                    Each individual subword token outputs its own 384-dimensional vector from the final transformer layer (<code className="text-slate-300 font-mono">last_hidden_state</code>). Unlike static word vectors (such as Word2Vec), transformer token embeddings are <em>contextual</em>: the token "bank" in "river bank" will occupy a distinctly different point in 3D space than "bank" in "investment bank".
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
