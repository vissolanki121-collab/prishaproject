import React from 'react';
import { TokenizeResponse, TokenItem } from '../types';
import {
  Scissors,
  Hash,
  Type,
  Layers,
  HelpCircle,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';

interface Section2Props {
  sentence2: string;
  setSentence2: (val: string) => void;
  onAnalyzeTokens: () => void;
  isLoading: boolean;
  data: TokenizeResponse | null;
  highlightedIndices?: number[];
  searchTerm?: string;
}

export const Section2Tokenization: React.FC<Section2Props> = ({
  sentence2,
  setSentence2,
  onAnalyzeTokens,
  isLoading,
  data,
  highlightedIndices = [],
  searchTerm = ''
}) => {
  const [selectedToken, setSelectedToken] = React.useState<TokenItem | null>(null);

  // Helper chip color class
  const getChipStyle = (token: TokenItem, isMatch: boolean) => {
    if (isMatch) return 'chip-match';
    if (token.is_special) return 'chip-special border';
    const colorIdx = token.chip_color_index % 8;
    return `chip-${colorIdx} border`;
  };

  return (
    <section id="section-2" className="scroll-mt-20 mb-12">
      <div className="glass-panel glass-panel-glow-green rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold text-base">
              02
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                  Tokenization & Subword Character Counter
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sentence 2
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Deconstruct natural text into discrete transformer tokens (words, subword pieces, punctuation, and control tokens) with the WordPiece tokenizer.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-navy-900/90 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-mono self-start sm:self-auto">
            <Scissors className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Tokenizer:</span>
            <span className="font-bold text-emerald-400">WordPiece (BERT/MiniLM)</span>
          </div>
        </div>

        {/* Input Text Area */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Enter Second Sentence:
            </label>
            <div className="relative">
              <textarea
                value={sentence2}
                onChange={(e) => setSentence2(e.target.value)}
                placeholder="e.g. A speedy amber canine leaps past a sleepy hound."
                rows={3}
                className="w-full glass-input rounded-2xl p-4 text-slate-100 placeholder-slate-500 text-sm sm:text-base resize-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="absolute bottom-3 right-3 text-xs font-mono text-slate-400">
                {sentence2.length} chars
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Tokens include special symbols (<code className="text-slate-300 font-mono">[CLS]</code>, <code className="text-slate-300 font-mono">[SEP]</code>) and subwords prefixed with <code className="text-slate-300 font-mono">##</code>.
              </span>
            </div>

            <button
              onClick={onAnalyzeTokens}
              disabled={isLoading || !sentence2.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-glow-green transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Tokenizing Text...</span>
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4 text-emerald-200" />
                  <span>Analyze & Tokenize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Metrics & Chips */}
        {data && (
          <div className="mt-7 pt-6 border-t border-slate-800/80 animate-fade-in space-y-5">
            {/* Real Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-navy-900/80 rounded-xl p-3.5 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1 font-mono uppercase">
                  <Type className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Total Characters</span>
                </div>
                <span className="text-xl font-black text-cyan-400 font-mono">
                  {data.char_count}
                </span>
                <span className="text-[10px] text-slate-500 block">including spaces</span>
              </div>

              <div className="bg-navy-900/80 rounded-xl p-3.5 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1 font-mono uppercase">
                  <Hash className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Total Tokens</span>
                </div>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {data.token_count}
                </span>
                <span className="text-[10px] text-slate-500 block">all model inputs</span>
              </div>

              <div className="bg-navy-900/80 rounded-xl p-3.5 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1 font-mono uppercase">
                  <Type className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Whitespace Words</span>
                </div>
                <span className="text-xl font-black text-indigo-400 font-mono">
                  {data.word_count}
                </span>
                <span className="text-[10px] text-slate-500 block">space-delimited words</span>
              </div>

              <div className="bg-navy-900/80 rounded-xl p-3.5 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1 font-mono uppercase">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tokens / Word Ratio</span>
                </div>
                <span className="text-xl font-black text-purple-400 font-mono">
                  {data.word_count > 0 ? (data.token_count / data.word_count).toFixed(2) : '1.00'}
                </span>
                <span className="text-[10px] text-slate-500 block">granularity factor</span>
              </div>
            </div>

            {/* Visual Token Chips Area */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Individual Colored Token Chips ({data.tokens.length} items)
                  </h4>
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Click any chip to inspect subword spans & token ID
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-navy-950/90 border border-slate-800 flex flex-wrap gap-2.5">
                {data.tokens.map((tok, idx) => {
                  const isMatch = highlightedIndices.includes(idx);
                  const isSelected = selectedToken?.token_id === tok.token_id && selectedToken?.start_char === tok.start_char;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedToken(tok)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${getChipStyle(
                        tok,
                        isMatch
                      )} ${isSelected ? 'ring-2 ring-white scale-105' : 'hover:scale-105'}`}
                    >
                      <span className="font-bold">
                        {tok.token}
                      </span>
                      <span className="text-[10px] opacity-75 font-mono px-1 py-0.5 rounded bg-black/30">
                        #{tok.token_id}
                      </span>
                      {tok.is_subword && (
                        <span className="text-[9px] uppercase px-1 rounded bg-amber-500/20 text-amber-300">
                          subword
                        </span>
                      )}
                      {tok.is_special && (
                        <span className="text-[9px] uppercase px-1 rounded bg-slate-700 text-slate-300">
                          special
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Token Inspector Drawer */}
            {selectedToken && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-cyan-300 font-bold px-2 py-1 bg-cyan-950/80 rounded border border-cyan-800/80 text-sm">
                    {selectedToken.token}
                  </span>
                  <div className="text-slate-300">
                    <span className="font-semibold text-slate-400">Vocabulary ID:</span>{' '}
                    <span className="font-mono text-white font-bold">{selectedToken.token_id}</span>
                    <span className="mx-2 text-slate-600">|</span>
                    <span className="font-semibold text-slate-400">Character Range:</span>{' '}
                    <span className="font-mono text-white">[{selectedToken.start_char} .. {selectedToken.end_char}]</span>
                    <span className="mx-2 text-slate-600">|</span>
                    <span className="font-semibold text-slate-400">Classification:</span>{' '}
                    <span className="text-emerald-400 font-medium">
                      {selectedToken.is_special ? 'Special Control Token' : selectedToken.is_subword ? 'Subword Unit (Suffix)' : 'Standalone Word Token'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedToken(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                >
                  Close
                </button>
              </div>
            )}

            {/* Educational Callout on Tokenization */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200/90 leading-relaxed flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-300 mb-1">
                  Why Are Tokens Not Just Words? (Educational Concept)
                </p>
                <p>
                  In modern LLMs and transformer architectures, text is not split simply by spaces. A vocabulary of 30,522 fixed tokens is used. Rare or compound words are split into subword fragments (e.g. <code className="bg-black/40 px-1 py-0.5 rounded font-mono">tokenization</code> becomes <code className="bg-black/40 px-1 py-0.5 rounded font-mono">token</code> and <code className="bg-black/40 px-1 py-0.5 rounded font-mono">##ization</code>). This prevents out-of-vocabulary errors and allows the model to understand novel words by recognizing morphological prefixes and suffixes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
