import React, { useState } from 'react';
import { useEmbeddingStore } from '../hooks/useEmbeddingStore';
import { tokenizeSentence } from '../api/client';
import type { TokenizeResponse } from '../types';

const PASTEL_PALETTE = [
  { bg: 'rgba(139,92,246,0.15)', border: '#8b5cf6', text: '#c4b5fd' },
  { bg: 'rgba(59,130,246,0.15)', border: '#3b82f6', text: '#93c5fd' },
  { bg: 'rgba(16,185,129,0.15)', border: '#10b981', text: '#6ee7b7' },
  { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', text: '#fcd34d' },
  { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#fca5a5' },
  { bg: 'rgba(236,72,153,0.15)', border: '#ec4899', text: '#f9a8d4' },
  { bg: 'rgba(20,184,166,0.15)', border: '#14b8a6', text: '#99f6e4' },
  { bg: 'rgba(249,115,22,0.15)', border: '#f97316', text: '#fdba74' },
];

const SUBWORD_STYLE = {
  bg: 'rgba(100,116,139,0.12)',
  border: '#475569',
  text: '#94a3b8',
};

interface TokenChipProps {
  token: string;
  tokenId: number;
  colorIndex: number;
  isSubword: boolean;
}

const TokenChip: React.FC<TokenChipProps> = ({ token, tokenId, colorIndex, isSubword }) => {
  const color = isSubword ? SUBWORD_STYLE : PASTEL_PALETTE[colorIndex % PASTEL_PALETTE.length];
  const displayToken = isSubword ? token.slice(2) : token;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {isSubword && (
        <span
          style={{
            color: '#64748b',
            fontSize: '10px',
            fontFamily: 'monospace',
            userSelect: 'none',
            marginRight: '1px',
          }}
          title="Subword continuation token"
        >
          ↳
        </span>
      )}
      <div
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: color.bg,
          border: `1px ${isSubword ? 'dashed' : 'solid'} ${color.border}`,
          borderRadius: isSubword ? '6px' : '999px',
          padding: isSubword ? '3px 8px 3px 8px' : '4px 10px',
          marginBottom: '4px',
          minWidth: isSubword ? '36px' : '40px',
          opacity: isSubword ? 0.85 : 1,
          transform: isSubword ? 'scale(0.92)' : 'none',
          transformOrigin: 'left center',
        }}
        title={isSubword ? `Subword continuation: "##${displayToken}"` : `Token: "${token}"`}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: isSubword ? '11px' : '12px',
            color: color.text,
            fontWeight: 600,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
          }}
        >
          {isSubword ? `##${displayToken}` : displayToken}
        </span>
        <span
          style={{
            fontSize: '9px',
            color: '#64748b',
            fontFamily: 'monospace',
            lineHeight: 1,
            marginTop: '2px',
          }}
        >
          {tokenId}
        </span>
      </div>
    </div>
  );
};

const Spinner: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a78bfa' }}>
    <svg
      style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
    <span style={{ fontSize: '14px' }}>Analyzing tokens…</span>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

