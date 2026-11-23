import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { AnalyzePairResponse, Point3D } from '../types';
import {
  Compass,
  Maximize2,
  RotateCcw,
  Layers,
  HelpCircle,
  Eye,
  Info,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface Section3Props {
  data: AnalyzePairResponse | null;
  isLoading: boolean;
  onRefreshAnalysis: () => void;
  sentence1: string;
  sentence2: string;
}

export const Section3Visualization3D: React.FC<Section3Props> = ({
  data,
  isLoading,
  onRefreshAnalysis,
  sentence1,
  sentence2
}) => {
  const plotContainerRef = useRef<HTMLDivElement>(null);
  const [showTokens, setShowTokens] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<'default' | 'top' | 'side'>('default');

  // Render or update Plotly 3D graph whenever data, showTokens, or showLabels changes
  useEffect(() => {
    if (!plotContainerRef.current || !data) return;

    // Filter points based on user toggles
    const pointsToRender = showTokens
      ? data.points_3d
      : data.points_3d.filter((p) => p.is_sentence_level);

    // Group points by visual category
    // 1. Sentence 1 Centroid (Sentence-level pooled embedding) - Blue Diamond
    const s1Center = pointsToRender.filter((p) => p.point_type === 'sentence_1');
    // 2. Sentence 2 Centroid (Sentence-level pooled embedding) - Green Diamond
    const s2Center = pointsToRender.filter((p) => p.point_type === 'sentence_2');
    // 3. Matched tokens - RED
    const matchedTokens = pointsToRender.filter((p) => !p.is_sentence_level && p.is_match);
    // 4. Normal S1 tokens - Blue circles
    const s1Tokens = pointsToRender.filter((p) => p.point_type === 'token_1' && !p.is_match);
    // 5. Normal S2 tokens - Green circles
    const s2Tokens = pointsToRender.filter((p) => p.point_type === 'token_2' && !p.is_match);

    const traces: any[] = [];

    // Trace 1: Sentence 1 Centroid (Blue Diamond)
    if (s1Center.length > 0) {
      traces.push({
        type: 'scatter3d',
        mode: showLabels ? 'markers+text' : 'markers',
        name: 'Sentence 1 (Pooled Vector)',
        x: s1Center.map((p) => p.x),
        y: s1Center.map((p) => p.y),
        z: s1Center.map((p) => p.z),
        text: s1Center.map((p) => 'Sentence 1 [Pooled]'),
        textposition: 'top center',
        textfont: { color: '#60a5fa', size: 12, family: 'Inter, sans-serif' },
        hovertext: s1Center.map((p) => p.hover_text),
        hoverinfo: 'text',
        marker: {
          size: 15,
          color: '#3b82f6',
          symbol: 'diamond',
          line: { color: '#93c5fd', width: 2.5 },
          opacity: 1.0
        }
      });
    }

    // Trace 2: Sentence 2 Centroid (Green Diamond)
    if (s2Center.length > 0) {
      traces.push({
        type: 'scatter3d',
        mode: showLabels ? 'markers+text' : 'markers',
        name: 'Sentence 2 (Pooled Vector)',
        x: s2Center.map((p) => p.x),
        y: s2Center.map((p) => p.y),
        z: s2Center.map((p) => p.z),
        text: s2Center.map((p) => 'Sentence 2 [Pooled]'),
        textposition: 'top center',
        textfont: { color: '#34d399', size: 12, family: 'Inter, sans-serif' },
        hovertext: s2Center.map((p) => p.hover_text),
        hoverinfo: 'text',
        marker: {
          size: 15,
          color: '#10b981',
          symbol: 'diamond',
          line: { color: '#a7f3d0', width: 2.5 },
          opacity: 1.0
        }
      });
    }

    // Trace 3: Dashed connecting line between Sentence 1 and Sentence 2 centroids
    if (s1Center.length > 0 && s2Center.length > 0) {
      traces.push({
        type: 'scatter3d',
        mode: 'lines',
        name: `Distance: ${data.similarity.euclidean_distance}`,
        x: [s1Center[0].x, s2Center[0].x],
        y: [s1Center[0].y, s2Center[0].y],
        z: [s1Center[0].z, s2Center[0].z],
        line: {
          color: 'rgba(255, 255, 255, 0.4)',
          width: 3,
          dash: 'dash'
        },
        hoverinfo: 'name'
      });
    }

    // Trace 4: Sentence 1 Token Points (Light Blue)
    if (s1Tokens.length > 0) {
      traces.push({
        type: 'scatter3d',
        mode: showLabels ? 'markers+text' : 'markers',
        name: 'S1 Contextual Tokens',
        x: s1Tokens.map((p) => p.x),
        y: s1Tokens.map((p) => p.y),
        z: s1Tokens.map((p) => p.z),
        text: s1Tokens.map((p) => p.label.replace('S1: ', '')),
        textposition: 'bottom right',
        textfont: { color: '#93c5fd', size: 10, family: 'JetBrains Mono, monospace' },
        hovertext: s1Tokens.map((p) => p.hover_text),
        hoverinfo: 'text',
        marker: {
          size: 7,
          color: '#60a5fa',
          symbol: 'circle',
          line: { color: '#1e3a8a', width: 1 },
          opacity: 0.85
        }
      });
    }

    // Trace 5: Sentence 2 Token Points (Light Green)
    if (s2Tokens.length > 0) {
      traces.push({
        type: 'scatter3d',
        mode: showLabels ? 'markers+text' : 'markers',
        name: 'S2 Contextual Tokens',
        x: s2Tokens.map((p) => p.x),
        y: s2Tokens.map((p) => p.y),
        z: s2Tokens.map((p) => p.z),
        text: s2Tokens.map((p) => p.label.replace('S2: ', '')),
        textposition: 'bottom right',
        textfont: { color: '#6ee7b7', size: 10, family: 'JetBrains Mono, monospace' },
        hovertext: s2Tokens.map((p) => p.hover_text),
        hoverinfo: 'text',
        marker: {
          size: 7,
          color: '#34d399',
          symbol: 'circle',
          line: { color: '#064e3b', width: 1 },
          opacity: 0.85
        }
      });
    }

    // Trace 6: Search Match Highlighted Tokens (RED)
    if (matchedTokens.length > 0) {
      traces.push({
        type: 'scatter3d',
        mode: 'markers+text',
        name: `Search Matches (${matchedTokens.length})`,
        x: matchedTokens.map((p) => p.x),
        y: matchedTokens.map((p) => p.y),
        z: matchedTokens.map((p) => p.z),
        text: matchedTokens.map((p) => `★ ${p.label}`),
        textposition: 'top left',
        textfont: { color: '#ef4444', size: 11, family: 'JetBrains Mono, monospace' },
        hovertext: matchedTokens.map((p) => p.hover_text),
        hoverinfo: 'text',
        marker: {
          size: 13,
          color: '#ef4444',
          symbol: 'cross',
          line: { color: '#ffffff', width: 2 },
          opacity: 1.0
        }
      });
    }

    // Determine camera position based on preset
    let eye = { x: 1.45, y: 1.45, z: 1.15 };
    if (cameraPreset === 'top') {
      eye = { x: 0, y: 0, z: 2.3 };
    } else if (cameraPreset === 'side') {
      eye = { x: 2.3, y: 0, z: 0.2 };
    }

    const layout: any = {
      autosize: true,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { l: 0, r: 0, b: 0, t: 0 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(12, 18, 34, 0.85)',
        bordercolor: 'rgba(255, 255, 255, 0.1)',
        borderwidth: 1,
        font: { color: '#cbd5e1', size: 11, family: 'Inter, sans-serif' }
      },
      scene: {
        camera: { eye },
        xaxis: {
          title: { text: `PC 1 (${data.pca_meta.variance_explained_ratio[0] || 0}%)`, font: { color: '#94a3b8', size: 11 } },
          backgroundcolor: 'rgba(15, 23, 42, 0.5)',
          gridcolor: 'rgba(255, 255, 255, 0.07)',
          showbackground: true,
          zerolinecolor: 'rgba(59, 130, 246, 0.4)'
        },
        yaxis: {
          title: { text: `PC 2 (${data.pca_meta.variance_explained_ratio[1] || 0}%)`, font: { color: '#94a3b8', size: 11 } },
          backgroundcolor: 'rgba(15, 23, 42, 0.5)',
          gridcolor: 'rgba(255, 255, 255, 0.07)',
          showbackground: true,
          zerolinecolor: 'rgba(16, 185, 129, 0.4)'
        },
        zaxis: {
          title: { text: `PC 3 (${data.pca_meta.variance_explained_ratio[2] || 0}%)`, font: { color: '#94a3b8', size: 11 } },
          backgroundcolor: 'rgba(15, 23, 42, 0.5)',
          gridcolor: 'rgba(255, 255, 255, 0.07)',
          showbackground: true,
          zerolinecolor: 'rgba(168, 85, 247, 0.4)'
        }
      }
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['toImage']
    };

    Plotly.react(plotContainerRef.current, traces, layout, config);
  }, [data, showTokens, showLabels, cameraPreset]);

  // Window resize handler for Plotly
  useEffect(() => {
    const handleResize = () => {
      if (plotContainerRef.current) {
        Plotly.Plots.resize(plotContainerRef.current);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section id="section-3" className="scroll-mt-20 mb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border-cyan-500/30">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -mr-28 -mt-28"></div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-extrabold text-base">
              03
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                  Interactive 3D Embedding Space
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Core Visualization
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Dimensionality reduction via Principal Component Analysis (PCA) projecting high-dimensional 384-D sentence & token vectors into an interactive 3D coordinate frame.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshAnalysis}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Recalculate 3D Plot</span>
            </button>
          </div>
        </div>

        {/* Cosine Similarity & Vector Metrics Dashboard */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            {/* Metric 1: Cosine Similarity */}
            <div className="bg-navy-900/90 rounded-2xl p-4 border border-blue-500/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                  Cosine Similarity (384-D)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                    {data.similarity.cosine_similarity > 0
                      ? `+${data.similarity.cosine_similarity.toFixed(4)}`
                      : data.similarity.cosine_similarity.toFixed(4)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">[-1.0 to +1.0]</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                Calculated on <strong className="text-blue-300">original 384 dimensions</strong>, not projected 3D coordinates.
              </p>
            </div>

            {/* Metric 2: Percentage-Style Similarity Indicator */}
            <div className="bg-navy-900/90 rounded-2xl p-4 border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                  Similarity Indicator
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    {data.similarity.similarity_percentage.toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono text-slate-400">aligned scale</span>
                </div>
              </div>
              <p className="text-[10px] text-amber-300/90 mt-2 pt-2 border-t border-slate-800 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span>Directional similarity score, NOT a probability.</span>
              </p>
            </div>

            {/* Metric 3: Euclidean & Angular Distance */}
            <div className="bg-navy-900/90 rounded-2xl p-4 border border-purple-500/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                  High-D Vector Distances
                </span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Euclidean (L2):</span>
                    <span className="font-bold text-purple-300">{data.similarity.euclidean_distance.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Subtended Angle:</span>
                    <span className="font-bold text-indigo-300">{data.similarity.angle_degrees.toFixed(1)}°</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                Smaller Euclidean distance = closer in semantic space.
              </p>
            </div>

            {/* Metric 4: PCA Explained Variance */}
            <div className="bg-navy-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                  PCA Variance Captured
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-200 font-mono">
                    {data.pca_meta.total_variance_explained.toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono text-slate-400">top 3 components</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800 font-mono flex items-center justify-between">
                <span>PC1: {data.pca_meta.variance_explained_ratio[0]}%</span>
                <span>PC2: {data.pca_meta.variance_explained_ratio[1]}%</span>
                <span>PC3: {data.pca_meta.variance_explained_ratio[2]}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Semantic Verdict Banner */}
        {data && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-emerald-950/60 border border-slate-700/80 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-slate-400 mr-2">Semantic Diagnosis:</span>
                <strong className="text-cyan-300 font-semibold">{data.similarity.semantic_verdict}</strong>
                <span className="text-slate-400 hidden md:inline ml-2">— {data.similarity.explanation}</span>
              </div>
            </div>
          </div>
        )}

        {/* Graph Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-navy-900/80 rounded-2xl border border-slate-800 mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
              Camera View:
            </span>
            <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-xl border border-slate-800 font-medium">
              <button
                onClick={() => setCameraPreset('default')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  cameraPreset === 'default' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Perspective
              </button>
              <button
                onClick={() => setCameraPreset('top')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  cameraPreset === 'top' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Top (XY)
              </button>
              <button
                onClick={() => setCameraPreset('side')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  cameraPreset === 'side' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Side (XZ)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
              <input
                type="checkbox"
                checked={showTokens}
                onChange={(e) => setShowTokens(e.target.checked)}
                className="rounded bg-navy-950 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Display Token Cloud</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="rounded bg-navy-950 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Display Labels</span>
            </label>
          </div>
        </div>

        {/* 3D Interactive Plotly Canvas */}
        <div className="relative w-full h-[540px] sm:h-[620px] rounded-2xl bg-navy-950/90 border border-slate-800/90 overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy-950/80 z-20 gap-3">
              <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm font-semibold text-cyan-300">
                Projecting 384-dimensional manifold into 3D via PCA...
              </p>
            </div>
          ) : null}

          <div ref={plotContainerRef} className="w-full h-full" />
        </div>

        {/* Educational Callout & How to Interpret Panel */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <Info className="w-4 h-4 text-cyan-400" />
              How to Interpret the 3D Visualization
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400 leading-relaxed">
              <li>
                <strong className="text-blue-400">Blue Diamond:</strong> The sentence-level pooled embedding for Sentence 1.
              </li>
              <li>
                <strong className="text-emerald-400">Green Diamond:</strong> The sentence-level pooled embedding for Sentence 2.
              </li>
              <li>
                <strong className="text-slate-300">Smaller Dots:</strong> Contextual token-level embeddings produced by the transformer hidden states.
              </li>
              <li>
                <strong className="text-red-400">Vibrant Red Markers:</strong> Tokens that match your search query from Section 4.
              </li>
              <li>
                <strong>Rotation & Zoom:</strong> Click and drag to orbit in 3D; scroll to zoom in/out; right-click drag to pan.
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              Crucial Educational Distinctions
            </h4>
            <div className="space-y-2 text-slate-400 leading-relaxed">
              <p>
                <strong className="text-purple-300">1. Original 384-D vs 3D PCA:</strong> High-dimensional embeddings inhabit a 384-dimensional geometric space. PCA captures the top 3 axes of greatest statistical variance, but it is an approximation. Cosine similarity is always computed in the true 384-D space.
              </p>
              <p>
                <strong className="text-amber-300">2. No Semantic Meaning for Axes:</strong> The X, Y, and Z axes (PC1, PC2, PC3) do <em>not</em> represent human concepts like "sentiment" or "topic". They are orthogonal linear combinations of all 384 neural dimensions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
