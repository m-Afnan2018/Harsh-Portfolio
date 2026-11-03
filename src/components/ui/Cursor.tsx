"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Blue dot + trailing ring. Reads data-cursor="view|drag|open|link|text" from hovered elements.
 * "text" → ring grows with mix-blend-difference to invert text beneath.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [mode, setMode] = useState<string>("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setEnabled(mq.matches);
    const on = () => setEnabled(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-cursor");
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.55, ease: "power3" });
    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY });
        gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, [role=button], input, textarea");
      if (!el) { setMode(""); setLabel(""); return; }
      const c = el.dataset.cursor ?? "link";
      setMode(c);
      setLabel(el.dataset.cursorLabel ?? (c === "view" ? "View" : c === "drag" ? "Drag" : c === "open" ? "Open" : ""));
    };
    const leaveWin = () => { shown = false; gsap.to([dot.current, ring.current], { autoAlpha: 0, duration: 0.3 }); };
    const down = () => gsap.to(ring.current, { scale: 0.8, duration: 0.2 });
    const up = () => gsap.to(ring.current, { scale: 1, duration: 0.4, ease: "elastic.out(1,0.5)" });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerleave", leaveWin);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leaveWin);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled]);

  if (!enabled) return null;
  const big = mode === "view" || mode === "drag" || mode === "open";
  const ringSize = big ? 96 : mode === "text" ? 120 : mode === "link" ? 56 : 34;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={ring}
        className="invisible absolute left-0 top-0 opacity-0"
        style={{ mixBlendMode: mode === "text" ? "difference" : "normal" }}
      >
        <div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-[width,height,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
          style={{
            width: ringSize,
            height: ringSize,
            border: big || mode === "text" ? "1px solid transparent" : "1px solid rgb(77 163 255 / .55)",
            background: big ? "#2F6BFF" : mode === "text" ? "#EDEFF5" : "transparent",
            boxShadow: big ? "0 0 40px rgb(47 107 255 / .55)" : "none",
          }}
        >
          <span
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-white transition-all duration-300"
            style={{ opacity: big ? 1 : 0, transform: `scale(${big ? 1 : 0.4})` }}
          >
            {label}
          </span>
        </div>
      </div>
      <div ref={dot} className="invisible absolute left-0 top-0 opacity-0">
        <div
          className="h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow shadow-[0_0_10px_#4DA3FF] transition-transform duration-300"
          style={{ transform: `translate(-50%,-50%) scale(${big || mode === "text" ? 0 : 1})` }}
        />
      </div>
    </div>
  );
}
