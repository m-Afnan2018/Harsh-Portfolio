"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip, SplitText, useGSAP);
  gsap.defaults({ ease: "expo.out" });
}

export { gsap, ScrollTrigger, Flip, SplitText, useGSAP };

/** Shared media-query conditions for gsap.matchMedia */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 768px) and (pointer: fine)",
  wide: "(min-width: 768px)",
  mobile: "(max-width: 767px)",
};
