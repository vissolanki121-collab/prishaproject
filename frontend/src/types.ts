export interface VectorStats {
  min_val: number;
  max_val: number;
  mean_val: number;
  std_val: number;
  l2_norm: number;
}

export interface SentenceEmbedResponse {
  text: string;
  dimensions: number;
  embedding: number[];
  stats: VectorStats;
  sample_preview: string;
}

export interface TokenItem {
  token_id: number;
  token: string;
  clean_token: string;
  start_char: number;
  end_char: number;
  is_special: boolean;
  is_subword: boolean;
  chip_color_index: number;
}

export interface TokenizeResponse {
  text: string;
  char_count: number;
  word_count: number;
  token_count: number;
  tokens: TokenItem[];
  model_name: string;
}

export interface Point3D {
  point_id: string;
  label: string;
  hover_text: string;
  x: number;
  y: number;
  z: number;
  point_type: 'sentence_1' | 'sentence_2' | 'token_1' | 'token_2';
  sentence_id: number;
  is_sentence_level: boolean;
  is_match: boolean;
  token_id?: number | null;
  color: string;
}

export interface SearchResult {
  search_term: string;
  found_in_s1: boolean;
  found_in_s2: boolean;
  s1_match_count: number;
  s2_match_count: number;
  message: string;
  s1_matched_token_indices: number[];
  s2_matched_token_indices: number[];
  s1_highlighted_ranges: [number, number][];
  s2_highlighted_ranges: [number, number][];
}

export interface SimilarityMetrics {
  cosine_similarity: number;
  similarity_percentage: number;
  euclidean_distance: number;
  manhattan_distance: number;
  angle_degrees: number;
  semantic_verdict: string;
  explanation: string;
}

export interface PCAMetadata {
  variance_explained_ratio: number[];
  total_variance_explained: number;
  n_points_projected: number;
}

export interface AnalyzePairResponse {
  sentence1: string;
  sentence2: string;
  dimensions: number;
  s1_char_count: number;
  s2_char_count: number;
  s1_tokens: TokenItem[];
  s2_tokens: TokenItem[];
  s1_embedding: number[];
  s2_embedding: number[];
  s1_stats: VectorStats;
  s2_stats: VectorStats;
  similarity: SimilarityMetrics;
  points_3d: Point3D[];
  pca_meta: PCAMetadata;
  search: SearchResult;
}

export interface PresetItem {
  id: string;
  title: string;
  sentence1: string;
  sentence2: string;
  searchTerm: string;
  description: string;
}
