/* Sección de servicios con tarjetas de iconos */
"use client";

import { Droplets, Flame, Thermometer, Hammer } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";

const services = [
  {
    icon: Droplets,
    title: "Fontanería",
    description:
      "instalaciones sanitarias en viviendas y locales, montantes de agua, bajantes comunitarias.",
    accent: "copper",
  },
  {
    icon: Flame,
    title: "Gas",
    description:
      "Empresa autorizada, Instalacion de calderas y calentadores de gas, certificados y alta en industria.",
    accent: "steel-blue",
  },
  {
    icon: Thermometer,
    title: "Calefacción y climatización",
    description:
      "Instalacion de radiadores, suelo radiante y aire acondicionado.",
    accent: "copper",
  },
  {
    icon: Hammer,
    title: "Reformas generales",
    description:
      "Reformas de cuartos de baños, cocinas pisos y locales, coordinación de gremios.",
    accent: "steel-blue",
  },
];

export default function Services() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      id="servicios"
      className="scroll-mt-28 bg-cream py-28 md:py-36"
    >
      <div ref={ref} className="mx-auto max-w-7xl px-6">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
            Nuestros Servicios
          </span>
          <h2 className="mt-4 text-3xl text-carbon md:text-4xl lg:text-[2.75rem]">
            Soluciones profesionales
            <br className="hidden sm:block" />
             para tu hogar
          </h2>
          <span className="mx-auto mt-6 decorative-line" />
          <p className="mt-6 text-base leading-relaxed text-silver">
            Cubrimos todas las necesidades de tu vivienda con un equipo
            cualificado y materiales de primera calidad.
          </p>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, index) => (
            <div
              key={s.title}
              className={`group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all duration-[2600ms] ease-in-out hover-glow hover:-translate-y-1 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{
                transitionDelay: visible ? `${200 + index * 100}ms` : "0ms",
              }}
            >
              <div
                className={`absolute top-0 left-0 right-0 h-[2px] ${
                  s.accent === "copper"
                    ? "bg-gradient-to-r from-copper to-copper-light"
                    : "bg-gradient-to-r from-steel-blue to-steel-blue-light"
                }`}
              />
              <div
                className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300 ${
                  s.accent === "copper"
                    ? "bg-copper/8 group-hover:bg-copper/15"
                    : "bg-steel-blue/8 group-hover:bg-steel-blue/15"
                }`}
              >
                <s.icon
                  className={
                    s.accent === "copper" ? "text-copper" : "text-steel-blue"
                  }
                  size={26}
                />
              </div>
              <h3 className="text-xl text-carbon">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-silver">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
