"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { getState, setState } from "@/lib/store";
import { lenisRef, lockScroll } from "@/lib/lenis";
import { ScrollTrigger } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import { site } from "@/data/site";
import { pageImage, projects } from "@/data/projects";

/** Counter 0→100 tied to real asset loading, then a split-screen wipe reveals the hero. */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only once per visit: client-side returns to "/" (e.g. from a project page) skip it.
    if (getState().loaded) {
      if (root.current) root.current.style.display = "none";
      sceneState.intro = 1;
      return;
    }
    lockScroll(true);
    window.scrollTo(0, 0);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const assets = [site.photo.src, ...projects.slice(0, 4).map((p) => pageImage(p.pages[0], "md"))];
    let loaded = 0;
    const real = { v: 0 };
    const shown = { v: 0 };
    const bump = () => { loaded++; real.v = loaded / (assets.length + 1); };
    assets.forEach((src) => { const i = new Image(); i.onload = i.onerror = bump; i.src = src; });
    document.fonts.ready.then(bump);

    let done = false;
    const minTime = reduce ? 0.4 : 2.2;
    const start = performance.now();
    const tick = (_t: number, dtMs: number) => {
      const elapsed = (performance.now() - start) / 1000;
      const target = Math.min(real.v, elapsed / minTime);
      shown.v += (target - shown.v) * (1 - Math.pow(0.004, Math.min(dtMs, 1000) / 1000));
      if (target - shown.v < 0.004) shown.v = target;
            const v = Math.round(shown.v * 100);
      if (num.current) num.current.textContent = String(v).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${shown.v})`;
      if (shown.v >= 1 && !done) { done = true; exit(); }
    };
    gsap.ticker.add(tick);
    // safety net: never block the site for more than 8s
    const safety = setTimeout(() => { real.v = 1; }, 8000);

    const exit = () => {
      gsap.ticker.remove(tick);
      const tl = gsap.timeline({
        onComplete: () => {
          lockScroll(false);
          if (root.current) root.current.style.display = "none";
        },
      });
      tl.to(content.current, { autoAlpha: 0, y: -30, duration: 0.6, ease: "power3.in" })
        .add(() => {
          setState({ loaded: true });
          // deep link (/#work etc.): land on the section behind the wipe
          const el = location.hash.length > 1 ? document.querySelector<HTMLElement>(location.hash) : null;
          if (el) {
            ScrollTrigger.refresh();
            const y = el.getBoundingClientRect().top + window.scrollY;
            if (lenisRef.current) lenisRef.current.scrollTo(y, { immediate: true, force: true });
            else window.scrollTo(0, y);
          }
        })
        .to(top.current, { yPercent: -100, duration: reduce ? 0.2 : 1.3, ease: "expo.inOut" }, "-=0.1")
        .to(bottom.current, { yPercent: 100, duration: reduce ? 0.2 : 1.3, ease: "expo.inOut" }, "<")
        .to(sceneState, { intro: 1, duration: 2.4, ease: "expo.out" }, "<0.35");
    };
    return () => {
      gsap.ticker.remove(tick);
      clearTimeout(safety);
    };
  }, []);

  return (
    <div ref={root} className="fixed inset-0 z-[96]" role="status" aria-live="polite" aria-label="Loading portfolio">
      <div ref={top} className="absolute inset-x-0 top-0 h-1/2 bg-surface" />
      <div ref={bottom} className="absolute inset-x-0 bottom-0 h-1/2 bg-surface" />
      <div ref={content} className="container-x absolute inset-0 flex flex-col justify-between py-8">
        <div className="flex items-center justify-between">
          <span className="label">Portfolio — {new Date().getFullYear()}</span>
          <span className="label">{site.role}</span>
        </div>
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="display text-[18vw] leading-none text-paper md:text-[11vw]">
              {site.initials}
              <span className="text-blue">.</span>
            </div>
            <div className="label mt-3">{site.name}</div>
          </div>
          <span ref={num} className="display tabular-nums text-[14vw] leading-none text-paper/90 md:text-[8vw]">
            000
          </span>
        </div>
        <div className="absolute inset-x-0 top-1/2 h-px bg-line">
          <div ref={bar} className="h-full origin-left scale-x-0 bg-blue shadow-[0_0_14px_#2F6BFF]" />
        </div>
      </div>
    </div>
  );
}
