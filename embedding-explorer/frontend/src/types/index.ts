export interface EmbeddingResponse { embedding: number[]; dimensions: number; }
export interface TokenizeResponse { tokens: string[]; token_ids: number[]; count: number; char_count: number; }
export interface VisualizeResponse { sentence1_3d: [number,number,number]; sentence2_3d: [number,number,number]; cosine_similarity: number; euclidean_distance: number; sentence1_embedding: number[]; sentence2_embedding: number[]; }
export interface TokenEmbeddingsResponse { tokens: string[]; embeddings_3d: [number,number,number][]; token_ids: number[]; }
export interface WordSearchResponse { word: string; found_in_sentence1: boolean; found_in_sentence2: boolean; sentence1_token_indices: number[]; sentence2_token_indices: number[]; sentence1_tokens: string[]; sentence2_tokens: string[]; }
