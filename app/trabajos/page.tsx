import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import { fetchConfig, fetchAllReformas } from "../lib/data";
import TrabajosClient from "./TrabajosClient";


/* ─────────────────────── HERO BANNER ─────────────────────── */

function TrabajosHero() {
  return (
    <section className="relative overflow-hidden bg-carbon py-24 md:py-32">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/3 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/3 blur-[100px]" />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center animate-fade-up">
        <h1 className="font-heading text-4xl leading-tight text-white md:text-5xl lg:text-6xl">
          Nuestros Trabajos
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
          Explora algunos de nuestros proyectos de reformas, fontanería e instalaciones.
        </p>
      </div>
    </section>
  );
}

export default async function TrabajosPage() {
  const [config, projects] = await Promise.all([
    fetchConfig(),
    fetchAllReformas(),
  ]);

  return (
    <>
      <Navbar />
      <TrabajosHero />
      <TrabajosClient
        projects={projects}
        tags={config.tags}
        phoneNumber={config.business?.phoneNumber ?? ""}
      />
      <Footer />
      <FloatingActions phoneNumber={config.business?.phoneNumber} />
    </>
  );
}
