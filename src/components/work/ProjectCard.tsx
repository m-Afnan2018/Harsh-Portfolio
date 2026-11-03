"use client";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import DistortImage from "@/components/ui/DistortImage";
import { pageImage, pageSrcSet, type Project } from "@/data/projects";
import { openProject } from "./openProject";
import { playClick } from "@/lib/sound";

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const tilt = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = tilt.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(tilt.current, { rotateY: px * 10, rotateX: -py * 8, transformPerspective: 1000, duration: 0.6, ease: "power3.out" });
    gsap.to(glare.current, { opacity: 1, background: `radial-gradient(circle at ${(px + 0.5) * 100}% ${(py + 0.5) * 100}%, rgba(140,196,255,.28), transparent 55%)`, duration: 0.4 });
  };
  const onLeave = () => {
    gsap.to(tilt.current, { rotateY: 0, rotateX: 0, duration: 1, ease: "elastic.out(1,0.5)" });
    gsap.to(glare.current, { opacity: 0, duration: 0.5 });
  };

  return (
    <article className="work-card group w-full shrink-0 md:w-[42vw] lg:w-[36vw]" data-discipline={project.discipline}>
      <a
        href={`/work/${project.slug}`}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey) return;
          e.preventDefault();
          playClick();
          openProject(project.slug, media.current?.querySelector("img"));
        }}
        onPointerEnter={() => playClick("hover")}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        data-cursor="view"
        className="block"
        aria-label={`${project.title} — ${project.category}, ${project.year}. Open project`}
      >
        <div ref={tilt} className="relative will-change-transform" style={{ transformStyle: "preserve-3d" }}>
          <div ref={media} className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-surface">
            <DistortImage
              src={pageImage(project.pages[0], "md")}
              srcSet={pageSrcSet(project.pages[0])}
              sizes="(min-width: 768px) 44vw, 86vw"
              glSrc={pageImage(project.pages[0], "md")}
              alt={`${project.title} — ${project.client}`}
              width={1280}
              height={720}
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
              flipId={`p-${project.slug}`}
              className="h-full w-full"
              imgClassName="transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
            />
            <div ref={glare} className="pointer-events-none absolute inset-0 z-[3] opacity-0 mix-blend-screen" />
          </div>
        </div>
        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <span className="label">{String(index + 1).padStart(2, "0")} — {project.category}</span>
            <h3 className="display mt-2 text-2xl transition-colors duration-500 group-hover:text-glow md:text-[2.2vw]">{project.title}</h3>
          </div>
          <span className="label pt-0.5">{project.year}</span>
        </div>
      </a>
    </article>
  );
}
