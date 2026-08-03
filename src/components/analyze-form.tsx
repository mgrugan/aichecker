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
    <div className="flex w-full flex-col gap-md">
      <div
        className={cn(
          "rounded-lg border bg-surface transition-colors duration-150",
          dragging ? "border-accent bg-success-surface" : "border-border",
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
          placeholder="Paste the text you want to examine. At least 40 words for a reliable reading."
          rows={12}
          className="w-full resize-y rounded-lg bg-transparent p-lg text-body-md leading-relaxed text-primary placeholder:text-secondary focus:outline-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-md border-t border-border px-lg py-sm">
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
              className="rounded-md border border-border bg-surface px-md py-xs text-body-sm text-primary transition-colors duration-150 hover:bg-success-surface active:translate-y-px"
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

      <p className="text-caption text-secondary">
        Accepts pasted text or .txt, .md, .docx, and .pdf files. Drag a file
        anywhere onto the panel.
      </p>

      {error && (
        <div
          role="alert"
          className="rounded-md bg-danger-surface px-md py-sm text-body-sm text-danger"
        >
          {error}
        </div>
      )}
    </div>
  );
}
