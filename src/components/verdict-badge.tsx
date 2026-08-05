import type { Verdict } from "@/lib/api";
import { cn } from "@/lib/utils";

const STYLES: Record<Verdict, string> = {
  human: "bg-success-surface text-success",
  mixed: "bg-warning-surface text-warning",
  ai: "bg-danger-surface text-danger",
};

const LABELS: Record<Verdict, string> = {
  human: "Likely human",
  mixed: "Mixed signals",
  ai: "Likely AI",
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-sm py-2xs font-mono text-label-caps font-normal uppercase tracking-label-caps",
        STYLES[verdict],
      )}
    >
      {LABELS[verdict]}
    </span>
  );
}
