"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { lenisRef } from "@/lib/lenis";
import { marquee } from "@/data/site";

/** Two outlined rows; speed + direction follow scroll velocity, skewing on fast scroll. */
export default function Marquee() {
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const x = [0, 0];
    let dir = 1, skew = 0, lastY = window.scrollY;
    const tick = (_t: number, dt: number) => {
      const v = lenisRef.current?.velocity ?? (window.scrollY - lastY);
      lastY = window.scrollY;
      if (Math.abs(v) > 0.5) dir = v > 0 ? 1 : -1;
      const speed = (0.05 + Math.min(Math.abs(v), 60) * 0.012) * dir * (dt / 16.67);
      skew += (gsap.utils.clamp(-12, 12, -v * 0.35) - skew) * 0.1;
      rows.current.forEach((row, i) => {
        if (!row) return;
        const w = row.scrollWidth / 2;
        x[i] -= speed * (i === 0 ? 1 : -1);
        x[i] = gsap.utils.wrap(-w, 0, x[i]);
        row.style.transform = `translate3d(${x[i]}px,0,0) skewX(${skew}deg)`;
      });
    };
    // convert speed % into px
    const pxTick = (t: number, dt: number) => tick(t, dt * 1);
    gsap.ticker.add(pxTick);
    return () => gsap.ticker.remove(pxTick);
  }, []);

  const Row = ({ i, outline }: { i: number; outline: boolean }) => (
    <div className="overflow-hidden whitespace-nowrap py-2" aria-hidden>
      <div ref={(el) => { rows.current[i] = el; }} className="inline-flex will-change-transform" style={{ transform: `translate3d(${i ? "-50%" : "0"},0,0)` }}>
        {[0, 1].map((k) => (
          <span key={k} className="inline-flex items-center">
            {marquee.map((m) => (
              <span key={m + k} className="display inline-flex items-center text-[16vw] leading-[1] md:text-[9vw]">
                <span className={outline ? "outline-text" : "text-paper"}>{m}</span>
                <span className="mx-[3vw] inline-block h-[1.6vw] w-[1.6vw] min-h-3 min-w-3 rounded-full bg-blue shadow-[0_0_20px_#2F6BFF]" />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <section className="relative z-10 border-y border-line py-10 md:py-16" aria-label={`Services: ${marquee.join(", ")}`}>
      <Row i={0} outline />
      <Row i={1} outline={false} />
    </section>
  );
}
