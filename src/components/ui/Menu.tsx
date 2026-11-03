"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { setState, useStore } from "@/lib/store";
import { lockScroll, scrollTo } from "@/lib/lenis";
import { site } from "@/data/site";
import { pageImage } from "@/data/projects";
import RollText from "./RollText";
import { transitionTo } from "./Curtain";
import { playClick } from "@/lib/sound";

const links = [
  { label: "Home", id: "top", img: pageImage(1, "md") },
  { label: "About", id: "about", img: site.photo.src },
  { label: "Work", id: "work", img: pageImage(8, "md") },
  { label: "Craft", id: "craft", img: pageImage(10, "md") },
  { label: "Contact", id: "contact", img: pageImage(23, "md") },
];
const ease = [0.16, 1, 0.3, 1] as const;

export default function Menu() {
  const open = useStore((s) => s.menuOpen);
  const pathname = usePathname();
  const [active, setActive] = useState(0);

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setState({ menuOpen: false });
    window.addEventListener("keydown", esc);
    document.getElementById("menu-first")?.focus();
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const go = (id: string) => {
    playClick();
    setState({ menuOpen: false });
    if (pathname !== "/") return transitionTo(id === "top" ? "/" : `/#${id}`);
    setTimeout(() => scrollTo(id === "top" ? 0 : `#${id}`, { duration: 2 }), 450);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[65] overflow-hidden bg-ink"
          initial={{ clipPath: "circle(0% at calc(100% - 4rem) 3rem)" }}
          animate={{ clipPath: "circle(150% at calc(100% - 4rem) 3rem)" }}
          exit={{ clipPath: "circle(0% at calc(100% - 4rem) 3rem)" }}
          transition={{ duration: 0.9, ease }}
          data-lenis-prevent
        >
          <div className="container-x grid h-full grid-cols-1 items-center gap-10 pt-24 pb-10 md:grid-cols-[1.3fr_1fr]">
            <nav aria-label="Primary">
              <ul className="space-y-1">
                {links.map((l, i) => (
                  <li key={l.id} className="overflow-hidden">
                    <motion.button
                      id={i === 0 ? "menu-first" : undefined}
                      type="button"
                      onClick={() => go(l.id)}
                      onPointerEnter={() => { setActive(i); playClick("hover"); }}
                      onFocus={() => setActive(i)}
                      initial={{ y: "110%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "110%" }}
                      transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.06 }}
                      className="roll-host group flex items-baseline gap-4 text-left"
                    >
                      <span className="label w-8 tabular-nums">0{i + 1}</span>
                      <span className={`display text-[13vw] leading-[0.95] transition-colors duration-500 md:text-[7.5vw] ${active === i ? "text-paper" : "text-paper/30"}`}>
                        <RollText text={l.label} />
                      </span>
                    </motion.button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="relative hidden aspect-[4/5] max-h-[70vh] overflow-hidden rounded-2xl md:block">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={active}
                  src={links[active].img}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.25 }}
                  animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
                  exit={{ opacity: 0.4 }}
                  transition={{ duration: 0.9, ease }}
                />
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            </div>
            <motion.div
              className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-6 md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.8, ease } }}
              exit={{ opacity: 0 }}
            >
              <a href={`mailto:${site.email}`} className="roll-host text-sm"><RollText text={site.email} /></a>
              {site.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="roll-host text-sm text-muted hover:text-paper">
                  <RollText text={s.label} />
                </a>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
