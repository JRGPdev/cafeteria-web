import { Anatomy } from "@/components/landing/Anatomy/Anatomy";
import { Espresso } from "@/components/landing/Espresso/Espresso";
import { Hero } from "@/components/landing/Hero/Hero";
import { Origin } from "@/components/landing/Origin/Origin";
import { SectionIndicator } from "@/components/landing/SectionIndicator/SectionIndicator";
import { Visit } from "@/components/landing/Visit/Visit";
import { Footer } from "@/components/layout/Footer/Footer";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { SceneLoader } from "@/components/three/SceneLoader";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Navbar />
      <SceneLoader />
      <SectionIndicator />

      {/* El orden de las secciones define las paradas de la escena 3D (three/choreography.ts). */}
      <main>
        <Hero />
        <Anatomy />
        <Espresso />
        <Origin />
        <Visit />
      </main>

      <Footer />
    </>
  );
}
