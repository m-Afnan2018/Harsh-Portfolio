# Harsh Sharma — Portfolio

Minimal, motion-rich portfolio for graphic designer **Harsh Sharma**.
Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · GSAP (ScrollTrigger, Flip, SplitText) · Lenis · React Three Fiber · custom GLSL · Framer Motion.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Node 20+. Use TypeScript 5 (Next 15 does not support TypeScript 7 yet — already pinned in `package.json`).

## Where the content lives

| What | File |
| --- | --- |
| **All projects** (title, client, category, discipline, year, tools, description, highlights, PDF pages) | `src/data/projects.ts` |
| Name, contact, socials, intro, bio, design skills, craft steps (each with its PDF page), marquee words | `src/data/site.ts` |
| Page images (extracted from the PDF) | `public/work/invent-<page>-<sm\|md\|lg>.webp` |
| Profile photo | `public/profile/harsh.webp` |

### Source rules
- Projects come **only** from `INVENT BRANDING.pdf` (23 pages — one brand case study for Invent Elevators, split into 9 graphic-design projects: identity, brand book, social creatives, web/app screens, posters & banner, packaging, exhibition, workwear, truck livery).
- `tools` is empty for every project because the PDF does not list software; add them if you want them shown.
- `year` (2026) comes from the PDF's document date, not its text.
- Profile photo and contact details come from the previous site.

### Add / edit a project
1. Put the new PDF in the project root and render its pages:
   ```bash
   python3 scripts/extract-pdf.py "NEW FILE.pdf" myprefix   # needs poppler (pdftoppm) + Pillow
   ```
   This writes `public/work/myprefix-01-{sm,md,lg}.webp` … (640 / 1280 / 2560 px wide).
2. Add an entry to `projects` in `src/data/projects.ts`. `pages` lists the PDF page numbers; the first one is the cover.
   If you use a new prefix, extend `pageImage()` (e.g. add a `prefix` field to `Project`).
3. Filters are driven by `discipline` (`Identity` · `Social & Screen` · `Print & Packaging` · `Applied Graphics`), which you can extend in `disciplines`.

## Structure

```
src/
  app/                    layout (global UI), home page, /work/[slug] (SSG + per-project metadata), sitemap, robots
  components/
    sections/             Preloader, Hero, About, Marquee, Craft, Contact, Footer,
                          Traveler (blue orb that moves between sections), SceneDirector (scroll → 3D)
    work/                 Work gallery, ProjectCard, ProjectView, ProjectOverlay (shared-element modal), ProjectPage
    webgl/                Scene (blob + particle shaders), SceneMount (reduced-motion / no-WebGL fallback)
    ui/                   Cursor, Magnetic, RollText, Reveal, DistortImage, Header, Menu, Curtain, SmoothScroll…
  lib/                    gsap setup, Lenis handle, tiny store, hover-distortion WebGL renderer, sound, scene state
  data/                   projects.ts, site.ts
scripts/extract-pdf.py    PDF → WebP
```

## How the motion works

- **3D pen tool** — the designer's signature object, modelled in code (`components/webgl/PenModel.ts`: extruded, bevelled
  nib with a keyhole slit, pearl inlays and a frosted collar, custom gradient/rim-light shader). One fixed R3F canvas;
  `lib/sceneState.ts` holds numbers (position, scale, explode, aim, scatter, glow…) and `SceneDirector` scrubs them with
  ScrollTrigger: floats in the hero and tilts to the mouse → exploded view under the photo → dissolves into particles that
  frame the work gallery → reassembles beside the contact CTA and points at it, with particles drawn to the cursor.
  The render loop stops while a project is open.
- **Travelling elements** — the hero name flies into the nav logo while the hero is pinned (scrubbed, reversible);
  a blue orb (`Traveler`) moves between `[data-anchor]` points: status dot → photo badge → work label → craft line → CTA.
  Project cards expand into the detail view with **GSAP Flip** and shrink back on close.
- **Image shader** — a single shared WebGL canvas (`lib/hoverGL.ts`) is attached to whichever image is hovered:
  liquid ripple + RGB shift driven by cursor velocity. This avoids one GL context per card.
- **Reduced motion** — no Lenis, no WebGL (a static SVG pen tool instead), no pins or scrubs; reveals become fades.
- **Mobile / touch** — lighter geometry and fewer particles, DPR capped at 1.5, no custom cursor or hover shader,
  and the horizontal gallery becomes a vertical stack.

Debug: add `?nogl` to the URL to force the static fallback.

## Deploy to Vercel

1. Push this folder to a Git repository and import it in Vercel. The framework preset is detected as Next.js; no settings are needed.
2. Set `NEXT_PUBLIC_SITE_URL` to the final domain (used for canonical URLs, Open Graph, the sitemap and JSON-LD).
   It defaults to `https://harsh-creative-designer.vercel.app`.

Or from the CLI: `npx vercel --prod`.
