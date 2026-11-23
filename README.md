# Embedding Explorer — Interactive NLP Visualization Platform

An interactive, modern educational platform designed for computer science students to visually explore how Large Language Models (LLMs) and Transformer architectures process human text, convert sentences into high-dimensional numerical vectors (embeddings), and calculate semantic similarity.

![Embedding Explorer](https://img.shields.io/badge/Model-sentence--transformers%2Fall--MiniLM--L6--v2-blue)
![Dimensions](https://img.shields.io/badge/Dimensions-384--D%20Float32-cyan)
![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20PyTorch-emerald)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Plotly%203D%20%2B%20Tailwind-purple)

---

## Architecture Overview

Embedding Explorer is a unified single-page dashboard featuring four tightly coupled sections:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SECTION 1: Sentence Embedding Generator             │
│  • Sentence 1 Input ➔ PyTorch all-MiniLM-L6-v2 ➔ Real 384-D Vector     │
│  • Vector statistics (Min, Max, Mean, Std, Unit L2 Norm)               │
│  • Interactive 384-dimensional tensor inspector                        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│              SECTION 2: Tokenization & Subword Character Counter       │
│  • Sentence 2 Input ➔ WordPiece Tokenizer (Vocabulary size 30,522)     │
│  • Subword detection (##prefixes), punctuation tokens, special tokens  │
│  • Colored chips showing token IDs and character offset ranges         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│          SECTION 3: Interactive 3D Embedding Visualization (PCA)       │
│  • Sentence 1 (Blue Diamond) vs Sentence 2 (Green Diamond) centroids   │
│  • Contextual token clouds for each sentence in shared coordinate frame│
│  • Cosine Similarity calculated on ORIGINAL 384-dimensional vectors    │
│  • Percentage-style similarity indicator (aligned directional scale)   │
│  • Euclidean distance and subtended angle (degrees)                    │
│  • Orbit, zoom, pan, and perspective/top/side camera presets           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│              SECTION 4: Word Search & Dynamic Token Highlighting       │
│  • Query word search across both sentences                             │
│  • Matching tokens highlighted in vibrant RED in 3D visualization      │
│  • Matching words highlighted in the raw text with red glow marks      │
│  • Clear ownership feedback (Found in S1, S2, Both, or Neither)        │
│  • Educational distinction: Sentence-level vs Token-level embeddings   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Machine Learning & Mathematical Fundamentals

### 1. Pretrained Transformer Model
- **Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Architecture**: 6-layer BERT-style Transformer, 12 attention heads, hidden size $d = 384$.
- **Token Vocabulary**: 30,522 WordPiece subwords.

### 2. Sentence-Level vs. Token-Level Embeddings
- **Token Embeddings**: The transformer outputs a contextual hidden state vector $\mathbf{h}_i \in \mathbb{R}^{384}$ for every token in the sequence. Even identical words (like "bank" in "river bank" vs "bank account") receive distinct contextual vectors.
- **Sentence Embedding**: Formed via **Mean Pooling** over all valid token vectors (weighted by attention mask), followed by unit L2 normalization:
  $$\mathbf{u} = \frac{\sum_{i=1}^N \mathbf{h}_i \cdot m_i}{\sum_{i=1}^N m_i}, \quad \hat{\mathbf{u}} = \frac{\mathbf{u}}{\|\mathbf{u}\|_2}$$

### 3. Cosine Similarity & Distance
Calculated strictly on the **original 384-dimensional vectors**, not on the reduced 3D coordinates:
$$\text{Cosine Similarity}(\hat{\mathbf{u}}, \hat{\mathbf{v}}) = \hat{\mathbf{u}} \cdot \hat{\mathbf{v}} = \cos(\theta)$$
$$\text{Euclidean Distance} = \|\hat{\mathbf{u}} - \hat{\mathbf{v}}\|_2 = \sqrt{2 - 2 \cos(\theta)}$$
$$\theta = \arccos(\text{clip}(\text{Cosine Similarity}, -1.0, 1.0))$$

### 4. Dimensionality Reduction (PCA)
- High-dimensional vectors inhabit $\mathbb{R}^{384}$.
- **Principal Component Analysis (PCA)** performs an optimal linear transformation to identify the 3 orthogonal axes of maximum variance across all sentence centroids and token points.
- The user interface explicitly clarifies that PC axes do *not* have human-interpretable meanings (like "sentiment").

---

## Quick Start

### 1. Launch the Application
Simply run:
```bash
./run.sh
```
Or start manually:
```bash
.venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

Open your browser to:
[http://localhost:8000](http://localhost:8000)

### 2. Development Mode (Optional)
If modifying the frontend with hot-module reload:
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

---

## Pre-Loaded Educational Demonstration Presets
Click any of the instant preset buttons at the top of the page:
1. **High Similarity (Paraphrases with Different Words)**:
   - S1: *"The quick brown fox jumps over the lazy dog."*
   - S2: *"A speedy amber canine leaps past a sleepy hound."*
   - Demonstrates that completely distinct vocabularies achieve high cosine similarity (~0.75-0.85).
2. **Related Domain (Astrophysics & Space Science)**:
   - S1: *"The astronaut conducted experiments aboard the international space station."*
   - S2: *"Modern telescopes observe distant galaxies and cosmic radiation in deep space."*
3. **Unrelated Topics (Culinary vs Quantum Physics)**:
   - S1: *"The pastry chef baked fresh sourdough bread and decorated chocolate pastries in the bakery."*
   - S2: *"Quantum computers leverage superposition and entanglement to execute complex algorithms."*
   - Demonstrates near-orthogonal vectors with low cosine similarity.
4. **Opposite Meaning (Bright Sunlight vs Heavy Storm)**:
   - S1: *"The sun is shining brightly and the summer sky is completely clear and warm."*
   - S2: *"A dark torrential thunderstorm is pouring cold rain across the flooded streets."*
5. **Polysemy / Lexical Ambiguity (The word 'bank')**:
   - S1: *"Wildflowers and green moss grew along the muddy river bank."*
   - S2: *"She deposited the paycheck into her savings account at the commercial bank."*
   - Highlights how the same word produces different contextual token embeddings.
