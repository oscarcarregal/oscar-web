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

  const business = siteConfig?.business;
  const footer = siteConfig?.footer;
  const storeAddress = siteConfig?.storeAddress;
  const phoneHref = business?.phoneNumber ? `tel:+34${business.phoneNumber}` : undefined;

  const scheduleEntries = (business?.scheduleEntries && business.scheduleEntries.length > 0)
    ? business.scheduleEntries
    : DEFAULT_SCHEDULE;

  return (
    <footer className="relative bg-carbon-light text-white/90">
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
                alt={business?.brandName ?? "Logo"}
                width={180}
                height={45}
                className="h-10 w-auto cursor-default brightness-90"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              {footer?.description}
            </p>
            <a
              href={business?.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all duration-300 hover:border-white/25 hover:text-white"
            >
              <Instagram size={16} className="text-silver" />
              {business?.instagram.handle}
              <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Col 2 – Quick links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
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
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
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
                  {formatPhoneNumber(business?.phoneNumber)}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business?.email ?? ""}`}
                  className="group flex items-center gap-3 transition-colors hover:text-white"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-white/10">
                    <Mail size={14} className="text-silver transition-colors group-hover:text-white" />
                  </div>
                  {business?.email}
                </a>
              </li>
              <li>
                {storeAddress ? (
                  <a
                    href={`https://maps.google.com/maps?q=${encodeURIComponent(
                      `${storeAddress.street.toLowerCase().includes("local") ? storeAddress.street : storeAddress.street + ", local 1"}, ${storeAddress.postalCode} ${storeAddress.city}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 transition-colors hover:text-white"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-white/10">
                      <MapPin size={14} className="text-silver transition-colors group-hover:text-white" />
                    </div>
                    <span className="text-sm text-white/80">
                      {storeAddress.street.toLowerCase().includes("local") ? storeAddress.street : storeAddress.street + ", local 1"}, {storeAddress.postalCode} {storeAddress.city}
                    </span>
                  </a>
                ) : null}
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 shrink-0">
                  <Clock size={14} className="text-silver" />
                </div>
                <div className="mt-1 text-white/80 flex flex-wrap gap-x-3 gap-y-1">
                  {scheduleEntries.filter(e => e.open).map((entry, i) => (
                    <span key={i} className="whitespace-nowrap">
                      <strong className="font-medium text-white/90 mr-1">{entry.days}</strong>
                      <span className="text-white/80">{formatScheduleEntry(entry)}</span>
                    </span>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center gap-4 border-t border-white/8 pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-white/80">
            {footer?.copyrightLine}
          </p>
          <p className="text-xs text-white/80">
            {footer?.copyrightNote}
          </p>
        </div>
      </div>
    </footer>
  );
}
