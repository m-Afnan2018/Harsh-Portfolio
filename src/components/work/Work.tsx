"use client";
import { useRef, useState } from "react";
import { gsap, Flip, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
import { lenisRef } from "@/lib/lenis";
import { disciplines, projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import Reveal from "@/components/ui/Reveal";
import { playClick } from "@/lib/sound";

export default function Work() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<(typeof disciplines)[number]>("All");
  const st = useRef<ScrollTrigger | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MQ.wide} and ${MQ.motion}`, () => {
        const dist = () => Math.max(0, track.current!.scrollWidth - window.innerWidth);
        const tween = gsap.to(track.current, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        st.current = tween.scrollTrigger ?? null;
        // progress counter
        const bar = root.current!.querySelector<HTMLElement>(".work-progress");
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: () => `+=${dist()}`,
          onUpdate: (s) => bar && (bar.style.transform = `scaleX(${s.progress})`),
        });
        return () => { st.current = null; };
      });
      mm.add(MQ.motion, () => {
        gsap.from(".work-card", { y: 80, opacity: 0, duration: 1.4, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: track.current, start: "top 85%", once: true } });
      });
    },
    { scope: root },
  );

  const applyFilter = (d: (typeof disciplines)[number]) => {
    if (d === filter) return;
    playClick();
    setFilter(d);
    const cards = gsap.utils.toArray<HTMLElement>(".work-card", root.current);
    const state = Flip.getState(cards, { props: "opacity" });
    cards.forEach((c) => (c.style.display = d === "All" || c.dataset.discipline === d ? "" : "none"));
    if (st.current && lenisRef.current && window.scrollY > st.current.start + 10) lenisRef.current.scrollTo(st.current.start, { duration: 1 });
    Flip.from(state, {
      duration: 0.9,
      ease: "expo.inOut",
      scale: true,
      absolute: true,
      stagger: 0.03,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.8, delay: 0.2 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.5 }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  };

  const counts = Object.fromEntries(disciplines.map((d) => [d, d === "All" ? projects.length : projects.filter((p) => p.discipline === d).length]));

  return (
    <section ref={root} id="work" className="relative z-10 flex min-h-svh flex-col justify-center overflow-hidden py-24 md:h-svh md:pb-4 md:pt-24" aria-labelledby="work-title">
      <div className="container-x flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="label">(02)</span>
            <span data-anchor="2" aria-hidden className="h-3 w-3 rounded-full border border-blue/50" />
            <span className="label">Selected Work — Invent Elevators</span>
          </div>
          <Reveal as="h2" className="display whitespace-nowrap text-[13vw] md:text-[4.8vw]" type="chars" stagger={0.025}>
            <span id="work-title">Selected Work</span>
          </Reveal>
        </div>
        <div role="group" aria-label="Filter projects by discipline" className="flex flex-wrap gap-2">
          {disciplines.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={filter === d}
              onClick={() => applyFilter(d)}
              className={`relative rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors duration-500 ${
                filter === d ? "border-blue bg-blue text-white shadow-[0_0_24px_rgba(47,107,255,.45)]" : "border-line text-muted hover:border-paper/40 hover:text-paper"
              }`}
            >
              {d} <sup className="ml-0.5 opacity-70">{counts[d]}</sup>
            </button>
          ))}
        </div>
      </div>
      <div
        ref={track}
        className="container-x mt-10 flex flex-col gap-14 will-change-transform md:mt-14 md:w-max md:flex-row md:gap-[4vw]"
      >
        {projects.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>
      <div className="container-x mt-10 hidden items-center gap-4 md:flex" aria-hidden>
        <span className="label">Scroll</span>
        <div className="h-px flex-1 bg-line">
          <div className="work-progress h-full origin-left scale-x-0 bg-blue" />
        </div>
        <span className="label">{projects.length} projects</span>
      </div>
    </section>
  );
}
