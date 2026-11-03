/**
 * ALL portfolio work — extracted from "INVENT BRANDING.pdf" (23 pages).
 * The PDF is one brand case study for Invent Elevators; each logical group
 * of pages is presented as its own project.
 *
 * Images live in /public/work as `${prefix}-${page}-${size}.webp`
 * (regenerate with `npm run extract`). Sizes: sm 640w · md 1280w · lg 2560w.
 *
 * `tools` is empty because the PDF does not list software — add them here if you like.
 * `year` comes from the PDF's document date (2026).
 */

export type Discipline = "Identity" | "Social & Screen" | "Print & Packaging" | "Applied Graphics";

export type Highlight = { label: string; items: string[] };

export type Project = {
  slug: string;
  title: string;
  client: string;
  category: string;
  discipline: Discipline;
  year: string;
  tools: string[];
  summary: string;
  description: string[];
  highlights: Highlight[];
  /** PDF page numbers belonging to this project (first = cover). */
  pages: number[];
};

const PREFIX = "invent";
export const PAGE_ASPECT = 2160 / 3840; // every PDF page is 16:9

export const pageImage = (page: number, size: "sm" | "md" | "lg" = "md") =>
  `/work/${PREFIX}-${String(page).padStart(2, "0")}-${size}.webp`;

export const pageSrcSet = (page: number) =>
  `${pageImage(page, "sm")} 640w, ${pageImage(page, "md")} 1280w, ${pageImage(page, "lg")} 2560w`;

const client = "Invent Elevators";

