import type { AnalysisResult } from "@/lib/api";
import { VerdictBadge } from "@/components/verdict-badge";
import { cn } from "@/lib/utils";

const VERDICT_COPY: Record<AnalysisResult["verdict"], string> = {
  human:
    "The statistical fingerprint of this document matches human writing: varied sentence rhythm, natural vocabulary spread, and phrasing that the AI language model finds comparatively improbable.",
  mixed:
    "The signals point in both directions. Parts of this document read as human, others carry patterns common in machine text. Treat this as inconclusive rather than an accusation.",
  ai: "The statistical fingerprint of this document matches machine generation: even sentence rhythm, uniform vocabulary, and word sequences the AI language model finds highly probable.",
};

function ProbabilityDial({ p }: { p: number }) {
  const pct = Math.round(p * 100);
  return (
    <div className="flex flex-col gap-xs">
      <p className="font-mono text-data-lg font-medium text-primary">{pct}%</p>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-neutral"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Probability the text is AI-generated"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            pct >= 80 ? "bg-danger" : pct <= 20 ? "bg-success" : "bg-warning",
          )}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
      <p className="text-caption text-secondary">probability of AI generation</p>
    </div>
  );
}

export function ResultsView({
  result,
  onReset,
}: {
  result: AnalysisResult;
  onReset: () => void;
}) {
  const flagged = result.sentences.filter((s) => s.leaning === "ai").length;

  return (
    <div className="flex w-full flex-col gap-lg animate-in fade-in duration-300">
      <section className="rounded-lg border border-border bg-surface p-lg">
        <div className="flex flex-wrap items-start justify-between gap-lg">
          <div className="flex min-w-56 flex-1 flex-col gap-md">
            <VerdictBadge verdict={result.verdict} />
            <p className="max-w-reading-max text-body-lg leading-relaxed text-primary">
              {VERDICT_COPY[result.verdict]}
            </p>
            <p className="text-body-sm text-secondary">
              {result.word_count.toLocaleString()} words analyzed
              {result.source !== "paste" && ` from ${result.source}`}. Ensemble
              accuracy {Math.round(result.model.ensemble_accuracy * 1000) / 10}%
              on held-out essays. No detector is proof; use this as one signal
              among others.
            </p>
          </div>
          <div className="w-56">
            <ProbabilityDial p={result.probability_ai} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-lg lg:grid-cols-5">
        <section className="rounded-lg border border-border bg-surface p-lg lg:col-span-3">
          <h2 className="font-sans text-h3 font-semibold text-primary">
            Document, sentence by sentence
          </h2>
          <p className="mt-2xs text-body-sm text-secondary">
            {flagged === 0
              ? "No sentences lean strongly toward machine generation."
              : `${flagged} of ${result.sentences.length} sentences lean toward machine generation.`}
          </p>
          <div className="mt-md max-h-96 overflow-y-auto rounded-md bg-neutral p-md leading-relaxed">
            {result.sentences.map((s, i) => (
              <span
                key={i}
                className={cn(
                  "text-body-md",
                  s.leaning === "ai" &&
                    "bg-danger-surface text-danger underline decoration-danger/60 decoration-2 underline-offset-2",
                  s.leaning === "human" && "text-primary",
                  s.leaning === "neutral" && "text-primary/80",
                )}
              >
                {s.text}{" "}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-lg lg:col-span-2">
          <h2 className="font-sans text-h3 font-semibold text-primary">
            What the model measured
          </h2>
          <ul className="mt-md flex flex-col gap-md">
            {result.evidence.map((e) => (
              <li key={e.key} className="flex flex-col gap-2xs">
                <div className="flex items-baseline justify-between gap-md">
                  <p className="text-body-sm font-medium text-primary">{e.label}</p>
                  <p
                    className={cn(
                      "font-mono text-data-md",
                      e.signal === "ai" ? "text-danger" : "text-success",
                    )}
                  >
                    {e.value}
                  </p>
                </div>
                <p className="text-caption leading-normal text-secondary">
                  {e.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-border bg-surface px-lg py-sm text-body-md text-primary transition-colors duration-150 hover:bg-success-surface active:translate-y-px"
        >
          Analyze another document
        </button>
      </div>
    </div>
  );
}
