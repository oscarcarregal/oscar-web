"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { type ScheduleEntry } from "../../lib/data";
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
  EyeOff,
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
  Maximize,
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
  appointmentUrl?: string;
}

interface SiteConfig {
  business: any;
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

/* ═══════════════════════════════ LIGHTBOX ═══════════════════════════════ */

function LightboxModal({
  src,
  alt = "Imagen ampliada",
  onClose,
}: {
  src: string;
  alt?: string;
  onClose: () => void;
}) {
  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-[90vw] items-center justify-center animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -right-2 -top-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:-right-10 sm:top-0"
          aria-label="Cerrar imagen"
        >
          <X size={20} />
        </button>
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="90vw"
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
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
  // IDs de consultas ya conocidas — para detectar nuevas en el polling
  const knownIdsRef = useRef<Set<string>>(new Set());
  // Toast de nueva consulta
  const [newToastCount, setNewToastCount] = useState(0);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Carga inicial completa (config + reformas + presupuestos) */
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
      // Registrar IDs conocidos tras la carga inicial
      knownIdsRef.current = new Set(presData.map((p) => p.id));
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

  /** Polling silencioso — sólo refresca presupuestos cada 30 s */
  const pollPresupuestos = useCallback(async () => {
    try {
      const presData = await api<Presupuesto[]>("/api/admin/presupuestos");
      const incoming = presData.filter((p) => !knownIdsRef.current.has(p.id));
      if (incoming.length > 0) {
        // Registrar los nuevos IDs
        incoming.forEach((p) => knownIdsRef.current.add(p.id));
        // Mostrar toast
        setNewToastCount(incoming.length);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setNewToastCount(0), 5000);
      }
      setPresupuestos(presData);
    } catch {
      // Silenciar errores de red en el polling
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling cada 30 segundos
  useEffect(() => {
    const interval = setInterval(pollPresupuestos, 30_000);
    return () => clearInterval(interval);
  }, [pollPresupuestos]);

  // Limpiar toast timer al desmontar
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

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
      <div className="flex min-h-dvh items-center justify-center bg-[#0f1117]">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-amber-500/25 bg-amber-500/8 px-8 py-10 text-center">
          <AlertCircle size={32} className="text-amber-400" />
          <h2 className="font-heading text-lg text-[#e2e8f0]">Sesión expirada</h2>
          <p className="text-sm text-[#94a3b8]">
            Tu sesión ha expirado por inactividad.<br />Vuelve a iniciar sesión para continuar.
          </p>
          <button
            onClick={() => router.replace("/admin")}
            className="mt-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
          >
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0f1117]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-indigo-400" />
          <p className="text-xs text-[#64748b]">Cargando panel…</p>
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
    <div className="flex min-h-dvh bg-[#0f1117] text-[#e2e8f0]">

      {/* Toast — nueva consulta recibida */}
      {newToastCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-[#0f1f17] px-4 py-3 shadow-2xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle size={16} className="text-emerald-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              {newToastCount === 1 ? "Nueva consulta recibida" : `${newToastCount} nuevas consultas`}
            </p>
            <p className="text-xs text-emerald-500/70">Aparece en la lista automáticamente</p>
          </div>
        </div>
      )}

      {/* ── Barra superior fija en móvil ── */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-white/8 bg-[#111420] px-4 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748b] hover:bg-white/6 hover:text-[#e2e8f0] transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
          Admin Panel
        </p>
        {newCount > 0 && (
          <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
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
            className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-white/8 bg-[#111420]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                  Admin Panel
                </p>
                <p className="mt-1 text-[10px] text-[#475569]">Oscar Carregal</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-[#64748b] hover:bg-white/6 hover:text-[#e2e8f0] transition-colors"
                aria-label="Cerrar menú"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-5 pb-4 pt-3">
              <div className="flex gap-1.5">
                <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-emerald-500/12 px-2 py-2">
                  <span className="text-base font-bold leading-none text-emerald-400">{newCount}</span>
                  <span className="text-[8px] font-semibold uppercase tracking-wide text-emerald-500/70">Nuevas</span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-blue-500/12 px-2 py-2">
                  <span className="text-base font-bold leading-none text-blue-400">{contactadoCount}</span>
                  <span className="text-[8px] font-semibold uppercase tracking-wide text-blue-500/70">Seguim.</span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-white/6 px-2 py-2">
                  <span className="text-base font-bold leading-none text-[#64748b]">{cerradoCount}</span>
                  <span className="text-[8px] font-semibold uppercase tracking-wide text-[#475569]">Cerradas</span>
                </div>
              </div>
            </div>
            <nav className="flex-1 space-y-0.5 px-3 py-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSidebarOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    tab === t.key
                      ? "bg-indigo-500/15 text-indigo-300 font-medium"
                      : "text-[#64748b] hover:bg-white/5 hover:text-[#94a3b8]"
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                  {t.key === "presupuestos" && newCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                      {newCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="border-t border-white/8 px-3 py-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#64748b] transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Sidebar fijo (escritorio ≥ md) ── */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-white/8 bg-[#111420] md:flex">
        <div className="border-b border-white/8 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Admin Panel
          </p>
          <p className="mt-1 text-[10px] text-[#475569]">Oscar Carregal</p>

          {/* Contadores de consultas */}
          <div className="mt-4 flex gap-1.5">
            <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-emerald-500/12 px-2 py-2">
              <span className="text-base font-bold leading-none text-emerald-400">{newCount}</span>
              <span className="text-[8px] font-semibold uppercase tracking-wide text-emerald-500/70">Nuevas</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-blue-500/12 px-2 py-2">
              <span className="text-base font-bold leading-none text-blue-400">{contactadoCount}</span>
              <span className="text-[8px] font-semibold uppercase tracking-wide text-blue-500/70">Seguim.</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-white/6 px-2 py-2">
              <span className="text-base font-bold leading-none text-[#64748b]">{cerradoCount}</span>
              <span className="text-[8px] font-semibold uppercase tracking-wide text-[#475569]">Cerradas</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                tab === t.key
                  ? "bg-indigo-500/15 text-indigo-300 font-medium"
                  : "text-[#64748b] hover:bg-white/5 hover:text-[#94a3b8]"
              }`}
            >
              <t.icon size={16} />
              {t.label}
              {t.key === "presupuestos" && newCount > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/8 px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#64748b] transition-colors hover:bg-red-500/10 hover:text-red-400"
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
            newToastCount={newToastCount}
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
    nuevo: { bg: "bg-emerald-500/15 border border-emerald-500/25", text: "text-emerald-400", icon: AlertCircle },
    contactado: { bg: "bg-blue-500/15 border border-blue-500/25", text: "text-blue-400", icon: Clock },
    cerrado: { bg: "bg-slate-500/15 border border-slate-500/20", text: "text-[#94a3b8]", icon: CheckCircle },
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
  newToastCount,
}: {
  presupuestos: Presupuesto[];
  onRefresh: () => void;
  newToastCount: number;
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
    nuevo: { active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/35", inactive: "bg-[#1e2435] text-[#64748b] border-white/8" },
    contactado: { active: "bg-blue-500/20 text-blue-400 border-blue-500/35", inactive: "bg-[#1e2435] text-[#64748b] border-white/8" },
    cerrado: { active: "bg-slate-500/20 text-[#94a3b8] border-slate-400/25", inactive: "bg-[#1e2435] text-[#64748b] border-white/8" },
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-[#e2e8f0]">Consultas</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            {presupuestos.length} consultas recibidas
          </p>
        </div>
        {/* Indicador de actualización automática */}
        <div className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-[#1e2435] px-3 py-1.5">
          <span className={`h-2 w-2 rounded-full ${
            newToastCount > 0 ? "bg-emerald-400 animate-pulse" : "bg-[#475569]"
          }`} />
          <span className="text-[10px] text-[#64748b]">
            {newToastCount > 0 ? "Nueva consulta" : "Actualiz. automática"}
          </span>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mt-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full rounded-lg border border-white/10 bg-[#1e2435] pl-10 pr-4 py-2.5 text-sm text-[#e2e8f0] outline-none transition-all focus:border-indigo-500/40 placeholder:text-[#475569]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Estado filters */}
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-[#475569]" />
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
            <ArrowUpDown size={14} className="text-[#475569]" />
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
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "bg-[#1e2435] text-[#64748b] hover:bg-[#252d3d] hover:text-[#94a3b8]"
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
          <p className="py-12 text-center text-sm text-[#475569]">
            No hay consultas con estos filtros
          </p>
        )}
        {filtered.map((p) => (
          <div
            key={p.id}
            className="overflow-hidden rounded-xl border border-white/8 bg-[#161b27] transition-all"
          >
            <button
              onClick={() =>
                setExpanded(expanded === p.id ? null : p.id)
              }
              className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-white/3"
            >
              <StatusBadge estado={p.estado} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-[#e2e8f0]">{p.nombre}</p>
                <p className="text-xs text-[#64748b]">
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
              <div className="border-t border-white/8 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#475569]">
                      Teléfono
                    </p>
                    {p.telefono ? (
                      <a
                        href={`tel:${p.telefono}`}
                        className="mt-0.5 flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        <PhoneIcon size={12} />
                        {p.telefono}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm text-[#475569]">—</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#475569]">
                      Email
                    </p>
                    {p.email ? (
                      <a
                        href={`mailto:${p.email}`}
                        className="mt-0.5 flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        <Mail size={12} />
                        {p.email}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm text-[#475569]">—</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-wider text-[#475569]">
                    Descripción
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#94a3b8]">
                    {p.descripcion}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <p className="text-[10px] uppercase tracking-wider text-[#475569]">
                    Estado:
                  </p>
                  {["nuevo", "contactado", "cerrado"].map((e) => (
                    <button
                      key={e}
                      onClick={() => updateEstado(p.id, e)}
                      disabled={saving}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-all ${
                        p.estado === e
                          ? "bg-indigo-600 text-white"
                          : "bg-[#1e2435] text-[#64748b] hover:bg-[#252d3d] hover:text-[#94a3b8]"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                  <button
                    onClick={() => deletePresupuesto(p.id)}
                    className="ml-auto rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-red-500/10 hover:text-red-400"
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

function AdminReformaCard({
  reforma,
  isFeatured,
  onEdit,
  onDelete,
}: {
  reforma: Reforma;
  isFeatured: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCycle = () => {
    if (reforma.images.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setImgIdx((prev) => (prev + 1) % reforma.images.length),
      900
    );
  };

  const stopCycle = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setImgIdx(0);
  };

  return (
    <div
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-[#161b27] shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
      onClick={onEdit}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
    >
      <div
        className="relative h-64 overflow-hidden bg-[#1e2435]"
        onMouseEnter={startCycle}
        onMouseLeave={stopCycle}
        onTouchStart={startCycle}
        onTouchEnd={stopCycle}
      >
        {reforma.images.length > 0 ? (
          reforma.images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={reforma.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-all duration-700 ${
                i === imgIdx ? "opacity-100" : "opacity-0"
              } ${hovered ? "scale-105" : "scale-100"}`}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-[#475569]">
            <ImagesIcon size={32} />
          </div>
        )}
        
        <div
          className={`absolute inset-0 bg-gradient-to-t from-[#0f1117]/80 via-transparent to-transparent transition-opacity duration-500 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
          {isFeatured && (
            <span className="rounded-full border border-indigo-500/30 bg-indigo-600/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm shadow-sm">
              DESTACADO
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-sm shadow-sm">
            <ImagesIcon size={12} />
            <span className="font-medium">{reforma.images.length}</span>
          </span>
        </div>

        {/* Hover Action buttons */}
        <div
          className={`absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between transition-all duration-400 ${
            hovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <div className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-all hover:bg-indigo-500">
            <Edit3 size={12} />
            Editar
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/90 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-red-500 hover:scale-110"
            aria-label="Eliminar"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <h3 className="text-xl text-[#e2e8f0] transition-colors group-hover:text-indigo-300">
          {reforma.title || "(Sin título)"}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#94a3b8] line-clamp-3">
          {reforma.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {reforma.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#1e2435] px-3 py-1 text-[11px] font-medium tracking-wide text-[#94a3b8]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

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
          <h1 className="font-heading text-2xl text-[#e2e8f0]">Reformas</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            {reformas.length} proyectos
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
        >
          <Plus size={16} />
          Nueva Reforma
        </button>
      </div>

      {/* ── Selector de reformas destacadas ── */}
      <section className="mt-8 rounded-xl border border-white/8 bg-[#161b27] p-6">
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
            <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
              Reformas Destacadas
            </h2>
            <p className="mt-0.5 text-xs text-[#64748b]">
              Aparecen en la portada · máx. 3
            </p>
          </div>
          <div className="flex items-center gap-2">
            {savingFeatured && (
              <Loader2 size={14} className="animate-spin text-[#64748b]" />
            )}
            {/* Botón para colapsar/expandir la sección */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFeaturedOpen((v) => !v);
              }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-[#64748b] transition-colors hover:bg-white/6 hover:text-[#94a3b8]"
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
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#1e2435]"
              >
                <div className="relative aspect-[4/3]">
                  {reforma.images.length > 0 ? (
                    <Image
                      src={reforma.images[0].startsWith("http") ? reforma.images[0] : `/reformas/${reforma.id}/${reforma.images[0]}`}
                      alt={reforma.title}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#252d3d]">
                      <ImagesIcon size={24} className="text-[#475569]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <p className="absolute bottom-2 left-2 right-8 truncate text-xs font-semibold text-white drop-shadow-sm">
                    {reforma.title || "(Sin título)"}
                  </p>
                  {/* Número de slot */}
                  <span className="absolute left-2 top-2 rounded-md bg-indigo-600/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
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
                    ? "cursor-pointer border-indigo-500/25 bg-[#1e2435] hover:border-indigo-500/50 hover:bg-indigo-500/8"
                    : "cursor-not-allowed border-white/6 bg-[#161b27] opacity-40"
                }`}
              >
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                      isNextEmpty
                        ? "border-indigo-500/25 bg-indigo-500/8 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/15"
                        : "border-white/8 bg-white/3"
                    }`}
                  >
                    <Plus
                      size={18}
                      className={`transition-colors ${
                        isNextEmpty
                          ? "text-indigo-400/50 group-hover:text-indigo-400"
                          : "text-white/10"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[11px] transition-colors ${
                      isNextEmpty
                        ? "text-[#475569] group-hover:text-indigo-400/80"
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
          <AdminReformaCard
            key={r.id}
            reforma={r}
            isFeatured={featuredList.includes(r.id)}
            onEdit={() => setEditing(r)}
            onDelete={() => handleDelete(r.id)}
          />
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
  const [images, setImages] = useState<string[]>(reforma?.images ?? []);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(reforma?.tags ?? []);
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

  const processFiles = async (files: FileList | File[]) => {
    if (!reforma || files.length === 0) return;
    
    const formData = new FormData();
    let hasImage = false;
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        formData.append("images", file);
        hasImage = true;
      }
    }
    if (!hasImage) return;

    setUploading(true);
    try {
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

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  useEffect(() => {
    if (isNew) return;
    const handlePaste = (e: ClipboardEvent) => {
      // Ignorar pegado en inputs de texto para no interferir
      if (
        (e.target instanceof HTMLInputElement && e.target.type !== "file") ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        e.preventDefault();
        processFiles(e.clipboardData.files);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [reforma?.id, isNew]);

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
    "w-full rounded-lg border border-white/10 bg-[#1e2435] px-3 py-2.5 text-sm text-[#e2e8f0] outline-none transition-all focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/15 placeholder:text-[#475569]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#161b27] p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-[#64748b] hover:bg-white/6 hover:text-[#e2e8f0] transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="font-heading text-xl text-[#e2e8f0]">
          {isNew ? "Nueva Reforma" : `Editar — ${reforma.title || reforma.id}`}
        </h2>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#64748b]">
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
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#64748b]">
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
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#64748b]">
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
                className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-[#1e2435] px-3 py-2.5 text-sm text-[#e2e8f0] transition-all hover:border-white/20"
              >
                <span className="flex flex-wrap gap-1.5">
                  {selectedTags.length > 0 ? (
                    selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTag(tag);
                          }}
                          className="text-indigo-400/60 hover:text-indigo-300"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-[#475569]">Seleccionar tags…</span>
                  )}
                </span>
                <ChevronDown size={14} className="shrink-0 text-[#64748b]" />
              </div>

              {tagDropdownOpen && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#1e2435] py-1 shadow-xl">
                  {availableTags.length === 0 && (
                    <p className="px-3 py-2 text-xs text-[#475569]">No hay tags configurados</p>
                  )}
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                        selectedTags.includes(tag) ? "text-indigo-300" : "text-[#94a3b8]"
                      }`}
                    >
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          selectedTags.includes(tag)
                            ? "border-indigo-500 bg-indigo-500/25"
                            : "border-white/20"
                        }`}
                      >
                        {selectedTags.includes(tag) && <CheckCircle size={10} className="text-indigo-400" />}
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
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b]">
                  Imágenes ({images.length})
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1e2435] px-3 py-1.5 text-xs text-[#94a3b8] transition-colors hover:bg-[#252d3d] hover:text-[#e2e8f0]">
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

              <p className="mt-1 text-[10px] text-[#475569]">Arrastra para reordenar</p>

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
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-[#1e2435]">
                      <Image
                        src={img}
                        alt=""
                        fill
                        sizes="120px"
                        className="object-cover pointer-events-none"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                        <GripVertical size={16} className="text-white/0 transition-colors group-hover:text-white/70" />
                      </div>
                    </div>
                    {/* Botones on hover */}
                    <div className="absolute -right-1 -top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImg(img);
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-white hover:bg-black hover:scale-110 transition-all"
                        aria-label="Ampliar"
                      >
                        <Maximize size={10} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(img);
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 hover:scale-110 transition-all"
                        aria-label="Eliminar"
                      >
                        <X size={10} />
                      </button>
                    </div>
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
              className="rounded-lg bg-[#1e2435] px-5 py-2.5 text-sm text-[#64748b] hover:bg-[#252d3d] hover:text-[#94a3b8] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !canSave}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-40"
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

      {lightboxImg && (
        <LightboxModal
          src={lightboxImg}
          onClose={() => setLightboxImg(null)}
        />
      )}
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
        className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#161b27] p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-[#64748b] hover:bg-white/6 hover:text-[#e2e8f0] transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="font-heading text-xl text-[#e2e8f0]">Seleccionar reforma destacada</h2>
        <p className="mt-1 text-sm text-[#64748b]">
          Elige la reforma que aparecerá en la portada
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {reformas.length === 0 ? (
            <p className="col-span-3 py-8 text-center text-sm text-[#475569]">
              Todas las reformas ya están destacadas
            </p>
          ) : (
            reformas.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelect(r.id)}
                className="group overflow-hidden rounded-xl border border-white/8 bg-[#161b27] text-left transition-all hover:border-indigo-500/40 hover:bg-indigo-500/5"
              >
                <div className="relative h-28 bg-[#1e2435]">
                  {r.images.length > 0 ? (
                    <Image
                      src={r.images[0]}
                      alt={r.title}
                      fill
                      sizes="200px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImagesIcon size={24} className="text-[#475569]" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-1 text-xs font-semibold text-[#94a3b8] transition-colors group-hover:text-[#e2e8f0]">
                    {r.title || "(Sin título)"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#475569]">
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
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
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
          <h1 className="font-heading text-2xl text-[#e2e8f0]">Carrusel Hero</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            {slides.length} slides configurados
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5 text-xs text-[#64748b]">
              <Loader2 size={12} className="animate-spin" />
              Guardando…
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle size={12} />
              Guardado
            </span>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
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
            className="flex items-center gap-4 rounded-xl border border-white/8 bg-[#161b27] p-3"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveSlide(i, -1)}
                disabled={i === 0}
                className="p-0.5 text-[#475569] hover:text-[#94a3b8] disabled:opacity-20 transition-colors"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => moveSlide(i, 1)}
                disabled={i === slides.length - 1}
                className="p-0.5 text-[#475569] hover:text-[#94a3b8] disabled:opacity-20 transition-colors"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="group relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[#1e2435]">
              <Image
                src={slide.image}
                alt=""
                fill
                sizes="96px"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImg(slide.image);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/40"
                  aria-label="Ampliar"
                >
                  <Maximize size={12} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#64748b]">
                {getReformaTitle(slide.reforma)}
              </p>
              <input
                value={slide.caption}
                onChange={(e) => updateCaption(i, e.target.value)}
                placeholder="Pie de foto del slide…"
                className="mt-1 w-full rounded-md border border-white/10 bg-[#1e2435] px-2 py-1.5 text-xs text-[#e2e8f0] outline-none focus:border-indigo-500/40 placeholder:text-[#475569]"
              />
            </div>

            <button
              onClick={() => removeSlide(i)}
              className="rounded-lg p-2 text-[#475569] hover:bg-red-500/10 hover:text-red-400 transition-colors"
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
            className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#161b27] p-5 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-[#64748b] hover:bg-white/6 hover:text-[#e2e8f0] transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="font-heading text-xl text-[#e2e8f0]">Añadir Slide al Carrusel</h2>
            <p className="mt-1 text-sm text-[#64748b]">
              Selecciona una imagen de tus reformas
            </p>

            <div className="mt-6 space-y-6">
              {reformas
                .filter((r) => r.images.length > 0)
                .map((r) => (
                  <div key={r.id}>
                    <p className="text-xs font-medium text-[#94a3b8]">
                      {r.title || "(Sin título)"}
                    </p>
                    <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-7">
                      {r.images.map((img) => (
                        <button
                          key={img}
                          onClick={() => addSlide(r.id, img)}
                          className="relative aspect-square overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-indigo-500 hover:scale-105"
                        >
                          <Image
                            src={img}
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
                <p className="py-8 text-center text-sm text-[#475569]">
                  No hay reformas con imágenes. Sube imágenes a una reforma primero.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {lightboxImg && (
        <LightboxModal
          src={lightboxImg}
          onClose={() => setLightboxImg(null)}
        />
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
    setBusiness((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateNestedBusiness = (
    parent: string,
    key: string,
    value: string
  ) => {
    setBusiness((prev: any) => ({
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


  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#1e2435] px-3 py-2.5 text-sm text-[#e2e8f0] outline-none transition-all focus:border-indigo-500/40 placeholder:text-[#475569]";

  const biz = business as Record<string, unknown>;
  const insta = (biz.instagram ?? {}) as Record<string, string>;
  const schedule = (biz.schedule ?? {}) as Record<string, string>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-[#e2e8f0]">Configuración</h1>
          <p className="mt-1 text-sm text-[#64748b]">
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
          <section className="rounded-xl border border-white/8 bg-[#161b27] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
              Datos del Negocio
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
                  Nombre de marca
                </label>
                <input
                  value={(biz.brandName as string) ?? ""}
                  onChange={(e) => updateBusiness("brandName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
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
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
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
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
                  Email
                </label>
                <input
                  value={(biz.email as string) ?? ""}
                  onChange={(e) => updateBusiness("email", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
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
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
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
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
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
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
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
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
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
          <section className="rounded-xl border border-white/8 bg-[#161b27] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
              Tags de Servicios
            </h2>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="group inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-sm text-indigo-300"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="rounded-full p-0.5 text-indigo-400/40 transition-colors hover:bg-red-500/20 hover:text-red-400"
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
                  className="flex items-center gap-1.5 rounded-lg bg-[#1e2435] px-4 py-2 text-sm text-[#64748b] transition-colors hover:bg-[#252d3d] hover:text-[#e2e8f0] disabled:opacity-30"
                >
                  <Plus size={14} />
                  Añadir
                </button>
              </div>
              <p className="mt-2 text-[10px] text-[#475569]">
                Se usan en los filtros de la página de trabajos y en el editor de reformas.
              </p>
            </div>
          </section>

          <button
            onClick={handleSaveVisual}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-40"
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
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const inputClass = "w-full rounded-lg border border-white/10 bg-[#1e2435] px-3 py-2.5 text-sm text-[#e2e8f0] outline-none transition-all focus:border-indigo-500/40 placeholder:text-[#475569]";

  return (
    <section className="rounded-xl border border-red-500/20 bg-[#1e1620] p-6 mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400 flex items-center gap-2">
        <AlertCircle size={16} />
        Seguridad
      </h2>
      <p className="mt-2 text-xs text-[#64748b]">
        Cambia la contraseña de acceso al panel de administración. Por seguridad, te recomendamos usar una contraseña fuerte.
      </p>
      
      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-400">
          ¡Contraseña cambiada con éxito!
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-sm">
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
            Contraseña actual
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`${inputClass} pr-10`}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94a3b8] transition-colors"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`${inputClass} pr-10`}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94a3b8] transition-colors"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
            Confirmar nueva contraseña
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputClass} pr-10`}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94a3b8] transition-colors"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 px-6 py-2.5 text-sm font-semibold transition-all hover:bg-red-500/25 hover:text-red-300 disabled:opacity-40"
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
    appointmentUrl: config?.storeAddress?.appointmentUrl ?? "",
  });
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>(
    (config?.business?.scheduleEntries && config.business.scheduleEntries.length > 0)
      ? config.business.scheduleEntries
      : [
          { days: "Lun–Vie", open: "08:00", close: "19:00" },
          { days: "Sáb",     open: "09:00", close: "12:00" },
          { days: "Dom",     open: null,    close: null },
        ]
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Sube imágenes al endpoint /api/admin/tienda/images */
  const processFiles = async (files: FileList | File[]) => {
    if (files.length === 0) return;
    
    const formData = new FormData();
    let hasImage = false;
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        formData.append("images", file);
        hasImage = true;
      }
    }
    if (!hasImage) return;

    setUploading(true);
    try {
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

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Ignorar pegado en inputs de texto
      if (
        (e.target instanceof HTMLInputElement && e.target.type !== "file") ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        e.preventDefault();
        processFiles(e.clipboardData.files);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

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
          business: {
            ...(config.business ?? {}),
            scheduleEntries,
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
    "w-full rounded-lg border border-white/10 bg-[#1e2435] px-3 py-2.5 text-sm text-[#e2e8f0] outline-none transition-all focus:border-indigo-500/40 placeholder:text-[#475569]";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-[#e2e8f0]">Localización</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Fotos del showroom y datos de ubicación
          </p>
        </div>
      </div>

      {/* ── Fotos del showroom ── */}
      <section className="mt-8 rounded-xl border border-white/8 bg-[#161b27] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
            Fotos del Showroom
          </h2>
          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1e2435] px-3 py-1.5 text-xs text-[#94a3b8] transition-colors hover:bg-[#252d3d] hover:text-[#e2e8f0]">
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
            <p className="mt-2 text-[10px] text-[#475569]">
              Arrastra para reordenar · {photos.length} fotos
            </p>

            {/* Grid de fotos con drag & drop */}
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5 items-end">
              {/* Contenedor agrupador de las 3 fotos principales con borde único */}
              {photos.length >= 3 && (
                <div className="col-span-3 flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Destacadas en web</span>
                <div className="grid grid-cols-3 gap-3 rounded-xl ring-[4px] ring-indigo-500/50 p-1">
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
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-[#1e2435]">
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
                      {/* Botones on hover */}
                      <div className="absolute -right-1 -top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImg(photo.src);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-white hover:bg-black hover:scale-110 transition-all"
                          aria-label="Ampliar"
                        >
                          <Maximize size={10} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(photo.src);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 hover:scale-110 transition-all"
                          aria-label="Eliminar"
                        >
                          <X size={10} />
                        </button>
                      </div>
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
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-[#1e2435]">
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
                  {/* Botones on hover */}
                  <div className="absolute -right-1 -top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxImg(photo.src);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-white hover:bg-black hover:scale-110 transition-all"
                      aria-label="Ampliar"
                    >
                      <Maximize size={10} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.src);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 hover:scale-110 transition-all"
                      aria-label="Eliminar"
                    >
                      <X size={10} />
                    </button>
                  </div>
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
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-500/20 py-10">
            <ImagesIcon size={32} className="text-[#475569]" />
            <p className="mt-3 text-sm text-[#475569]">
              Sin fotos. Sube imágenes del showroom.
            </p>
          </div>
        )}
      </section>

      {/* ── Dirección y localización ── */}
      <section className="mt-6 rounded-xl border border-white/8 bg-[#161b27] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
          Dirección y Región
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
              Calle y número
            </label>
            <input
              value={address.street}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, street: e.target.value }))
              }
              className={inputClass}
              placeholder="Avenida de Tolosa 89, local 1"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
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
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
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
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
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
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
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
            <p className="mt-1 text-[10px] text-[#475569]">
              Descripción de la zona de cobertura. Se muestra en la sección de contacto.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
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
            <p className="mt-1 text-[10px] text-[#475569]">
              Formato: latitud,longitud. Centra el mapa y genera el enlace de Google Maps.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748b]">
              URL de cita previa (Google Appointment Scheduling)
            </label>
            <input
              value={address.appointmentUrl ?? ""}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, appointmentUrl: e.target.value }))
              }
              className={inputClass}
              placeholder="https://calendar.app.google/..."
            />
            <p className="mt-1 text-[10px] text-[#475569]">
              URL del formulario de citas de Google Calendar. Se usa en el botón "Solicitar visita al local".
            </p>
          </div>
        </div>
      </section>

      {/* ── Horarios por día ── */}
      <section className="mt-6 rounded-xl border border-white/8 bg-[#161b27] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
          Horario de atención
        </h2>
        <p className="mt-1 text-[10px] text-[#475569]">
          Define el horario por bloque de días. Deja "Apertura" vacío para marcarlo como cerrado.
        </p>
        <div className="mt-4 space-y-2">
          {scheduleEntries.map((entry, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_100px_80px_auto] items-center gap-2">
              <input
                value={entry.days}
                onChange={(e) => {
                  const updated = [...scheduleEntries];
                  updated[i] = { ...updated[i], days: e.target.value };
                  setScheduleEntries(updated);
                }}
                className={`${inputClass} text-xs`}
                placeholder="Lun–Vie"
              />
              <input
                value={entry.open ?? ""}
                onChange={(e) => {
                  const updated = [...scheduleEntries];
                  updated[i] = { ...updated[i], open: e.target.value || null };
                  setScheduleEntries(updated);
                }}
                className={`${inputClass} text-xs`}
                placeholder="08:00"
              />
              <input
                value={entry.close ?? ""}
                onChange={(e) => {
                  const updated = [...scheduleEntries];
                  updated[i] = { ...updated[i], close: e.target.value || null };
                  setScheduleEntries(updated);
                }}
                className={`${inputClass} text-xs`}
                placeholder="19:00"
              />
              <input
                value={entry.note ?? ""}
                onChange={(e) => {
                  const updated = [...scheduleEntries];
                  updated[i] = { ...updated[i], note: e.target.value };
                  setScheduleEntries(updated);
                }}
                className={`${inputClass} text-xs`}
                placeholder="Nota"
              />
              <button
                onClick={() => setScheduleEntries(scheduleEntries.filter((_, j) => j !== i))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                aria-label="Eliminar fila"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_100px_100px_80px_auto] gap-2 text-[9px] uppercase tracking-wider text-[#475569] px-1">
            <span>Días</span><span>Apertura</span><span>Cierre</span><span>Nota</span><span />
          </div>
        </div>
        <button
          onClick={() => setScheduleEntries([...scheduleEntries, { days: "", open: "", close: "", note: "" }])}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#1e2435] px-3 py-1.5 text-xs text-[#94a3b8] transition-colors hover:bg-[#252d3d] hover:text-[#e2e8f0]"
        >
          <Plus size={12} />
          Añadir fila
        </button>
      </section>

      {saveSuccess && (
        <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-400">
          Cambios guardados correctamente
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-40"
      >
        {saving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Save size={14} />
        )}
        Guardar cambios
      </button>

      {lightboxImg && (
        <LightboxModal
          src={lightboxImg}
          onClose={() => setLightboxImg(null)}
        />
      )}
    </div>
  );
}
