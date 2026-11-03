import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/data/site";
import SmoothScroll from "@/components/ui/SmoothScroll";
import Atmosphere from "@/components/ui/Atmosphere";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Cursor from "@/components/ui/Cursor";
import Header from "@/components/ui/Header";
import Menu from "@/components/ui/Menu";
import Curtain from "@/components/ui/Curtain";
import SceneMount from "@/components/webgl/SceneMount";

const description =
  "Harsh Sharma — graphic designer. Logo and identity design, typography, colour, posters, packaging, social media creatives and vehicle graphics.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
  description,
  keywords: ["Harsh Sharma", "graphic designer", "logo design", "visual identity", "typography", "packaging design", "poster design", "portfolio", "Invent Elevators"],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    title: `${site.name} — ${site.role}`,
    description,
    url: "/",
    siteName: site.name,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${site.name} — portfolio` }],
  },
  twitter: { card: "summary_large_image", title: `${site.name} — ${site.role}`, description, images: ["/og.jpg"] },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#050608", colorScheme: "dark" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  email: `mailto:${site.email}`,
  telephone: site.phone,
  image: `${site.url}${site.photo.src}`,
  url: site.url,
  address: { "@type": "PostalAddress", addressLocality: "Ghaziabad", addressCountry: "IN" },
  sameAs: site.socials.map((s) => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href={site.photo.src} as="image" type="image/webp" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-blue focus:px-4 focus:py-2">
          Skip to content
        </a>
        <SmoothScroll />
        <Atmosphere />
        <SceneMount />
        <ScrollProgress />
        <Header />
        <Menu />
        {children}
        <Curtain />
        <Cursor />
      </body>
    </html>
  );
}