const Section2_Tokenizer: React.FC = () => {
  const sentence2 = useEmbeddingStore((s) => s.sentence2);
  const setSentence2 = useEmbeddingStore((s) => s.setSentence2);

  const [result, setResult] = useState<TokenizeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!sentence2.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await tokenizeSentence(sentence2.trim());
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAnalyze();
    }
  };

  return (
    <div
      className="glass-card p-6"
      style={{
        background: 'rgba(13,21,64,0.6)',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        marginBottom: '32px',
      }}
    >
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            borderRadius: '10px',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '16px',
            color: '#fff',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(139,92,246,0.4)',
          }}
        >
          02
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #c4b5fd, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Tokenization Explorer
        </h2>
      </div>

      {/* Educational Info Box */}
      <div
        style={{
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#a5b4fc',
          lineHeight: 1.6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>💡</span>
          <div>
            <strong style={{ color: '#c4b5fd', display: 'block', marginBottom: '6px' }}>
              Tokens ≠ Words
            </strong>
            <p style={{ margin: '0 0 6px 0' }}>
              Language models don't see words — they see <em>tokens</em>. Tokenization splits text
              into sub-units using algorithms like <strong style={{ color: '#c4b5fd' }}>WordPiece</strong>{' '}
              (used in BERT).
            </p>
            <p style={{ margin: '0 0 6px 0' }}>
              <strong style={{ color: '#c4b5fd' }}>Subword tokenization</strong> breaks rare or
              compound words into smaller known pieces. For example:
            </p>
            <code
              style={{
                display: 'inline-block',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                color: '#fcd34d',
                fontFamily: 'monospace',
                marginBottom: '6px',
              }}
            >
              "unhappiness" → ["un", "##happiness"]
            </code>
            <p style={{ margin: 0 }}>
              Tokens prefixed with <code style={{ color: '#fcd34d' }}>##</code> are{' '}
              <em>continuation tokens</em> — they attach to the previous token and together form a
              single word. Special tokens like{' '}
              <code style={{ color: '#6ee7b7' }}>[CLS]</code> and{' '}
              <code style={{ color: '#6ee7b7' }}>[SEP]</code> are added automatically by the model.
            </p>
          </div>
        </div>
      </div>

      {/* Textarea */}
      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="sentence2-input"
          style={{
            display: 'block',
            fontSize: '13px',
            color: '#94a3b8',
            marginBottom: '8px',
            fontWeight: 500,
            letterSpacing: '0.03em',
          }}
        >
          Enter a sentence to tokenize
          <span style={{ color: '#475569', marginLeft: '8px', fontWeight: 400 }}>
            (Ctrl+Enter to analyze)
          </span>
        </label>
        <textarea
          id="sentence2-input"
          value={sentence2}
          onChange={(e) => setSentence2(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="e.g. The unhappiness of the situation was overwhelming."
          style={{
            width: '100%',
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            color: '#e2e8f0',
            fontSize: '15px',
            fontFamily: 'inherit',
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(139,92,246,0.7)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(139,92,246,0.3)';
          }}
        />

        {/* Live character count */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '6px',
            fontSize: '12px',
            color: '#475569',
          }}
        >
          <span>
            <span style={{ color: sentence2.length > 0 ? '#818cf8' : '#475569', fontWeight: 600 }}>
              {sentence2.length}
            </span>{' '}
            character{sentence2.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading || !sentence2.trim()}
        style={{
          background:
            loading || !sentence2.trim()
              ? 'rgba(99,102,241,0.2)'
              : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          border: 'none',
          borderRadius: '10px',
          padding: '11px 28px',
          color: loading || !sentence2.trim() ? '#475569' : '#fff',
          fontSize: '15px',
          fontWeight: 600,
          cursor: loading || !sentence2.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          boxShadow:
            loading || !sentence2.trim() ? 'none' : '0 4px 15px rgba(139,92,246,0.35)',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={(e) => {
          if (!loading && sentence2.trim()) {
            (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(139,92,246,0.5)';
          }
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.transform = 'none';
          (e.target as HTMLButtonElement).style.boxShadow =
            !loading && sentence2.trim() ? '0 4px 15px rgba(139,92,246,0.35)' : 'none';
        }}
      >
        {loading ? 'Analyzing…' : '🔍 Analyze Tokens'}
      </button>

      {/* Loading State */}
      {loading && (
        <div style={{ marginTop: '24px' }}>
          <Spinner />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div
          style={{
            marginTop: '20px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#fca5a5',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div style={{ marginTop: '28px' }}>
          {/* Stats Row */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}
          >
            <StatCard
              label="Characters"
              value={result.char_count}
              icon="📝"
              color="#818cf8"
            />
            <StatCard
              label="Tokens"
              value={result.count}
              icon="🔢"
              color="#a78bfa"
            />
            <StatCard
              label="Token / Char Ratio"
              value={(result.count / Math.max(result.char_count, 1)).toFixed(2)}
              icon="📊"
              color="#6ee7b7"
              isFloat
            />
          </div>

          {/* Token chips */}
          <div>
            <div
              style={{
                fontSize: '13px',
                color: '#64748b',
                marginBottom: '12px',
                fontWeight: 500,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Token Breakdown
            </div>

            {/* Legend */}
            <div
              style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '14px',
                fontSize: '12px',
                color: '#64748b',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '20px',
                    height: '10px',
                    borderRadius: '999px',
                    border: '1px solid #8b5cf6',
                    background: 'rgba(139,92,246,0.15)',
                  }}
                />
                <span>Regular token</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '20px',
                    height: '10px',
                    borderRadius: '4px',
                    border: '1px dashed #475569',
                    background: 'rgba(100,116,139,0.12)',
                  }}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '10px' }}>↳</span>
                  Subword continuation (##)
                </span>
              </div>
            </div>

            {/* Chips */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'flex-end',
                padding: '16px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {result.tokens.map((token, i) => {
                const isSubword = token.startsWith('##');
                // Don't count special tokens or subwords in color cycling
                const isSpecial = token.startsWith('[') && token.endsWith(']');
                const colorIndex = isSpecial ? 7 : i;
                return (
                  <TokenChip
                    key={i}
                    token={token}
                    tokenId={result.token_ids[i]}
                    colorIndex={colorIndex}
                    isSubword={isSubword}
                  />
                );
              })}
            </div>

            {/* Token count note */}
            <div
              style={{
                marginTop: '10px',
                fontSize: '12px',
                color: '#475569',
                textAlign: 'right',
              }}
            >
              {result.count} tokens total · includes special tokens [CLS] and [SEP]
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  isFloat?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <div
    style={{
      flex: '1 1 100px',
      minWidth: '100px',
      background: 'rgba(0,0,0,0.25)',
      border: `1px solid ${color}40`,
      borderRadius: '10px',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '4px',
    }}
  >
    <div style={{ fontSize: '20px', marginBottom: '2px' }}>{icon}</div>
    <div
      style={{
        fontSize: '24px',
        fontWeight: 800,
        color: color,
        lineHeight: 1.1,
        fontFamily: 'monospace',
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{label}</div>
  </div>
);

export default Section2_Tokenizer;
