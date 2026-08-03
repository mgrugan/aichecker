export type Verdict = "ai" | "human" | "mixed";

export interface SentenceScore {
  text: string;
  llr: number;
  leaning: "ai" | "human" | "neutral";
}

export interface Evidence {
  key: string;
  label: string;
  value: number;
  signal: "ai" | "human";
  description: string;
}

export interface AnalysisResult {
  verdict: Verdict;
  probability_ai: number;
  tree_probability_ai: number;
  confidence: number;
  word_count: number;
  source: string;
  sentences: SentenceScore[];
  evidence: Evidence[];
  model: {
    ensemble_accuracy: number;
    ensemble_auc: number;
  };
}

async function handle(res: Response): Promise<AnalysisResult> {
  if (!res.ok) {
    let detail = `Analysis failed (${res.status}).`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      // keep default message
    }
    throw new Error(detail);
  }
  return res.json();
}

export function analyzeText(text: string): Promise<AnalysisResult> {
  return fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).then(handle);
}

export function analyzeFile(file: File): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("file", file);
  return fetch("/api/analyze-file", { method: "POST", body: form }).then(handle);
}
