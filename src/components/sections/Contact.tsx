"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import Magnetic from "@/components/ui/Magnetic";
import RollText from "@/components/ui/RollText";
import { site } from "@/data/site";
import { playClick } from "@/lib/sound";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    playClick();
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      window.location.href = `mailto:${site.email}`;
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="contact" className="container-x relative z-10 flex min-h-svh flex-col justify-center py-28 md:py-40" aria-labelledby="contact-title">
      <div className="mb-12 flex items-center gap-4 md:mb-16">
        <span className="label">(04)</span>
        <span className="hairline flex-1" />
        <span className="label">Contact</span>
      </div>
      <div className="relative">
        <Reveal as="h2" className="display text-center text-[15vw] md:text-[10.5vw]" type="chars" stagger={0.02}>
          <span id="contact-title">
            Let&apos;s work <br />
            <span className="outline-text-blue">together</span>
          </span>
        </Reveal>

        <div className="mt-10 flex justify-center md:-mt-6">
          <Magnetic strength={0.5}>
            <a
              href={`mailto:${site.email}?subject=Project%20enquiry`}
              data-anchor="4"
              data-cursor="open"
              data-cursor-label="Write"
              onClick={() => playClick()}
              className="roll-host relative grid h-44 w-44 place-items-center rounded-full border border-glow/30 bg-blue/10 text-center shadow-[0_0_60px_rgba(47,107,255,.25)] md:h-52 md:w-52"
            >
              <span className="absolute inset-0 rounded-full border border-glow/40 [animation:ping_2.6s_cubic-bezier(0,0,.2,1)_infinite] motion-reduce:hidden" aria-hidden />
              <span className="relative z-10 text-xs font-medium uppercase tracking-[0.16em] text-white md:text-sm md:tracking-[0.2em]">
                <RollText text="Start a project" />
              </span>
            </a>
          </Magnetic>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-10 border-t border-line pt-10 md:mt-24 md:grid-cols-3">
        <div>
          <span className="label">Email</span>
          <button
            type="button"
            onClick={copy}
            data-cursor-label="Copy"
            data-cursor="open"
            className="relative mt-3 flex items-center gap-3 text-left text-lg md:text-xl"
            aria-label={`Copy email address ${site.email}`}
          >
            <span className="roll-host"><RollText text={site.email} /></span>
            <span className="relative inline-flex h-7 min-w-16 items-center justify-center overflow-hidden rounded-full border border-line px-3 text-[10px] uppercase tracking-[0.18em] text-muted">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? "y" : "n"}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={copied ? "text-glow" : ""}
                >
                  {copied ? "Copied!" : "Copy"}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Email copied to clipboard" : ""}</span>
        </div>
        <div>
          <span className="label">Phone / WhatsApp</span>
          <div className="mt-3 flex flex-col gap-1 text-lg md:text-xl">
            <a href={site.phoneHref} className="roll-host w-fit"><RollText text={site.phone} /></a>
            <a href={site.whatsapp} target="_blank" rel="noreferrer" className="roll-host w-fit text-sm text-muted hover:text-paper">
              <RollText text="Message on WhatsApp ↗" />
            </a>
          </div>
        </div>
        <div>
          <span className="label">Elsewhere</span>
          <ul className="mt-3 flex flex-col gap-1 text-lg md:text-xl">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="roll-host" onPointerEnter={() => playClick("hover")}>
                  <RollText text={`${s.label} ↗`} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
