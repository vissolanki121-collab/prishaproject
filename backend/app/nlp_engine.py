import re
import math
import numpy as np
import torch
from typing import List, Dict, Any, Tuple, Optional
from transformers import AutoTokenizer, AutoModel
from sklearn.decomposition import PCA
from .models import (
    VectorStats, TokenItem, Point3D, SearchResult,
    SimilarityMetrics, PCAMetadata, AnalyzePairResponse
)

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Color palette for token chips (dark-mode friendly pastel accents)
CHIP_PALETTES = [
    0, 1, 2, 3, 4, 5, 6, 7
]

class NLPEngine:
    def __init__(self):
        print(f"Loading NLP Engine with model: {MODEL_NAME}...")
        # Load tokenizer and model locally
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, local_files_only=True)
        self.model = AutoModel.from_pretrained(MODEL_NAME, local_files_only=True)
        self.model.eval()
        self.dimensions = self.model.config.hidden_size
        print(f"NLP Engine initialized successfully. Embedding dimensions: {self.dimensions}")

    def _mean_pooling(self, model_output, attention_mask):
        """
        Perform mean pooling with attention mask (standard sentence-transformers pooling).
        """
        token_embeddings = model_output[0]  # First element of model_output contains all token embeddings
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
        sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
        return sum_embeddings / sum_mask

    def embed_sentence(self, text: str) -> Tuple[List[float], VectorStats, str]:
        """
        Embed a single sentence and return high-dimensional vector and stats.
        """
        text = text.strip() or " "
        encoded_input = self.tokenizer(
            text,
            padding=True,
            truncation=True,
            max_length=256,
            return_tensors='pt'
        )

        with torch.no_grad():
            model_output = self.model(**encoded_input)

        sentence_embeddings = self._mean_pooling(model_output, encoded_input['attention_mask'])
        # Normalize embeddings to unit sphere (L2 norm = 1.0)
        sentence_embeddings = torch.nn.functional.normalize(sentence_embeddings, p=2, dim=1)
        embedding_vec = sentence_embeddings[0].cpu().numpy().tolist()

        arr = np.array(embedding_vec)
        stats = VectorStats(
            min_val=round(float(np.min(arr)), 6),
            max_val=round(float(np.max(arr)), 6),
            mean_val=round(float(np.mean(arr)), 6),
            std_val=round(float(np.std(arr)), 6),
            l2_norm=round(float(np.linalg.norm(arr)), 6)
        )

        # Build readable sample preview
        first_few = [f"{v:+.4f}" for v in embedding_vec[:6]]
        last_few = [f"{v:+.4f}" for v in embedding_vec[-4:]]
        preview = f"[{', '.join(first_few)}, ... ({self.dimensions - 10} values) ..., {', '.join(last_few)}]"

        return embedding_vec, stats, preview

    def tokenize_sentence(self, text: str) -> List[TokenItem]:
        """
        Tokenize text with character offsets and subword detection.
        """
        clean_text = text if text.strip() else " "
        encoding = self.tokenizer(
            clean_text,
            return_offsets_mapping=True,
            add_special_tokens=True,
            truncation=True,
            max_length=128
        )

        input_ids = encoding["input_ids"]
        offset_mapping = encoding["offset_mapping"]
        tokens_raw = self.tokenizer.convert_ids_to_tokens(input_ids)

        token_items: List[TokenItem] = []
        for idx, (tid, tok, offsets) in enumerate(zip(input_ids, tokens_raw, offset_mapping)):
            is_special = tok in ["[CLS]", "[SEP]", "[PAD]", "[UNK]", "[MASK]"]
            is_subword = tok.startswith("##")
            clean_tok = tok[2:] if is_subword else tok

            token_items.append(
                TokenItem(
                    token_id=int(tid),
                    token=tok,
                    clean_token=clean_tok,
                    start_char=int(offsets[0]),
                    end_char=int(offsets[1]),
                    is_special=is_special,
                    is_subword=is_subword,
                    chip_color_index=idx % len(CHIP_PALETTES)
                )
            )

        return token_items

    def extract_token_embeddings(self, text: str) -> Tuple[List[TokenItem], np.ndarray, np.ndarray]:
        """
        Extract token items, token contextual embeddings matrix (N, 384), and sentence-level pooled embedding (1, 384).
        """
        clean_text = text if text.strip() else " "
        encoding = self.tokenizer(
            clean_text,
            return_offsets_mapping=True,
            return_tensors='pt',
            truncation=True,
            max_length=128
        )

        offset_mapping = encoding.pop("offset_mapping")[0].cpu().tolist()
        input_ids = encoding["input_ids"][0].cpu().tolist()
        tokens_raw = self.tokenizer.convert_ids_to_tokens(input_ids)

        with torch.no_grad():
            outputs = self.model(**encoding)
            # Hidden states of shape (1, seq_len, 384)
            hidden_states = outputs.last_hidden_state[0]  # (seq_len, 384)

            # Sentence embedding via mean pooling & L2 normalization
            pooled = self._mean_pooling(outputs, encoding["attention_mask"])
            sentence_vec = torch.nn.functional.normalize(pooled, p=2, dim=1)[0].cpu().numpy()

        token_vecs = hidden_states.cpu().numpy()

        token_items: List[TokenItem] = []
        for idx, (tid, tok, offsets) in enumerate(zip(input_ids, tokens_raw, offset_mapping)):
            is_special = tok in ["[CLS]", "[SEP]", "[PAD]", "[UNK]", "[MASK]"]
            is_subword = tok.startswith("##")
            clean_tok = tok[2:] if is_subword else tok

            token_items.append(
                TokenItem(
                    token_id=int(tid),
                    token=tok,
                    clean_token=clean_tok,
                    start_char=int(offsets[0]),
                    end_char=int(offsets[1]),
                    is_special=is_special,
                    is_subword=is_subword,
                    chip_color_index=idx % len(CHIP_PALETTES)
                )
            )

        return token_items, token_vecs, sentence_vec

    def calculate_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> SimilarityMetrics:
        """
        Calculate cosine similarity, Euclidean distance, and angular distance on original high-dimensional vectors.
        """
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            cos_sim = 0.0
        else:
            cos_sim = float(np.dot(vec1, vec2) / (norm1 * norm2))

        # Clamp for numerical stability
        cos_sim = max(-1.0, min(1.0, cos_sim))

        euclidean_dist = float(np.linalg.norm(vec1 - vec2))
        manhattan_dist = float(np.sum(np.abs(vec1 - vec2)))

        # Angle in degrees
        angle_rad = math.acos(cos_sim)
        angle_deg = float(math.degrees(angle_rad))

        # Percentage indicator (normalized scale 0% to 100%)
        # Note: In sentence embeddings, vectors generally lie in non-negative orthants; max(0, cos_sim) is standard
        sim_percentage = round(max(0.0, cos_sim) * 100.0, 2)

        # Semantic interpretation verdict
        if cos_sim >= 0.85:
            verdict = "Very High Semantic Similarity (Near Paraphrase)"
            explanation = "The two sentences share almost identical core meanings, themes, and conceptual contexts."
        elif cos_sim >= 0.65:
            verdict = "Substantial Semantic Similarity"
            explanation = "The sentences belong to closely related domains or describe overlapping topics."
        elif cos_sim >= 0.40:
            verdict = "Moderate / Loose Similarity"
            explanation = "The sentences share some general concepts or syntactic patterns but diverge in meaning."
        elif cos_sim >= 0.15:
            verdict = "Low Semantic Similarity"
            explanation = "The sentences discuss distinct subjects with minimal conceptual intersection."
        else:
            verdict = "Unrelated or Orthogonal Meaning"
            explanation = "The two sentences occupy entirely different regions of semantic space."

        return SimilarityMetrics(
            cosine_similarity=round(cos_sim, 4),
            similarity_percentage=sim_percentage,
            euclidean_distance=round(euclidean_dist, 4),
            manhattan_distance=round(manhattan_dist, 4),
            angle_degrees=round(angle_deg, 2),
            semantic_verdict=verdict,
            explanation=explanation
        )

    def search_and_match(
        self,
        query: str,
        s1_text: str,
        s2_text: str,
        s1_tokens: List[TokenItem],
        s2_tokens: List[TokenItem]
    ) -> SearchResult:
        """
        Search for a word/term in both sentences and identify corresponding tokens and character ranges.
        """
        query_clean = query.strip()
        if not query_clean:
            return SearchResult(
                search_term="",
                found_in_s1=False,
                found_in_s2=False,
                s1_match_count=0,
                s2_match_count=0,
                message="Enter a word above to search across both sentences.",
                s1_matched_token_indices=[],
                s2_matched_token_indices=[],
                s1_highlighted_ranges=[],
                s2_highlighted_ranges=[]
            )

        query_lower = query_clean.lower()

        # Helper to find character ranges using word boundaries or regex
        def find_char_ranges(text: str, term: str) -> List[List[int]]:
            ranges = []
            if not text.strip():
                return ranges
            # Escaped pattern matching whole words or substrings
            pattern = re.compile(re.escape(term), re.IGNORECASE)
            for m in pattern.finditer(text):
                ranges.append([m.start(), m.end()])
            return ranges

        s1_ranges = find_char_ranges(s1_text, query_clean)
        s2_ranges = find_char_ranges(s2_text, query_clean)

        # Helper to find matching token indices
        def match_tokens(tokens: List[TokenItem], ranges: List[List[int]], term_lower: str) -> List[int]:
            matched_indices = []
            for idx, tok in enumerate(tokens):
                if tok.is_special:
                    continue
                # Direct token match
                clean_tok_lower = tok.clean_token.lower()
                if clean_tok_lower == term_lower or term_lower in clean_tok_lower or clean_tok_lower in term_lower:
                    matched_indices.append(idx)
                    continue
                # Character overlap check
                for r_start, r_end in ranges:
                    if not (tok.end_char <= r_start or tok.start_char >= r_end):
                        matched_indices.append(idx)
                        break
            return sorted(list(set(matched_indices)))

        s1_matched_tokens = match_tokens(s1_tokens, s1_ranges, query_lower)
        s2_matched_tokens = match_tokens(s2_tokens, s2_ranges, query_lower)

        found_in_s1 = len(s1_matched_tokens) > 0 or len(s1_ranges) > 0
        found_in_s2 = len(s2_matched_tokens) > 0 or len(s2_ranges) > 0

        # Construct clear message
        if found_in_s1 and found_in_s2:
            msg = f"'{query_clean}' was found in BOTH Sentence 1 ({len(s1_ranges)} occurrences) and Sentence 2 ({len(s2_ranges)} occurrences)."
        elif found_in_s1:
            msg = f"'{query_clean}' was found in Sentence 1 ({len(s1_ranges)} occurrences), but NOT in Sentence 2."
        elif found_in_s2:
            msg = f"'{query_clean}' was found in Sentence 2 ({len(s2_ranges)} occurrences), but NOT in Sentence 1."
        else:
            msg = f"'{query_clean}' was NOT found in either Sentence 1 or Sentence 2."

        return SearchResult(
            search_term=query_clean,
            found_in_s1=found_in_s1,
            found_in_s2=found_in_s2,
            s1_match_count=len(s1_ranges),
            s2_match_count=len(s2_ranges),
            message=msg,
            s1_matched_token_indices=s1_matched_tokens,
            s2_matched_token_indices=s2_matched_tokens,
            s1_highlighted_ranges=s1_ranges,
            s2_highlighted_ranges=s2_ranges
        )

    def analyze_pair(self, s1_text: str, s2_text: str, search_term: str = "") -> AnalyzePairResponse:
        """
        End-to-end analysis:
        1. Tokenize both sentences
        2. Generate sentence-level and token-level embeddings
        3. Calculate cosine similarity & distance on original 384-d vectors
        4. Project all points into 3D using PCA
        5. Search and highlight matching tokens
        """
        s1_tokens, s1_token_vecs, s1_sent_vec = self.extract_token_embeddings(s1_text)
        s2_tokens, s2_token_vecs, s2_sent_vec = self.extract_token_embeddings(s2_text)

        # Similarity on original 384-dimensional sentence vectors
        similarity = self.calculate_similarity(s1_sent_vec, s2_sent_vec)

        # Vector stats
        s1_stats = VectorStats(
            min_val=round(float(np.min(s1_sent_vec)), 6),
            max_val=round(float(np.max(s1_sent_vec)), 6),
            mean_val=round(float(np.mean(s1_sent_vec)), 6),
            std_val=round(float(np.std(s1_sent_vec)), 6),
            l2_norm=round(float(np.linalg.norm(s1_sent_vec)), 6)
        )
        s2_stats = VectorStats(
            min_val=round(float(np.min(s2_sent_vec)), 6),
            max_val=round(float(np.max(s2_sent_vec)), 6),
            mean_val=round(float(np.mean(s2_sent_vec)), 6),
            std_val=round(float(np.std(s2_sent_vec)), 6),
            l2_norm=round(float(np.linalg.norm(s2_sent_vec)), 6)
        )

        # Search matching
        search_res = self.search_and_match(search_term, s1_text, s2_text, s1_tokens, s2_tokens)

        # Build list of all vectors to project via PCA
        # Order:
        # [0] = s1_sent_vec
        # [1] = s2_sent_vec
        # [2 : 2+len(s1_tokens)] = s1_token_vecs
        # [rest] = s2_token_vecs
        all_vecs = [s1_sent_vec, s2_sent_vec]
        for v in s1_token_vecs:
            all_vecs.append(v)
        for v in s2_token_vecs:
            all_vecs.append(v)

        matrix = np.array(all_vecs)

        # Fit PCA with 3 components
        # If there are fewer than 3 samples, we pad or fallback
        n_samples = matrix.shape[0]
        n_components = min(3, n_samples)

        pca = PCA(n_components=n_components, random_state=42)
        projected = pca.fit_transform(matrix)

        # If projected has fewer than 3 columns, pad with zeros
        if projected.shape[1] < 3:
            padding = np.zeros((projected.shape[0], 3 - projected.shape[1]))
            projected = np.hstack([projected, padding])

        var_explained = [round(float(v) * 100, 2) for v in pca.explained_variance_ratio_]
        total_var = round(float(np.sum(pca.explained_variance_ratio_)) * 100, 2)

        pca_meta = PCAMetadata(
            variance_explained_ratio=var_explained,
            total_variance_explained=total_var,
            n_points_projected=int(n_samples)
        )

        # Build 3D Points
        points: List[Point3D] = []

        # 1. Sentence 1 Centroid (Sentence Embedding)
        points.append(
            Point3D(
                point_id="sentence_1_center",
                label="Sentence 1 [Sentence Embedding]",
                hover_text=f"<b>Sentence 1 (Pooled Embedding)</b><br>Text: \"{s1_text[:60]}...\"<br>Vector: 384-D (PCA projected)",
                x=round(float(projected[0, 0]), 4),
                y=round(float(projected[0, 1]), 4),
                z=round(float(projected[0, 2]), 4),
                point_type="sentence_1",
                sentence_id=1,
                is_sentence_level=True,
                is_match=False,
                token_id=None,
                color="#3b82f6"  # Blue
            )
        )

        # 2. Sentence 2 Centroid (Sentence Embedding)
        points.append(
            Point3D(
                point_id="sentence_2_center",
                label="Sentence 2 [Sentence Embedding]",
                hover_text=f"<b>Sentence 2 (Pooled Embedding)</b><br>Text: \"{s2_text[:60]}...\"<br>Vector: 384-D (PCA projected)",
                x=round(float(projected[1, 0]), 4),
                y=round(float(projected[1, 1]), 4),
                z=round(float(projected[1, 2]), 4),
                point_type="sentence_2",
                sentence_id=2,
                is_sentence_level=True,
                is_match=False,
                token_id=None,
                color="#10b981"  # Green
            )
        )

        # 3. Sentence 1 Tokens
        s1_offset = 2
        for idx, tok in enumerate(s1_tokens):
            row_idx = s1_offset + idx
            is_match = idx in search_res.s1_matched_token_indices
            tok_color = "#ef4444" if is_match else "#60a5fa"  # Red if search match, otherwise light blue

            points.append(
                Point3D(
                    point_id=f"s1_tok_{idx}",
                    label=f"S1: {tok.token}",
                    hover_text=f"<b>Sentence 1 Token:</b> <code>{tok.token}</code><br>ID: {tok.token_id}<br>Type: {'[Special]' if tok.is_special else ('[Subword]' if tok.is_subword else '[Word]')}{'<br><b style=\"color:#ef4444\">★ MATCHES SEARCH</b>' if is_match else ''}",
                    x=round(float(projected[row_idx, 0]), 4),
                    y=round(float(projected[row_idx, 1]), 4),
                    z=round(float(projected[row_idx, 2]), 4),
                    point_type="token_1",
                    sentence_id=1,
                    is_sentence_level=False,
                    is_match=is_match,
                    token_id=tok.token_id,
                    color=tok_color
                )
            )

        # 4. Sentence 2 Tokens
        s2_offset = 2 + len(s1_tokens)
        for idx, tok in enumerate(s2_tokens):
            row_idx = s2_offset + idx
            is_match = idx in search_res.s2_matched_token_indices
            tok_color = "#ef4444" if is_match else "#34d399"  # Red if search match, otherwise light green

            points.append(
                Point3D(
                    point_id=f"s2_tok_{idx}",
                    label=f"S2: {tok.token}",
                    hover_text=f"<b>Sentence 2 Token:</b> <code>{tok.token}</code><br>ID: {tok.token_id}<br>Type: {'[Special]' if tok.is_special else ('[Subword]' if tok.is_subword else '[Word]')}{'<br><b style=\"color:#ef4444\">★ MATCHES SEARCH</b>' if is_match else ''}",
                    x=round(float(projected[row_idx, 0]), 4),
                    y=round(float(projected[row_idx, 1]), 4),
                    z=round(float(projected[row_idx, 2]), 4),
                    point_type="token_2",
                    sentence_id=2,
                    is_sentence_level=False,
                    is_match=is_match,
                    token_id=tok.token_id,
                    color=tok_color
                )
            )

        return AnalyzePairResponse(
            sentence1=s1_text,
            sentence2=s2_text,
            dimensions=self.dimensions,
            s1_char_count=len(s1_text),
            s2_char_count=len(s2_text),
            s1_tokens=s1_tokens,
            s2_tokens=s2_tokens,
            s1_embedding=s1_sent_vec.tolist(),
            s2_embedding=s2_sent_vec.tolist(),
            s1_stats=s1_stats,
            s2_stats=s2_stats,
            similarity=similarity,
            points_3d=points,
            pca_meta=pca_meta,
            search=search_res
        )

# Global singleton
nlp_engine = NLPEngine()