export const projects: Project[] = [
  {
    slug: "invent-visual-identity",
    title: "Logo & Visual Identity",
    client,
    category: "Logo & Identity Design",
    discipline: "Identity",
    year: "2026",
    tools: [],
    summary:
      "A building-inspired mark in gold on dark, an app icon on a strict grid, bilingual typography and a restrained four-colour palette.",
    description: [
      "The mark abstracts architecture and vertical movement into simple gold strokes, paired with a spaced-out INVENT ELEVATOR wordmark. It sits on deep, near-black surfaces to feel premium rather than technical.",
      "The app icon is drawn on a 215 × 215px grid with 65px clear space. Typography pairs Vera Humana 95 (primary) with Gotham (secondary), plus an Arabic display face for bilingual layouts.",
    ],
    highlights: [
      { label: "Typography", items: ["Vera Humana 95 — Primary", "Gotham — Secondary", "Arabic display face"] },
      {
        label: "Colour Palette",
        items: ["Primary #5E5248", "Blue Matte #102950", "Secondary Beige", "Secondary Dark #030308", "White #FFFFFF"],
      },
      { label: "Icon", items: ["215 × 215px icon", "65px clear space"] },
    ],
    pages: [8, 9, 10, 11],
  },
  {
    slug: "invent-brand-book",
    title: "Brand Book",
    client,
    category: "Brand Book & Layout",
    discipline: "Identity",
    year: "2026",
    tools: [],
    summary:
      "The brand presentation itself — cover, typographic hierarchy and layouts that explain the brand's values, audience and character.",
    description: [
      "A 16:9 brand book laid out in the identity's own type and colours: an image-led cover, airy pages with large uppercase headings, and split layouts pairing text with photography and mockups.",
      "The brief it presents: Invent Elevator is a premium elevator company across UAE and GCC, positioned as “Luxury Vertical Mobility for Modern Living” — so every page had to feel minimal, architectural and high-end.",
    ],
    highlights: [
      { label: "Pages designed", items: ["Cover", "Brand overview", "Challenges & solution", "Values & competitive edge", "Brand differentiation", "Customer transformation & audience"] },
      { label: "Brand values", items: ["Luxury First", "Design Driven", "Engineering Excellence", "Customer-Centric Approach", "Innovation & Modernization"] },
      { label: "Also shown", items: ["Employee ID card & lanyard"] },
    ],
    pages: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    slug: "invent-social-media",
    title: "Social Media Creatives",
    client,
    category: "Social Media Design",
    discipline: "Social & Screen",
    year: "2026",
    tools: [],
    summary: "Post designs, a consistent Instagram grid and profile artwork for YouTube, Facebook and LinkedIn.",
    description: [
      "Lifestyle-led post designs built on repeatable layouts — photography of interiors and lifts, gold accents and short typographic headlines — so the feed reads as one coherent grid.",
      "The same artwork is adapted into covers and profile images for each platform.",
    ],
    highlights: [
      { label: "Platforms", items: ["Instagram", "YouTube", "Facebook", "LinkedIn"] },
      { label: "Profile line", items: ["Luxury Vertical Mobility for Modern Living", "Dubai | Sharjah | Abu Dhabi | UAE"] },
    ],
    pages: [12, 13, 14],
  },
  {
    slug: "invent-website",
    title: "Website & App Screens",
    client,
    category: "Web & App Graphics",
    discipline: "Social & Screen",
    year: "2026",
    tools: [],
    summary: "Website and mobile / tablet screens carrying the identity — “Where Architecture Meets Elevation”.",
    description: [
      "Hero imagery, the gold-on-dark palette and the brand's type hierarchy translated to desktop, tablet and phone screens, presented as device mockups.",
    ],
    highlights: [{ label: "Screens", items: ["Website", "Mobile / Tablet"] }],
    pages: [15, 16],
  },
  {
    slug: "invent-outdoor",
    title: "Metro Posters & Banner",
    client,
    category: "Poster & Banner Design",
    discipline: "Print & Packaging",
    year: "2026",
    tools: [],
    summary: "A series of metro posters and a large-format bilingual sponsor banner.",
    description: [
      "Three portrait posters that share one grid — headline, image and logo — alternating light and dark versions, plus a sponsor banner with an Arabic headline set against architectural photography.",
    ],
    highlights: [{ label: "Formats", items: ["Metro posters", "Sponsor banner"] }],
    pages: [17, 18],
  },
  {
    slug: "invent-packaging",
    title: "Shipping Boxes",
    client,
    category: "Packaging Design",
    discipline: "Print & Packaging",
    year: "2026",
    tools: [],
    summary: "Branded kraft shipping boxes for components and deliveries.",
    description: ["Corrugated kraft boxes printed with the mark and handling icons — the identity kept simple enough to survive one-colour print on cardboard."],
    highlights: [{ label: "Formats", items: ["Shipping boxes"] }],
    pages: [21],
  },
  {
    slug: "invent-exhibition",
    title: "Exhibition Stall",
    client,
    category: "Exhibition Graphics",
    discipline: "Applied Graphics",
    year: "2026",
    tools: [],
    summary: "Stall graphics that bring the identity into a physical space.",
    description: [
      "Wall graphics, wordmark, photography and a gold Dubai map illustration across the stand, with the brand colours split between light and dark panels.",
    ],
    highlights: [{ label: "Applied to", items: ["Exhibition stall"] }],
    pages: [19],
  },
  {
    slug: "invent-construction",
    title: "Workwear & Helmet",
    client,
    category: "Merchandise Design",
    discipline: "Applied Graphics",
    year: "2026",
    tools: [],
    summary: "Branded hi-vis vests and hard hats for on-site teams.",
    description: ["The mark and wordmark placed on orange workwear and helmets — legible at distance and on curved surfaces."],
    highlights: [{ label: "Applied to", items: ["Workwear", "Helmet"] }],
    pages: [20],
  },
  {
    slug: "invent-transportation",
    title: "Truck Livery",
    client,
    category: "Vehicle Graphics",
    discipline: "Applied Graphics",
    year: "2026",
    tools: [],
    summary: "A dark, architectural livery that turns delivery trucks into moving posters.",
    description: ["Large-scale vehicle graphics with the LUXURY LIFTS headline, lift photography and the brand's web address, laid out to read from the side of the road."],
    highlights: [{ label: "Applied to", items: ["Delivery truck"] }],
    pages: [22, 23],
  },
];

export const disciplines: ("All" | Discipline)[] = ["All", "Identity", "Social & Screen", "Print & Packaging", "Applied Graphics"];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const neighbours = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  const n = projects.length;
  return { prev: projects[(i - 1 + n) % n], next: projects[(i + 1) % n] };
};
