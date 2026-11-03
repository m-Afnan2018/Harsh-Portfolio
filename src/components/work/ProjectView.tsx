"use client";
import { forwardRef, useEffect, useRef } from "react";
import { neighbours, pageImage, pageSrcSet, projects, type Project } from "@/data/projects";
import RollText from "@/components/ui/RollText";
import Magnetic from "@/components/ui/Magnetic";

/** Reveals children with a clip-path wipe when they enter the given scroll root. */
function useClipReveal(root: React.RefObject<HTMLElement | null>, deps: unknown[]) {
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!els?.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && (en.target.classList.add("is-in"), io.unobserve(en.target))),
      { rootMargin: "0px 0px -10% 0px" },
    );
    els.forEach((e) => { e.classList.remove("is-in"); io.observe(e); });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

type Props = {
  project: Project;
  onNavigate: (slug: string) => void;
  onClose?: () => void;
  closeLabel?: string;
  /** overlay: sticky top bar; page: static bar under the global header */
  inOverlay?: boolean;
};

const ProjectView = forwardRef<HTMLImageElement, Props>(function ProjectView({ project, onNavigate, onClose, closeLabel = "Close", inOverlay = true }, heroRef) {
  const root = useRef<HTMLDivElement>(null);
  const { prev, next } = neighbours(project.slug);
  const index = projects.findIndex((p) => p.slug === project.slug);
  useClipReveal(root, [project.slug]);
  const [cover, ...rest] = project.pages;

  return (
    <div ref={root} className="relative">
      <style>{`
        [data-reveal]{clip-path:inset(12% 0 0 0 round 16px);transform:translateY(60px);opacity:0;transition:clip-path 1.3s cubic-bezier(.16,1,.3,1),transform 1.3s cubic-bezier(.16,1,.3,1),opacity .6s}
        [data-reveal].is-in{clip-path:inset(0 0 0 0 round 16px);transform:none;opacity:1}
        [data-reveal] img{transform:scale(1.15);transition:transform 1.6s cubic-bezier(.16,1,.3,1)}
        [data-reveal].is-in img{transform:scale(1)}
      `}</style>

      <div className={`container-x z-20 flex items-center justify-between py-5 md:py-7 ${inOverlay ? "sticky top-0 bg-gradient-to-b from-ink via-ink/85 to-transparent" : "pt-24 md:pt-28"}`}>
        <span className="label tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </span>
        {onClose && (
          <Magnetic>
            <button
              type="button"
              onClick={onClose}
              className="roll-host flex items-center gap-3 rounded-full border border-line bg-ink/85 py-2.5 pl-5 pr-3 text-xs uppercase tracking-[0.18em] hover:border-blue/60"
            >
              <RollText text={closeLabel} />
              <span className="grid h-6 w-6 place-items-center rounded-full bg-blue text-white" aria-hidden>×</span>
            </button>
          </Magnetic>
        )}
      </div>

      <header className="container-x pt-6 md:pt-10">
        <div className="pv-in flex flex-wrap gap-x-8 gap-y-2">
          <span className="label">{project.client}</span>
          <span className="label">{project.category}</span>
          <span className="label">{project.year}</span>
        </div>
        <h1 className="pv-in display mt-5 max-w-[14ch] text-[13vw] md:text-[7.5vw]">{project.title}</h1>
        <p className="pv-in mt-6 max-w-2xl text-lg leading-relaxed text-paper/75 md:text-xl">{project.summary}</p>
      </header>

      <div className="container-x mt-12 md:mt-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={heroRef}
          data-flip-id={`p-${project.slug}`}
          src={pageImage(cover, "lg")}
          srcSet={pageSrcSet(cover)}
          sizes="100vw"
          width={2560}
          height={1440}
          alt={`${project.title} — ${project.client}, page ${cover}`}
          className="relative z-10 block aspect-[16/9] w-full rounded-2xl object-cover"
        />
      </div>

      <div className="container-x pv-in mt-16 grid grid-cols-1 gap-12 md:mt-24 md:grid-cols-12">
        <div className="space-y-5 text-base leading-relaxed text-paper/80 md:col-span-6 md:text-lg">
          {project.description.map((d, i) => (
            <p key={i}>{d}</p>
          ))}
        </div>
        <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:col-span-5 md:col-start-8">
          {project.highlights.map((h) => (
            <div key={h.label} className="border-t border-line pt-4">
              <dt className="label mb-3">{h.label}</dt>
              <dd>
                <ul className="space-y-1.5 text-sm text-paper/85">
                  {h.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-blue" />
                      {it}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
          {project.tools.length > 0 && (
            <div className="border-t border-line pt-4">
              <dt className="label mb-3">Tools</dt>
              <dd className="text-sm">{project.tools.join(", ")}</dd>
            </div>
          )}
        </dl>
      </div>

      {rest.length > 0 && (
        <div className="container-x mt-20 space-y-6 md:mt-28 md:space-y-10">
          {rest.map((p) => (
            <figure key={p} data-reveal className="overflow-hidden rounded-2xl border border-line bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pageImage(p, "lg")}
                srcSet={pageSrcSet(p)}
                sizes="(min-width: 768px) 92vw, 100vw"
                width={2560}
                height={1440}
                loading="lazy"
                decoding="async"
                alt={`${project.title} — ${project.client}, page ${p}`}
                className="block aspect-[16/9] w-full object-cover"
              />
            </figure>
          ))}
        </div>
      )}

      <nav aria-label="More projects" className="container-x mt-28 grid grid-cols-1 border-t border-line md:mt-40 md:grid-cols-2">
        {[
          { p: prev, dir: "Previous" },
          { p: next, dir: "Next" },
        ].map(({ p, dir }) => (
          <a
            key={dir}
            href={`/work/${p.slug}`}
            onClick={(e) => { e.preventDefault(); onNavigate(p.slug); }}
            data-cursor="open"
            data-cursor-label={dir === "Next" ? "Next" : "Prev"}
            className={`group relative flex items-center gap-6 overflow-hidden py-10 md:py-16 ${dir === "Next" ? "md:justify-end md:border-l md:border-line md:pl-10 md:text-right" : "md:pr-10"}`}
          >
            <div className={dir === "Next" ? "order-1 md:order-none" : ""}>
              <span className="label">{dir} project</span>
              <div className="display mt-3 text-3xl transition-colors duration-500 group-hover:text-glow md:text-5xl">{p.title}</div>
              <span className="label mt-2 block">{p.category}</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pageImage(p.pages[0], "sm")}
              alt=""
              loading="lazy"
              className="hidden h-24 w-40 shrink-0 rounded-lg object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 md:block"
            />
          </a>
        ))}
      </nav>
      <div className="h-16" />
    </div>
  );
});

export default ProjectView;
