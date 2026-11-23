import {
  SentenceEmbedResponse,
  TokenizeResponse,
  AnalyzePairResponse,
  PresetItem
} from './types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; model: string; dimensions: number }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchPresets(): Promise<PresetItem[]> {
  const res = await fetch(`${API_BASE}/presets`);
  if (!res.ok) throw new Error(`Failed to load presets: ${res.statusText}`);
  return res.json();
}

export async function embedSentence(text: string): Promise<SentenceEmbedResponse> {
  const res = await fetch(`${API_BASE}/embed-sentence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to embed sentence');
  }
  return res.json();
}

export async function tokenizeSentence(text: string): Promise<TokenizeResponse> {
  const res = await fetch(`${API_BASE}/tokenize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to tokenize sentence');
  }
  return res.json();
}

export async function analyzePair(
  sentence1: string,
  sentence2: string,
  searchTerm: string = ''
): Promise<AnalyzePairResponse> {
  const res = await fetch(`${API_BASE}/analyze-pair`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sentence1,
      sentence2,
      search_term: searchTerm
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to analyze sentence pair');
  }
  return res.json();
}
