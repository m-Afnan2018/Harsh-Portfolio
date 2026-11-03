"use client";
import type Lenis from "lenis";

/** Module-level handle so any component can read velocity / call scrollTo. */
export const lenisRef: { current: Lenis | null } = { current: null };

export const scrollTo = (target: string | number | HTMLElement, opts: { duration?: number; offset?: number } = {}) => {
  if (lenisRef.current) {
    lenisRef.current.scrollTo(target, { duration: opts.duration ?? 1.6, offset: opts.offset ?? 0 });
  } else {
    const y =
      typeof target === "number"
        ? target
        : (typeof target === "string" ? document.querySelector<HTMLElement>(target) : target)?.getBoundingClientRect().top! + window.scrollY;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};

export const lockScroll = (lock: boolean) => {
  if (lock) lenisRef.current?.stop();
  else lenisRef.current?.start();
  document.documentElement.classList.toggle("is-locked", lock);
};
