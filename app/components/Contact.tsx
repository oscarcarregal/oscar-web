/* Sección de contacto con tarjetas de información */
"use client";

import { Phone, Mail, MapPin, CalendarCheck } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { formatPhoneNumber } from "../lib/phone";
import type { SiteConfig } from "../lib/data";

export default function Contact({ config }: { config: SiteConfig | null }) {
  const { ref, visible } = useScrollReveal();

  /* ── Fallbacks SEO: datos visibles incluso antes del fetch ── */
  const phone = config?.business?.phoneNumber ?? "600670867";
  const email = config?.business?.email ?? "oscarcarregalfontaneria@gmail.com";
  const schedule = config?.business?.schedule;
  const phoneHref = `tel:+34${phone}`;

  const contactItems = [
    {
      icon: Phone,
      title: "Teléfono",
      line1: formatPhoneNumber(phone),
      line2:
        schedule?.days && schedule?.hours
          ? `${schedule.days} · ${schedule.hours}`
          : "Lun–Vie · 08:00–19:00",
      href: phoneHref,
      iconColor: "text-green-500",
      iconBg: "bg-green-500/10 group-hover:bg-green-500/20",
    },
    {
      icon: Mail,
      title: "Email",
      line1: email,
      line2: config?.business?.responseTime ?? "Respuesta en menos de 24h",
      href: `mailto:${email}`,
      iconColor: "text-indigo-500",
      iconBg: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
    },
    {
      icon: MapPin,
      title: "Visita nuestro local",
      line1: config?.storeAddress
        ? (config.storeAddress.street.toLowerCase().includes("local") ? config.storeAddress.street : `${config.storeAddress.street}, local 1`)
        : "Avenida de Tolosa 89, local 1",
      line2: "⚠️ Solo con cita previa",
      href: "#ubicacion",
      iconColor: "text-red-500",
      iconBg: "bg-red-500/10 group-hover:bg-red-500/20",
    },
  ];

  // The location card is special: render it separately with the appointment badge
  const regularItems = contactItems.slice(0, 2);
  const locationItem = contactItems[2];

  return (
    <section id="contacto" className="scroll-mt-28 bg-white py-28 md:py-36">
      <div ref={ref} className="mx-auto max-w-7xl px-6">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
            Contacto
          </span>
          <h2 className="mt-4 text-3xl text-carbon md:text-4xl lg:text-[2.75rem]">
            Hablemos de tu proyecto
          </h2>
          <span className="mx-auto mt-6 decorative-line" />
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {regularItems.map((c, i) => {
            const CardWrapper = c.href ? "a" : "div";
            return (
              <CardWrapper
                key={c.title}
                href={c.href}
                target={c.href?.startsWith("http") ? "_blank" : undefined}
                rel={c.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`group flex flex-col items-center rounded-2xl bg-cream p-10 text-center transition-all duration-500 hover-glow hover:-translate-y-1 ${visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
                  }`}
                style={{
                  transitionDelay: visible ? `${200 + i * 120}ms` : "0ms",
                }}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300 ${c.iconBg}`}>
                  <c.icon className={c.iconColor} size={24} />
                </div>
                <h3 className="mt-5 text-xl text-carbon">{c.title}</h3>
                <p className="mt-2 text-sm font-medium text-gray-dark transition-colors group-hover:text-copper">
                  {c.line1}
                </p>
                <p className="mt-1 text-xs text-silver">{c.line2}</p>
              </CardWrapper>
            );
          })}

          {/* Location card — links to #ubicacion section */}
          <a
            href="#ubicacion"
            className={`group flex flex-col items-center rounded-2xl bg-cream p-10 text-center transition-all duration-500 hover-glow hover:-translate-y-1 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
            style={{ transitionDelay: visible ? "440ms" : "0ms" }}
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300 ${locationItem.iconBg}`}>
              <locationItem.icon className={locationItem.iconColor} size={24} />
            </div>
            <h3 className="mt-5 text-xl text-carbon">{locationItem.title}</h3>
            <p className="mt-2 text-sm font-medium text-gray-dark transition-colors group-hover:text-copper">
              {locationItem.line1}
            </p>
            {/* Appointment badge */}
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
              <CalendarCheck size={11} />
              Solo con cita previa
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
