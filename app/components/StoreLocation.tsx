/* Sección de ubicación de la tienda con mosaico de fotos y Google Maps */
"use client";

import Image from "next/image";
import { MapPin, Clock, ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import type { SiteConfig } from "../lib/data";

export default function StoreLocation({ config }: { config: SiteConfig | null }) {
  const { ref, visible } = useScrollReveal();
  const business = config?.business;
  const storeAddress = config?.storeAddress;
  const storePhotos = config?.storePhotos ?? [];
  const mapsQuery = storeAddress?.mapsQuery ?? "San+Sebasti%C3%A1n,+Gipuzkoa,+Espa%C3%B1a";

  return (
    <section id="ubicacion" className="scroll-mt-28 bg-cream py-28 md:py-36">
      <div ref={ref} className="mx-auto max-w-7xl px-6">
        {/* Cabecera de sección */}
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
            Nuestra Ubicación
          </span>
          <h2 className="mt-4 text-3xl text-carbon md:text-4xl lg:text-[2.75rem]">
            Encuéntranos en
            <br className="hidden sm:block" />
            <span className="text-gradient-copper">
              {business?.location.city?.split(",")[0] ?? "San Sebastián"}
            </span>
          </h2>
          <span className="mx-auto mt-6 decorative-line" />
          <p className="mt-6 text-base leading-relaxed text-silver">
            Visítanos en nuestras instalaciones o solicita presupuesto y nos
            desplazamos a tu domicilio.
          </p>
        </div>

        {/* Contenido: mosaico de fotos + mapa */}
        <div className="mt-16 grid gap-8 lg:grid-cols-5">
          {/* Mosaico de fotos (columna izquierda) */}
          {storePhotos.length > 0 && (
            <div
              className={`lg:col-span-2 transition-all duration-700 delay-200 ${
                visible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <div className="grid h-full grid-cols-2 gap-3">
                {/* Foto principal */}
                <div className="relative row-span-2 min-h-[300px] overflow-hidden rounded-2xl group">
                  <Image
                    src={storePhotos[0].src}
                    alt={storePhotos[0].alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-carbon/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>

                {/* Fotos secundarias */}
                {storePhotos.slice(1, 3).map((photo, i) => (
                  <div key={i} className="relative min-h-[145px] overflow-hidden rounded-2xl group">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 20vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mapa + tarjeta de dirección (columna derecha) */}
          <div
            className={`${storePhotos.length > 0 ? "lg:col-span-3" : "lg:col-span-5"} flex flex-col gap-5 transition-all duration-700 delay-300 ${
              visible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
          >
            {/* Google Maps embed */}
            <div className="relative flex-1 min-h-[300px] overflow-hidden rounded-2xl border border-gray-200/60 shadow-sm">
              <iframe
                title="Ubicación de Oscar Carregal en San Sebastián"
                src={`https://maps.google.com/maps?q=${mapsQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            {/* Tarjeta de dirección */}
            <div className="rounded-2xl bg-white p-7 shadow-sm transition-all duration-300 hover-glow">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-copper/8">
                  <MapPin className="text-copper" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl text-carbon">Nuestra dirección</h3>
                  {storeAddress?.street && (
                    <p className="mt-2 text-sm font-medium text-gray-dark">
                      {storeAddress.street}
                    </p>
                  )}
                  <p className={`${storeAddress?.street ? "mt-1" : "mt-2"} text-sm font-medium text-gray-dark`}>
                    {storeAddress?.postalCode} {storeAddress?.city ?? business?.location.city}
                  </p>
                  <p className="mt-1 text-xs text-silver">
                    {storeAddress?.region ?? business?.location.region}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <span className="inline-flex items-center gap-2 text-xs text-silver">
                      <Clock size={14} className="text-copper" />
                      {business?.schedule.compact}
                    </span>
                    <a
                      href={`https://maps.google.com/maps?q=${mapsQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-copper transition-colors hover:text-copper-dark"
                    >
                      Abrir en Google Maps
                      <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
