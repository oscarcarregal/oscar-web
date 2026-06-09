"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ReformaProject } from "../lib/data";

export default function GalleryModal({
  project,
  onClose,
}: {
  project: ReformaProject;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const total = project.imagePaths.length;

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + total) % total),
    [total]
  );
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % total),
    [total]
  );

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    window.history.pushState({ galleryModalOpen: true }, "");

    const handlePopState = () => {
      onCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (window.history.state?.galleryModalOpen) {
        window.history.back();
      }
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-carbon/85 p-2 backdrop-blur-md sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-scale-in relative flex h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:h-[92vh] lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-black/60"
          aria-label="Cerrar galería"
        >
          <X size={18} />
        </button>

        {/* LEFT (desktop) / BOTTOM (mobile): Info Panel */}
        <div className="order-2 flex min-h-0 flex-col overflow-y-auto border-t border-cream px-6 py-6 sm:px-8 lg:order-1 lg:w-[38%] lg:shrink-0 lg:border-r lg:border-t-0 lg:py-10">
          <h2 className="font-heading text-2xl text-carbon sm:text-3xl">
            {project.title}
          </h2>
          {/* Ubicación eliminada de la galería */}
          <p className="mt-4 text-sm leading-relaxed text-gray-dark">
            {project.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-cream px-3 py-1 text-[11px] font-medium tracking-wide text-gray-dark"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT (desktop) / TOP (mobile): Image Panel */}
        <div className="order-1 flex min-h-0 flex-col lg:order-2 lg:flex-1">
          {/* Main image */}
          <div className="relative h-[52vh] shrink-0 bg-carbon-light sm:h-[60vh] lg:h-auto lg:min-h-0 lg:flex-1 overflow-hidden">
            <div key={`img-${current}`} className="absolute inset-0 animate-in fade-in duration-300">
              <Image
                src={project.imagePaths[current]}
                alt={`${project.title} - Reforma integral - Foto ${current + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 62vw"
                className="object-contain"
                priority
              />
            </div>

            {total > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-black/50"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-black/50"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            <span className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {current + 1} / {total}
            </span>
          </div>

          {/* Thumbnails */}
          {total > 1 && (
            <div className="flex shrink-0 justify-center gap-2 overflow-x-auto border-t border-white/10 bg-carbon-light/95 px-4 py-3 backdrop-blur-sm hide-scrollbar">
              {project.imagePaths.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setCurrent(i)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${i === current
                    ? "ring-2 ring-silver ring-offset-2 ring-offset-carbon-light"
                    : "opacity-50 hover:scale-[1.03] hover:opacity-100"
                    }`}
                >
                  <Image
                    src={src}
                    alt={`${project.title} - Miniatura de la foto ${i + 1}`}
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
    </div>
  );
}
