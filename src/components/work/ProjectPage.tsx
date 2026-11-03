"use client";
import { useEffect } from "react";
import { getProject } from "@/data/projects";
import ProjectView from "./ProjectView";
import { transitionTo } from "@/components/ui/Curtain";
import { gsap } from "@/lib/gsap";

/** Standalone /work/[slug] page (direct visits, SEO). Same view as the overlay. */
export default function ProjectPage({ slug }: { slug: string }) {
  const project = getProject(slug)!;
  useEffect(() => {
    gsap.fromTo(".pv-in", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07, delay: 0.3 });
  }, [slug]);
  return (
    <main className="relative z-10 bg-ink">
      <ProjectView project={project} onNavigate={(s) => transitionTo(`/work/${s}`)} onClose={() => transitionTo("/#work")} closeLabel="All work" inOverlay={false} />
    </main>
  );
}
