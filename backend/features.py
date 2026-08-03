"""Stylometric feature extraction for AI-text detection.

Every feature is a deterministic mathematical measurement of the text —
no neural nets here. These capture the statistical fingerprints that
separate machine prose from human prose:

- Burstiness: humans vary sentence length a lot; LLMs are uncannily even.
- Lexical richness: type-token ratio, hapax rate (humans repeat less
  uniformly, and misspell).
- Punctuation and function-word distributions.
- Repetition of n-grams (LLMs re-use stock phrases).
- Readability formulas (Flesch), which are themselves pure arithmetic.
"""

from __future__ import annotations

import math
import re
from collections import Counter

# Function words whose relative frequencies are strong stylometric signals.
STOPWORDS = frozenset(
    """a about above after again all also am an and any are as at be because
    been before being below between both but by could did do does doing down
    during each few for from further had has have having he her here hers
    him his how i if in into is it its itself just me more most my myself no
    nor not now of off on once only or other our ours out over own same she
    should so some such than that the their theirs them then there these
    they this those through to too under until up very was we were what when
    where which while who whom why will with you your yours""".split()
)

# Words and phrases statistically over-represented in LLM output.
AI_MARKERS = (
    "delve", "tapestry", "furthermore", "moreover", "additionally",
    "in conclusion", "it is important to note", "it's important to note",
    "overall", "in today's", "plays a crucial role", "significant",
    "various", "crucial", "essential", "utilize", "foster", "landscape",
    "showcase", "underscore", "pivotal", "realm", "embark", "navigate",
    "firstly", "secondly", "lastly", "in summary", "ultimately",
    "furthermore,", "consequently", "therefore", "thus", "hence",
)

_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")
_WORD_RE = re.compile(r"[a-zA-Z']+")

FEATURE_NAMES = [
    "n_words",
    "n_sentences",
    "avg_word_len",
    "avg_sent_len",
    "sent_len_std",
    "burstiness",
    "type_token_ratio",
    "hapax_ratio",
    "yule_k",
    "shannon_entropy",
    "stopword_ratio",
    "comma_rate",
    "semicolon_rate",
    "colon_rate",
    "dash_rate",
    "exclaim_rate",
    "question_rate",
    "quote_rate",
    "paren_rate",
    "digit_rate",
    "upper_rate",
    "bigram_repeat_ratio",
    "trigram_repeat_ratio",
    "flesch_reading_ease",
    "ai_marker_rate",
    "long_word_ratio",
    "short_sent_ratio",
    "long_sent_ratio",
    "avg_para_len",
    "newline_rate",
]


def _syllables(word: str) -> int:
    word = word.lower()
    groups = re.findall(r"[aeiouy]+", word)
    n = len(groups)
    if word.endswith("e") and n > 1:
        n -= 1
    return max(1, n)


def extract_features(text: str) -> list[float]:
    """Map a document to a fixed-length numeric feature vector."""
    text = text.strip()
    chars = len(text) or 1

    sentences = [s for s in _SENT_SPLIT.split(text) if s.strip()]
    n_sents = len(sentences) or 1

    words = _WORD_RE.findall(text.lower())
    n_words = len(words) or 1

    word_lens = [len(w) for w in words] or [0]
    sent_lens = [len(_WORD_RE.findall(s)) for s in sentences] or [0]

    mean_sl = sum(sent_lens) / n_sents
    var_sl = sum((x - mean_sl) ** 2 for x in sent_lens) / n_sents
    std_sl = math.sqrt(var_sl)
    # Burstiness coefficient B = (sigma - mu) / (sigma + mu), in [-1, 1].
    # Human writing trends toward 0; metronomic LLM prose toward -1.
    burstiness = (std_sl - mean_sl) / (std_sl + mean_sl) if (std_sl + mean_sl) else 0.0

    counts = Counter(words)
    vocab = len(counts)
    hapax = sum(1 for c in counts.values() if c == 1)

    # Yule's K — repetitiveness of the vocabulary distribution.
    m1 = n_words
    m2 = sum(c * c for c in counts.values())
    yule_k = 10_000 * (m2 - m1) / (m1 * m1) if m1 else 0.0

    entropy = -sum(
        (c / n_words) * math.log2(c / n_words) for c in counts.values()
    )

    stop_ratio = sum(counts[w] for w in STOPWORDS if w in counts) / n_words

    bigrams = list(zip(words, words[1:]))
    trigrams = list(zip(words, words[1:], words[2:]))
    bi_repeat = 1 - (len(set(bigrams)) / len(bigrams)) if bigrams else 0.0
    tri_repeat = 1 - (len(set(trigrams)) / len(trigrams)) if trigrams else 0.0

    syll = sum(_syllables(w) for w in words)
    flesch = 206.835 - 1.015 * (n_words / n_sents) - 84.6 * (syll / n_words)

    low = text.lower()
    marker_hits = sum(low.count(m) for m in AI_MARKERS)

    paragraphs = [p for p in text.split("\n\n") if p.strip()] or [text]

    return [
        float(n_words),
        float(n_sents),
        sum(word_lens) / n_words,
        mean_sl,
        std_sl,
        burstiness,
        vocab / n_words,
        hapax / n_words,
        yule_k,
        entropy,
        stop_ratio,
        text.count(",") / n_words,
        text.count(";") / n_words,
        text.count(":") / n_words,
        (text.count("—") + text.count(" - ") + text.count("–")) / n_words,
        text.count("!") / n_sents,
        text.count("?") / n_sents,
        (text.count('"') + text.count("“") + text.count("”")) / n_sents,
        text.count("(") / n_sents,
        sum(ch.isdigit() for ch in text) / chars,
        sum(ch.isupper() for ch in text) / chars,
        bi_repeat,
        tri_repeat,
        flesch,
        marker_hits / n_words * 1000,
        sum(1 for w in words if len(w) >= 8) / n_words,
        sum(1 for s in sent_lens if s <= 8) / n_sents,
        sum(1 for s in sent_lens if s >= 30) / n_sents,
        n_words / len(paragraphs),
        text.count("\n") / n_sents,
    ]
