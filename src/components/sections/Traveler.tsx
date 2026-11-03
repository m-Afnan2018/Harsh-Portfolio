"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { subscribeStore, getState } from "@/lib/store";

/**
 * A blue orb that physically travels between [data-anchor] elements as you scroll:
 * hero status dot → about photo badge → work label → craft start → contact CTA.
 * Position = interpolation between consecutive anchors as each crosses the viewport middle,
 * so it is fully scrubbed and reversible.
 */
export default function Traveler() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = el.current!;
    let anchors: HTMLElement[] = [];
    const collect = () => {
      anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-anchor]")).sort(
        (a, b) => Number(a.dataset.anchor) - Number(b.dataset.anchor),
      );
    };
    collect();
    const mo = new MutationObserver(collect);
    mo.observe(document.body, { childList: true, subtree: true });
    const cur = { x: 0, y: 0, s: 8, init: false };
    const tick = () => {
      if (!anchors.length || !getState().loaded) return;
      const mid = window.innerHeight * 0.5;
      const rects = anchors.map((a) => a.getBoundingClientRect());
      const cy = rects.map((r) => r.top + r.height / 2);
      let i = 0;
      while (i < rects.length - 1 && cy[i + 1] <= mid) i++;
      const a = rects[i];
      const b = rects[Math.min(i + 1, rects.length - 1)];
      let w = 0;
      if (i < rects.length - 1 && cy[i] <= mid) w = gsap.utils.clamp(0, 1, (mid - cy[i]) / (cy[i + 1] - cy[i]));
      if (i === 0 && cy[0] > mid) w = 0;
      w = w * w * (3 - 2 * w); // smoothstep
      const lerp = gsap.utils.interpolate;
      const x = lerp(a.left + a.width / 2, b.left + b.width / 2, w);
      const y = lerp(a.top + a.height / 2, b.top + b.height / 2, w);
      // shrink to a small comet mid-flight so it never balloons over headings
      // small comet in flight; only grows to the target's size on landing
      const small = 14;
      const s = Math.max(8, small + (Math.max(a.width, 8) - small) * Math.pow(1 - w, 6) + (Math.max(b.width, 8) - small) * Math.pow(w, 6));
      if (!cur.init) { Object.assign(cur, { x, y, s, init: true }); }
      cur.x += (x - cur.x) * 0.35;
      cur.y += (y - cur.y) * 0.35;
      cur.s += (s - cur.s) * 0.25;
      node.style.transform = `translate3d(${cur.x - cur.s / 2}px, ${cur.y - cur.s / 2}px, 0)`;
      node.style.width = node.style.height = `${cur.s}px`;
      node.style.opacity = getState().menuOpen || getState().project ? "0" : "1";
    };
    gsap.ticker.add(tick);
    const unsub = subscribeStore(() => {});
    return () => { gsap.ticker.remove(tick); mo.disconnect(); unsub(); };
  }, []);
  return (
    <div
      ref={el}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[5] rounded-full opacity-0 transition-opacity duration-500"
      style={{
        background: "radial-gradient(circle at 35% 30%, #8cc4ff, #2F6BFF 45%, #0A1F5C 100%)",
        boxShadow: "0 0 40px rgba(47,107,255,.55), 0 0 120px rgba(47,107,255,.25)",
      }}
    />
  );
}
