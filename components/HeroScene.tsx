"use client";

import { useRef, type PointerEvent } from "react";
import { VacLogo } from "@/components/BrandLogo";

export function HeroScene() {
  const stage = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!stage.current ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      stage.current?.style.setProperty("--tilt-x", (-y * 5).toFixed(2) + "deg");
      stage.current?.style.setProperty("--tilt-y", (x * 6).toFixed(2) + "deg");
    });
  }

  function reset() {
    cancelAnimationFrame(raf.current);
    stage.current?.style.setProperty("--tilt-x", "0deg");
    stage.current?.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div
      className="vac-editorial-stage"
      ref={stage}
      onPointerMove={move}
      onPointerLeave={reset}
      aria-label="Creative filmmaking and photography at Visual Archive Club"
    >
      <div className="vac-editorial-halo" aria-hidden="true" />
      <div className="vac-editorial-photo">
        <img
          src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=88&w=1600"
          alt="Cinematic film imagery, representing visual storytelling"
          fetchPriority="high"
          decoding="async"
        />
        <div className="vac-editorial-photo-shade" aria-hidden="true" />
        <div className="vac-editorial-photo-caption">
          <span>CREATIVE ARCHIVE / 001</span>
          <strong>Made to be remembered.</strong>
          <small>Photography · Film · Visual Culture</small>
        </div>
      </div>
      <div className="vac-editorial-stamp">
        <VacLogo alt="Visual Archive Club" priority />
      </div>
      <div className="vac-editorial-side-label" aria-hidden="true">EASTERN UNIVERSITY · DHAKA</div>
      <div className="vac-editorial-counter" aria-hidden="true">
        <i />
        <span>EST. 2010</span>
      </div>
    </div>
  );
}
