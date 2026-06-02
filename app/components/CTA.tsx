/* Sección de llamada a la acción */
"use client";

import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function CTA({ phoneNumber }: { phoneNumber: string }) {
  const { ref, visible } = useScrollReveal();
  const phoneHref = phoneNumber ? `tel:+34${phoneNumber}` : "#";

  return (
    <section className="relative overflow-hidden bg-carbon py-24 md:py-32">
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-white/3 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-white/3 blur-[100px]" />

      <div
        ref={ref}
        className={`mx-auto max-w-4xl px-6 text-center transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="text-3xl text-white md:text-4xl lg:text-5xl">
          ¿Listo para transformar
          <br className="hidden sm:block" />
          <span className="text-gradient-copper">tu hogar?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70">
          Cuéntame tu proyecto y me pondré en contacto contigo para darte una
          respuesta personalizada y adaptada a lo que necesitas.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={phoneHref}
            className="group inline-flex items-center gap-2 rounded-full bg-copper px-8 py-4 text-base font-semibold text-white shadow-lg shadow-copper/25 transition-all duration-300 hover:bg-copper-light hover:shadow-xl"
          >
            <Phone size={18} />
            Llamar Ahora
          </a>
          <Link
            href="/presupuesto"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10"
          >
            <Mail size={18} />
            Tu Proyecto
          </Link>
        </div>
      </div>
    </section>
  );
}
