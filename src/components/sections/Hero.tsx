"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { useStore } from "@/lib/store";
import { site } from "@/data/site";
import { scrollTo } from "@/lib/lenis";
import CropMarks from "@/components/ui/CropMarks";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ/—_#*+";

function Scramble({ words, run }: { words: readonly string[]; run: boolean }) {
  const [text, setText] = useState(words[0]);
  useEffect(() => {
    if (!run) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      let i = 0;
      const id = setInterval(() => setText(words[(i = (i + 1) % words.length)]), 2600);
      return () => clearInterval(id);
    }
    let i = 0, frame = 0, raf = 0, timer: ReturnType<typeof setTimeout>;
    const to = (next: string) => {
      const from = text;
      const len = Math.max(from.length, next.length);
      const queue = Array.from({ length: len }, (_, k) => ({ from: from[k] ?? "", to: next[k] ?? "", start: Math.floor(Math.random() * 14), end: 14 + Math.floor(Math.random() * 22) }));
      frame = 0;
      const step = () => {
        let out = "", complete = 0;
        for (const q of queue) {
          if (frame >= q.end) { complete++; out += q.to; }
          else if (frame >= q.start) out += q.to === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          else out += q.from;
        }
        setText(out);
        frame++;
        if (complete < queue.length) raf = requestAnimationFrame(step);
        else timer = setTimeout(cycle, 2400);
      };
      step();
    };
    const cycle = () => { i = (i + 1) % words.length; to(words[i]); };
    timer = setTimeout(cycle, 2200);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, words]);
  return <span aria-live="off">{text}</span>;
}

function LocalTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: site.timezone });
    const tick = () => setT(f.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{t || "--:--:--"}</span>;
}

const Chars = ({ text }: { text: string }) => (
  <>
    {Array.from(text).map((c, i) => (
      <span key={i} className="hero-char inline-block will-change-transform" style={{ transformOrigin: "50% 100%" }}>
        {c}
      </span>
    ))}
  </>
);

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const name = useRef<HTMLHeadingElement>(null);
  const loaded = useStore((s) => s.loaded);

  // entrance after preloader
  useGSAP(
    () => {
      if (!loaded) return;
      const reduce = matchMedia(MQ.reduce).matches;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      if (reduce) {
        tl.to(".hero-fade", { autoAlpha: 1, duration: 0.8 }).set(".hero-char", { yPercent: 0, opacity: 1 }, 0);
        return;
      }
      tl.fromTo(".hero-char", { yPercent: 120, rotate: 8, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.6, stagger: 0.045 }, 0.15)
        .fromTo(".hero-fade", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.7);
    },
    { scope: root, dependencies: [loaded] },
  );

  // Name travels into the nav logo slot while the hero is pinned (scrubbed, reversible)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const logo = document.getElementById("nav-logo");
      mm.add(MQ.motion, () => {
        const el = name.current!;
        if (!logo) return;
        // offset* values ignore transforms → stable measurements on every refresh.
        // While pinned the hero sits at the top-left of the viewport, so offsets == viewport coords.
        const m = () => {
          const b = logo.getBoundingClientRect();
          return { dx: b.left - el.offsetLeft, dy: b.top - el.offsetTop, s: b.width / el.offsetWidth };
        };
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => (window.innerWidth < 768 ? "+=50%" : "+=75%"),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const done = self.progress > 0.97;
              gsap.set(logo, { opacity: done ? 1 : 0 });
              gsap.set(el, { opacity: done ? 0 : 1 });
            },
          },
        });
        tl.to(el, { x: () => m().dx, y: () => m().dy, scale: () => m().s, transformOrigin: "0 0", ease: "power2.inOut", duration: 1 }, 0)
          .to(".hero-meta", { autoAlpha: 0, y: -40, stagger: 0.05, duration: 0.5 }, 0);
        return () => { gsap.set(logo, { opacity: 1 }); };
      });
      mm.add(MQ.reduce, () => {
        if (logo) gsap.set(logo, { opacity: 1 });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="container-x relative z-10 flex h-svh flex-col justify-between pb-8 pt-28 md:pt-32" aria-label="Introduction">
      <div className="hero-meta pointer-events-none absolute inset-0"><div className="hero-fade invisible absolute inset-3 md:inset-6"><CropMarks inset={0} /></div></div>
      <div className="hero-meta"><div className="hero-fade invisible flex flex-wrap items-start justify-between gap-6">
        <p className="max-w-[22rem] text-sm leading-relaxed text-muted">
          {site.intro}
        </p>
        <div className="flex items-center gap-3 rounded-full border border-line bg-ink/80 px-4 py-2 text-xs">
          <span data-anchor="0" className="pulse-dot h-2 w-2 rounded-full bg-blue shadow-[0_0_10px_#2F6BFF]" />
          <span>{site.availability}</span>
          <span className="h-3 w-px bg-line" />
          <span className="text-muted">
            IN <LocalTime />
          </span>
        </div>
      </div></div>

      <div className="relative">
        <div aria-hidden className="hero-meta pointer-events-none absolute right-0 top-0 hidden flex-col items-end gap-2 text-[10px] uppercase tracking-[0.2em] text-muted md:flex">
          <span className="hero-fade invisible">Aa — Clash Display 600</span>
          <span className="hero-fade invisible flex items-center gap-1.5">
            {["#050608", "#0A1F5C", "#2F6BFF", "#4DA3FF", "#EDEFF5"].map((c) => (
              <span key={c} className="h-3 w-3 rounded-[3px] border border-line" style={{ background: c }} title={c} />
            ))}
          </span>
          <span className="hero-fade invisible">Grid 12 col · 4vw gutter</span>
        </div>
        <h1 ref={name} aria-label={site.name} className="display w-fit select-none text-[19vw] leading-[0.82] md:text-[16.5vw]">
          <span className="block overflow-hidden pb-[0.04em]" aria-hidden>
            <Chars text={site.firstName} />
          </span>
          <span className="block overflow-hidden whitespace-nowrap pb-[0.04em] pl-[3vw] md:pl-[8vw]" aria-hidden>
            <Chars text={site.lastName} />
            <span className="hero-char inline-block text-blue">.</span>
          </span>
        </h1>
        <div className="hero-meta mt-6 flex flex-wrap items-end justify-between gap-6 md:mt-8">
          <p className="hero-fade invisible display text-xl md:text-3xl">
            <span className="text-muted">{site.role} — </span>
            <span className="text-glow">
              <Scramble words={site.specialties} run={loaded} />
            </span>
          </p>
          <button
            type="button"
            onClick={() => scrollTo("#about", { duration: 2 })}
            className="hero-scroll hero-fade invisible flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted hover:text-paper"
            aria-label="Scroll to about"
          >
            Scroll
            <span className="scroll-line block h-12 w-px bg-line" />
          </button>
        </div>
      </div>
    </section>
  );
}
