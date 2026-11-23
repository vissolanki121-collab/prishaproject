import React, { useState, useEffect } from 'react';
import {
  fetchHealth,
  fetchPresets,
  embedSentence,
  tokenizeSentence,
  analyzePair
} from './api';
import {
  SentenceEmbedResponse,
  TokenizeResponse,
  AnalyzePairResponse,
  PresetItem
} from './types';
import { Navbar } from './components/Navbar';
import { PresetsSelector } from './components/PresetsSelector';
import { Section1SentenceEmbedding } from './components/Section1SentenceEmbedding';
import { Section2Tokenization } from './components/Section2Tokenization';
import { Section3Visualization3D } from './components/Section3Visualization3D';
import { Section4WordSearch } from './components/Section4WordSearch';
import { EducationalPanels } from './components/EducationalPanels';
import { VectorInspectorModal } from './components/VectorInspectorModal';
import { AlertCircle, RefreshCw, Compass, CheckCircle2 } from 'lucide-react';

export function App() {
  // Input states
  const [sentence1, setSentence1] = useState(
    'The quick brown fox jumps over the lazy dog.'
  );
  const [sentence2, setSentence2] = useState(
    'A speedy amber canine leaps past a sleepy hound.'
  );
  const [searchTerm, setSearchTerm] = useState('dog');

  // Loading states
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEmbeddingS1, setIsEmbeddingS1] = useState(false);
  const [isTokenizingS2, setIsTokenizingS2] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Data states
  const [modelInfo, setModelInfo] = useState<{
    status: string;
    model: string;
    dimensions: number;
  } | null>(null);
  const [presets, setPresets] = useState<PresetItem[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('paraphrase');

  const [s1EmbedData, setS1EmbedData] = useState<SentenceEmbedResponse | null>(
    null
  );
  const [s2TokenData, setS2TokenData] = useState<TokenizeResponse | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalyzePairResponse | null>(
    null
  );

  // Modals & Navigation
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isVectorModalOpen, setIsVectorModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('section-1');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Master analysis function that keeps all 4 sections in perfect sync
  const runFullAnalysis = async (
    s1: string = sentence1,
    s2: string = sentence2,
    query: string = searchTerm
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      // 1. Fetch pair analysis for Section 3 (3D Plot) & Section 4 (Search)
      const pairRes = await analyzePair(s1, s2, query);
      setAnalysisData(pairRes);

      // 2. Sync Section 1 embedding data
      setS1EmbedData({
        text: s1,
        dimensions: pairRes.dimensions,
        embedding: pairRes.s1_embedding,
        stats: pairRes.s1_stats,
        sample_preview: `[${pairRes.s1_embedding
          .slice(0, 5)
          .map((v) => (v > 0 ? `+${v.toFixed(4)}` : v.toFixed(4)))
          .join(', ')}, ... (${pairRes.dimensions - 10} values) ...]`
      });

      // 3. Sync Section 2 tokenization data
      setS2TokenData({
        text: s2,
        char_count: pairRes.s2_char_count,
        word_count: s2.trim() ? s2.trim().split(/\s+/).length : 0,
        token_count: pairRes.s2_tokens.length,
        tokens: pairRes.s2_tokens,
        model_name: modelInfo?.model || 'sentence-transformers/all-MiniLM-L6-v2'
      });
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(
        err.message || 'Failed to connect to backend NLP server. Please verify backend is running on port 8000.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Section 1 dedicated embedding button
  const handleGenerateS1Embedding = async () => {
    setIsEmbeddingS1(true);
    setErrorMessage(null);
    try {
      const res = await embedSentence(sentence1);
      setS1EmbedData(res);
      // Also update full pair in background so 3D plot stays updated
      runFullAnalysis(sentence1, sentence2, searchTerm);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error generating embedding for Sentence 1');
    } finally {
      setIsEmbeddingS1(false);
    }
  };

  // Section 2 dedicated tokenization button
  const handleTokenizeS2 = async () => {
    setIsTokenizingS2(true);
    setErrorMessage(null);
    try {
      const res = await tokenizeSentence(sentence2);
      setS2TokenData(res);
      // Also update full pair so 3D plot stays updated
      runFullAnalysis(sentence1, sentence2, searchTerm);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error tokenizing Sentence 2');
    } finally {
      setIsTokenizingS2(false);
    }
  };

  // Section 4 dedicated search button
  const handleSearchWord = async () => {
    setIsSearching(true);
    try {
      await runFullAnalysis(sentence1, sentence2, searchTerm);
    } finally {
      setIsSearching(false);
    }
  };

  // Preset selector
  const handleSelectPreset = (preset: PresetItem) => {
    setSelectedPresetId(preset.id);
    setSentence1(preset.sentence1);
    setSentence2(preset.sentence2);
    setSearchTerm(preset.searchTerm);
    runFullAnalysis(preset.sentence1, preset.sentence2, preset.searchTerm);
  };

  // Initial load
  useEffect(() => {
    const initApp = async () => {
      try {
        const [health, presetList] = await Promise.all([
          fetchHealth().catch(() => null),
          fetchPresets().catch(() => [])
        ]);

        if (health) setModelInfo(health);
        if (presetList && presetList.length > 0) setPresets(presetList);

        // Run initial full analysis
        await runFullAnalysis(sentence1, sentence2, searchTerm);
      } catch (err: any) {
        console.error('Initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    initApp();
  }, []);

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 bg-grid-pattern relative flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onOpenGuide={() => setIsGuideOpen(true)}
        activeSection={activeSection}
        onScrollTo={scrollToSection}
        modelInfo={modelInfo}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Hero Banner */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Educational Machine Learning Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3">
            Explore How Language Models Think in{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              High-Dimensional Space
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            Enter two sentences, tokenize them with WordPiece, inspect real 384-dimensional vector embeddings generated by <code className="text-cyan-300 font-mono">all-MiniLM-L6-v2</code>, calculate genuine cosine similarities, and orbit through an interactive 3D PCA projection.
          </p>
        </div>

        {/* Global Error Banner if any */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/60 text-red-200 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => runFullAnalysis()}
              className="px-3 py-1 rounded-lg bg-red-600/40 hover:bg-red-600/60 text-white font-mono text-xs flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Instant Presets Bar */}
        {presets.length > 0 && (
          <PresetsSelector
            presets={presets}
            selectedPresetId={selectedPresetId}
            onSelectPreset={handleSelectPreset}
            isLoading={isAnalyzing}
          />
        )}

        {/* Global Synchronize Action Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 p-4 rounded-2xl bg-navy-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              Real-time synchronization active: Editing any input updates the whole 4-section pipeline.
            </span>
          </div>

          <button
            onClick={() => runFullAnalysis()}
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-glow-blue flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Recalculating Pipeline...' : 'Synchronize All Sections'}</span>
          </button>
        </div>

        {/* SECTION 1: Sentence Embedding Generator */}
        <Section1SentenceEmbedding
          sentence1={sentence1}
          setSentence1={setSentence1}
          onGenerateEmbedding={handleGenerateS1Embedding}
          isLoading={isEmbeddingS1 || isAnalyzing}
          data={s1EmbedData}
          onOpenInspector={() => setIsVectorModalOpen(true)}
        />

        {/* SECTION 2: Tokenization and Character Counter */}
        <Section2Tokenization
          sentence2={sentence2}
          setSentence2={setSentence2}
          onAnalyzeTokens={handleTokenizeS2}
          isLoading={isTokenizingS2 || isAnalyzing}
          data={s2TokenData}
          highlightedIndices={analysisData?.search.s2_matched_token_indices || []}
          searchTerm={searchTerm}
        />

        {/* SECTION 3: Interactive 3D Embedding Visualization (MOST IMPORTANT) */}
        <Section3Visualization3D
          data={analysisData}
          isLoading={isAnalyzing}
          onRefreshAnalysis={() => runFullAnalysis()}
          sentence1={sentence1}
          sentence2={sentence2}
        />

        {/* SECTION 4: Word Search and Highlighting */}
        <Section4WordSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearchWord}
          isLoading={isSearching || isAnalyzing}
          searchResult={analysisData?.search || null}
          sentence1={sentence1}
          sentence2={sentence2}
          s1Tokens={analysisData?.s1_tokens || []}
          s2Tokens={analysisData?.s2_tokens || []}
        />

        {/* Educational FAQ / Concept Panel */}
        <EducationalPanels />
      </main>

      {/* Vector Inspector Modal */}
      {s1EmbedData && (
        <VectorInspectorModal
          isOpen={isVectorModalOpen}
          onClose={() => setIsVectorModalOpen(false)}
          sentence={sentence1}
          embedding={s1EmbedData.embedding}
          stats={s1EmbedData.stats}
          dimensions={s1EmbedData.dimensions}
        />
      )}

      {/* CS Student Guide Modal */}
      <EducationalPanels
        isOpenModal={isGuideOpen}
        onCloseModal={() => setIsGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-navy-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Embedding Explorer</span>
            <span>—</span>
            <span>Built with PyTorch, Sentence Transformers, Hugging Face, React, Three/Plotly & Tailwind CSS</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Model: sentence-transformers/all-MiniLM-L6-v2 (384-D)
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
