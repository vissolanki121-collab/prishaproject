from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from typing import List, Dict, Any
from .models import (
    SentenceEmbedRequest, SentenceEmbedResponse,
    TokenizeRequest, TokenizeResponse,
    AnalyzePairRequest, AnalyzePairResponse
)
from .nlp_engine import nlp_engine, MODEL_NAME

app = FastAPI(
    title="Embedding Explorer API",
    description="Educational NLP Backend providing real sentence embeddings, tokenization, cosine similarity, and 3D PCA coordinates.",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRESETS = [
    {
        "id": "paraphrase",
        "title": "High Similarity (Paraphrases with Different Words)",
        "sentence1": "The quick brown fox jumps over the lazy dog.",
        "sentence2": "A speedy amber canine leaps past a sleepy hound.",
        "searchTerm": "dog",
        "description": "Notice how completely different vocabulary achieves very high semantic similarity because the underlying conceptual scene is identical."
    },
    {
        "id": "space_science",
        "title": "Related Domain (Astrophysics & Space Exploration)",
        "sentence1": "The astronaut conducted experiments aboard the international space station.",
        "sentence2": "Modern telescopes observe distant galaxies and cosmic radiation in deep space.",
        "searchTerm": "space",
        "description": "These sentences share thematic context (space exploration, science) while describing different specific actions."
    },
    {
        "id": "unrelated",
        "title": "Unrelated Topics (Culinary vs Quantum Physics)",
        "sentence1": "The pastry chef baked fresh sourdough bread and decorated chocolate pastries in the bakery.",
        "sentence2": "Quantum computers leverage superposition and entanglement to execute complex algorithms.",
        "searchTerm": "chef",
        "description": "Zero conceptual overlap; embeddings point in nearly orthogonal directions with very low cosine similarity."
    },
    {
        "id": "contradiction",
        "title": "Opposite Meaning (Bright Sunlight vs Heavy Storm)",
        "sentence1": "The sun is shining brightly and the summer sky is completely clear and warm.",
        "sentence2": "A dark torrential thunderstorm is pouring cold rain across the flooded streets.",
        "searchTerm": "sun",
        "description": "Both describe weather conditions (similar broad domain), but their semantic vectors diverge in tone and state."
    },
    {
        "id": "polysemy",
        "title": "Polysemy / Lexical Ambiguity (The word 'bank')",
        "sentence1": "Wildflowers and green moss grew along the muddy river bank.",
        "sentence2": "She deposited the paycheck into her savings account at the commercial bank.",
        "searchTerm": "bank",
        "description": "The exact same word 'bank' appears in both sentences, but with completely different meanings (riverbank vs financial institution)."
    }
]

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "model": MODEL_NAME,
        "dimensions": nlp_engine.dimensions,
        "device": "cpu"
    }

@app.get("/api/presets")
def get_presets():
    return PRESETS

@app.post("/api/embed-sentence", response_model=SentenceEmbedResponse)
def embed_sentence_endpoint(req: SentenceEmbedRequest):
    try:
        embedding, stats, preview = nlp_engine.embed_sentence(req.text)
        return SentenceEmbedResponse(
            text=req.text,
            dimensions=nlp_engine.dimensions,
            embedding=embedding,
            stats=stats,
            sample_preview=preview
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding error: {str(e)}")

@app.post("/api/tokenize", response_model=TokenizeResponse)
def tokenize_endpoint(req: TokenizeRequest):
    try:
        tokens = nlp_engine.tokenize_sentence(req.text)
        words = req.text.strip().split() if req.text.strip() else []
        return TokenizeResponse(
            text=req.text,
            char_count=len(req.text),
            word_count=len(words),
            token_count=len(tokens),
            tokens=tokens,
            model_name=MODEL_NAME
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tokenization error: {str(e)}")

@app.post("/api/analyze-pair", response_model=AnalyzePairResponse)
def analyze_pair_endpoint(req: AnalyzePairRequest):
    try:
        s1 = req.sentence1.strip() or " "
        s2 = req.sentence2.strip() or " "
        response = nlp_engine.analyze_pair(s1, s2, req.search_term or "")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

# Mount frontend production build if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

