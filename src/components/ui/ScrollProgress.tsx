"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const set = gsap.quickSetter(bar.current, "scaleX");
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      set(max > 0 ? window.scrollY / max : 0);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[2px]">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-gradient-to-r from-deep via-blue to-glow shadow-[0_0_12px_#2F6BFF]" />
    </div>
  );
}
