"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** Mounts the WebGL scene unless reduced motion is requested (static pen-tool illustration instead). */
export default function SceneMount() {
  const [mode, setMode] = useState<"none" | "gl" | "static">("none");
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = document.createElement("canvas");
    const webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    setMode(reduce || !webgl || location.search.includes("nogl") ? "static" : "gl");
  }, []);
  if (mode === "gl") return <Scene />;
  if (mode === "static")
    return (
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 flex h-svh items-start justify-center pt-[24svh] opacity-70 md:justify-end md:pr-[24vw] md:pt-[14svh]">
        <svg viewBox="0 0 512 512" className="w-[40vmin] drop-shadow-[0_0_60px_rgba(47,107,255,.45)]">
          <defs>
            <linearGradient id="pn" x1="0.2" y1="0.9" x2="1" y2="0">
              <stop offset="0" stopColor="#4B4DFF" />
              <stop offset="1" stopColor="#19C3FF" />
            </linearGradient>
            <linearGradient id="pc" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#9FCDFF" />
              <stop offset="1" stopColor="#E6F3FF" />
            </linearGradient>
          </defs>
          <path d="M490 10 L430 320 L262 396 L116 250 L192 82 Z" fill="url(#pn)" stroke="url(#pn)" strokeWidth="18" strokeLinejoin="round" />
          <path d="M116 250 L262 396 L140 506 L6 372 Z" fill="url(#pc)" stroke="url(#pc)" strokeWidth="14" strokeLinejoin="round" />
          <circle cx="306" cy="206" r="44" fill="#EAF5FF" />
          <path d="M330 182 L486 26" stroke="#EAF5FF" strokeWidth="22" strokeLinecap="round" />
        </svg>
      </div>
    );
  return null;
}
