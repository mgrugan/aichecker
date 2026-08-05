import { WireframeCanvas } from "@/components/wireframe-canvas";

export function GeometricLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex h-full flex-col items-center justify-center overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <WireframeCanvas shape={7} dim={1} autoCycleMs={1400} className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
        <p className="text-body-md text-primary/80">Reading the document…</p>
        <p className="mt-2xs text-caption text-secondary">
          Measuring sentence rhythm, vocabulary, and phrase likelihood.
        </p>
      </div>
    </div>
  );
}
