"use client";
import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import Reveal from "@/components/ui/Reveal";
import DistortImage from "@/components/ui/DistortImage";
import { craftSteps } from "@/data/site";
import { pageImage, pageSrcSet } from "@/data/projects";

/** How an identity is built — mark, type, colour, layout, application — each step shown with its PDF page. */
export default function Craft() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const path = root.current!.querySelector<SVGPathElement>(".craft-path")!;
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".craft-list", start: "top 70%", end: "bottom 70%", scrub: 1 } });
        gsap.utils.toArray<HTMLElement>(".craft-step").forEach((step) => {
          gsap.fromTo(
            step.querySelector(".craft-text"),
            { clipPath: "inset(0% 0% 100% 0%)", y: 40 },
            { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: step, start: "top 80%", once: true } },
          );
          gsap.fromTo(
            step.querySelector(".craft-img"),
            { clipPath: "inset(0% 100% 0% 0% round 14px)" },
            { clipPath: "inset(0% 0% 0% 0% round 14px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: step, start: "top 75%", once: true } },
          );
          gsap.fromTo(step.querySelector(".craft-img img"), { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: step, start: "top bottom", end: "bottom top", scrub: true } });
          gsap.fromTo(step.querySelector(".craft-node"), { scale: 0 }, { scale: 1, duration: 0.8, ease: "back.out(3)", scrollTrigger: { trigger: step, start: "top 65%", toggleActions: "play none none reverse" } });
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="craft" className="container-x relative z-10 py-28 md:py-40" aria-labelledby="craft-title">
      <div className="mb-12 flex items-center gap-4 md:mb-20">
        <span className="label">(03)</span>
        <span className="hairline flex-1" />
        <span className="label">Craft</span>
      </div>
      <div className="mb-16 grid grid-cols-1 gap-6 md:mb-24 md:grid-cols-12">
        <Reveal as="h2" className="display text-[12vw] md:col-span-8 md:text-[5.4vw]" type="words" stagger={0.05}>
          <span id="craft-title">From a single mark to every surface.</span>
        </Reveal>
        <Reveal as="p" className="max-w-sm self-end text-paper/60 md:col-span-4" delay={0.2}>
          How the Invent Elevators identity was built — one design decision at a time.
        </Reveal>
      </div>
      <ol className="craft-list relative">
        <svg aria-hidden className="pointer-events-none absolute left-[11px] top-3 h-[calc(100%-1.5rem)] w-4 overflow-visible" preserveAspectRatio="none" viewBox="0 0 16 100">
          <path d="M8 0 C 16 20, 0 30, 8 50 S 16 80, 8 100" className="craft-path" fill="none" stroke="url(#cg)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <defs>
            <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4DA3FF" />
              <stop offset="1" stopColor="#0A1F5C" />
            </linearGradient>
          </defs>
        </svg>
        {craftSteps.map((s, i) => (
          <li key={s.title} className="craft-step relative grid grid-cols-1 gap-6 pb-16 pl-14 last:pb-0 md:grid-cols-12 md:gap-8 md:pb-24">
            <span
              {...(i === 0 ? { "data-anchor": "3" } : {})}
              className="craft-node absolute left-0 top-1 grid h-6 w-6 place-items-center rounded-full border border-blue/60 bg-ink"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-glow shadow-[0_0_8px_#4DA3FF]" />
            </span>
            <div className="craft-text md:col-span-5">
              <div className="flex items-baseline gap-5">
                <span className="display text-5xl text-blue/90 md:text-7xl">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display text-2xl md:text-4xl">{s.title}</h3>
              </div>
              <p className="mt-4 max-w-md text-paper/65">{s.text}</p>
            </div>
            <div className="craft-img relative aspect-[16/9] overflow-hidden rounded-[14px] border border-line md:col-span-6 md:col-start-7" data-cursor="view" data-cursor-label="Look">
              <DistortImage
                src={pageImage(s.page, "md")}
                srcSet={pageSrcSet(s.page)}
                sizes="(min-width: 768px) 46vw, 90vw"
                glSrc={pageImage(s.page, "md")}
                alt={`${s.title} — Invent Elevators, PDF page ${s.page}`}
                width={1280}
                height={720}
                loading="lazy"
                decoding="async"
                className="h-full w-full"
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
