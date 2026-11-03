/**
 * Shared, mutable state for the fixed WebGL scene.
 * GSAP ScrollTriggers (SceneDirector) tween these numbers; the R3F loop reads them.
 * x / y are in "half-viewport" units: -1 = left/bottom edge, 1 = right/top edge.
 */
export const sceneState = {
  x: 0,
  y: 0,
  scale: 1,
  amp: 0.22, // noise displacement — "morph"
  freq: 1.4,
  blob: 1, // pen opacity / presence
  scatter: 0, // 0 = particles hug the blob, 1 = particles form a frame
  points: 0.35, // particle opacity
  glow: 0.35, // rim glow intensity
  attract: 0, // particles drift toward the cursor (contact)
  explode: 0, // pen parts separate (exploded view)
  aim: 0, // 0 = pen-tool diagonal, 1 = tip points down at the contact CTA
  intro: 0, // preloader → hero entrance
};
export type SceneState = typeof sceneState;
