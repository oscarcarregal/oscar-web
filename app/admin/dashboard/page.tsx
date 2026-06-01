"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Hammer,
  Images as ImagesIcon,
  Settings,
  LogOut,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Upload,
  ChevronDown,
  ChevronUp,
  Eye,
  MapPin,
  Phone as PhoneIcon,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  GripVertical,
  Search,
  ArrowUpDown,
  Filter,
  Star,
  Menu,
} from "lucide-react";

/* ═══════════════════════════════ TYPES ═══════════════════════════════ */

interface Reforma {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: string[];
}

interface Presupuesto {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  servicio: string;
  descripcion: string;
  fecha: string;
  estado: "nuevo" | "contactado" | "cerrado";
}

interface HeroSlide {
  reforma: string;
  image: string;
  caption: string;
}

interface StoreAddress {
  street?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  serviceArea?: string;
  mapsQuery?: string;
}

interface SiteConfig {
  business: Record<string, unknown>;
  storeAddress?: StoreAddress;
  storePhotos?: { src: string; alt: string }[];
  footer: Record<string, unknown>;
  tags: string[];
  featuredReformas: string[];
  heroCarousel: HeroSlide[];
}

type Tab = "presupuestos" | "reformas" | "carousel" | "localizacion" | "config";
type EstadoFilter = "nuevo" | "contactado" | "cerrado";
type SortField = "fecha" | "estado" | "nombre";
type SortDir = "asc" | "desc";

const ESTADO_ORDER: Record<string, number> = { nuevo: 0, contactado: 1, cerrado: 2 };

/* ═══════════════════════════════ API HELPERS ═══════════════════════════════ */

async function api<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, opts);
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }
  return res.json();
}

