"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  Phone,
  Mail,
  Hammer,
  Images,
  ArrowRight,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import {
  fetchConfig,
  fetchAllReformas,
  type SiteConfig,
  type ReformaProject,
} from "../lib/data";
import { TrabajosSkeleton } from "../components/Skeletons";

/* ─────────────────────── DATA HOOK ─────────────────────── */

function useTrabajosData() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [projects, setProjects] = useState<ReformaProject[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [config, data] = await Promise.all([
          fetchConfig(),
          fetchAllReformas(),
        ]);
        setSiteConfig(config);
        setTags(config.tags);
        setProjects(data);
      } catch (err) {
        console.error("Error loading trabajos data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { siteConfig, projects, tags, loading };
}

/* ─────────────────────── HERO BANNER ─────────────────────── */

function TrabajosHero() {
  return (
    <section className="relative overflow-hidden bg-carbon py-24 md:py-32">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-copper/8 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-steel-blue/8 blur-[100px]" />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-copper/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center animate-fade-up">
        <h1 className="font-heading text-4xl leading-tight text-white md:text-5xl lg:text-6xl">
          Nuestros <span className="text-gradient-copper">Trabajos</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/50 md:text-xl">
          Explora algunos de nuestros proyectos de reformas, fontanería e
          instalaciones.
        </p>
      </div>
    </section>
  );
}

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
            className="w-full rounded-full border border-gray-200 bg-cream py-3 pl-11 pr-4 text-sm text-carbon outline-none transition-all placeholder:text-silver focus:border-copper/40 focus:ring-2 focus:ring-copper/10"
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
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${activeTags.length === 0
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
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${activeTags.includes(tag)
                  ? "bg-copper text-white shadow-sm"
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
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 ${i === imgIdx ? "opacity-100" : "opacity-0"
              } ${hovered ? "scale-105" : "scale-100"}`}
          />
        ))}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-carbon/60 via-transparent to-transparent transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-0"
            }`}
        />

        <span className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
          <Images size={12} />
          <span className="font-medium">{project.imagePaths.length}</span>
        </span>

        {/* Ubicación eliminada de las tarjetas */}

        <div
          className={`absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-copper px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-all duration-400 ${hovered
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0"
            }`}
        >
          Ver galería
          <ArrowRight size={12} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <h3 className="text-xl text-carbon transition-colors group-hover:text-copper">
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

/* ─────────────────────── GALLERY MODAL ─────────────────────── */

function GalleryModal({
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
          <div className="relative h-[52vh] shrink-0 bg-carbon-light sm:h-[60vh] lg:h-auto lg:min-h-0 lg:flex-1">
            {project.imagePaths.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={`${project.title} – Foto ${i + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 62vw"
                className={`object-contain transition-all duration-500 ${i === current ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
                  }`}
                priority={i === 0}
              />
            ))}

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
                    ? "ring-2 ring-copper ring-offset-2 ring-offset-carbon-light"
                    : "opacity-50 hover:scale-[1.03] hover:opacity-100"
                    }`}
                >
                  <Image
                    src={src}
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
    </div>
  );
}

/* ─────────────────────── CTA SECTION ─────────────────────── */

function TrabajosCTA({ phoneNumber }: { phoneNumber: string }) {
  const phoneHref = phoneNumber ? `tel:+34${phoneNumber}` : "#";

  return (
    <section className="relative overflow-hidden bg-carbon py-24 md:py-32">
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-copper/30 to-transparent" />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-copper/8 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-steel-blue/8 blur-[100px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-heading text-3xl text-white md:text-4xl lg:text-5xl">
          ¿Te gustaría un
          <br className="hidden sm:block" />
          <span className="text-gradient-copper">resultado así?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/50">
          Cuéntame tu idea y me pondré en contacto contigo para hablar de tu
          proyecto de forma directa y personalizada.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={phoneHref}
            className="group inline-flex items-center gap-2 rounded-full bg-copper px-8 py-4 text-base font-semibold text-white shadow-lg shadow-copper/25 transition-all duration-300 hover:bg-copper-light hover:shadow-xl"
          >
            <Phone size={18} />
            Llamar Ahora
          </a>
          <a
            href="/#contacto"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10"
          >
            <Mail size={18} />
            Enviar Mensaje
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── PAGE ─────────────────────── */

export default function TrabajosPage() {
  const { siteConfig, projects, tags, loading } = useTrabajosData();
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [modalProject, setModalProject] = useState<ReformaProject | null>(
    null
  );

  const business = siteConfig?.business;

  const filtered = projects.filter((p) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));

    const matchesTag =
      activeTags.length === 0 ||
      activeTags.some((tag) => p.tags.includes(tag));

    return matchesQuery && matchesTag;
  });

  return (
    <>
      <Navbar />
      <TrabajosHero />

      {loading ? (
        <TrabajosSkeleton />
      ) : (
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
                    No se encontraron proyectos con esos filtros. Prueba a
                    cambiar el término de búsqueda o la categoría.
                  </p>
                  <button
                    onClick={() => {
                      setQuery("");
                      setActiveTags([]);
                    }}
                    className="mt-6 rounded-full bg-copper px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-copper-dark"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <TrabajosCTA phoneNumber={business?.phoneNumber ?? ""} />
      <Footer />
      <FloatingActions phoneNumber={business?.phoneNumber} />

      {modalProject && (
        <GalleryModal
          project={modalProject}
          onClose={() => setModalProject(null)}
        />
      )}
    </>
  );
}
