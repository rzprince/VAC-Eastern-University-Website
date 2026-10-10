"use client";

import { useEffect } from "react";

/**
 * Progressive enhancement only. Content is visible without JavaScript.
 * Newly rendered Next.js route content is observed too.
 */
export function PremiumMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animated = new WeakSet<HTMLElement>();

    let progressFrame = 0;
    function updateProgress() {
      progressFrame = 0;
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const fraction = Math.min(1, Math.max(0, window.scrollY / max));
      root.style.setProperty("--vac-scroll-progress", String(fraction));
    }
    function handleScroll() {
      if (!progressFrame) {
        progressFrame = window.requestAnimationFrame(updateProgress);
      }
    }

    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const element = entry.target as HTMLElement;
              element.classList.add("is-visible");
              observer?.unobserve(element);
            }
          },
          { rootMargin: "0px 0px -4% 0px", threshold: 0.04 }
        )
      : null;

    function watchElement(element: HTMLElement) {
      if (animated.has(element)) return;
      animated.add(element);
      if (!observer || reducedMotion.matches) {
        element.classList.add("is-visible");
      } else {
        observer.observe(element);
      }
    }
    function watchTree(node: Node) {
      if (!(node instanceof Element)) return;
      if (node.matches("[data-reveal]")) watchElement(node as HTMLElement);
      node.querySelectorAll<HTMLElement>("[data-reveal]").forEach(watchElement);
    }

    root.classList.add("vac-motion-ready");
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(watchElement);

    const mutationObserver = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach(watchTree);
      }
      handleScroll();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    function showAllForReducedMotion() {
      if (reducedMotion.matches) {
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
          node.classList.add("is-visible");
          observer?.unobserve(node);
        });
      }
    }
    reducedMotion.addEventListener("change", showAllForReducedMotion);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    window.addEventListener("pageshow", handleScroll);
    updateProgress();

    return () => {
      mutationObserver.disconnect();
      observer?.disconnect();
      reducedMotion.removeEventListener("change", showAllForReducedMotion);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("pageshow", handleScroll);
      if (progressFrame) cancelAnimationFrame(progressFrame);
      root.classList.remove("vac-motion-ready");
      root.style.removeProperty("--vac-scroll-progress");
    };
  }, []);

  return <div className="vac-scroll-progress" aria-hidden="true" />;
}
