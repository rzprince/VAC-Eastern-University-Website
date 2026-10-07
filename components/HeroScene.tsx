"use client";

import { PointerEvent, useRef } from "react";
import { VacLogo } from "@/components/BrandLogo";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1705107959309-ca7d26fbeb08?auto=format&fit=crop&fm=webp&q=92&w=2800";
const FILM_IMAGE =
  "https://images.unsplash.com/photo-1727451139462-cd34008cd50b?auto=format&fit=crop&fm=webp&q=90&w=1800";

export function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const element = ref.current;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      element.style.setProperty("--scene-rx", (-y * 5).toFixed(2) + "deg");
      element.style.setProperty("--scene-ry", (x * 6).toFixed(2) + "deg");
      element.style.setProperty("--scene-x", (x * 18).toFixed(2) + "px");
      element.style.setProperty("--scene-y", (y * 14).toFixed(2) + "px");
    });
  }

  function reset() {
    if (!ref.current) return;
    ref.current.style.setProperty("--scene-rx", "0deg");
    ref.current.style.setProperty("--scene-ry", "0deg");
    ref.current.style.setProperty("--scene-x", "0px");
    ref.current.style.setProperty("--scene-y", "0px");
  }

  return (
    <div
      ref={ref}
      className="hero-scene hero-scene--editorial"
      onPointerMove={move}
      onPointerLeave={reset}
      aria-label="VAC photography and filmmaking visual"
    >
      <div className="hero-art-glow" aria-hidden="true" />

      <div className="hero-art-main">
        <img
          src={HERO_IMAGE}
          alt="Photographer working with a camera in cinematic light"
          fetchPriority="high"
          decoding="async"
        />
        <span className="hero-art-vignette" aria-hidden="true" />
        <div className="hero-art-caption">
          <small>Visual Archive Club</small>
          <strong>Frame / Story / Archive</strong>
        </div>
      </div>

      <div className="hero-art-secondary" aria-hidden="true">
        <img src={FILM_IMAGE} alt="" loading="lazy" decoding="async" />
      </div>

      <div className="hero-logo-seal">
        <VacLogo alt="Visual Archive Club" priority />
      </div>

      <div className="hero-coordinate hero-coordinate--one" aria-hidden="true">
        <span>23.8103° N</span><span>90.4125° E</span>
      </div>

      <div className="hero-coordinate hero-coordinate--two" aria-hidden="true">
        <span>EST.</span><strong>2010</strong>
      </div>
    </div>
  );
}
