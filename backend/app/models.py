from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SentenceEmbedRequest(BaseModel):
    text: str = Field(..., description="The sentence to embed")

class VectorStats(BaseModel):
    min_val: float
    max_val: float
    mean_val: float
    std_val: float
    l2_norm: float

class SentenceEmbedResponse(BaseModel):
    text: str
    dimensions: int
    embedding: List[float]
    stats: VectorStats
    sample_preview: str

class TokenItem(BaseModel):
    token_id: int
    token: str
    clean_token: str
    start_char: int
    end_char: int
    is_special: bool
    is_subword: bool
    chip_color_index: int

class TokenizeRequest(BaseModel):
    text: str = Field(..., description="The sentence to tokenize")

class TokenizeResponse(BaseModel):
    text: str
    char_count: int
    word_count: int
    token_count: int
    tokens: List[TokenItem]
    model_name: str

class Point3D(BaseModel):
    point_id: str
    label: str
    hover_text: str
    x: float
    y: float
    z: float
    point_type: str  # "sentence_1", "sentence_2", "token_1", "token_2"
    sentence_id: int  # 1 or 2
    is_sentence_level: bool
    is_match: bool
    token_id: Optional[int] = None
    color: str

class SearchResult(BaseModel):
    search_term: str
    found_in_s1: bool
    found_in_s2: bool
    s1_match_count: int
    s2_match_count: int
    message: str
    s1_matched_token_indices: List[int]
    s2_matched_token_indices: List[int]
    s1_highlighted_ranges: List[List[int]]  # [[start, end], ...]
    s2_highlighted_ranges: List[List[int]]

class AnalyzePairRequest(BaseModel):
    sentence1: str = Field(..., description="First sentence")
    sentence2: str = Field(..., description="Second sentence")
    search_term: Optional[str] = Field(default="", description="Optional word to search and highlight")

class SimilarityMetrics(BaseModel):
    cosine_similarity: float
    similarity_percentage: float
    euclidean_distance: float
    manhattan_distance: float
    angle_degrees: float
    semantic_verdict: str
    explanation: str

class PCAMetadata(BaseModel):
    variance_explained_ratio: List[float]
    total_variance_explained: float
    n_points_projected: int

class AnalyzePairResponse(BaseModel):
    sentence1: str
    sentence2: str
    dimensions: int
    s1_char_count: int
    s2_char_count: int
    s1_tokens: List[TokenItem]
    s2_tokens: List[TokenItem]
    s1_embedding: List[float]
    s2_embedding: List[float]
    s1_stats: VectorStats
    s2_stats: VectorStats
    similarity: SimilarityMetrics
    points_3d: List[Point3D]
    pca_meta: PCAMetadata
    search: SearchResult
