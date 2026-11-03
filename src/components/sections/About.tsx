"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import Reveal from "@/components/ui/Reveal";
import DistortImage from "@/components/ui/DistortImage";
import { bio, site, skills } from "@/data/site";
import CropMarks from "@/components/ui/CropMarks";

function Pills() {
  const area = useRef<HTMLDivElement>(null);
  return (
    <div ref={area} className="relative mt-10 flex min-h-[220px] flex-wrap content-start gap-2.5 rounded-3xl border border-line p-4 md:p-6" data-cursor="drag">
      <span className="label absolute -top-2.5 left-6 bg-ink px-2">Design skills — drag me</span>
      {skills.map((s, i) => (
        <motion.span
          key={s}
          drag
          dragConstraints={area}
          dragElastic={0.25}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 14 }}
          whileDrag={{ scale: 1.08, backgroundColor: "#2F6BFF", color: "#fff", zIndex: 5 }}
          whileHover={{ y: -3 }}
          animate={{ y: [0, -4 - (i % 3) * 2, 0] }}
          transition={{ y: { duration: 3 + (i % 5) * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 } }}
          className="relative cursor-grab select-none rounded-full border border-line bg-surface px-4 py-2 text-sm text-paper/90 active:cursor-grabbing"
          data-cursor="drag"
        >
          {s}
        </motion.span>
      ))}
    </div>
  );
}

export default function About() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        // photo: clip-path wipe + scale 1.2 → 1, scrubbed
        gsap.fromTo(
          ".about-photo",
          { clipPath: "inset(100% 0% 0% 0% round 24px)" },
          { clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none", scrollTrigger: { trigger: ".about-photo", start: "top 95%", end: "top 35%", scrub: 1 } },
        );
        gsap.fromTo(".about-photo img", { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".about-photo", start: "top bottom", end: "bottom top", scrub: true } });
        gsap.to(".about-parallax", { yPercent: -18, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" className="container-x relative z-10 py-28 md:py-40" aria-labelledby="about-title">
      <div className="mb-12 flex items-center gap-4 md:mb-20">
        <span className="label">(01)</span>
        <span className="hairline flex-1" />
        <span className="label">About</span>
      </div>
      <div className="grid grid-cols-1 gap-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-7">
          <Reveal as="h2" className="display text-[11vw] md:text-[5.6vw]" type="words" stagger={0.04}>
            <span id="about-title">
              Type, colour &amp; form — <span className="text-glow">crafted</span> with intent.
            </span>
          </Reveal>
          <div className="mt-10 max-w-xl space-y-5 text-base leading-relaxed text-paper/75 md:mt-14 md:text-lg">
            {bio.map((p, i) => (
              <Reveal key={i} as="p" delay={i * 0.05}>
                {p}
              </Reveal>
            ))}
          </div>
          <Pills />
        </div>
        <div className="relative md:col-span-4 md:col-start-9">
          <div className="about-parallax md:sticky md:top-28">
            <div className="relative">
              <span
                data-anchor="1"
                aria-hidden
                className="absolute -left-6 -top-6 z-20 h-16 w-16 rounded-full border border-blue/40 md:-left-10 md:-top-10 md:h-24 md:w-24"
              />
              <div className="about-photo relative aspect-[3/4] overflow-hidden rounded-3xl" data-cursor="view" data-cursor-label="Hi!">
                <DistortImage
                  src={site.photo.src}
                  glSrc={site.photo.src}
                  alt={site.photo.alt}
                  width={site.photo.width}
                  height={site.photo.height}
                  loading="lazy"
                  strength={1.4}
                  className="h-full w-full"
                />
                <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              </div>
              <CropMarks inset={-10} target={false} />
              <div className="mt-4 flex items-center justify-between text-xs text-muted">
                <span>{site.name}</span>
                <span>{site.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