/* ═══════════════════════════════ DASHBOARD ═══════════════════════════════ */

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("presupuestos");
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [reformas, setReformas] = useState<Reforma[]>([]);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  // Controla la visibilidad del drawer de navegación en móvil
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [cfgData, refData, presData] = await Promise.all([
        api<SiteConfig>("/api/admin/config"),
        api<Reforma[]>("/api/admin/reformas"),
        api<Presupuesto[]>("/api/admin/presupuestos"),
      ]);
      setConfig(cfgData);
      setReformas(refData);
      setPresupuestos(presData);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        setSessionExpired(true);
        return;
      }
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Clear session on page refresh/close so password is required again
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon("/api/admin/logout");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
  };

  if (sessionExpired) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-8 py-10 text-center">
          <AlertCircle size={32} className="text-amber-400" />
          <h2 className="font-heading text-lg text-white">Sesión expirada</h2>
          <p className="text-sm text-white/40">
            Tu sesión ha expirado por inactividad.<br />Vuelve a iniciar sesión para continuar.
          </p>
          <button
            onClick={() => router.replace("/admin")}
            className="mt-2 rounded-lg bg-copper px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-copper" />
          <p className="text-xs text-white/30">Cargando panel…</p>
        </div>
      </div>
    );
  }


  const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: "presupuestos", label: "Consultas", icon: FileText },
    { key: "reformas", label: "Reformas", icon: Hammer },
    { key: "carousel", label: "Carrusel inicio", icon: ImagesIcon },
    { key: "localizacion", label: "Localización", icon: MapPin },
    { key: "config", label: "Configuración", icon: Settings },
  ];

  const newCount = presupuestos.filter((p) => p.estado === "nuevo").length;
  const contactadoCount = presupuestos.filter((p) => p.estado === "contactado").length;
  const cerradoCount = presupuestos.filter((p) => p.estado === "cerrado").length;

  return (
    <div className="flex min-h-dvh bg-[#0A0A0A] text-white">

      {/* ── Barra superior fija en móvil ── */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-white/6 bg-[#0D0D0D] px-4 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
          Admin Panel
        </p>
        {newCount > 0 && (
          <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-copper text-[10px] font-bold text-white">
            {newCount}
          </span>
        )}
      </header>

      {/* ── Drawer de navegación (móvil) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          {/* Fondo oscuro */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          {/* Panel lateral */}
          <aside
            className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-white/6 bg-[#0D0D0D]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                  Admin Panel
                </p>
                <p className="mt-1 text-[10px] text-white/25">Oscar Carregal</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white"
                aria-label="Cerrar menú"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-5 pb-4 pt-3">
              <div className="flex gap-1.5">
                <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-green-500/10 px-2 py-2">
                  <span className="text-base font-bold leading-none text-green-400">{newCount}</span>
                  <span className="text-[8px] font-semibold uppercase tracking-wide text-green-400/60">Nuevas</span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-blue-500/10 px-2 py-2">
                  <span className="text-base font-bold leading-none text-blue-400">{contactadoCount}</span>
                  <span className="text-[8px] font-semibold uppercase tracking-wide text-blue-400/60">Seguim.</span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-white/5 px-2 py-2">
                  <span className="text-base font-bold leading-none text-white/40">{cerradoCount}</span>
                  <span className="text-[8px] font-semibold uppercase tracking-wide text-white/20">Cerradas</span>
                </div>
              </div>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSidebarOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    tab === t.key
                      ? "bg-copper/10 text-copper"
                      : "text-white/40 hover:bg-white/5 hover:text-white/70"
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                  {t.key === "presupuestos" && newCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-copper text-[10px] font-bold text-white">
                      {newCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="border-t border-white/6 px-3 py-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Sidebar fijo (escritorio ≥ md) ── */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-white/6 bg-[#0D0D0D] md:flex">
        <div className="border-b border-white/6 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
            Admin Panel
          </p>
          <p className="mt-1 text-[10px] text-white/25">Oscar Carregal</p>

          {/* Contadores de consultas */}
          <div className="mt-4 flex gap-1.5">
            <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-green-500/10 px-2 py-2">
              <span className="text-base font-bold leading-none text-green-400">{newCount}</span>
              <span className="text-[8px] font-semibold uppercase tracking-wide text-green-400/60">Nuevas</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-blue-500/10 px-2 py-2">
              <span className="text-base font-bold leading-none text-blue-400">{contactadoCount}</span>
              <span className="text-[8px] font-semibold uppercase tracking-wide text-blue-400/60">Seguim.</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-white/5 px-2 py-2">
              <span className="text-base font-bold leading-none text-white/40">{cerradoCount}</span>
              <span className="text-[8px] font-semibold uppercase tracking-wide text-white/20">Cerradas</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                tab === t.key
                  ? "bg-copper/10 text-copper"
                  : "text-white/40 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              <t.icon size={16} />
              {t.label}
              {t.key === "presupuestos" && newCount > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-copper text-[10px] font-bold text-white">
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/6 px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main — padding superior compensa la barra fija en móvil */}
      <main className="flex-1 overflow-y-auto px-4 pb-8 pt-[4.5rem] sm:px-6 md:p-8 md:pt-8">
        {tab === "presupuestos" && (
          <PresupuestosPanel
            presupuestos={presupuestos}
            onRefresh={loadData}
          />
        )}
        {tab === "reformas" && (
          <ReformasPanel
            reformas={reformas}
            config={config}
            onRefresh={loadData}
          />
        )}
        {tab === "carousel" && (
          <CarouselPanel
            config={config}
            reformas={reformas}
            onRefresh={loadData}
          />
        )}
        {tab === "localizacion" && (
          <LocalizacionPanel config={config} onRefresh={loadData} />
        )}
        {tab === "config" && (
          <ConfigPanel config={config} onRefresh={loadData} />
        )}
      </main>
    </div>
  );
}

/* ═══════════════════════════════ STATUS BADGE ═══════════════════════════════ */

function StatusBadge({ estado }: { estado: string }) {
  const styles: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
    nuevo: { bg: "bg-green-500/15", text: "text-green-400", icon: AlertCircle },
    contactado: { bg: "bg-blue-500/15", text: "text-blue-400", icon: Clock },
    cerrado: { bg: "bg-white/10", text: "text-white/40", icon: CheckCircle },
  };

  const s = styles[estado] ?? styles.nuevo;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${s.bg} ${s.text}`}
    >
      <s.icon size={10} />
      {estado}
    </span>
  );
}

/* ═══════════════════════════════ PRESUPUESTOS ═══════════════════════════════ */

function PresupuestosPanel({
  presupuestos,
  onRefresh,
}: {
  presupuestos: Presupuesto[];
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Filters from localStorage
  const [searchQuery, setSearchQuery] = useState("");
  const [activeEstados, setActiveEstados] = useState<EstadoFilter[]>(() => {
    if (typeof window === "undefined") return ["nuevo", "contactado", "cerrado"];
    try {
      const stored = localStorage.getItem("admin_presup_estados");
      return stored ? JSON.parse(stored) : ["nuevo", "contactado", "cerrado"];
    } catch {
      return ["nuevo", "contactado", "cerrado"];
    }
  });
  const [sortField, setSortField] = useState<SortField>(() => {
    if (typeof window === "undefined") return "fecha";
    return (localStorage.getItem("admin_presup_sort") as SortField) || "fecha";
  });
  const [sortDir, setSortDir] = useState<SortDir>(() => {
    if (typeof window === "undefined") return "desc";
    return (localStorage.getItem("admin_presup_dir") as SortDir) || "desc";
  });

  // Persist filters
  useEffect(() => {
    localStorage.setItem("admin_presup_estados", JSON.stringify(activeEstados));
  }, [activeEstados]);
  useEffect(() => {
    localStorage.setItem("admin_presup_sort", sortField);
  }, [sortField]);
  useEffect(() => {
    localStorage.setItem("admin_presup_dir", sortDir);
  }, [sortDir]);

  const toggleEstado = (estado: EstadoFilter) => {
    setActiveEstados((prev) => {
      if (prev.includes(estado)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter((e) => e !== estado);
      }
      return [...prev, estado];
    });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "fecha" ? "desc" : "asc");
    }
  };

  // Filter & sort
  const filtered = presupuestos
    .filter((p) => activeEstados.includes(p.estado))
    .filter((p) =>
      searchQuery
        ? p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "fecha") {
        cmp = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      } else if (sortField === "estado") {
        cmp = (ESTADO_ORDER[a.estado] ?? 0) - (ESTADO_ORDER[b.estado] ?? 0);
      } else if (sortField === "nombre") {
        cmp = a.nombre.localeCompare(b.nombre);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  const updateEstado = async (id: string, estado: string) => {
    setSaving(true);
    try {
      await api("/api/admin/presupuestos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deletePresupuesto = async (id: string) => {
    if (!confirm("¿Eliminar esta consulta?")) return;
    try {
      await api("/api/admin/presupuestos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const estadoColors: Record<string, { active: string; inactive: string }> = {
    nuevo: { active: "bg-green-500/20 text-green-400 border-green-500/30", inactive: "bg-white/5 text-white/30 border-white/8" },
    contactado: { active: "bg-blue-500/20 text-blue-400 border-blue-500/30", inactive: "bg-white/5 text-white/30 border-white/8" },
    cerrado: { active: "bg-white/15 text-white/60 border-white/20", inactive: "bg-white/5 text-white/30 border-white/8" },
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl">Consultas</h1>
          <p className="mt-1 text-sm text-white/30">
            {presupuestos.length} consultas recibidas
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mt-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full rounded-lg border border-white/8 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all focus:border-copper/40 placeholder:text-white/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Estado filters */}
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-white/20" />
            {(["nuevo", "contactado", "cerrado"] as EstadoFilter[]).map((e) => (
              <button
                key={e}
                onClick={() => toggleEstado(e)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  activeEstados.includes(e) ? estadoColors[e].active : estadoColors[e].inactive
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-white/10" />

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={14} className="text-white/20" />
            {([
              { field: "fecha" as SortField, label: "Fecha" },
              { field: "estado" as SortField, label: "Estado" },
              { field: "nombre" as SortField, label: "Nombre" },
            ]).map((s) => (
              <button
                key={s.field}
                onClick={() => toggleSort(s.field)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  sortField === s.field
                    ? "bg-copper/15 text-copper"
                    : "bg-white/5 text-white/30 hover:bg-white/10"
                }`}
              >
                {s.label}
                {sortField === s.field && (
                  <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mt-4 space-y-3">
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-white/20">
            No hay consultas con estos filtros
          </p>
        )}
        {filtered.map((p) => (
          <div
            key={p.id}
            className="overflow-hidden rounded-xl border border-white/6 bg-[#141414]"
          >
            <button
              onClick={() =>
                setExpanded(expanded === p.id ? null : p.id)
              }
              className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-white/3"
            >
              <StatusBadge estado={p.estado} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.nombre}</p>
                <p className="text-xs text-white/30">
                  {p.servicio} ·{" "}
                  {new Date(p.fecha).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {expanded === p.id ? (
                <ChevronUp size={16} className="text-white/30" />
              ) : (
                <ChevronDown size={16} className="text-white/30" />
              )}
            </button>

            {expanded === p.id && (
              <div className="border-t border-white/6 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/20">
                      Teléfono
                    </p>
                    {p.telefono ? (
                      <a
                        href={`tel:${p.telefono}`}
                        className="mt-0.5 flex items-center gap-1.5 text-sm text-copper hover:underline"
                      >
                        <PhoneIcon size={12} />
                        {p.telefono}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm text-white/30">—</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/20">
                      Email
                    </p>
                    {p.email ? (
                      <a
                        href={`mailto:${p.email}`}
                        className="mt-0.5 flex items-center gap-1.5 text-sm text-copper hover:underline"
                      >
                        <Mail size={12} />
                        {p.email}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm text-white/30">—</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/20">
                    Descripción
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-white/60">
                    {p.descripcion}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <p className="text-[10px] uppercase tracking-wider text-white/20">
                    Estado:
                  </p>
                  {["nuevo", "contactado", "cerrado"].map((e) => (
                    <button
                      key={e}
                      onClick={() => updateEstado(p.id, e)}
                      disabled={saving}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-all ${
                        p.estado === e
                          ? "bg-copper text-white"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                  <button
                    onClick={() => deletePresupuesto(p.id)}
                    className="ml-auto rounded-lg p-1.5 text-white/20 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════ REFORMAS ═══════════════════════════════ */

function ReformasPanel({
  reformas,
  config,
  onRefresh,
}: {
  reformas: Reforma[];
  config: SiteConfig | null;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState<Reforma | null>(null);
  const [creating, setCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savingFeatured, setSavingFeatured] = useState(false);
  const [featuredOpen, setFeaturedOpen] = useState(false); // sección destacadas minimizada por defecto

  const handleDelete = async (id: string) => {
    const r = reformas.find((ref) => ref.id === id);
    const name = r?.title || id;
    if (!confirm(`¿Eliminar la reforma "${name}" y todas sus imágenes?`)) return;
    try {
      await api(`/api/admin/reformas/${id}`, { method: "DELETE" });
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  };

  /* Añade una reforma al final del array de destacados (máx. 3) */
  const addFeatured = async (reformaId: string) => {
    if (!config) return;
    const current = config.featuredReformas ?? [];
    if (current.includes(reformaId) || current.length >= 3) return;
    setSavingFeatured(true);
    try {
      await api("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, featuredReformas: [...current, reformaId] }),
      });
      setPickerOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingFeatured(false);
    }
  };

  /* Elimina una reforma del array de destacados */
  const removeFeatured = async (reformaId: string) => {
    if (!config) return;
    setSavingFeatured(true);
    try {
      const updated = (config.featuredReformas ?? []).filter((id) => id !== reformaId);
      await api("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, featuredReformas: updated }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingFeatured(false);
    }
  };

  const featuredList = config?.featuredReformas ?? [];
  /* Resolución de los 3 slots posicionales a objetos Reforma */
  const featuredSlots = [0, 1, 2].map((i) =>
    reformas.find((r) => r.id === featuredList[i]) ?? null
  );
  /* Reformas que aún no están destacadas (disponibles para el picker) */
  const availableForFeatured = reformas.filter((r) => !featuredList.includes(r.id));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl">Reformas</h1>
          <p className="mt-1 text-sm text-white/30">
            {reformas.length} proyectos
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-copper px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-copper-light"
        >
          <Plus size={16} />
          Nueva Reforma
        </button>
      </div>

      {/* ── Selector de reformas destacadas ── */}
      <section className="mt-8 rounded-xl border border-white/6 bg-[#141414] p-6">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setFeaturedOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFeaturedOpen((v) => !v);
            }
          }}
          className="flex items-center justify-between cursor-pointer"
        >
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-copper">
              Reformas Destacadas
            </h2>
            <p className="mt-0.5 text-xs text-white/30">
              Aparecen en la portada · máx. 3
            </p>
          </div>
          <div className="flex items-center gap-2">
            {savingFeatured && (
              <Loader2 size={14} className="animate-spin text-white/30" />
            )}
            {/* Botón para colapsar/expandir la sección */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFeaturedOpen((v) => !v);
              }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
            >
              {featuredOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {featuredOpen ? "Minimizar" : "Expandir"}
            </button>
          </div>
        </div>

        {/* 3 slots visuales — visibles solo cuando la sección está expandida */}
        {featuredOpen && <div className="mt-5 grid grid-cols-3 gap-4">
          {[0, 1, 2].map((slot) => {
            const reforma = featuredSlots[slot];
            /* Slot vacío solo es clickable si es el siguiente disponible */
            const isNextEmpty = slot === featuredList.length;

            return reforma ? (
              /* Slot relleno — muestra thumbnail + título + botón eliminar */
              <div
                key={slot}
                className="group relative overflow-hidden rounded-xl border border-white/8 bg-[#1A1A1A]"
              >
                <div className="relative aspect-[4/3]">
                  {reforma.images.length > 0 ? (
                    <Image
                      src={`/reformas/${reforma.id}/${reforma.images[0]}`}
                      alt={reforma.title}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#222]">
                      <ImagesIcon size={24} className="text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <p className="absolute bottom-2 left-2 right-8 truncate text-xs font-semibold text-white drop-shadow-sm">
                    {reforma.title || "(Sin título)"}
                  </p>
                  {/* Número de slot */}
                  <span className="absolute left-2 top-2 rounded-md bg-copper/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                    {slot + 1}
                  </span>
                </div>
                {/* Botón eliminar — visible al hover */}
                <button
                  onClick={() => removeFeatured(reforma.id)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/50 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/80 hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              /* Slot vacío — botón "+" */
              <button
                key={slot}
                onClick={() => isNextEmpty && setPickerOpen(true)}
                disabled={!isNextEmpty}
                className={`group aspect-[4/3] rounded-xl border-2 border-dashed transition-all ${
                  isNextEmpty
                    ? "cursor-pointer border-white/15 bg-[#1A1A1A] hover:border-copper/50 hover:bg-copper/5"
                    : "cursor-not-allowed border-white/6 bg-[#161616] opacity-40"
                }`}
              >
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                      isNextEmpty
                        ? "border-white/15 bg-white/5 group-hover:border-copper/40 group-hover:bg-copper/10"
                        : "border-white/8 bg-white/3"
                    }`}
                  >
                    <Plus
                      size={18}
                      className={`transition-colors ${
                        isNextEmpty
                          ? "text-white/25 group-hover:text-copper"
                          : "text-white/10"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[11px] transition-colors ${
                      isNextEmpty
                        ? "text-white/20 group-hover:text-copper/60"
                        : "text-white/10"
                    }`}
                  >
                    Añadir
                  </span>
                </div>
              </button>
            );
          })}
        </div>}

        {/* Vista previa eliminada por configuración */}
      </section>

      {/* ── Grid de todas las reformas ── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reformas.map((r) => (
          <div
            key={r.id}
            className="group overflow-hidden rounded-xl border border-white/6 bg-[#141414] transition-all hover:border-white/12"
          >
            {/* Thumbnail */}
            <div className="relative h-40 bg-[#1A1A1A]">
              {r.images.length > 0 ? (
                <Image
                  src={`/reformas/${r.id}/${r.images[0]}`}
                  alt={r.title}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/10">
                  <ImagesIcon size={32} />
                </div>
              )}
              <div className="absolute right-2 top-2 flex gap-1.5">
                {featuredList.includes(r.id) && (
                  <span className="rounded-md bg-copper/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                    DESTACADO
                  </span>
                )}
                <span className="rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  {r.images.length} fotos
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="truncate text-sm font-semibold">
                {r.title || "(Sin título)"}
              </h3>
              {r.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/30"
                    >
                      {tag}
                    </span>
                  ))}
                  {r.tags.length > 3 && (
                    <span className="text-[10px] text-white/20">
                      +{r.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setEditing(r)}
                  className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Edit3 size={12} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="ml-auto rounded-lg p-1.5 text-white/15 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal selector de destacados */}
      {pickerOpen && (
        <FeaturedPickerModal
          reformas={availableForFeatured}
          onSelect={addFeatured}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {/* Modal edición */}
      {editing && (
        <ReformaEditor
          reforma={editing}
          availableTags={config?.tags ?? []}
          onClose={() => setEditing(null)}
          onSave={() => {
            setEditing(null);
            onRefresh();
          }}
        />
      )}

      {/* Modal creación */}
      {creating && (
        <ReformaEditor
          reforma={null}
          availableTags={config?.tags ?? []}
          onClose={() => setCreating(false)}
          onSave={() => {
            setCreating(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════ REFORMA EDITOR ═══════════════════════════════ */

function ReformaEditor({
  reforma,
  availableTags,
  onClose,
  onSave,
}: {
  reforma: Reforma | null;
  availableTags: string[];
  onClose: () => void;
  onSave: () => void;
}) {
  const isNew = reforma === null;
  const [title, setTitle] = useState(reforma?.title ?? "");
  // `location` field removed — no longer tracked
  const [description, setDescription] = useState(reforma?.description ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(reforma?.tags ?? []);
  const [images, setImages] = useState<string[]>(reforma?.images ?? []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Close tag dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setTagDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const canSave = title.trim() && description.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      if (isNew) {
        await api("/api/admin/reformas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            tags: selectedTags,
          }),
        });
      } else {
        await api(`/api/admin/reformas/${reforma.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            tags: selectedTags,
            images,
          }),
        });
      }
      onSave();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error guardando");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!reforma) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("images", file);
      }

      const res = await api<{ files: string[] }>(
        `/api/admin/reformas/${reforma.id}/images`,
        { method: "POST", body: formData }
      );

      setImages((prev) => [...prev, ...res.files]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error subiendo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (filename: string) => {
    if (!reforma) return;
    if (!confirm("¿Eliminar esta imagen?")) return;
    try {
      await api(`/api/admin/reformas/${reforma.id}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      setImages((prev) => prev.filter((img) => img !== filename));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error eliminando");
    }
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...images];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setImages(updated);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-copper/40 focus:ring-1 focus:ring-copper/20 placeholder:text-white/15";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/8 bg-[#111111] p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-white"
        >
          <X size={18} />
        </button>

        <h2 className="font-heading text-xl">
          {isNew ? "Nueva Reforma" : `Editar — ${reforma.title || reforma.id}`}
        </h2>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Reforma Integral de Baño"
            />
          </div>

          {/* Ubicación eliminada del editor */}

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">
              Descripción <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Describe el proyecto..."
            />
          </div>

          {/* Tags dropdown */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">
              Tags
            </label>
            <div ref={tagDropdownRef} className="relative">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setTagDropdownOpen(!tagDropdownOpen);
                  }
                }}
                className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white transition-all hover:border-white/20"
              >
                <span className="flex flex-wrap gap-1.5">
                  {selectedTags.length > 0 ? (
                    selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-copper/15 px-2 py-0.5 text-xs text-copper"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTag(tag);
                          }}
                          className="text-copper/60 hover:text-copper"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-white/20">Seleccionar tags…</span>
                  )}
                </span>
                <ChevronDown size={14} className="shrink-0 text-white/30" />
              </div>

              {tagDropdownOpen && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#1A1A1A] py-1 shadow-xl">
                  {availableTags.length === 0 && (
                    <p className="px-3 py-2 text-xs text-white/20">No hay tags configurados</p>
                  )}
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                        selectedTags.includes(tag) ? "text-copper" : "text-white/60"
                      }`}
                    >
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          selectedTags.includes(tag)
                            ? "border-copper bg-copper/20"
                            : "border-white/20"
                        }`}
                      >
                        {selectedTags.includes(tag) && <CheckCircle size={10} className="text-copper" />}
                      </div>
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Images — only for existing reformas */}
          {!isNew && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                  Imágenes ({images.length})
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white">
                  <Upload size={12} />
                  {uploading ? "Subiendo…" : "Subir imágenes"}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="mt-1 text-[10px] text-white/15">Arrastra para reordenar</p>

              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {images.map((img, i) => (
                  <div
                    key={img}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDragEnd={handleDragEnd}
                    className={`group relative cursor-grab active:cursor-grabbing ${
                      dragIndex === i ? "opacity-50" : ""
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-[#1A1A1A]">
                      <Image
                        src={`/reformas/${reforma.id}/${img}`}
                        alt=""
                        fill
                        sizes="120px"
                        className="object-cover pointer-events-none"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                        <GripVertical size={16} className="text-white/0 transition-colors group-hover:text-white/70" />
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(img)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          {!canSave && (
            <p className="text-xs text-red-400/70">
              Rellena todos los campos obligatorios (*)
            </p>
          )}
          <div className="ml-auto flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg bg-white/5 px-5 py-2.5 text-sm text-white/40 hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !canSave}
              className="flex items-center gap-2 rounded-lg bg-copper px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-copper-light disabled:opacity-40"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {isNew ? "Crear Reforma" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ FEATURED PICKER MODAL ═══════════════════════════════ */

/**
 * Modal para seleccionar una reforma como destacada.
 * Muestra solo las reformas que aún no están en featuredReformas.
 */
function FeaturedPickerModal({
  reformas,
  onSelect,
  onClose,
}: {
  reformas: Reforma[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/8 bg-[#111111] p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-white"
        >
          <X size={18} />
        </button>

        <h2 className="font-heading text-xl">Seleccionar reforma destacada</h2>
        <p className="mt-1 text-sm text-white/30">
          Elige la reforma que aparecerá en la portada
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {reformas.length === 0 ? (
            <p className="col-span-3 py-8 text-center text-sm text-white/20">
              Todas las reformas ya están destacadas
            </p>
          ) : (
            reformas.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelect(r.id)}
                className="group overflow-hidden rounded-xl border border-white/6 bg-[#141414] text-left transition-all hover:border-copper/40 hover:bg-copper/5"
              >
                <div className="relative h-28 bg-[#1A1A1A]">
                  {r.images.length > 0 ? (
                    <Image
                      src={`/reformas/${r.id}/${r.images[0]}`}
                      alt={r.title}
                      fill
                      sizes="200px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImagesIcon size={24} className="text-white/10" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-1 text-xs font-semibold text-white/70 transition-colors group-hover:text-white">
                    {r.title || "(Sin título)"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/25">
                    {r.images.length} {r.images.length === 1 ? "foto" : "fotos"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ CAROUSEL ═══════════════════════════════ */

function CarouselPanel({
  config,
  reformas,
  onRefresh,
}: {
  config: SiteConfig | null;
  reformas: Reforma[];
  onRefresh: () => void;
}) {
  const [slides, setSlides] = useState<HeroSlide[]>(
    config?.heroCarousel ?? []
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Auto-save whenever slides change
  const autoSave = useCallback(
    (newSlides: HeroSlide[]) => {
      if (!config) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      setSaveStatus("saving");
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await api("/api/admin/config", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...config, heroCarousel: newSlides }),
          });
          setSaveStatus("saved");
          onRefresh();
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (err) {
          console.error(err);
          setSaveStatus("idle");
        }
      }, 800);
    },
    [config, onRefresh]
  );

  const updateSlides = (newSlides: HeroSlide[]) => {
    setSlides(newSlides);
    autoSave(newSlides);
  };

  const removeSlide = (index: number) => {
    updateSlides(slides.filter((_, i) => i !== index));
  };

  const moveSlide = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const updated = [...slides];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updateSlides(updated);
  };

  const addSlide = (reformaId: string, image: string) => {
    updateSlides([...slides, { reforma: reformaId, image, caption: "" }]);
    setShowAddModal(false);
  };

  const updateCaption = (index: number, caption: string) => {
    const updated = slides.map((s, i) => (i === index ? { ...s, caption } : s));
    updateSlides(updated);
  };

  // Get reforma title by ID
  const getReformaTitle = (reformaId: string) => {
    const r = reformas.find((ref) => ref.id === reformaId);
    return r?.title || reformaId;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl">Carrusel Hero</h1>
          <p className="mt-1 text-sm text-white/30">
            {slides.length} slides configurados
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5 text-xs text-white/30">
              <Loader2 size={12} className="animate-spin" />
              Guardando…
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-xs text-green-400/70">
              <CheckCircle size={12} />
              Guardado
            </span>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-copper px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-copper-light"
          >
            <Plus size={16} />
            Añadir Slide
          </button>
        </div>
      </div>

      {/* Current slides */}
      <div className="mt-6 space-y-3">
        {slides.map((slide, i) => (
          <div
            key={`${slide.reforma}-${slide.image}-${i}`}
            className="flex items-center gap-4 rounded-xl border border-white/6 bg-[#141414] p-3"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveSlide(i, -1)}
                disabled={i === 0}
                className="p-0.5 text-white/20 hover:text-white/50 disabled:opacity-20"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => moveSlide(i, 1)}
                disabled={i === slides.length - 1}
                className="p-0.5 text-white/20 hover:text-white/50 disabled:opacity-20"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[#1A1A1A]">
              <Image
                src={`/reformas/${slide.reforma}/${slide.image}`}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/30">
                {getReformaTitle(slide.reforma)}
              </p>
              <input
                value={slide.caption}
                onChange={(e) => updateCaption(i, e.target.value)}
                placeholder="Pie de foto del slide…"
                className="mt-1 w-full rounded-md border border-white/8 bg-white/3 px-2 py-1.5 text-xs text-white outline-none focus:border-copper/30"
              />
            </div>

            <button
              onClick={() => removeSlide(i)}
              className="rounded-lg p-2 text-white/15 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add slide modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/8 bg-[#111111] p-5 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>

            <h2 className="font-heading text-xl">Añadir Slide al Carrusel</h2>
            <p className="mt-1 text-sm text-white/30">
              Selecciona una imagen de tus reformas
            </p>

            <div className="mt-6 space-y-6">
              {reformas
                .filter((r) => r.images.length > 0)
                .map((r) => (
                  <div key={r.id}>
                    <p className="text-xs font-medium text-white/40">
                      {r.title || "(Sin título)"}
                    </p>
                    <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-7">
                      {r.images.map((img) => (
                        <button
                          key={img}
                          onClick={() => addSlide(r.id, img)}
                          className="relative aspect-square overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-copper hover:scale-105"
                        >
                          <Image
                            src={`/reformas/${r.id}/${img}`}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              {reformas.filter((r) => r.images.length > 0).length === 0 && (
                <p className="py-8 text-center text-sm text-white/20">
                  No hay reformas con imágenes. Sube imágenes a una reforma primero.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════ CONFIG ═══════════════════════════════ */

function ConfigPanel({
  config,
  onRefresh,
}: {
  config: SiteConfig | null;
  onRefresh: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [business, setBusiness] = useState(config?.business ?? {});
  const [tags, setTags] = useState<string[]>(config?.tags ?? []);
  const [newTag, setNewTag] = useState("");

  const updateBusiness = (key: string, value: string) => {
    setBusiness((prev) => ({ ...prev, [key]: value }));
  };

  const updateNestedBusiness = (
    parent: string,
    key: string,
    value: string
  ) => {
    setBusiness((prev) => ({
      ...prev,
      [parent]: { ...(prev as Record<string, Record<string, string>>)[parent], [key]: value },
    }));
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSaveVisual = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const updated = {
        ...config,
        business,
        tags,
      };

      await api("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setSuccess(true);
      onRefresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-copper/40 placeholder:text-white/15";

  const biz = business as Record<string, unknown>;
  const insta = (biz.instagram ?? {}) as Record<string, string>;
  const schedule = (biz.schedule ?? {}) as Record<string, string>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl">Configuración</h1>
          <p className="mt-1 text-sm text-white/30">
            Datos del negocio y etiquetas
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs text-green-400">
          Configuración guardada correctamente
        </div>
      )}

      <div className="mt-6 space-y-8">
          {/* Business Info */}
          <section className="rounded-xl border border-white/6 bg-[#141414] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-copper">
              Datos del Negocio
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
                  Nombre de marca
                </label>
                <input
                  value={(biz.brandName as string) ?? ""}
                  onChange={(e) => updateBusiness("brandName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
                  Eslogan
                </label>
                <input
                  value={(biz.brandTagline as string) ?? ""}
                  onChange={(e) =>
                    updateBusiness("brandTagline", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
                  Teléfono
                </label>
                <input
                  value={(biz.phoneNumber as string) ?? ""}
                  onChange={(e) =>
                    updateBusiness("phoneNumber", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
                  Email
                </label>
                <input
                  value={(biz.email as string) ?? ""}
                  onChange={(e) => updateBusiness("email", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
                  Experiencia
                </label>
                <input
                  value={(biz.experience as string) ?? ""}
                  onChange={(e) =>
                    updateBusiness("experience", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
                  Instagram URL
                </label>
                <input
                  value={insta.url ?? ""}
                  onChange={(e) =>
                    updateNestedBusiness("instagram", "url", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
                  Instagram handle
                </label>
                <input
                  value={insta.handle ?? ""}
                  onChange={(e) =>
                    updateNestedBusiness("instagram", "handle", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
                  Horario - Días
                </label>
                <input
                  value={schedule.days ?? ""}
                  onChange={(e) =>
                    updateNestedBusiness("schedule", "days", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
                  Horario - Horas
                </label>
                <input
                  value={schedule.hours ?? ""}
                  onChange={(e) =>
                    updateNestedBusiness("schedule", "hours", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              {/* Campos de localización eliminados de la configuración */}
            </div>
          </section>

          {/* Tags */}
          <section className="rounded-xl border border-white/6 bg-[#141414] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-copper">
              Tags de Servicios
            </h2>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="group inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/60"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="rounded-full p-0.5 text-white/20 transition-colors hover:bg-red-500/20 hover:text-red-400"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className={`${inputClass} max-w-xs`}
                  placeholder="Nuevo tag…"
                />
                <button
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-white/5 px-4 py-2 text-sm text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <Plus size={14} />
                  Añadir
                </button>
              </div>
              <p className="mt-2 text-[10px] text-white/20">
                Se usan en los filtros de la página de trabajos y en el editor de reformas.
              </p>
            </div>
          </section>

          <button
            onClick={handleSaveVisual}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-copper px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-copper-light disabled:opacity-40"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Guardar Configuración
          </button>

          {/* Seguridad / Cambio de Contraseña */}
          <ChangePasswordForm />

        </div>
    </div>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Las nuevas contraseñas no coinciden");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await api("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Error al cambiar la contraseña");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-copper/40 placeholder:text-white/15";

  return (
    <section className="rounded-xl border border-red-500/20 bg-[#1A1111] p-6 mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400 flex items-center gap-2">
        <AlertCircle size={16} />
        Seguridad
      </h2>
      <p className="mt-2 text-xs text-white/40">
        Cambia la contraseña de acceso al panel de administración. Por seguridad, te recomendamos usar una contraseña fuerte.
      </p>
      
      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs text-green-400">
          ¡Contraseña cambiada con éxito!
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-sm">
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
            Contraseña actual
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
            Nueva contraseña
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
            Confirmar nueva contraseña
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            required
            minLength={8}
          />
        </div>
        <button
          type="submit"
          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-2.5 text-sm font-semibold transition-all hover:bg-red-500/30 hover:text-red-300 disabled:opacity-40"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Actualizar Contraseña
        </button>
      </form>
    </section>
  );
}

/* ═══════════════════════════════ LOCALIZACIÓN ═══════════════════════════════ */

/**
 * Panel de gestión de la sección de localización:
 * - Fotos del showroom (subir, eliminar, reordenar con drag & drop)
 * - Vista previa del mosaico de fotos (layout idéntico al web)
 * - Dirección y coordenadas Google Maps
 */
function LocalizacionPanel({
  config,
  onRefresh,
}: {
  config: SiteConfig | null;
  onRefresh: () => void;
}) {
  const [photos, setPhotos] = useState<{ src: string; alt: string }[]>(
    config?.storePhotos ?? []
  );
  const [address, setAddress] = useState({
    street: config?.storeAddress?.street ?? "",
    postalCode: config?.storeAddress?.postalCode ?? "",
    city: config?.storeAddress?.city ?? "",
    region: config?.storeAddress?.region ?? "",
    serviceArea: config?.storeAddress?.serviceArea ?? "",
    mapsQuery: config?.storeAddress?.mapsQuery ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Sube imágenes al endpoint /api/admin/tienda/images */
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("images", file);
      }
      const res = await api<{ files: { src: string; alt: string }[] }>(
        "/api/admin/tienda/images",
        { method: "POST", body: formData }
      );
      setPhotos((prev) => [...prev, ...res.files]);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error subiendo imágenes");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* Elimina una foto del disco y la quita del array local */
  const handleDeletePhoto = async (src: string) => {
    if (!confirm("¿Eliminar esta foto del showroom?")) return;
    try {
      await api("/api/admin/tienda/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ src }),
      });
      setPhotos((prev) => prev.filter((p) => p.src !== src));
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error eliminando foto");
    }
  };

  /* Drag & drop para reordenar fotos */
  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...photos];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setPhotos(updated);
    setDragIndex(index);
  };
  const handleDragEnd = () => setDragIndex(null);

  /* Guarda el orden de fotos + dirección en config.json */
  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          storePhotos: photos,
          storeAddress: {
            ...(config.storeAddress ?? {}),
            ...address,
          },
        }),
      });
      setSaveSuccess(true);
      onRefresh();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error guardando cambios");
    } finally {
      setSaving(false);
    }
  };

  /* El mosaico web usa [2],[0],[1] como orden visual (izquierda grande + dos a la derecha) */
  const mosaicPhotos = photos.length >= 3 ? [photos[2], photos[0], photos[1]] : photos;

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-copper/40 placeholder:text-white/15";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl">Localización</h1>
          <p className="mt-1 text-sm text-white/30">
            Fotos del showroom y datos de ubicación
          </p>
        </div>
      </div>

      {/* ── Fotos del showroom ── */}
      <section className="mt-8 rounded-xl border border-white/6 bg-[#141414] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-copper">
            Fotos del Showroom
          </h2>
          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white">
            <Upload size={12} />
            {uploading ? "Subiendo…" : "Subir fotos"}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>

        {photos.length > 0 ? (
          <>
            <p className="mt-2 text-[10px] text-white/20">
              Arrastra para reordenar · {photos.length} fotos
            </p>

            {/* Grid de fotos con drag & drop */}
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5 items-end">
              {/* Contenedor agrupador de las 3 fotos principales con borde naranja único */}
              {photos.length >= 3 && (
                <div className="col-span-3 flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-copper">Destacadas en web</span>
                <div className="grid grid-cols-3 gap-3 rounded-xl ring-[4px] ring-copper p-1">
                  {photos.slice(0, 3).map((photo, i) => (
                    <div
                      key={photo.src}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragEnd={handleDragEnd}
                      className={`group relative cursor-grab active:cursor-grabbing ${
                        dragIndex === i ? "opacity-50" : ""
                      }`}
                    >
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-[#1A1A1A]">
                        <Image
                          src={photo.src}
                          alt={photo.alt || ""}
                          fill
                          sizes="120px"
                          className="pointer-events-none object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                          <GripVertical
                            size={16}
                            className="text-white/0 transition-colors group-hover:text-white/70"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePhoto(photo.src)}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
                </div>
              )}

              {/* Resto de fotos (a partir de la 4ª) sin borde especial */}
              {photos.map((photo, i) => {
                if (i < 3 && photos.length >= 3) return null; // ya renderizadas arriba
                return (
                <div
                  key={photo.src}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragEnd={handleDragEnd}
                  className={`group relative cursor-grab active:cursor-grabbing ${
                    dragIndex === i ? "opacity-50" : ""
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-[#1A1A1A]">
                    <Image
                      src={photo.src}
                      alt={photo.alt || ""}
                      fill
                      sizes="120px"
                      className="pointer-events-none object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                      <GripVertical
                        size={16}
                        className="text-white/0 transition-colors group-hover:text-white/70"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePhoto(photo.src)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={10} />
                  </button>
                </div>
                );
              })}
            </div>

            {/* Vista previa del mosaico web */}
            <div className="mt-6">
              {/* Previsualización del mosaico eliminada */}
            </div>
          </>
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 py-10">
            <ImagesIcon size={32} className="text-white/10" />
            <p className="mt-3 text-sm text-white/20">
              Sin fotos. Sube imágenes del showroom.
            </p>
          </div>
        )}
      </section>

      {/* ── Dirección y localización ── */}
      <section className="mt-6 rounded-xl border border-white/6 bg-[#141414] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-copper">
          Dirección y Región
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
              Calle y número
            </label>
            <input
              value={address.street}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, street: e.target.value }))
              }
              className={inputClass}
              placeholder="Avenida de Tolosa 89"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
              Código postal
            </label>
            <input
              value={address.postalCode}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, postalCode: e.target.value }))
              }
              className={inputClass}
              placeholder="20018"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
              Ciudad
            </label>
            <input
              value={address.city}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, city: e.target.value }))
              }
              className={inputClass}
              placeholder="San Sebastián"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
              Región / Provincia
            </label>
            <input
              value={address.region}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, region: e.target.value }))
              }
              className={inputClass}
              placeholder="Gipuzkoa, País Vasco"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
              Zona de trabajo
            </label>
            <input
              value={address.serviceArea}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, serviceArea: e.target.value }))
              }
              className={inputClass}
              placeholder="San Sebastián, Irún, Tolosa y alrededores"
            />
            <p className="mt-1 text-[10px] text-white/20">
              Descripción de la zona de cobertura. Se muestra en la sección de contacto.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">
              Coordenadas Google Maps
            </label>
            <input
              value={address.mapsQuery}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, mapsQuery: e.target.value }))
              }
              className={inputClass}
              placeholder="43.30739782667964,-2.0075817173451656"
            />
            <p className="mt-1 text-[10px] text-white/20">
              Formato: latitud,longitud. Centra el mapa y genera el enlace de Google Maps.
            </p>
          </div>
        </div>
      </section>

      {saveSuccess && (
        <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-xs text-green-400">
          Cambios guardados correctamente
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 flex items-center gap-2 rounded-lg bg-copper px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-copper-light disabled:opacity-40"
      >
        {saving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Save size={14} />
        )}
        Guardar cambios
      </button>
    </div>
  );
}
