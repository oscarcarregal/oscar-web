/* Sección de contacto con tarjetas de información */
"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { formatPhoneNumber } from "../lib/phone";
import type { SiteConfig } from "../lib/data";

export default function Contact({ config }: { config: SiteConfig | null }) {
  const { ref, visible } = useScrollReveal();

  const business = config?.business;
  const phoneHref = business?.phoneNumber ? `tel:+34${business.phoneNumber}` : undefined;

  const contactItems = [
    {
      icon: Phone,
      title: "Teléfono",
      line1: formatPhoneNumber(business?.phoneNumber),
      line2:
        business?.schedule.days && business?.schedule.hours
          ? `${business.schedule.days} · ${business.schedule.hours}`
          : "",
      href: phoneHref,
      iconColor: "text-green-500",
      iconBg: "bg-green-500/10 group-hover:bg-green-500/20",
    },
    {
      icon: Mail,
      title: "Email",
      line1: business?.email,
      line2: business?.responseTime,
      href: business?.email ? `mailto:${business.email}` : undefined,
      iconColor: "text-indigo-500",
      iconBg: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
    },
    {
      icon: MapPin,
      title: "Visita nuestro local",
      // primera linea: Calle y número
      line1: config?.storeAddress
        ? (config.storeAddress.street.toLowerCase().includes("local") ? config.storeAddress.street : `${config.storeAddress.street}, local 1`)
        : "Avenida de Tolosa 89, local 1",
      // Segunda linea: CP + Ciudad
      line2: config?.storeAddress
        ? `${config.storeAddress.postalCode} ${config.storeAddress.city}`
        : undefined,
      href: "https://maps.google.com/maps?q=" + config?.storeAddress?.mapsQuery,
      iconColor: "text-red-500",
      iconBg: "bg-red-500/10 group-hover:bg-red-500/20",
    },
  ];

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
          {contactItems.map((c, i) => (
            <div
              key={c.title}
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
              {c.href ? (
                <a
                  href={c.href}
                  className="mt-2 text-sm font-medium text-gray-dark transition-colors hover:text-copper"
                >
                  {c.line1}
                </a>
              ) : (
                <p className="mt-2 text-sm font-medium text-gray-dark">
                  {c.line1}
                </p>
              )}
              <p className="mt-1 text-xs text-silver">{c.line2}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
