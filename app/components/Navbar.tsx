/* Navbar sticky con navegación suave y detección de sección activa */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";

/* Mapeo de enlaces a sus secciones del home */
const links = [
  { label: "Trabajos", href: "/trabajos", sectionId: "trabajos" },
  { label: "Servicios", href: "/#servicios", sectionId: "servicios" },
  { label: "Nosotros", href: "/#nosotros", sectionId: "nosotros" },
  { label: "Ubicación", href: "/#ubicacion", sectionId: "ubicacion" },
  { label: "Contacto", href: "/#contacto", sectionId: "contacto" },
];

/* IDs de las secciones que se observan en el home */
const HOME_SECTION_IDS = links
  .filter((l) => l.href.startsWith("/#"))
  .map((l) => l.sectionId);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* Scroll suave hacia una sección del home */
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return false;

    const heading = section.querySelector("h1, h2, h3");
    const target = heading ?? section;
    const navEl = document.querySelector("nav");
    const navHeight = navEl?.getBoundingClientRect().height ?? 0;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    const navGap = Math.round(navHeight * 0.72);
    const viewportGap = Math.round(
      window.innerHeight * (isMobile ? 0.02 : 0.025)
    );
    const minGap = isMobile ? 35 : 42;
    const maxGap = isMobile ? 56 : 66;
    const extraOffset = Math.min(maxGap, Math.max(minGap, navGap, viewportGap));

    const y =
      target.getBoundingClientRect().top + window.scrollY - navHeight - extraOffset;

    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    return true;
  };

  /* Detección de scroll para el fondo del navbar */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Gestión de clicks en enlaces con hash */
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const id = href.split("#")[1];

      const runScroll = () => {
        const didScroll = scrollToSection(id);
        if (didScroll) {
          history.replaceState(null, "", href);
        } else {
          router.push(href);
        }
      };

      if (open) {
        setOpen(false);
        window.setTimeout(runScroll, 260);
      } else {
        runScroll();
      }
    }
  };

  /* Observer para detectar la sección activa visible en el viewport */
  useEffect(() => {
    /* En rutas que no son home, marcar activo por pathname */
    if (pathname === "/trabajos") {
      setActive("Trabajos");
      return;
    }
    if (pathname !== "/") {
      setActive(null);
      return;
    }

    /* En home: observar todas las secciones y activar la más visible */
    const ratios = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.intersectionRatio);
        }

        /* Encontrar la sección con mayor ratio de intersección */
        let bestId: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }

        if (bestRatio > 0.15 && bestId) {
          /* Buscar el label del link correspondiente a esta sección */
          const link = links.find((l) => l.sectionId === bestId);
          setActive(link?.label ?? null);
        } else {
          setActive(null);
        }
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.7] }
    );

    /* Observar cada sección del home */
    for (const id of HOME_SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [pathname]);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-[0_1px_20px_rgba(0,0,0,0.06)]"
          : "bg-transparent border-b border-transparent"
        }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="shrink-0 group">
          <Image
            src="/assets/Logo_texto-removebg-preview.png"
            alt="Oscar Carregal – Fontanería & Reformas"
            width={200}
            height={50}
            priority
            className="h-9 w-auto transition-transform duration-300 group-hover:scale-[1.02] md:h-11"
          />
        </Link>

        {/* Enlaces de escritorio */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300 ${active === l.label
                  ? "text-copper"
                  : "text-gray-dark hover:text-carbon"
                }`}
            >
              {l.label}
              {active === l.label && (
                <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-copper animate-line-grow rounded-full" />
              )}
            </Link>
          ))}
          <div className="ml-4 h-5 w-px bg-gray-200" />
          <Link
            href="/presupuesto"
            className="group ml-4 inline-flex items-center gap-2 rounded-full bg-carbon px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-copper hover:shadow-lg hover:shadow-copper/20"
          >
            Tu  Proyecto
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        {/* Hamburguesa móvil */}
        <button
          aria-label="Abrir menú"
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-dark transition-colors hover:bg-gray-bg"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menú móvil desplegable */}
      <div
        className={`overflow-hidden transition-all duration-400 lg:hidden ${open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="border-t border-gray-100 bg-white px-6 pb-6 pt-4">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={(e) => {
                handleNavClick(e, l.href);
              }}
              className="flex items-center justify-between py-3.5 text-base font-medium text-gray-dark transition-colors hover:text-copper border-b border-gray-50 last:border-0"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {l.label}
              <ArrowUpRight size={14} className="text-silver" />
            </Link>
          ))}
          <Link
            href="/presupuesto"
            onClick={() => setOpen(false)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-carbon py-3.5 text-sm font-semibold text-white transition-all hover:bg-copper"
          >
            Tu  Proyecto
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
