"use client";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, MQ } from "@/lib/gsap";

/**
 * Masked line-by-line slide-up reveal (GSAP SplitText), triggered on scroll.
 * Falls back to a simple fade under prefers-reduced-motion.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  stagger = 0.08,
  type = "lines",
  start = "top 85%",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  type?: "lines" | "words" | "chars";
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        let split: SplitText | null = null;
        document.fonts.ready.then(() => {
          split = SplitText.create(el, {
            type: type === "lines" ? "lines" : `lines,${type}`,
            mask: "lines",
            linesClass: "line-mask",
            autoSplit: true,
            onSplit(self) {
              const targets = type === "lines" ? self.lines : type === "words" ? self.words : self.chars;
              return gsap.from(targets, {
                yPercent: 115,
                rotate: 2.5,
                duration: 1.3,
                stagger,
                delay,
                ease: "expo.out",
                scrollTrigger: { trigger: el, start, once: true },
              });
            },
          });
          gsap.set(el, { autoAlpha: 1 });
        });
        return () => split?.revert();
      });
      mm.add(MQ.reduce, () => {
        gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, scrollTrigger: { trigger: el, start, once: true } });
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={`invisible ${className}`}>
      {children}
    </Tag>
  );
}
