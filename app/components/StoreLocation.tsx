/* Sección de ubicación de la tienda con mosaico de fotos y Google Maps */
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MapPin, Clock, ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import type { SiteConfig } from "../lib/data";

export default function StoreLocation({ config }: { config: SiteConfig | null }) {
  const { ref, visible } = useScrollReveal();
  const business = config?.business;
  const storeAddress = config?.storeAddress;
  const storePhotos = config?.storePhotos ?? [];
  const mapsQuery = storeAddress?.mapsQuery ?? "43.30739782667964,-2.0075817173451656";
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  // Para mantener el layout actual (izquierda grande + dos a la derecha),
  // usamos izquierda = foto sin número, derecha arriba = (8), derecha abajo = (5).
  const visibleMosaicPhotos = useMemo(() => {
    if (storePhotos.length < 3) return storePhotos;
    return [storePhotos[2], storePhotos[0], storePhotos[1]];
  }, [storePhotos]);

  const totalPhotos = storePhotos.length;

  const openViewerBySrc = (src: string) => {
    const index = storePhotos.findIndex((photo) => photo.src === src);
    if (index < 0) return;
    setCurrentPhoto(index);
    setViewerOpen(true);
  };

  const goPrev = () => {
    if (totalPhotos < 2) return;
    setCurrentPhoto((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  const goNext = () => {
    if (totalPhotos < 2) return;
    setCurrentPhoto((prev) => (prev + 1) % totalPhotos);
  };

  useEffect(() => {
    if (!viewerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewerOpen(false);
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [viewerOpen, totalPhotos]);

  const cityName = storeAddress?.city?.trim() || "San Sebastian";
  const locationTitle = cityName.split(",")[0];
  const streetLine = storeAddress?.street?.trim() || "Avenida de Tolosa 89";
  const postalCityLine = [storeAddress?.postalCode?.trim(), cityName]
    .filter(Boolean)
    .join(" ");

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
              {locationTitle}
            </span>
          </h2>
          <span className="mx-auto mt-6 decorative-line" />
          <p className="mt-6 text-base leading-relaxed text-silver">
            Visítanos en nuestras instalaciones o contacta conmigo y me
            desplazo a tu domicilio.
          </p>
        </div>

        {/* Contenido: mosaico de fotos + mapa */}
        <div className="mt-16 grid gap-8 lg:grid-cols-5">
          {/* Mosaico de fotos (columna izquierda) */}
          {visibleMosaicPhotos.length > 0 && (
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
                    src={visibleMosaicPhotos[0].src}
                    alt={visibleMosaicPhotos[0].alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-carbon/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <button
                    type="button"
                    onClick={() => openViewerBySrc(visibleMosaicPhotos[0].src)}
                    className="absolute inset-0 z-10"
                    aria-label="Abrir visor de fotos"
                  />
                </div>

                {/* Fotos secundarias */}
                {visibleMosaicPhotos.slice(1, 3).map((photo, i) => (
                  <div key={i} className="relative min-h-[145px] overflow-hidden rounded-2xl group">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 20vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <button
                      type="button"
                      onClick={() => openViewerBySrc(photo.src)}
                      className="absolute inset-0 z-10"
                      aria-label="Abrir visor de fotos"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mapa + tarjeta de dirección (columna derecha) */}
          <div
            className={`${visibleMosaicPhotos.length > 0 ? "lg:col-span-3" : "lg:col-span-5"} flex flex-col gap-5 transition-all duration-700 delay-300 ${
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
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <MapPin className="text-gray-500" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl text-carbon">Dirección y horario</h3>
                  <p className="mt-2 text-sm font-medium text-gray-dark">
                    {streetLine}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-dark">
                    {postalCityLine}
                  </p>
                  <p className="mt-2 text-xs text-silver">
                    Gipuzkoa, País Vasco
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <span className="inline-flex items-center gap-2 text-xs text-silver">
                      <Clock size={14} className="text-silver" />
                      {business?.schedule.compact}
                    </span>
                    <a
                      href={`https://maps.google.com/maps?q=${mapsQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-dark transition-colors hover:text-carbon"
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

      {viewerOpen && totalPhotos > 0 && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-carbon/85 p-2 backdrop-blur-md sm:p-4"
          onClick={() => setViewerOpen(false)}
        >
          <div
            className="relative flex h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewerOpen(false)}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-black/60"
              aria-label="Cerrar visor"
            >
              <X size={18} />
            </button>

            <div className="relative min-h-0 flex-1 bg-carbon-light">
              {storePhotos.map((photo, index) => (
                <Image
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 90vw"
                  className={`object-contain transition-all duration-500 ${
                    index === currentPhoto ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
                  }`}
                  priority={index === currentPhoto}
                />
              ))}

              {totalPhotos > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-black/50"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-black/50"
                    aria-label="Foto siguiente"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {totalPhotos > 1 && (
              <div className="flex shrink-0 justify-center gap-2 overflow-x-auto border-t border-white/10 bg-carbon-light/95 px-4 py-3 backdrop-blur-sm hide-scrollbar">
                {storePhotos.map((photo, index) => (
                  <button
                    key={`${photo.src}-${index}`}
                    onClick={() => setCurrentPhoto(index)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${
                      index === currentPhoto
                        ? "ring-2 ring-silver ring-offset-2 ring-offset-carbon-light"
                        : "opacity-50 hover:scale-[1.03] hover:opacity-100"
                    }`}
                    aria-label={`Ver foto ${index + 1}`}
                  >
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
