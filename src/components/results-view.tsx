import type { AnalysisResult } from "@/lib/api";
import { VerdictBadge } from "@/components/verdict-badge";
import { cn } from "@/lib/utils";

const VERDICT_COPY: Record<AnalysisResult["verdict"], string> = {
  human:
    "The statistical fingerprint matches human writing: varied sentence rhythm, natural vocabulary spread, and phrasing the AI language model finds comparatively improbable.",
  mixed:
    "The signals point in both directions. Parts read as human, others carry patterns common in machine text. Treat this as inconclusive rather than an accusation.",
  ai: "The statistical fingerprint matches machine generation: even sentence rhythm, uniform vocabulary, and word sequences the AI language model finds highly probable.",
};

function ProbabilityDial({ p }: { p: number }) {
  const pct = Math.round(p * 100);
  return (
    <div className="flex w-48 shrink-0 flex-col gap-2xs">
      <p className="font-mono text-data-lg font-medium text-primary">{pct}%</p>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-border"
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
    <div className="flex h-full min-h-0 flex-col gap-md animate-in fade-in duration-300 motion-reduce:animate-none">
      <h1 className="sr-only">Analysis results</h1>

      <section className="flex shrink-0 flex-wrap items-center gap-lg rounded-lg border border-border bg-surface px-lg py-md">
        <div className="flex min-w-64 flex-1 flex-col gap-xs">
          <div className="flex items-center gap-md">
            <VerdictBadge verdict={result.verdict} />
            <p className="text-caption text-secondary">
              {result.word_count.toLocaleString()} words
              {result.source !== "paste" && ` · ${result.source}`}
            </p>
          </div>
          <p className="max-w-reading-max text-body-sm leading-normal text-primary">
            {VERDICT_COPY[result.verdict]}
          </p>
        </div>
        <ProbabilityDial p={result.probability_ai} />
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-border bg-surface px-lg py-xs text-body-sm text-primary transition-colors duration-150 hover:bg-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:translate-y-px"
        >
          Analyze another
        </button>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-md lg:grid-cols-5">
        <section className="flex min-h-0 flex-col rounded-lg border border-border bg-surface p-md lg:col-span-3">
          <div className="shrink-0">
            <h2 className="font-sans text-body-lg font-semibold text-primary">
              Document, sentence by sentence
            </h2>
            <p className="text-caption text-secondary">
              {flagged === 0
                ? "No sentences lean strongly toward machine generation."
                : `${flagged} of ${result.sentences.length} sentences lean toward machine generation.`}
            </p>
          </div>
          <div className="mt-sm min-h-0 flex-1 overflow-y-auto rounded-md bg-neutral p-md leading-relaxed">
            {result.sentences.map((s, i) => (
              <span
                key={i}
                className={cn(
                  "text-body-sm",
                  s.leaning === "ai" &&
                    "bg-danger-surface text-danger underline decoration-danger/60 decoration-2 underline-offset-2",
                  s.leaning === "human" && "text-primary",
                  s.leaning === "neutral" && "text-primary/75",
                )}
              >
                {s.text}{" "}
              </span>
            ))}
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-lg border border-border bg-surface p-md lg:col-span-2">
          <h2 className="shrink-0 font-sans text-body-lg font-semibold text-primary">
            What the model measured
          </h2>
          <ul className="mt-sm flex min-h-0 flex-1 flex-col gap-sm overflow-y-auto">
            {result.evidence.map((e) => (
              <li key={e.key} className="flex flex-col gap-px">
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
    </div>
  );
}
