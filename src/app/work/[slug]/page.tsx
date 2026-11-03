import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, pageImage, projects } from "@/data/projects";
import ProjectPage from "@/components/work/ProjectPage";
import Footer from "@/components/sections/Footer";

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const title = `${p.title} · ${p.client}`;
  return {
    title,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title, description: p.summary, url: `/work/${p.slug}`, images: [{ url: pageImage(p.pages[0], "md"), width: 1280, height: 720, alt: title }] },
    twitter: { card: "summary_large_image", title, description: p.summary, images: [pageImage(p.pages[0], "md")] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  return (
    <>
      <ProjectPage slug={slug} />
      <Footer />
    </>
  );
}
