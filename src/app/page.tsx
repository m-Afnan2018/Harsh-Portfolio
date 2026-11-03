import Preloader from "@/components/sections/Preloader";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Marquee from "@/components/sections/Marquee";
import Work from "@/components/work/Work";
import Craft from "@/components/sections/Craft";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import Traveler from "@/components/sections/Traveler";
import SceneDirector from "@/components/sections/SceneDirector";
import ProjectOverlay from "@/components/work/ProjectOverlay";

export default function Home() {
  return (
    <>
      <Preloader />
      <Traveler />
      <main id="main" className="relative">
        <Hero />
        <About />
        <Marquee />
        <Work />
        <Craft />
        <Contact />
      </main>
      <Footer />
      <SceneDirector />
      <ProjectOverlay />
    </>
  );
}
