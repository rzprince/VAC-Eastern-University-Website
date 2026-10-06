"use client";

import Image from "next/image";
import { PointerEvent, useRef } from "react";

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
      element.style.setProperty("--scene-rx", (-y * 8).toFixed(2) + "deg");
      element.style.setProperty("--scene-ry", (x * 10).toFixed(2) + "deg");
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
      className="hero-scene"
      onPointerMove={move}
      onPointerLeave={reset}
      aria-hidden="true"
    >
      <div className="hero-scene-glow" />
      <div className="scene-orbit scene-orbit--one" />
      <div className="scene-orbit scene-orbit--two" />
      <div className="scene-lens">
        <div className="scene-lens-ring scene-lens-ring--outer" />
        <div className="scene-lens-ring scene-lens-ring--mid" />
        <div className="scene-lens-core">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="scene-logo">
        <Image
          src="/vac-logo.png"
          alt=""
          width={520}
          height={347}
          priority
        />
      </div>

      <div className="scene-tag scene-tag--photo">
        <small>01</small><strong>Photography</strong>
      </div>
      <div className="scene-tag scene-tag--video">
        <small>02</small><strong>Film</strong>
      </div>
      <div className="scene-tag scene-tag--archive">
        <small>03</small><strong>Archive</strong>
      </div>
    </div>
  );
}
