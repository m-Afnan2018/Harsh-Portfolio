"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, Flip } from "@/lib/gsap";
import { getState, setState, useStore } from "@/lib/store";
import { lockScroll } from "@/lib/lenis";
import { getProject, projects } from "@/data/projects";
import { site } from "@/data/site";
import ProjectView from "./ProjectView";
import { flipRef } from "./openProject";
import { playClick } from "@/lib/sound";

/**
 * Full-screen project detail on the home page. The cover image grows out of the
 * clicked card (GSAP Flip) and shrinks back into it on close. Next/prev use a wipe.
 */
export default function ProjectOverlay() {
  const openSlug = useStore((s) => s.project);
  const [slug, setSlug] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLImageElement>(null);
  const wipeA = useRef<HTMLDivElement>(null);
  const wipeB = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const lastFocus = useRef<HTMLElement | null>(null);
  const reduce = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // open
  useEffect(() => {
    if (openSlug && !slug) {
      lastFocus.current = document.activeElement as HTMLElement;
      lockScroll(true);
      setSlug(openSlug);
    }
  }, [openSlug, slug]);

  useLayoutEffect(() => {
    if (!slug || !panel.current || closing.current) return;
    const p = getProject(slug);
    document.title = p ? `${p.title} — ${site.name}` : document.title;
    if (panel.current.dataset.opened) return;
    panel.current.dataset.opened = "1";
    panel.current.scrollTop = 0;
    const tl = gsap.timeline();
    tl.fromTo(bg.current, { opacity: 0 }, { opacity: 1, duration: reduce ? 0.2 : 0.7, ease: "power2.out" }, 0);
    if (flipRef.state && hero.current && !reduce) {
      tl.add(Flip.from(flipRef.state, { targets: hero.current, duration: 1.2, ease: "expo.inOut", scale: true, absolute: false, zIndex: 50 }), 0);
    } else {
      tl.fromTo(hero.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1 }, 0.2);
    }
    tl.fromTo(panel.current.querySelectorAll(".pv-in"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07, ease: "expo.out" }, reduce ? 0 : 0.5);
    panel.current.focus({ preventScroll: true });
  }, [slug, reduce]);

  const finishClose = useCallback(() => {
    closing.current = false;
    if (panel.current) delete panel.current.dataset.opened;
    setSlug(null);
    setState({ project: null });
    lockScroll(false);
    document.title = `${site.name} — ${site.role}`;
    lastFocus.current?.focus({ preventScroll: true });
  }, []);

  const animateClose = useCallback(() => {
    if (closing.current || !panel.current) return;
    closing.current = true;
    const source = flipRef.source;
    const tl = gsap.timeline({ onComplete: finishClose });
    tl.to(panel.current.querySelectorAll(".pv-in, [data-reveal], nav"), { opacity: 0, duration: 0.35 }, 0);
    const canFit = source && source.isConnected && hero.current && !reduce && panel.current.scrollTop < 200 && slug === getState().project;
    if (canFit) {
      panel.current.scrollTop = 0;
      tl.add(Flip.fit(hero.current!, source!, { duration: 0.9, ease: "expo.inOut", scale: true }) as gsap.core.Tween, 0.1);
      tl.to(bg.current, { opacity: 0, duration: 0.6 }, 0.4);
      tl.to(hero.current, { opacity: 0, duration: 0.2 }, ">-0.05");
    } else {
      tl.to(panel.current, { opacity: 0, duration: 0.5 }, 0).to(bg.current, { opacity: 0, duration: 0.5 }, 0).set(panel.current, { opacity: 1 });
    }
  }, [finishClose, reduce, slug]);

  const close = useCallback(() => {
    playClick();
    if (history.state?.overlay) history.back(); // popstate → animateClose
    else {
      history.replaceState(history.state, "", "/");
      animateClose();
    }
  }, [animateClose]);

  // browser back/forward
  useEffect(() => {
    const pop = () => {
      const m = location.pathname.match(/^\/work\/([^/]+)/);
      if (m && getProject(m[1])) {
        if (!getState().project) { flipRef.state = null; flipRef.source = null; setState({ project: m[1] }); }
        else navigate(m[1], false);
      } else if (getState().project) animateClose();
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  });

  const navigate = (next: string, push = true) => {
    if (next === slug) return;
    playClick();
    if (push) history.replaceState(history.state ? { ...history.state, overlay: next } : { overlay: next }, "", `/work/${next}`);
    flipRef.source = document.querySelector<HTMLElement>(`.work-card img[data-flip-id="p-${next}"]`);
    flipRef.state = null;
    const tl = gsap.timeline();
    tl.set([wipeA.current, wipeB.current], { xPercent: -100, autoAlpha: 1 })
      .to(wipeA.current, { xPercent: 0, duration: reduce ? 0.01 : 0.6, ease: "expo.inOut" })
      .to(wipeB.current, { xPercent: 0, duration: reduce ? 0.01 : 0.6, ease: "expo.inOut" }, "<0.1")
      .add(() => {
        setSlug(next);
        setState({ project: next });
        if (panel.current) panel.current.scrollTop = 0;
      })
      .to(wipeB.current, { xPercent: 100, duration: reduce ? 0.01 : 0.7, ease: "expo.inOut", delay: 0.1 })
      .to(wipeA.current, { xPercent: 100, duration: reduce ? 0.01 : 0.7, ease: "expo.inOut" }, "<0.08")
      .fromTo(() => panel.current!.querySelectorAll(".pv-in"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, stagger: 0.06 }, "<0.2")
      .set([wipeA.current, wipeB.current], { autoAlpha: 0 });
  };

  // keyboard: Esc closes, arrows navigate
  useEffect(() => {
    if (!slug) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      const i = projects.findIndex((p) => p.slug === slug);
      if (e.key === "ArrowRight") navigate(projects[(i + 1) % projects.length].slug);
      if (e.key === "ArrowLeft") navigate(projects[(i - 1 + projects.length) % projects.length].slug);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const project = slug ? getProject(slug) : null;
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={`Project: ${project.title}`}>
      <div ref={bg} className="absolute inset-0 bg-ink opacity-0" />
      <div ref={panel} tabIndex={-1} data-lenis-prevent className="absolute inset-0 overflow-y-auto overscroll-contain outline-none">
        <ProjectView ref={hero} project={project} onNavigate={(s) => navigate(s)} onClose={close} />
      </div>
      <div ref={wipeA} aria-hidden className="pointer-events-none invisible absolute inset-0 z-30 bg-blue" />
      <div ref={wipeB} aria-hidden className="pointer-events-none invisible absolute inset-0 z-30 bg-surface" />
    </div>
  );
}
