/* Sección "Por qué elegirnos" con razones y tarjeta de empresa */
"use client";

import Image from "next/image";
import { ShieldCheck, Sparkles, CalendarCheck, Star } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Calidad Premium",
    description:
      "Trabajamos solo con marcas líderes y materiales certificados con todas las garantías.",
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10",
  },
  {
    icon: Sparkles,
    title: "Limpieza Absoluta",
    description:
      "Dejamos tu hogar impecable tras cada trabajo. Protegemos muebles y superficies durante toda la obra.",
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
  },
  {
    icon: CalendarCheck,
    title: "Plazos Cumplidos",
    description:
      "Planificamos cada fase al detalle. Nos comprometemos con la fecha de entrega y la cumplimos.",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
];

export default function WhyUs({ experience }: { experience: string }) {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="nosotros" className="scroll-mt-28 bg-cream py-28 md:py-36">
      <div ref={ref} className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div
            className={`transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              }`}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
              ¿Por qué elegirnos?
            </span>
            <h2 className="mt-4 text-3xl text-carbon md:text-4xl lg:text-[2.75rem]">
              La diferencia está
              <br />
              en los detalles
            </h2>
            <span className="mt-6 decorative-line" />
            <p className="mt-6 text-base leading-relaxed text-silver">
              No somos una empresa más. Nos tomamos cada proyecto como si
              fuera nuestro propio hogar.
            </p>

            <div className="mt-12 space-y-8">
              {reasons.map((r, i) => (
                <div
                  key={r.title}
                  className={`flex gap-5 transition-all duration-500 ${visible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                    }`}
                  style={{
                    transitionDelay: visible ? `${300 + i * 150}ms` : "0ms",
                  }}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${r.iconBg}`}>
                    <r.icon className={r.iconColor} size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg text-carbon">{r.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-silver">
                      {r.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`relative transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              }`}
          >
            <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-silver/10 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-silver/10 blur-3xl animate-pulse" />

            <div className="relative overflow-hidden rounded-3xl bg-carbon p-10 text-white shadow-2xl md:p-14">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/3" />
              <div className="relative">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <Image
                    src="/assets/Logo__1_-removebg-preview.png"
                    alt="OC Símbolo"
                    width={56}
                    height={56}
                    className="h-14 w-14 object-contain"
                  />
                </div>
                <h3 className="mt-8 text-center text-2xl md:text-3xl">
                  {experience} cuidando hogares
                </h3>
                <p className="mt-4 text-center text-sm leading-relaxed text-white/70">
                  Desde instalaciones sencillas hasta reformas integrales,
                  ponemos la misma dedicación en cada proyecto.
                </p>
                <div className="mt-8 flex justify-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="mt-2 text-center text-xs tracking-wide text-white/70">
                  Valoración media de nuestros clientes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
