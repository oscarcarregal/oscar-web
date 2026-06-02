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
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
    gradientClass: "from-blue-500 to-blue-400",
  },
  {
    icon: Flame,
    title: "Gas",
    description:
      "Empresa autorizada, Instalacion de calderas y calentadores de gas, certificados y alta en industria.",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10 group-hover:bg-amber-500/20",
    gradientClass: "from-amber-500 to-amber-400",
  },
  {
    icon: Thermometer,
    title: "Calefacción y climatización",
    description:
      "Instalacion de radiadores, suelo radiante y aire acondicionado.",
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10 group-hover:bg-red-500/20",
    gradientClass: "from-red-500 to-red-400",
  },
  {
    icon: Hammer,
    title: "Reformas generales",
    description:
      "Reformas de cuartos de baños, cocinas pisos y locales, coordinación de gremios.",
    iconColor: "text-stone-600",
    iconBg: "bg-stone-600/10 group-hover:bg-stone-600/20",
    gradientClass: "from-stone-600 to-stone-500",
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
                className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${s.gradientClass}`}
              />
              <div
                className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300 ${s.iconBg}`}
              >
                <s.icon
                  className={s.iconColor}
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
