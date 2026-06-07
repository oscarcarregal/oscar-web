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
          src: s.image,
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

  useEffect(() => {
    if (!loading && typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const section = document.getElementById(id);
        if (section) {
          const heading = section.querySelector("h1, h2, h3");
          const target = heading ?? section;
          const navEl = document.querySelector("nav");
          const navHeight = navEl?.getBoundingClientRect().height ?? 0;
          const isMobile = window.matchMedia("(max-width: 1023px)").matches;
          const navGap = Math.round(navHeight * 0.72);
          const viewportGap = Math.round(window.innerHeight * (isMobile ? 0.02 : 0.025));
          const extraOffset = Math.min(isMobile ? 56 : 66, Math.max(isMobile ? 35 : 42, navGap, viewportGap));
          const y = target.getBoundingClientRect().top + window.scrollY - navHeight - extraOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      }, 150); // Pequeño margen para que React termine de pintar el DOM
    }
  }, [loading]);

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
      {!loading && <Portfolio projects={featured} instagramUrl={business?.instagram?.url} />}
      <WhyUs experience={business?.experience ?? ""} />
      <CTA phoneNumber={business?.phoneNumber ?? ""} />
      <StoreLocation config={siteConfig} />
      <Contact config={siteConfig} />
      <Footer />
      <FloatingActions phoneNumber={business?.phoneNumber} />
    </>
  );
}
