"use client";
import { Flip } from "@/lib/gsap";
import { setState } from "@/lib/store";

/** Flip state of the clicked card image — consumed by the overlay for the shared-element transition. */
export const flipRef: { state: Flip.FlipState | null; source: HTMLElement | null } = { state: null, source: null };

export function openProject(slug: string, img?: HTMLElement | null) {
  flipRef.state = img ? Flip.getState(img) : null;
  flipRef.source = img ?? null;
  history.pushState({ ...history.state, overlay: slug }, "", `/work/${slug}`);
  setState({ project: slug });
}
