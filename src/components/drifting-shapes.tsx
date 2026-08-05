import type React from "react";
import { WireframeCanvas } from "@/components/wireframe-canvas";

// Dimmed wireframe polyhedra drifting slowly across the background.
// Under prefers-reduced-motion the drift stops and shapes hold position.
const SHAPES = [
  { shape: 3, size: 260, top: "6%", left: "4%", duration: "110s", delay: "-30s", dim: 0.4 },
  { shape: 2, size: 170, top: "50%", left: "30%", duration: "140s", delay: "-90s", dim: 0.32 },
  { shape: 1, size: 130, top: "26%", left: "58%", duration: "95s", delay: "-60s", dim: 0.28 },
  { shape: 5, size: 200, top: "66%", left: "76%", duration: "125s", delay: "-15s", dim: 0.36 },
];

export function DriftingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {SHAPES.map((s, i) => (
        <div
          key={i}
          className="absolute motion-safe:animate-[drift_linear_infinite]"
          style={
            {
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDuration: s.duration,
              animationDelay: s.delay,
            } as React.CSSProperties
          }
        >
          <WireframeCanvas shape={s.shape} dim={s.dim} className="h-full w-full" />
        </div>
      ))}
    </div>
  );
}
