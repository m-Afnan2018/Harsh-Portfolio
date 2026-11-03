/**
 * Personal + contact details.
 * Source: profile photo and contact details from the previous site
 * (harsh-creative-designer.vercel.app). Everything else is derived from the PDF.
 */
export const site = {
  name: "Harsh Sharma",
  firstName: "Harsh",
  lastName: "Sharma",
  initials: "HS",
  role: "Graphic Designer",
  /** Cycled in the hero with a scramble effect — design disciplines shown in the PDF. */
  specialties: [
    "Logo & Identity",
    "Typography",
    "Colour Palettes",
    "Poster Design",
    "Packaging Design",
    "Social Media Creatives",
  ],
  /** One-line intro under the hero. */
  intro: "Logos, type, colour and layout — drawn as one visual language and carried onto every poster, box, screen and surface.",
  photo: { src: "/profile/harsh.webp", width: 960, height: 1280, alt: "Portrait of Harsh Sharma" },
  location: "Sahibabad, Ghaziabad, India",
  timezone: "Asia/Kolkata",
  /** Edit freely — shown next to the pulsing dot in the hero. */
  availability: "Available for new projects",
  email: "hs3547454@gmail.com",
  phone: "+91 88514 37549",
  phoneHref: "tel:+918851437549",
  whatsapp: "https://wa.me/918851437549",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/harshpandattt" },
    { label: "LinkedIn", href: "https://linkedin.com/in/harsh-sharma-601413341/" },
    { label: "Behance", href: "https://www.behance.net/harshsharma400" },
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://harsh-creative-designer.vercel.app",
} as const;

/**
 * Bio — designer's voice, written only from what the PDF shows.
 * Each entry is revealed as its own line group.
 */
export const bio = [
  "I'm a graphic designer. I care about the small decisions — the weight of a letter, the space around a mark, the exact shade of a colour.",
  "For Invent Elevators I designed a building-inspired logo set in gold on dark, an app icon on a 215px grid, a bilingual type pairing — Vera Humana 95, Gotham and an Arabic display face — and a palette of warm brown, matte blue, beige and near-black.",
  "Then I put it to work: social media creatives, metro posters, a sponsor banner, an exhibition stall, shipping boxes, site workwear and a truck livery — in English and Arabic.",
];

/** Design skills shown as draggable pills — each one is visible in the PDF. */
export const skills = [
  "Logo Design",
  "Icon Design",
  "Visual Identity",
  "Typography",
  "Arabic + English Layout",
  "Colour Palettes",
  "Grids & Layout",
  "Poster Design",
  "Banner Design",
  "Social Media Creatives",
  "Packaging Design",
  "Print Collateral",
  "Exhibition Graphics",
  "Vehicle Livery",
  "Merchandise",
  "Mockups & Presentation",
];

/**
 * Craft — how an identity is built, step by step.
 * Each step is illustrated by the matching PDF page.
 */
export const craftSteps = [
  { title: "The Mark", page: 9, text: "A logo and app icon built on a grid — 215px icon, 65px clear space — so it stays sharp from a phone screen to a truck side." },
  { title: "Typography", page: 10, text: "A primary and secondary pairing, Vera Humana 95 and Gotham, plus an Arabic display face that holds the same character." },
  { title: "Colour", page: 11, text: "A restrained palette — Primary #5E5248, Blue Matte #102950, Secondary Beige, Secondary Dark #030308 and White." },
  { title: "Layout", page: 13, text: "Repeatable layouts for social posts and profiles, so every creative looks like it came from the same hand." },
  { title: "Application", page: 21, text: "The identity applied to posters, banners, a stall, boxes, workwear and vehicles — print and physical, not just screens." },
];

export const marquee = [
  "Logo Design",
  "Typography",
  "Colour",
  "Posters",
  "Packaging",
  "Social Creatives",
  "Print",
  "Livery",
];
