"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { lenisRef, lockScroll } from "@/lib/lenis";

/** Black + blue curtain wipe for route changes. Call `transitionTo(href)` from anywhere. */
let go: ((href: string) => void) | null = null;
export const transitionTo = (href: string) => (go ? go(href) : (window.location.href = href));

export default function Curtain() {
  const router = useRouter();
  const pathname = usePathname();
  const blue = useRef<HTMLDivElement>(null);
  const black = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const pending = useRef(false);

  useEffect(() => {
    go = (href: string) => {
      if (pending.current) return;
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname) {
        if (url.hash) document.querySelector(url.hash)?.scrollIntoView();
        return;
      }
      pending.current = true;
      lockScroll(true);
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap
        .timeline({ onComplete: () => router.push(href, { scroll: false }) })
        .set([blue.current, black.current], { yPercent: 100, autoAlpha: 1 })
        .to(blue.current, { yPercent: 0, duration: reduce ? 0.01 : 0.7, ease: "expo.inOut" })
        .to(black.current, { yPercent: 0, duration: reduce ? 0.01 : 0.7, ease: "expo.inOut" }, "<0.12")
        .fromTo(label.current, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.25");
    };
    return () => { go = null; };
  }, [router]);

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    const hash = location.hash;
    // let the new page mount its pins before jumping to a #section
    setTimeout(() => {
      lockScroll(false);
      if (hash) {
        ScrollTrigger.refresh();
        const el = document.querySelector<HTMLElement>(hash);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY;
          if (lenisRef.current) lenisRef.current.scrollTo(y, { immediate: true, force: true });
          else window.scrollTo(0, y);
        }
      }
      gsap
        .timeline({ delay: 0.15 })
        .to(label.current, { autoAlpha: 0, y: -20, duration: 0.3 })
        .to(black.current, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "<")
        .to(blue.current, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "<0.1")
        .set([blue.current, black.current], { autoAlpha: 0 });
    }, 120);
  }, [pathname]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95]">
      <div ref={blue} className="invisible absolute inset-0 bg-blue" />
      <div ref={black} className="invisible absolute inset-0 bg-ink">
        <div ref={label} className="absolute inset-0 grid place-items-center opacity-0">
          <span className="display text-2xl text-paper">
            Harsh Sharma<span className="text-blue">.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
