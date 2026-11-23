from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
import uvicorn
import numpy as np
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModel
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
import torch

# Global model references
model = None
tokenizer = None
transformer_model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, tokenizer, transformer_model
    model = SentenceTransformer("all-MiniLM-L6-v2")
    tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
    transformer_model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic models ---

class SentenceRequest(BaseModel):
    sentence: str


class TwoSentenceRequest(BaseModel):
    sentence1: str
    sentence2: str


class WordSearchRequest(BaseModel):
    word: str
    sentence1: str
    sentence2: str


# --- Endpoints ---

@app.get("/api/health")
def health():
    return {"status": "ok", "model": "all-MiniLM-L6-v2"}


@app.post("/api/embed")
def embed(req: SentenceRequest):
    if not req.sentence.strip():
        raise HTTPException(status_code=400, detail="sentence must not be empty")
    embedding = model.encode([req.sentence], show_progress_bar=False)[0]
    return {"embedding": embedding.tolist(), "dimensions": len(embedding)}


@app.post("/api/tokenize")
def tokenize(req: SentenceRequest):
    if not req.sentence.strip():
        raise HTTPException(status_code=400, detail="sentence must not be empty")
    encoded = tokenizer(req.sentence, return_tensors="pt", add_special_tokens=True)
    tokens = tokenizer.convert_ids_to_tokens(encoded["input_ids"][0].tolist())
    return {
        "tokens": tokens,
        "token_ids": encoded["input_ids"][0].tolist(),
        "count": len(tokens),
        "char_count": len(req.sentence),
    }


@app.post("/api/visualize")
def visualize(req: TwoSentenceRequest):
    if not req.sentence1.strip() or not req.sentence2.strip():
        raise HTTPException(status_code=400, detail="Both sentences must not be empty")
    emb1 = model.encode([req.sentence1])[0]
    emb2 = model.encode([req.sentence2])[0]
    cos_sim = float(cosine_similarity([emb1], [emb2])[0][0])
    euc_dist = float(np.linalg.norm(emb1 - emb2))
    matrix = np.vstack([emb1, emb2])
    if req.sentence1 == req.sentence2:
        matrix[1] += np.random.normal(0, 0.001, matrix[1].shape)
    coords = PCA(n_components=3).fit_transform(matrix)
    return {
        "sentence1_3d": coords[0].tolist(),
        "sentence2_3d": coords[1].tolist(),
        "cosine_similarity": cos_sim,
        "euclidean_distance": euc_dist,
        "sentence1_embedding": emb1.tolist(),
        "sentence2_embedding": emb2.tolist(),
    }


@app.post("/api/token_embeddings")
def token_embeddings(req: SentenceRequest):
    if not req.sentence.strip():
        raise HTTPException(status_code=400, detail="sentence must not be empty")
    encoded = tokenizer(req.sentence, return_tensors="pt", add_special_tokens=True)
    tokens = tokenizer.convert_ids_to_tokens(encoded["input_ids"][0].tolist())
    with torch.no_grad():
        outputs = transformer_model(**encoded, output_hidden_states=True)
    last_hidden = outputs.hidden_states[-1][0].numpy()  # [n_tokens, 384]
    n = len(tokens)
    n_components = min(3, n, last_hidden.shape[1])
    if n >= 2:
        pca = PCA(n_components=n_components)
        coords_reduced = pca.fit_transform(last_hidden)
        if n_components < 3:
            padding = np.zeros((n, 3 - n_components))
            coords_reduced = np.hstack([coords_reduced, padding])
    else:
        coords_reduced = np.zeros((1, 3))
    return {
        "tokens": tokens,
        "embeddings_3d": coords_reduced.tolist(),
        "token_ids": encoded["input_ids"][0].tolist(),
    }


@app.post("/api/word_search")
def word_search(req: WordSearchRequest):
    word_lower = req.word.lower()

    def find_in_sentence(sentence, wl):
        encoded = tokenizer(sentence, return_tensors="pt", add_special_tokens=True)
        tokens = tokenizer.convert_ids_to_tokens(encoded["input_ids"][0].tolist())
        matching_indices = [
            i for i, t in enumerate(tokens)
            if wl in t.lower().replace("##", "").replace("▁", "")
        ]
        return tokens, matching_indices

    tokens1, indices1 = find_in_sentence(req.sentence1, word_lower)
    tokens2, indices2 = find_in_sentence(req.sentence2, word_lower)
    return {
        "word": req.word,
        "found_in_sentence1": len(indices1) > 0,
        "found_in_sentence2": len(indices2) > 0,
        "sentence1_token_indices": indices1,
        "sentence2_token_indices": indices2,
        "sentence1_tokens": tokens1,
        "sentence2_tokens": tokens2,
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
