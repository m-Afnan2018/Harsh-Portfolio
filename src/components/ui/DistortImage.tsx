"use client";
import { useRef, type ImgHTMLAttributes } from "react";
import { hoverGL } from "@/lib/hoverGL";

/**
 * <img> with a GLSL liquid / RGB-shift hover. The <img> stays in the DOM
 * (accessibility, lazy-loading); a shared WebGL canvas is laid over it on hover.
 */
export default function DistortImage({
  glSrc,
  strength = 1,
  className = "",
  imgClassName = "",
  flipId,
  ...img
}: ImgHTMLAttributes<HTMLImageElement> & {
  glSrc: string;
  strength?: number;
  imgClassName?: string;
  flipId?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={host}
      className={`relative overflow-hidden ${className}`}
      onPointerEnter={(e) => hoverGL()?.enter(host.current!, glSrc, e.nativeEvent, { strength })}
      onPointerMove={(e) => hoverGL()?.move(e.nativeEvent)}
      onPointerLeave={() => hoverGL()?.leave(host.current!)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...img} data-flip-id={flipId} className={`block h-full w-full object-cover ${imgClassName}`} />
    </div>
  );
}
