# AI Checker

An AI-writing detector. Paste text or upload a document (.txt, .md, .docx,
.pdf) and a statistical model reports how likely the text is to be
machine-generated, with sentence-level evidence.

## How detection works

No neural networks are involved; the detector is built from classical,
inspectable math:

1. **Stylometric features** (`backend/features.py`) — 30 deterministic
   measurements per document: sentence-length burstiness, vocabulary
   richness (type-token ratio, hapax rate, Yule's K), Shannon entropy,
   function-word and punctuation distributions, n-gram repetition,
   Flesch reading ease, and the density of stock AI phrasing.
2. **Likelihood ratio** (`backend/likelihood.py`) — two smoothed
   unigram+bigram language models, one trained on human essays and one on
   AI essays. The average per-token log-likelihood ratio
   `log P(text | AI) − log P(text | human)` is both a feature and the
   sentence-level evidence highlighter.
3. **Categorization trees** (`backend/train.py`) — a depth-limited
   `DecisionTreeClassifier` (human-readable rules exported to
   `backend/models/tree_rules.txt`) plus a calibrated
   `HistGradientBoostingClassifier` ensemble that produces the production
   probability.

Training data: the [AI vs Human Text](https://www.kaggle.com/datasets/shanegerami/ai-vs-human-text)
corpus (~487k essays). Metrics on a held-out 10k-essay test split are in
`backend/models/metadata.json`.

## Running locally

Backend (Python 3.11+):

```bash
pip install -r backend/requirements.txt
cd backend && uvicorn app:app --port 8000
```

Frontend (Node 20+):

```bash
npm install
npm run dev          # Vite dev server on :5173, proxies /api to :8000
```

## Retraining

```bash
python3 backend/train.py                  # downloads the Kaggle dataset
python3 backend/train.py --csv my.csv     # or any CSV with text,generated columns
```

## Design system

The UI is governed by [`DESIGN.md`](./DESIGN.md) (Google design.md token
standard). Lint it with `npm run design:lint`; regenerate the Tailwind
theme with `npm run design:theme`.
