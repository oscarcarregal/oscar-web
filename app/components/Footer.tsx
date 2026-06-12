"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Instagram, ArrowUpRight } from "lucide-react";
import { fetchConfig, type SiteConfig } from "../lib/data";
import { formatPhoneNumber } from "../lib/phone";
import { DEFAULT_SCHEDULE, formatScheduleEntry } from "../lib/schedule";

export default function Footer() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const config = await fetchConfig();
        setSiteConfig(config);
      } catch (error) {
        console.error("Error loading footer config:", error);
      }
    })();
  }, []);

  /* ── Fallbacks SEO: aseguran que Google siempre ve datos de contacto en el HTML ── */
  const phone = siteConfig?.business?.phoneNumber ?? "600670867";
  const email = siteConfig?.business?.email ?? "oscarcarregalfontaneria@gmail.com";
  const brandName = siteConfig?.business?.brandName ?? "Oscar Carregal";
  const igUrl = siteConfig?.business?.instagram?.url ?? "https://www.instagram.com/oscarcarregal_fontaneria/";
  const igHandle = siteConfig?.business?.instagram?.handle ?? "@oscarcarregal_fontaneria";
  const footerDesc = siteConfig?.footer?.description ?? "Servicios profesionales de fontanería, gas, calefacción y reformas integrales en San Sebastián (Donostia), Gipuzkoa. Más de 15 años de experiencia.";
  const copyrightLine = siteConfig?.footer?.copyrightLine ?? `© ${new Date().getFullYear()} Oscar Carregal · Fontanería & Reformas`;
  const copyrightNote = siteConfig?.footer?.copyrightNote ?? "Todos los derechos reservados";
  const storeAddress = siteConfig?.storeAddress;
  const street = storeAddress?.street ?? "Avenida de Tolosa 89";
  const postalCode = storeAddress?.postalCode ?? "20018";
  const city = storeAddress?.city ?? "San Sebastián";
  const phoneHref = `tel:+34${phone}`;

  const scheduleEntries = (siteConfig?.business?.scheduleEntries && siteConfig.business.scheduleEntries.length > 0)
    ? siteConfig.business.scheduleEntries
    : DEFAULT_SCHEDULE;

  return (
    <footer className="relative bg-carbon text-white/80">
      {/* Top decorative border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 pt-20 pb-12">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Col 1 – Brand */}
          <div className="md:col-span-5">
            <Link
              href="/admin"
              tabIndex={-1}
              aria-hidden="true"
              className="inline-block cursor-default"
            >
              <Image
                src="/assets/Logo_texto_fondo_gris-removebg-preview.png"
                alt={brandName}
                width={180}
                height={45}
                className="h-10 w-auto cursor-default brightness-90"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              {footerDesc}
            </p>
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all duration-300 hover:border-white/25 hover:text-white"
            >
              <Instagram size={16} className="text-silver" />
              {igHandle}
              <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Col 2 – Quick links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Enlaces
            </h4>
            <ul className="mt-5 space-y-3">
              {[
                { label: "Servicios", href: "/#servicios" },
                { label: "Trabajos", href: "/trabajos" },
                { label: "Tu Proyecto", href: "/presupuesto" },
                { label: "Sobre Nosotros", href: "/#nosotros" },
                { label: "Ubicación", href: "/#ubicacion" },
                { label: "Contacto", href: "/#contacto" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors duration-300 hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 – Contact info */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Contacto
            </h4>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a
                  href={phoneHref}
                  className="group flex items-center gap-3 transition-colors hover:text-white"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-white/10">
                    <Phone size={14} className="text-silver transition-colors group-hover:text-white" />
                  </div>
                  {formatPhoneNumber(phone)}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="group flex items-center gap-3 transition-colors hover:text-white"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-white/10">
                    <Mail size={14} className="text-silver transition-colors group-hover:text-white" />
                  </div>
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                  <MapPin size={14} className="text-silver" />
                </div>
                {`${street.toLowerCase().includes("local") ? street : street + ", local 1"}, ${postalCode} ${city}`}
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 shrink-0">
                  <Clock size={14} className="text-silver" />
                </div>
                <div className="mt-1 text-white flex flex-wrap gap-x-3 gap-y-1">
                  {scheduleEntries.filter(e => e.open).map((entry, i) => (
                    <span key={i} className="whitespace-nowrap">
                      <strong className="font-medium text-white/90 mr-1">{entry.days}</strong>
                      {formatScheduleEntry(entry)}
                    </span>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center gap-4 border-t border-white/8 pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-white/70">
            {copyrightLine}
          </p>
          <p className="text-xs text-white/70">
            {copyrightNote}
          </p>
        </div>
      </div>
    </footer>
  );
}
