"use client";
import { setState, useStore } from "@/lib/store";
import { playClick } from "@/lib/sound";

export default function SoundToggle() {
  const on = useStore((s) => s.sound);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Turn interface sound off" : "Turn interface sound on"}
      onClick={() => {
        setState({ sound: !on });
        setTimeout(() => playClick(), 10);
      }}
      className="group flex h-10 items-center gap-2 px-2 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-paper"
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-[2px] rounded-full bg-current"
            style={{
              height: on ? "100%" : "25%",
              animation: on ? `eq 0.${6 + i}s ease-in-out ${i * 0.1}s infinite alternate` : "none",
              transition: "height .4s",
            }}
          />
        ))}
      </span>
      <span className="hidden sm:inline">Sound {on ? "on" : "off"}</span>
      <style>{`@keyframes eq{from{transform:scaleY(.3)}to{transform:scaleY(1)}} [aria-pressed] span span{transform-origin:bottom}`}</style>
    </button>
  );
}
