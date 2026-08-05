import { useState } from "react";
import { AnalyzeForm } from "@/components/analyze-form";
import { DriftingShapes } from "@/components/drifting-shapes";
import { GeometricLoader } from "@/components/geometric-loader";
import { ResultsView } from "@/components/results-view";
import { analyzeFile, analyzeText, type AnalysisResult } from "@/lib/api";

type Phase = "idle" | "analyzing" | "done";

const MIN_LOADING_MS = 3000;

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (job: Promise<AnalysisResult>) => {
    setPhase("analyzing");
    setError(null);
    const minDelay = new Promise((r) => setTimeout(r, MIN_LOADING_MS));
    try {
      const [res] = await Promise.all([job, minDelay]);
      setResult(res);
      setPhase("done");
    } catch (e) {
      await minDelay;
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setPhase("idle");
    }
  };

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      {phase !== "analyzing" && <DriftingShapes />}
      <header className="relative shrink-0 border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-content-max items-center justify-between px-lg">
          <p className="font-serif text-h3 font-medium text-primary">AI Checker</p>
          <p className="font-mono text-label-caps uppercase tracking-label-caps text-secondary">
            Writing provenance analysis
          </p>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-content-max flex-1 flex-col overflow-hidden px-lg py-md">
        {phase === "idle" && (
          <div className="flex h-full min-h-0 flex-col gap-md">
            <div className="shrink-0 pt-xs">
              <h1 className="font-serif text-h2 leading-tight tracking-h1 text-primary">
                Was this written by a person?
              </h1>
              <p className="mt-2xs max-w-reading-max text-body-md leading-normal text-secondary">
                Paste text or upload a document. A statistical model trained on
                490,000 essays reads its rhythm, vocabulary, and phrasing, then
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

        {phase === "analyzing" && <GeometricLoader />}

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

      <footer className="relative shrink-0 border-t border-border">
        <div className="mx-auto flex h-10 w-full max-w-content-max items-center justify-between gap-md px-lg">
          <p className="truncate text-caption text-secondary">
            Decision-tree ensemble over 30 stylometric measurements and n-gram
            likelihood ratios.
          </p>
          <p className="font-mono text-caption text-secondary">AI Checker</p>
        </div>
      </footer>
    </div>
  );
}
