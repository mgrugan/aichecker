"""Train the AI-text detector.

Pipeline:
  1. Load the Kaggle "AI vs Human Text" dataset (or any CSV with
     `text` and `generated` columns passed via --csv).
  2. Train class-conditional n-gram likelihood models on a large sample.
  3. Extract stylometric features + LLR for a balanced training sample.
  4. Fit two classifiers:
       - a depth-limited DecisionTreeClassifier (the interpretable
         "categorization tree" — exported as text for inspection)
       - a GradientBoosting ensemble of trees, probability-calibrated,
         used for the production score
  5. Evaluate on a held-out test split and save artifacts.

Usage:
    python3 backend/train.py [--csv path/to/data.csv] [--per-class 30000]
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text

from features import FEATURE_NAMES, extract_features
from likelihood import LikelihoodScorer

HERE = Path(__file__).parent
MODELS = HERE / "models"
SEED = 42


def load_dataset(csv: str | None) -> pd.DataFrame:
    if csv:
        path = csv
    else:
        import kagglehub

        root = kagglehub.dataset_download("shanegerami/ai-vs-human-text")
        path = str(Path(root) / "AI_Human.csv")
    df = pd.read_csv(path)
    df = df.dropna(subset=["text", "generated"])
    df = df[df["text"].str.split().str.len() >= 40]
    df["generated"] = df["generated"].astype(int)
    return df


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default=None, help="CSV with text,generated columns")
    ap.add_argument("--per-class", type=int, default=30_000)
    ap.add_argument("--lm-per-class", type=int, default=50_000)
    args = ap.parse_args()

    MODELS.mkdir(exist_ok=True)
    rng = np.random.RandomState(SEED)

    print("Loading dataset…")
    df = load_dataset(args.csv)
    ai = df[df.generated == 1]
    human = df[df.generated == 0]
    print(f"  {len(human):,} human / {len(ai):,} AI essays after filtering")

    # -- Split off a held-out test set FIRST so nothing leaks ----------
    ai_train, ai_test = train_test_split(ai, test_size=5_000, random_state=SEED)
    hu_train, hu_test = train_test_split(human, test_size=5_000, random_state=SEED)

    # -- 1. Likelihood models ------------------------------------------
    print("Training n-gram likelihood models…")
    t0 = time.time()
    scorer = LikelihoodScorer.train(
        ai_train.sample(min(args.lm_per_class, len(ai_train)), random_state=SEED)["text"].tolist(),
        hu_train.sample(min(args.lm_per_class, len(hu_train)), random_state=SEED)["text"].tolist(),
    )
    print(f"  done in {time.time() - t0:.1f}s")

    # -- 2. Feature matrix ---------------------------------------------
    n = args.per_class
    sample = pd.concat(
        [
            ai_train.sample(min(n, len(ai_train)), random_state=SEED),
            hu_train.sample(min(n, len(hu_train)), random_state=SEED),
        ]
    ).sample(frac=1, random_state=SEED)

    print(f"Extracting features for {len(sample):,} training docs…")
    t0 = time.time()
    X = np.array(
        [extract_features(t) + [scorer.llr(t)] for t in sample["text"]],
        dtype=np.float64,
    )
    y = sample["generated"].to_numpy()
    print(f"  done in {time.time() - t0:.1f}s")

    feature_names = FEATURE_NAMES + ["llr"]

    # -- 3. Interpretable categorization tree --------------------------
    print("Fitting decision tree (interpretable)…")
    tree = DecisionTreeClassifier(max_depth=6, min_samples_leaf=50, random_state=SEED)
    tree.fit(X, y)
    (MODELS / "tree_rules.txt").write_text(
        export_text(tree, feature_names=feature_names, max_depth=6)
    )

    # -- 4. Calibrated boosted-tree ensemble ---------------------------
    print("Fitting gradient-boosted ensemble (calibrated)…")
    gb = HistGradientBoostingClassifier(
        max_iter=400, learning_rate=0.1, max_depth=None, random_state=SEED
    )
    model = CalibratedClassifierCV(gb, method="isotonic", cv=3)
    model.fit(X, y)

    # -- 5. Evaluate on held-out test set ------------------------------
    test = pd.concat([ai_test, hu_test]).sample(frac=1, random_state=SEED)
    print(f"Evaluating on {len(test):,} held-out docs…")
    Xt = np.array(
        [extract_features(t) + [scorer.llr(t)] for t in test["text"]],
        dtype=np.float64,
    )
    yt = test["generated"].to_numpy()

    metrics = {}
    for name, clf in [("decision_tree", tree), ("ensemble", model)]:
        proba = clf.predict_proba(Xt)[:, 1]
        pred = (proba >= 0.5).astype(int)
        metrics[name] = {
            "accuracy": round(float(accuracy_score(yt, pred)), 4),
            "f1": round(float(f1_score(yt, pred)), 4),
            "roc_auc": round(float(roc_auc_score(yt, proba)), 4),
        }
        print(f"  {name}: {metrics[name]}")

    # -- 6. Save artifacts ---------------------------------------------
    joblib.dump(tree, MODELS / "decision_tree.joblib")
    joblib.dump(model, MODELS / "ensemble.joblib")
    scorer.save(MODELS / "likelihood.pkl")
    fi = getattr(tree, "feature_importances_", np.zeros(len(feature_names)))
    (MODELS / "metadata.json").write_text(
        json.dumps(
            {
                "feature_names": feature_names,
                "metrics": metrics,
                "train_docs": int(len(sample)),
                "test_docs": int(len(test)),
                "tree_feature_importances": {
                    n: round(float(v), 4) for n, v in zip(feature_names, fi)
                },
            },
            indent=2,
        )
    )
    print(f"Artifacts saved to {MODELS}/")


if __name__ == "__main__":
    main()
