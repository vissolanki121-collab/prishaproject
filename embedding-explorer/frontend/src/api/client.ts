import axios from 'axios'
import type { EmbeddingResponse, TokenizeResponse, VisualizeResponse, TokenEmbeddingsResponse, WordSearchResponse } from '../types'
const api = axios.create({ baseURL: '/api', timeout: 60000 })
export const generateEmbedding = (sentence: string): Promise<EmbeddingResponse> => api.post('/embed', { sentence }).then(r => r.data)
export const tokenizeSentence = (sentence: string): Promise<TokenizeResponse> => api.post('/tokenize', { sentence }).then(r => r.data)
export const visualizeEmbeddings = (sentence1: string, sentence2: string): Promise<VisualizeResponse> => api.post('/visualize', { sentence1, sentence2 }).then(r => r.data)
export const getTokenEmbeddings = (sentence: string): Promise<TokenEmbeddingsResponse> => api.post('/token_embeddings', { sentence }).then(r => r.data)
export const searchWord = (word: string, sentence1: string, sentence2: string): Promise<WordSearchResponse> => api.post('/word_search', { word, sentence1, sentence2 }).then(r => r.data)
export const checkHealth = () => api.get('/health').then(r => r.data)
