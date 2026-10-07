"use client";

import { PointerEvent, useRef } from "react";
import { VacLogo } from "@/components/BrandLogo";

export function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      ref.current?.style.setProperty("--lens-ry", (-18 + x * 28).toFixed(2) + "deg");
      ref.current?.style.setProperty("--lens-rx", (12 - y * 22).toFixed(2) + "deg");
      ref.current?.style.setProperty("--lens-x", (x * 16).toFixed(2) + "px");
      ref.current?.style.setProperty("--lens-y", (y * 14).toFixed(2) + "px");
    });
  }

  function reset() {
    if (!ref.current) return;
    ref.current.style.setProperty("--lens-ry", "-18deg");
    ref.current.style.setProperty("--lens-rx", "12deg");
    ref.current.style.setProperty("--lens-x", "0px");
    ref.current.style.setProperty("--lens-y", "0px");
  }

  return (
    <div
      ref={ref}
      className="hero-lens-stage"
      onPointerMove={move}
      onPointerLeave={reset}
      aria-label="Animated Visual Archive Club camera lens"
    >
      <div className="lens-ambient" aria-hidden="true" />
      <div className="vac-lens" aria-hidden="true">
        <i className="lens-ring lens-ring--one" />
        <i className="lens-ring lens-ring--two" />
        <i className="lens-ring lens-ring--three" />
        <i className="lens-ring lens-ring--four" />
        <div className="lens-core">
          <VacLogo alt="" priority />
        </div>
      </div>

      <div className="lens-note lens-note--top" aria-hidden="true">
        <span>VISUAL ARCHIVE</span>
        <b>EST. 2010</b>
      </div>
      <div className="lens-note lens-note--bottom" aria-hidden="true">
        <span>PHOTO · FILM · STORY</span>
        <b>Eastern University</b>
      </div>
    </div>
  );
}
