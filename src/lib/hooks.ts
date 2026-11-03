"use client";
import { useEffect, useState } from "react";

export function useMediaQuery(q: string, initial = false) {
  const [match, setMatch] = useState(initial);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [q]);
  return match;
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useIsTouch = () => useMediaQuery("(hover: none), (pointer: coarse)", true);
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
