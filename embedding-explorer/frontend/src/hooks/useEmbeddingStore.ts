import { create } from 'zustand'
import type { VisualizeResponse, TokenEmbeddingsResponse, WordSearchResponse } from '../types'
interface EmbeddingStore {
  sentence1: string; sentence2: string; searchWord: string;
  visualizeData: VisualizeResponse | null;
  tokenEmbeddings1: TokenEmbeddingsResponse | null;
  tokenEmbeddings2: TokenEmbeddingsResponse | null;
  wordSearchResult: WordSearchResponse | null;
  backendOnline: boolean;
  setSentence1: (s: string) => void; setSentence2: (s: string) => void;
  setSearchWord: (w: string) => void; setVisualizeData: (d: VisualizeResponse | null) => void;
  setTokenEmbeddings1: (d: TokenEmbeddingsResponse | null) => void;
  setTokenEmbeddings2: (d: TokenEmbeddingsResponse | null) => void;
  setWordSearchResult: (d: WordSearchResponse | null) => void;
  setBackendOnline: (v: boolean) => void;
}
export const useEmbeddingStore = create<EmbeddingStore>((set) => ({
  sentence1: 'The cat sat on the mat.', sentence2: 'A dog rested on the rug.',
  searchWord: '', visualizeData: null, tokenEmbeddings1: null, tokenEmbeddings2: null,
  wordSearchResult: null, backendOnline: false,
  setSentence1: (s) => set({ sentence1: s }), setSentence2: (s) => set({ sentence2: s }),
  setSearchWord: (w) => set({ searchWord: w }), setVisualizeData: (d) => set({ visualizeData: d }),
  setTokenEmbeddings1: (d) => set({ tokenEmbeddings1: d }), setTokenEmbeddings2: (d) => set({ tokenEmbeddings2: d }),
  setWordSearchResult: (d) => set({ wordSearchResult: d }), setBackendOnline: (v) => set({ backendOnline: v }),
}))
