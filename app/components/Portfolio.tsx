/* Sección de trabajos destacados con tarjetas de proyecto */
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Instagram } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import type { ReformaProject } from "../lib/data";
import GalleryModal from "./GalleryModal";

function ProjectCard({ project, index, visible, onOpen }: { project: ReformaProject; index: number; visible: boolean; onOpen: () => void }) {
  const [imgIdx, setImgIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCycle = () => {
    if (project.imagePaths.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setImgIdx((prev) => (prev + 1) % project.imagePaths.length),
      900
    );
  };

  const stopCycle = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setImgIdx(0);
  };

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 hover-glow hover:-translate-y-1 cursor-pointer ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{ transitionDelay: visible ? `${200 + index * 120}ms` : "0ms" }}
    >
      <div
        className="relative h-64 overflow-hidden"
        onMouseEnter={startCycle}
        onMouseLeave={stopCycle}
        onTouchStart={startCycle}
        onTouchEnd={stopCycle}
      >
        {project.imagePaths.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 group-hover:scale-105 ${i === imgIdx ? "opacity-100" : "opacity-0"
              }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-carbon/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {project.imagePaths.length > 1 && (
          <span className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
            <span className="font-medium">{project.imagePaths.length}</span>{" "}
            fotos
          </span>
        )}

        {/* Ubicación eliminada de las tarjetas destacadas */}

        {project.imagePaths.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {project.imagePaths.map((_, i) => (
              <span
                key={i}
                className={`block h-1 rounded-full transition-all duration-300 ${i === imgIdx ? "w-5 bg-silver" : "w-1 bg-white/50"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-7">
        <h3 className="text-xl text-carbon group-hover:text-[#555555] transition-colors duration-300">
          {project.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-silver">
          {project.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-bg px-3 py-1 text-[11px] font-medium tracking-wide text-gray-dark"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Portfolio({ projects, instagramUrl }: { projects: ReformaProject[], instagramUrl?: string }) {
  const { ref, visible } = useScrollReveal();
  const [modalProject, setModalProject] = useState<ReformaProject | null>(null);

  return (
    <section id="trabajos" className="scroll-mt-28 bg-white py-28 md:py-36">
      <div ref={ref} className="mx-auto max-w-7xl px-6">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
            Nuestros Trabajos
          </span>
          <h2 className="mt-4 text-3xl text-carbon md:text-4xl lg:text-[2.75rem]">
            Reformas que hablan{" "}
            <br className="hidden sm:block" />
            por sí solas
          </h2>

          <span className="mx-auto mt-6 decorative-line" />
          <p className="mt-6 text-base leading-relaxed text-silver">
            Proyectos reales de nuestros clientes.
          </p>
        </div>

        {projects.length > 0 ? (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} visible={visible} onOpen={() => setModalProject(p)} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-bg p-8 text-center text-sm text-silver">
            No hay proyectos destacados disponibles en este momento.
          </div>
        )}

        <div
          className={`mt-16 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-700 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <Link
            href="/trabajos"
            className="group inline-flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-carbon shadow-sm transition-all duration-300 hover:border-gray-400 hover:shadow-lg hover:shadow-black/10 sm:w-auto"
          >
            Ver todos los trabajos
            <ArrowRight
              size={16}
              className="text-silver transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-carbon shadow-sm transition-all duration-300 hover:border-gray-400 hover:shadow-lg hover:shadow-black/10 sm:w-auto"
            >
              <Instagram
                size={16}
                className="text-silver transition-transform duration-300 group-hover:scale-110"
              />
              Visita nuestro Instagram
            </a>
          )}
        </div>
      </div>

      {modalProject && (
        <GalleryModal
          project={modalProject}
          onClose={() => setModalProject(null)}
        />
      )}
    </section>
  );
}
