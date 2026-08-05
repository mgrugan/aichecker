import { useRef, useState } from "react";
import { LiquidMetalButton } from "@/components/liquid-metal-button";
import { cn } from "@/lib/utils";

const MIN_WORDS = 40;

interface AnalyzeFormProps {
  onAnalyzeText: (text: string) => void;
  onAnalyzeFile: (file: File) => void;
  error: string | null;
}

export function AnalyzeForm({ onAnalyzeText, onAnalyzeFile, error }: AnalyzeFormProps) {
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const ready = words >= MIN_WORDS;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onAnalyzeFile(file);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-sm">
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col rounded-lg border bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-colors duration-150 focus-within:border-accent/50 focus-within:ring-[3px] focus-within:ring-accent/10",
          dragging ? "border-accent/70 bg-white/[0.09]" : "border-white/10",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <label htmlFor="essay" className="sr-only">
          Text to analyze
        </label>
        <textarea
          id="essay"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the text you want to examine, at least 40 words…"
          className="min-h-0 w-full flex-1 resize-none rounded-lg bg-transparent p-md text-body-md leading-relaxed text-primary placeholder:text-secondary focus:outline-none"
        />
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-sm border-t border-white/10 px-md py-xs">
          <p className="font-mono text-data-md text-secondary">
            {words.toLocaleString()} {words === 1 ? "word" : "words"}
            {words > 0 && !ready && (
              <span className="text-warning"> ({MIN_WORDS} minimum)</span>
            )}
          </p>
          <div className="flex items-center gap-md">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="rounded-full border border-border bg-surface px-md py-xs text-body-sm text-primary transition-colors duration-150 hover:bg-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:translate-y-px"
            >
              Upload a document
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".txt,.md,.docx,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onAnalyzeFile(file);
                e.target.value = "";
              }}
            />
            <LiquidMetalButton
              label="Run analysis"
              onClick={() => ready && onAnalyzeText(text)}
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-md">
        <p className="text-caption text-secondary">
          Accepts pasted text or .txt, .md, .docx, and .pdf files. Drag a file
          anywhere onto the panel.
        </p>
        {error && (
          <p role="alert" className="rounded-md bg-danger-surface px-sm py-2xs text-body-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
