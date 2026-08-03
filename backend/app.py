"""AI Checker API.

POST /api/analyze        {"text": "..."}          → verdict JSON
POST /api/analyze-file   multipart file upload    → verdict JSON
GET  /api/health         model + metrics info

Run:  uvicorn app:app --port 8000   (from the backend/ directory)
"""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from extract import ExtractionError, extract_text
from features import FEATURE_NAMES, extract_features
from likelihood import LikelihoodScorer

HERE = Path(__file__).parent
MODELS = HERE / "models"

MIN_WORDS = 40
MAX_CHARS = 200_000

app = FastAPI(title="AI Checker API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_ensemble = joblib.load(MODELS / "ensemble.joblib")
_tree = joblib.load(MODELS / "decision_tree.joblib")
_scorer = LikelihoodScorer.load(MODELS / "likelihood.pkl")
_meta = json.loads((MODELS / "metadata.json").read_text())

class AnalyzeRequest(BaseModel):
    text: str


def _verdict(p_ai: float) -> str:
    if p_ai >= 0.80:
        return "ai"
    if p_ai <= 0.20:
        return "human"
    return "mixed"


def _analyze(text: str, source: str) -> dict:
    text = text.strip()
    words = len(text.split())
    if words < MIN_WORDS:
        raise HTTPException(
            status_code=422,
            detail=f"Please provide at least {MIN_WORDS} words for a reliable analysis (got {words}).",
        )
    if len(text) > MAX_CHARS:
        text = text[:MAX_CHARS]

    llr = _scorer.llr(text)
    x = np.array([extract_features(text) + [llr]], dtype=np.float64)
    p_ai = float(_ensemble.predict_proba(x)[0, 1])
    tree_p = float(_tree.predict_proba(x)[0, 1])

    names = FEATURE_NAMES + ["llr"]
    values = dict(zip(names, x[0].tolist()))

    sent_scores = _scorer.sentence_llrs(text)
    sentences = [
        {"text": s, "llr": round(v, 3), "leaning": "ai" if v > 0.5 else ("human" if v < -0.5 else "neutral")}
        for s, v in sent_scores
    ]

    evidence = [
        {
            "key": "llr",
            "label": "Phrase likelihood",
            "value": round(llr, 3),
            "signal": "ai" if llr > 0 else "human",
            "description": "How much more probable the word sequences are under the AI language model than the human one.",
        },
        {
            "key": "burstiness",
            "label": "Sentence rhythm",
            "value": round(values["burstiness"], 3),
            "signal": "ai" if values["burstiness"] < -0.25 else "human",
            "description": "Variation in sentence length. Human writing is bursty; AI prose tends to be uncannily even.",
        },
        {
            "key": "type_token_ratio",
            "label": "Vocabulary variety",
            "value": round(values["type_token_ratio"], 3),
            "signal": "ai" if values["type_token_ratio"] < 0.38 else "human",
            "description": "Share of distinct words in the document.",
        },
        {
            "key": "ai_marker_rate",
            "label": "Stock AI phrasing",
            "value": round(values["ai_marker_rate"], 2),
            "signal": "ai" if values["ai_marker_rate"] > 6 else "human",
            "description": "Density (per 1,000 words) of phrases statistically over-represented in AI output.",
        },
        {
            "key": "sent_len_std",
            "label": "Sentence length spread",
            "value": round(values["sent_len_std"], 2),
            "signal": "ai" if values["sent_len_std"] < 6 else "human",
            "description": "Standard deviation of sentence lengths.",
        },
    ]

    return {
        "verdict": _verdict(p_ai),
        "probability_ai": round(p_ai, 4),
        "tree_probability_ai": round(tree_p, 4),
        "confidence": round(abs(p_ai - 0.5) * 2, 4),
        "word_count": words,
        "source": source,
        "sentences": sentences,
        "evidence": evidence,
        "model": {
            "ensemble_accuracy": _meta["metrics"]["ensemble"]["accuracy"],
            "ensemble_auc": _meta["metrics"]["ensemble"]["roc_auc"],
        },
    }


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "metrics": _meta["metrics"], "train_docs": _meta["train_docs"]}


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest) -> dict:
    return _analyze(req.text, source="paste")


@app.post("/api/analyze-file")
async def analyze_file(file: UploadFile = File(...)) -> dict:
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (10 MB max).")
    try:
        text = extract_text(file.filename or "upload.txt", data)
    except ExtractionError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    return _analyze(text, source=file.filename or "upload")
