"""Class-conditional n-gram language models.

Two smoothed language models are trained — one on human essays, one on
AI essays. For a new document we compute the average per-token
log-likelihood under each model; the difference is the log-likelihood
ratio (LLR):

    LLR(doc) = log P(doc | AI) - log P(doc | human)

A positive LLR means the token sequence is more probable under the AI
model. This is a pure probability/likelihood method (naive-Bayes style),
independent of the tree classifier, and it doubles as a sentence-level
scorer for evidence highlighting.
"""

from __future__ import annotations

import math
import pickle
import re
from collections import Counter
from pathlib import Path

_WORD_RE = re.compile(r"[a-zA-Z']+")
_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")

BOS = "<s>"
UNK = "<unk>"


def tokenize(text: str) -> list[str]:
    return _WORD_RE.findall(text.lower())


class NgramModel:
    """Add-k smoothed unigram + bigram model with interpolation."""

    def __init__(self, vocab_size_cap: int = 60_000, k: float = 0.1, lam: float = 0.7):
        self.k = k
        self.lam = lam  # weight on bigram vs unigram
        self.cap = vocab_size_cap
        self.unigrams: Counter[str] = Counter()
        self.bigrams: Counter[tuple[str, str]] = Counter()
        self.total = 0
        self.vocab: set[str] = set()

    def fit(self, docs: list[str]) -> "NgramModel":
        raw_uni: Counter[str] = Counter()
        raw_bi: Counter[tuple[str, str]] = Counter()
        for doc in docs:
            toks = tokenize(doc)
            raw_uni.update(toks)
            raw_bi.update(zip([BOS] + toks[:-1], toks))
        self.vocab = {w for w, _ in raw_uni.most_common(self.cap)}

        def norm(w: str) -> str:
            return w if w in self.vocab or w == BOS else UNK

        self.unigrams = Counter()
        for w, c in raw_uni.items():
            self.unigrams[norm(w)] += c
        self.bigrams = Counter()
        for (w1, w2), c in raw_bi.items():
            self.bigrams[(norm(w1), norm(w2))] += c
        self.total = sum(self.unigrams.values())
        return self

    def _p_uni(self, w: str) -> float:
        v = len(self.vocab) + 1
        return (self.unigrams.get(w, 0) + self.k) / (self.total + self.k * v)

    def _p_bi(self, w1: str, w2: str) -> float:
        v = len(self.vocab) + 1
        c1 = self.unigrams.get(w1, 0) if w1 != BOS else self.total // max(1, len(self.bigrams))
        return (self.bigrams.get((w1, w2), 0) + self.k) / (c1 + self.k * v)

    def logprob_per_token(self, text: str) -> float:
        toks = tokenize(text)
        if not toks:
            return 0.0
        toks = [t if t in self.vocab else UNK for t in toks]
        lp = 0.0
        prev = BOS
        for t in toks:
            p = self.lam * self._p_bi(prev, t) + (1 - self.lam) * self._p_uni(t)
            lp += math.log(p)
            prev = t
        return lp / len(toks)


class LikelihoodScorer:
    """Pair of class-conditional models producing log-likelihood ratios."""

    def __init__(self, ai_model: NgramModel, human_model: NgramModel):
        self.ai = ai_model
        self.human = human_model

    @classmethod
    def train(cls, ai_docs: list[str], human_docs: list[str]) -> "LikelihoodScorer":
        return cls(NgramModel().fit(ai_docs), NgramModel().fit(human_docs))

    def llr(self, text: str) -> float:
        return self.ai.logprob_per_token(text) - self.human.logprob_per_token(text)

    def sentence_llrs(self, text: str) -> list[tuple[str, float]]:
        out = []
        for sent in _SENT_SPLIT.split(text.strip()):
            if len(tokenize(sent)) >= 4:
                out.append((sent, self.llr(sent)))
        return out

    def save(self, path: str | Path) -> None:
        with open(path, "wb") as f:
            pickle.dump(self, f, protocol=pickle.HIGHEST_PROTOCOL)

    @staticmethod
    def load(path: str | Path) -> "LikelihoodScorer":
        with open(path, "rb") as f:
            return pickle.load(f)
