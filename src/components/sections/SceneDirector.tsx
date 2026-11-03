"use client";
import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";

/**
 * Scroll choreography for the WebGL object (all scrubbed → reversible):
 * Hero: the 3D pen tool floats · About: exploded view beside the photo ·
 * Work: the pen dissolves into particles forming a frame around the gallery ·
 * Craft: particles drift quietly · Contact: reassembles above the CTA, tip pointing at it, glows, particles follow the cursor.
 * Must render after the sections so pin spacing is already known.
 */
export default function SceneDirector() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ wide: MQ.wide, motion: MQ.motion }, (ctx) => {
      if (!ctx.conditions?.motion) return;
      const wide = ctx.conditions.wide;
      const st = (trigger: string, start: string, end: string) => ({ trigger, start, end, scrub: 1.2 });
      type S = Omit<typeof sceneState, "intro">;
      const hero: S = { x: wide ? 0.42 : 0, y: wide ? 0.3 : 0.18, scale: wide ? 0.8 : 1, amp: 0.22, freq: 1.4, blob: 1, scatter: 0, points: 0.35, glow: 0.35, attract: 0, explode: 0, aim: 0 };
      const heroEnd: S = { ...hero, x: 0.12, y: 0, scale: 1.1 };
      const about: S = { ...heroEnd, x: wide ? 0.12 : 0.5, y: wide ? 0.22 : 0.62, scale: wide ? 0.46 : 0.42, amp: 0.48, freq: 2.1, glow: 0.6, explode: 1, blob: wide ? 1 : 0.12 };
      const work: S = { ...about, x: 0, y: 0, scale: 1, amp: 0.25, freq: 1.4, blob: 0, scatter: 1, points: 0.9, glow: 0.3, explode: 0 };
      const proc: S = { ...work, points: 0.25 };
      const contact: S = { ...proc, x: wide ? 0.26 : 0.3, y: wide ? -0.04 : 0.02, scale: wide ? 0.72 : 0.6, blob: 1, scatter: 0, points: 0.8, glow: 1, amp: 0.3, attract: 1, aim: 1 };
      // after the CTA scrolls up, the pen follows it so it never covers the contact links
      const contactEnd: S = wide ? { ...contact, x: 0.37, y: 0.42, scale: 0.58 } : contact;
      gsap.set(sceneState, hero);
      const seg = (from: S, to: S, trigger: ReturnType<typeof st>) =>
        gsap.fromTo(sceneState, { ...from }, { ...to, ease: "none", immediateRender: false, scrollTrigger: trigger });
      seg(hero, heroEnd, st("#top", "top top", wide ? "+=75%" : "+=50%"));
      seg(heroEnd, about, st("#about", "top bottom", "top 20%"));
      seg(about, work, st("#work", "top 90%", "top top"));
      seg(work, proc, st("#craft", "top 80%", "top 20%"));
      seg(proc, contact, st("#contact", "top 85%", "top 10%"));
      seg(contact, contactEnd, st("#contact", "top 10%", "bottom bottom"));
      ScrollTrigger.refresh();
    });
  });
  return null;
}
