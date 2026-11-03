"use client";
import { useEffect, useRef, type ReactNode, type ElementType } from "react";
import { gsap } from "@/lib/gsap";

/** Pulls its child toward the cursor; the inner layer moves a bit more for depth. */
export default function Magnetic({
  children,
  strength = 0.35,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const inner = el.firstElementChild as HTMLElement | null;
    const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      xTo(x * strength);
      yTo(y * strength);
      if (inner) gsap.to(inner, { x: x * strength * 0.35, y: y * strength * 0.35, duration: 0.6 });
    };
    const leave = () => {
      xTo(0); yTo(0);
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,0.4)" });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <Tag ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </Tag>
  );
}
