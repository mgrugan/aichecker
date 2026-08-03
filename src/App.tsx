import { useState } from "react";
import { ThinkingOrb } from "thinking-orbs";
import { AnalyzeForm } from "@/components/analyze-form";
import { ResultsView } from "@/components/results-view";
import { analyzeFile, analyzeText, type AnalysisResult } from "@/lib/api";

type Phase = "idle" | "analyzing" | "done";

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (job: Promise<AnalysisResult>) => {
    setPhase("analyzing");
    setError(null);
    try {
      const res = await job;
      setResult(res);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setPhase("idle");
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 w-full max-w-content-max items-center justify-between px-margin">
          <p className="font-serif text-h3 font-medium text-primary">AI Checker</p>
          <p className="font-mono text-label-caps uppercase tracking-label-caps text-secondary">
            Writing provenance analysis
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-content-max flex-1 flex-col px-margin py-xl">
        {phase === "idle" && (
          <div className="flex flex-col gap-xl">
            <div className="flex max-w-reading-max flex-col gap-sm pt-lg">
              <h1 className="font-serif text-h1 leading-tight tracking-h1 text-primary">
                Was this written by a person?
              </h1>
              <p className="text-body-lg leading-relaxed text-secondary">
                Paste text or upload a document. A statistical model trained on
                487,000 essays reads its rhythm, vocabulary, and phrasing, then
                reports the evidence.
              </p>
            </div>
            <AnalyzeForm
              onAnalyzeText={(t) => run(analyzeText(t))}
              onAnalyzeFile={(f) => run(analyzeFile(f))}
              error={error}
            />
          </div>
        )}

        {phase === "analyzing" && (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-1 flex-col items-center justify-center gap-lg py-2xl"
          >
            <div aria-hidden="true">
              <ThinkingOrb state="searching" size={64} />
            </div>
            <div className="flex flex-col items-center gap-2xs text-center">
              <p className="text-body-lg text-primary">Reading the document…</p>
              <p className="text-body-sm text-secondary">
                Measuring sentence rhythm, vocabulary, and phrase likelihood.
              </p>
            </div>
          </div>
        )}

        {phase === "done" && result && (
          <ResultsView
            result={result}
            onReset={() => {
              setResult(null);
              setPhase("idle");
            }}
          />
        )}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-content-max flex-wrap items-center justify-between gap-md px-margin py-lg">
          <p className="text-caption text-secondary">
            Decision-tree ensemble over 30 stylometric measurements and n-gram
            likelihood ratios. Trained on the AI vs Human Text corpus.
          </p>
          <p className="font-mono text-caption text-secondary">AI Checker</p>
        </div>
      </footer>
    </div>
  );
}
