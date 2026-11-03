"use client";
import { usePathname } from "next/navigation";
import Magnetic from "./Magnetic";
import RollText from "./RollText";
import SoundToggle from "./SoundToggle";
import { setState, useStore } from "@/lib/store";
import { scrollTo } from "@/lib/lenis";
import { transitionTo } from "./Curtain";
import { playClick } from "@/lib/sound";

export default function Header() {
  const menuOpen = useStore((s) => s.menuOpen);
  const project = useStore((s) => s.project);
  const pathname = usePathname();
  const home = pathname === "/" || (pathname.startsWith("/work/") && !!project);
  return (
    <header
      className={`container-x pointer-events-none fixed inset-x-0 top-0 z-[70] flex items-center justify-between py-5 transition-all duration-700 md:py-7 ${project ? "-translate-y-full opacity-0" : ""}`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[140%] bg-gradient-to-b from-ink via-ink/75 to-transparent" />
      <a
        id="nav-logo"
        href="/"
        aria-label="Harsh Sharma — home"
        onClick={(e) => {
          e.preventDefault();
          if (home) scrollTo(0, { duration: 2 });
          else transitionTo("/");
        }}
        className="roll-host display pointer-events-auto origin-left text-lg tracking-tight md:text-xl"
        style={{ opacity: home ? 0 : 1 }}
      >
        <RollText text="Harsh Sharma" />
        <span className="text-blue">.</span>
      </a>
      <div className="pointer-events-auto flex items-center gap-2 md:gap-5">
        <SoundToggle />
        <Magnetic strength={0.4}>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => {
              playClick();
              setState({ menuOpen: !menuOpen });
            }}
            className="roll-host group flex items-center gap-3 rounded-full border border-line bg-ink/80 py-2.5 pl-5 pr-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:border-blue/60"
          >
            <RollText text={menuOpen ? "Close" : "Menu"} />
            <span className="relative grid h-6 w-6 place-items-center rounded-full bg-blue" aria-hidden>
              <span className={`absolute h-px w-2.5 bg-white transition-transform duration-500 ${menuOpen ? "rotate-45" : "-translate-y-[2px]"}`} />
              <span className={`absolute h-px w-2.5 bg-white transition-transform duration-500 ${menuOpen ? "-rotate-45" : "translate-y-[2px]"}`} />
            </span>
          </button>
        </Magnetic>
      </div>
    </header>
  );
}
