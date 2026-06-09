"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  X,
  SlidersHorizontal,
  Phone,
  Mail,
  Images,
  ArrowRight,
} from "lucide-react";

import type { ReformaProject } from "../lib/data";
import GalleryModal from "../components/GalleryModal";

/* ─────────────────────── SEARCH & FILTERS ─────────────────────── */

function SearchFilters({
  query,
  setQuery,
  activeTags,
  setActiveTags,
  resultCount,
  tags,
}: {
  query: string;
  setQuery: (q: string) => void;
  activeTags: string[];
  setActiveTags: (tags: string[]) => void;
  resultCount: number;
  tags: string[];
}) {
  const toggleTag = (tag: string) => {
    setActiveTags(
      activeTags.includes(tag)
        ? activeTags.filter((item) => item !== tag)
        : [...activeTags, tag]
    );
  };

  return (
    <div className="sticky top-[57px] z-40 border-b border-gray-200/60 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="relative mx-auto max-w-xl">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver"
          />
          <input
            id="search-trabajos"
            type="text"
            placeholder="Buscar por nombre, ubicación o descripción…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-cream py-3 pl-11 pr-4 text-sm text-carbon outline-none transition-all placeholder:text-silver focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-silver transition-colors hover:bg-gray-200 hover:text-carbon"
              aria-label="Limpiar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="mt-5 overflow-x-auto hide-scrollbar">
          <div className="flex w-max items-center gap-2 px-1 md:w-auto md:flex-wrap md:justify-center">
            <SlidersHorizontal
              size={14}
              className="mr-1 shrink-0 text-silver"
            />
            <button
              onClick={() => setActiveTags([])}
              aria-pressed={activeTags.length === 0}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${
                activeTags.length === 0
                  ? "bg-carbon text-white shadow-sm"
                  : "bg-cream text-gray-dark hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                aria-pressed={activeTags.includes(tag)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${
                  activeTags.includes(tag)
                    ? "bg-carbon text-white shadow-sm"
                    : "bg-cream text-gray-dark hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-silver">
          {resultCount}{" "}
          {resultCount === 1 ? "proyecto encontrado" : "proyectos encontrados"}
          {activeTags.length > 0 &&
            ` · ${activeTags.length} filtro(s) activo(s)`}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────── PROJECT CARD ─────────────────────── */

function WorkCard({
  project,
  onOpen,
  style,
}: {
  project: ReformaProject;
  onOpen: () => void;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
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
      className="animate-fade-up group flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 hover-glow hover:-translate-y-1"
      style={style}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
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
            alt={`${project.title} - Proyecto de reforma y fontanería - Foto ${i + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 ${
              i === imgIdx ? "opacity-100" : "opacity-0"
            } ${hovered ? "scale-105" : "scale-100"}`}
          />
        ))}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-carbon/60 via-transparent to-transparent transition-opacity duration-500 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />

        <span className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
          <Images size={12} />
          <span className="font-medium">{project.imagePaths.length}</span>
        </span>

        <div
          className={`absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-carbon px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-all duration-400 ${
            hovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          Ver galería
          <ArrowRight size={12} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <h3 className="text-xl text-carbon transition-colors group-hover:text-[#555555]">
          {project.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-silver line-clamp-3">
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
    </div>
  );
}

/* ─────────────────────── CTA SECTION ─────────────────────── */

function TrabajosCTA({ phoneNumber }: { phoneNumber: string }) {
  const phoneHref = phoneNumber ? `tel:+34${phoneNumber}` : "#";

  return (
    <section className="relative overflow-hidden bg-carbon py-24 md:py-32">
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-white/3 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-white/3 blur-[100px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-heading text-3xl text-white md:text-4xl lg:text-5xl">
          ¿Te gustaría un{" "}
          <br className="hidden sm:block" />
          <span className="text-gradient-copper">resultado así?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70">
          Cuéntame tu idea y me pondré en contacto contigo para hablar de tu
          proyecto de forma directa y personalizada.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={phoneHref}
            className="group inline-flex items-center gap-2 rounded-full bg-carbon px-8 py-4 text-base font-semibold text-white shadow-lg shadow-black/10 transition-all duration-300 hover:bg-[#333333] hover:shadow-xl"
          >
            <Phone size={18} />
            Llamar Ahora
          </a>
          <Link
            href="/#contacto"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10"
          >
            <Mail size={18} />
            Enviar Mensaje
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── CLIENT COMPONENT ENTRY ─────────────────────── */

export default function TrabajosClient({
  projects,
  tags,
  phoneNumber,
}: {
  projects: ReformaProject[];
  tags: string[];
  phoneNumber: string;
}) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [modalProject, setModalProject] = useState<ReformaProject | null>(null);

  const filtered = projects.filter((p) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));

    const matchesTag =
      activeTags.length === 0 || activeTags.some((tag) => p.tags.includes(tag));

    return matchesQuery && matchesTag;
  });

  return (
    <>
      <SearchFilters
        query={query}
        setQuery={setQuery}
        activeTags={activeTags}
        setActiveTags={setActiveTags}
        resultCount={filtered.length}
        tags={tags}
      />

      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          {filtered.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, index) => (
                <WorkCard
                  key={p.id}
                  project={p}
                  onOpen={() => setModalProject(p)}
                  style={{ animationDelay: `${index * 80}ms` }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Search size={28} className="text-silver" />
              </div>
              <h3 className="mt-6 text-xl text-carbon">Sin resultados</h3>
              <p className="mt-3 max-w-sm text-sm text-silver">
                No se encontraron proyectos con esos filtros. Prueba a cambiar
                el término de búsqueda o la categoría.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveTags([]);
                }}
                className="mt-6 rounded-full bg-carbon px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#333333]"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      <TrabajosCTA phoneNumber={phoneNumber} />

      {modalProject && (
        <GalleryModal project={modalProject} onClose={() => setModalProject(null)} />
      )}
    </>
  );
}
