"use client";
import { getState } from "./store";

/** Tiny synthesized UI sounds — no audio files. Off by default. */
let ctx: AudioContext | null = null;

export function playClick(kind: "hover" | "click" = "click") {
  if (!getState().sound || typeof window === "undefined") return;
  ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(kind === "hover" ? 1400 : 720, t);
  osc.frequency.exponentialRampToValueAtTime(kind === "hover" ? 900 : 260, t + 0.08);
  gain.gain.setValueAtTime(kind === "hover" ? 0.025 : 0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.13);
}
