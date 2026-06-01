/* Página principal — orquesta las secciones del home */
"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingActions from "./components/FloatingActions";
import HeroCarousel from "./components/HeroCarousel";
import Services from "./components/Services";
import Portfolio from "./components/Portfolio";
import WhyUs from "./components/WhyUs";
import CTA from "./components/CTA";
import StoreLocation from "./components/StoreLocation";
import Contact from "./components/Contact";
import {
  fetchConfig,
  fetchReformas,
  type SiteConfig,
  type ReformaProject,
  type HeroSlide,
} from "./lib/data";
import { HomeSkeleton } from "./components/Skeletons";

/* ─────────────────────── HOOK DE DATOS ─────────────────────── */

function useHomeData() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [heroSlides, setHeroSlides] = useState<
    (HeroSlide & { src: string })[]
  >([]);
  const [featured, setFeatured] = useState<ReformaProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const config: SiteConfig = await fetchConfig();
        setSiteConfig(config);
        const slides = config.heroCarousel.map((s) => ({
          ...s,
          src: `/reformas/${s.reforma}/${s.image}`,
        }));
        setHeroSlides(slides);

        const featuredData = await fetchReformas(config.featuredReformas);
        setFeatured(featuredData);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { siteConfig, heroSlides, featured, loading };
}

/* ─────────────────────── PÁGINA ─────────────────────── */

export default function Home() {
  const { siteConfig, heroSlides, featured, loading } = useHomeData();

  const business = siteConfig?.business;

  return (
    <>
      <Navbar />
      {loading ? (
        <HomeSkeleton />
      ) : (
        <HeroCarousel slides={heroSlides} experience={business?.experience} />
      )}
      <Services />
      {!loading && <Portfolio projects={featured} />}
      <WhyUs experience={business?.experience ?? ""} />
      <CTA phoneNumber={business?.phoneNumber ?? ""} />
      <StoreLocation config={siteConfig} />
      <Contact config={siteConfig} />
      <Footer />
      <FloatingActions phoneNumber={business?.phoneNumber} />
    </>
  );
}
