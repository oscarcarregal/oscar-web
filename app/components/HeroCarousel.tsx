/* Carrusel de imágenes del hero con rotación automática */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import type { HeroSlide } from "../lib/data";

interface HeroCarouselProps {
  slides: (HeroSlide & { src: string })[];
  experience?: string;
}

export default function HeroCarousel({ slides, experience }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  useEffect(() => {
    if (total === 0) return;
    const timer = setInterval(
      () => setCurrent((prev) => (prev + 1) % total),
      6000
    );
    return () => clearInterval(timer);
  }, [total]);

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  if (total === 0) return null;

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-carbon text-white">
      {/* Imágenes de fondo */}
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          aria-hidden="true"
          className={`absolute inset-0 transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
        >
          <Image
            src={slide.src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* Gradientes superpuestos */}
      <div className="absolute inset-0 bg-gradient-to-b from-carbon/80 via-carbon/50 to-carbon/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-carbon/40 via-transparent to-carbon/40" />

      {/* Contenido central */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-6 pb-26 text-center">
        <span className="animate-fade-up mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-medium tracking-widest uppercase text-white/90 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-copper animate-pulse" />
          {experience || "Más de 15 años de experiencia"}
        </span>

        <h1 className="animate-fade-up delay-1 font-heading max-w-5xl text-[2.75rem] leading-[1.1] tracking-tight drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
          Tu reforma de sueños,
          <br />
          <span className="text-gradient-copper">hecha realidad</span>
        </h1>

        <p className="animate-fade-up delay-2 mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
          Fontanería, gas, calefacción y reformas integrales con los mejores
          materiales y un acabado impecable.
        </p>

        <div className="animate-fade-up delay-3 mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/presupuesto"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-carbon px-8 py-4 text-base font-semibold text-white shadow-lg shadow-black/10 transition-all duration-300 hover:bg-[#333333] hover:shadow-xl"
          >
            <span className="relative z-10 flex items-center gap-2">
              Cuéntame tu proyecto
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
            <span className="absolute inset-0 animate-shimmer" />
          </Link>
          <a
            href="#servicios"
            className="relative isolate inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-base font-medium text-white [transform:translateZ(0)] transition-all duration-300 hover:border-white/35 hover:bg-white/15"
          >
            Ver Servicios
          </a>
        </div>

        {/* Estadísticas */}
        <div className="animate-fade-up delay-5 mt-20 flex items-center gap-8 sm:gap-14">
          {[
            { value: "+50", label: "Proyectos" },
            { value: "+15", label: "Años exp." },
            { value: "100%", label: "Garantía" },
          ].map((item) => (
            <div key={item.label} className="text-center group">
              <p className="relative text-2xl font-bold text-white drop-shadow md:text-3xl">
                {item.value}
              </p>
              <p className="mt-1 text-[11px] font-medium tracking-widest uppercase text-white/70">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Flechas de navegación */}
      <button
        onClick={prev}
        aria-label="Diapositiva anterior"
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/15 md:left-8"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Diapositiva siguiente"
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/15 md:right-8"
      >
        <ChevronRight size={20} />
      </button>

      {/* Indicadores inferiores */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-4">
        <span className="rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
          {slides[current]?.caption?.split(" — ")[0]}
        </span>
        <div className="flex items-center gap-2.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Ir a diapositiva ${i + 1}`}
              className={`rounded-full transition-all duration-500 ${i === current
                ? "h-2 w-8 bg-silver"
                : "h-2 w-2 bg-white/25 hover:bg-white/50"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
