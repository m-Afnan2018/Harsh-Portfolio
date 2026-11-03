"use client";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { scrollTo } from "@/lib/lenis";
import { site } from "@/data/site";
import RollText from "@/components/ui/RollText";
import Magnetic from "@/components/ui/Magnetic";
import { playClick } from "@/lib/sound";

export default function Footer() {
  const arrow = useRef<HTMLSpanElement>(null);
  const top = () => {
    playClick();
    gsap
      .timeline()
      .to(arrow.current, { y: -40, opacity: 0, duration: 0.35, ease: "power3.in" })
      .set(arrow.current, { y: 40 })
      .to(arrow.current, { y: 0, opacity: 1, duration: 0.6, ease: "expo.out" });
    scrollTo(0, { duration: 2.4 });
  };
  return (
    <footer className="container-x relative z-10 border-t border-line py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <span className="text-sm text-muted">
          © {new Date().getFullYear()} {site.name} — {site.role}
        </span>
        <ul className="flex gap-6 text-sm">
          {site.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer" className="roll-host text-muted hover:text-paper">
                <RollText text={s.label} />
              </a>
            </li>
          ))}
        </ul>
        <Magnetic>
          <button type="button" onClick={top} className="roll-host flex items-center gap-3 text-sm" aria-label="Back to top">
            <RollText text="Back to top" />
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-line">
              <span ref={arrow} className="block text-glow" aria-hidden>↑</span>
            </span>
          </button>
        </Magnetic>
      </div>
    </footer>
  );
}
