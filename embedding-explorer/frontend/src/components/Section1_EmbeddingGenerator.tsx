import React, { useState } from 'react'
import { useEmbeddingStore } from '../hooks/useEmbeddingStore'
import { generateEmbedding } from '../api/client'
import type { EmbeddingResponse } from '../types'

function getChipColor(value: number): string {
  if (value < -0.1) {
    // negative → red-ish
    const intensity = Math.min(1, Math.abs(value) / 0.5)
    return `rgba(220, 38, 38, ${0.25 + intensity * 0.55})`
  } else if (value > 0.1) {
    // positive → blue/green
    const intensity = Math.min(1, value / 0.5)
    return `rgba(34, 197, 94, ${0.2 + intensity * 0.5})`
  } else {
    // near-zero → gray
    return 'rgba(100, 116, 139, 0.35)'
  }
}

function getChipTextColor(value: number): string {
  if (value < -0.1) return '#fca5a5'
  if (value > 0.1) return '#86efac'
  return '#94a3b8'
}

const DISPLAY_COUNT = 50

export default function Section1_EmbeddingGenerator() {
  const { sentence1, setSentence1 } = useEmbeddingStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EmbeddingResponse | null>(null)
  const [showAll, setShowAll] = useState(false)

  async function handleGenerate() {
    if (!sentence1.trim()) {
      setError('Please enter a sentence first.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    setShowAll(false)
    try {
      const data = await generateEmbedding(sentence1.trim())
      setResult(data)
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to generate embedding. Is the backend running?'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const displayedValues = result
    ? showAll
      ? result.embedding
      : result.embedding.slice(0, DISPLAY_COUNT)
    : []

  const hiddenCount = result ? result.embedding.length - DISPLAY_COUNT : 0

  return (
    <section
      className="glass-card p-6"
      style={{
        background: 'rgba(13, 21, 64, 0.6)',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        borderRadius: '1rem',
        marginBottom: '2rem',
      }}
    >
      {/* ── Section header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          01
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: '1.4rem',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Sentence Embedding Generator
        </h2>
      </div>

      {/* ── Info box: what is an embedding? ── */}
      <div
        style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          color: '#a5b4fc',
          lineHeight: 1.6,
        }}
      >
        <span style={{ fontWeight: 700, color: '#c084fc' }}>💡 What is an embedding?</span>
        {' '}An embedding is a fixed-length list of numbers (a <em>vector</em>) that captures the
        semantic meaning of a sentence. Similar sentences end up with similar vectors — the model
        has "learned" to place related concepts nearby in this high-dimensional space.
      </div>

      {/* ── Textarea ── */}
      <label
        htmlFor="s1-textarea"
        style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}
      >
        Sentence to embed
      </label>
      <textarea
        id="s1-textarea"
        rows={3}
        value={sentence1}
        onChange={(e) => setSentence1(e.target.value)}
        placeholder="Type a sentence here…"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '0.65rem 0.9rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          background: 'rgba(15, 23, 42, 0.7)',
          color: '#e2e8f0',
          fontSize: '1rem',
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'inherit',
          lineHeight: 1.5,
          marginBottom: '1rem',
        }}
      />

      {/* ── Generate button ── */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: '0.6rem 1.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: loading
            ? 'rgba(99, 102, 241, 0.3)'
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.95rem',
          letterSpacing: '0.02em',
          transition: 'opacity 0.2s',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Generating…' : '⚡ Generate Embedding'}
      </button>

      {/* ── Loading spinner ── */}
      {loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '1.25rem',
            color: '#a5b4fc',
            fontSize: '0.95rem',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '1.25rem',
              height: '1.25rem',
              border: '3px solid rgba(99, 102, 241, 0.3)',
              borderTopColor: '#818cf8',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          Generating embedding…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Error message ── */}
      {error && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.65rem 1rem',
            borderRadius: '0.5rem',
            background: 'rgba(220, 38, 38, 0.15)',
            border: '1px solid rgba(220, 38, 38, 0.4)',
            color: '#fca5a5',
            fontSize: '0.9rem',
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div style={{ marginTop: '1.5rem' }}>
          {/* Dimension badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                padding: '0.3rem 0.9rem',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              {result.dimensions} dimensions
            </span>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
              Showing {Math.min(DISPLAY_COUNT, result.embedding.length)} of {result.dimensions} values
            </span>
          </div>

          {/* Info box: what is a vector */}
          <div
            style={{
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '0.5rem',
              padding: '0.6rem 0.9rem',
              marginBottom: '0.85rem',
              fontSize: '0.8rem',
              color: '#c084fc',
              lineHeight: 1.5,
            }}
          >
            <strong>🔢 What is a vector?</strong> Each number below is one dimension of this
            {' '}{result.dimensions}-dimensional vector. <span style={{ color: '#86efac' }}>Green</span> values
            are positive, <span style={{ color: '#fca5a5' }}>red</span> values are negative,
            and <span style={{ color: '#94a3b8' }}>gray</span> values are near zero.
          </div>

          {/* Value chips */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.3rem',
            }}
          >
            {displayedValues.map((v, i) => (
              <span
                key={i}
                title={`dim[${i}] = ${v}`}
                style={{
                  display: 'inline-block',
                  padding: '0.18rem 0.42rem',
                  borderRadius: '0.25rem',
                  background: getChipColor(v),
                  color: getChipTextColor(v),
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.01em',
                  border: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'default',
                }}
              >
                {v.toFixed(4)}
              </span>
            ))}

            {/* "… and X more" or "Show all" */}
            {!showAll && hiddenCount > 0 && (
              <button
                onClick={() => setShowAll(true)}
                style={{
                  padding: '0.18rem 0.7rem',
                  borderRadius: '0.25rem',
                  border: '1px dashed rgba(99, 102, 241, 0.5)',
                  background: 'transparent',
                  color: '#818cf8',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                … and {hiddenCount} more
              </button>
            )}
            {showAll && hiddenCount > 0 && (
              <button
                onClick={() => setShowAll(false)}
                style={{
                  padding: '0.18rem 0.7rem',
                  borderRadius: '0.25rem',
                  border: '1px dashed rgba(99, 102, 241, 0.5)',
                  background: 'transparent',
                  color: '#818cf8',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Show less
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
