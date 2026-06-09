/**
 * Utilidades para los horarios estructurados por día.
 * Compatible con el formato antiguo (string) y el nuevo (ScheduleEntry[]).
 */
import type { ScheduleEntry } from "./data";

/** Horarios por defecto si no hay entradas configuradas en Redis */
export const DEFAULT_SCHEDULE: ScheduleEntry[] = [
  { days: "Lun–Vie", open: "08:00", close: "19:00" },
  { days: "Sáb",     open: "09:00", close: "12:00" },
  { days: "Dom",     open: null,    close: null },
];

/** Formatea un bloque de horario para mostrar ("08:00 – 19:00" | "Cerrado") */
export function formatScheduleEntry(entry: ScheduleEntry): string {
  if (!entry.open || !entry.close) return "Cerrado";
  return `${entry.open} – ${entry.close}`;
}

export interface OpenStatus {
  isOpen: boolean;
  label: string; // "Abierto ahora · Cierra a las 19:00" | "Cerrado · Abre el Lun a las 8:00"
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const ORDERED_DAYS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

// day-of-week (0=Sun) → matching tokens
const DAY_TOKENS: Record<number, string[]> = {
  1: ["lun"], 2: ["mar"], 3: ["mie", "mié"], 4: ["jue"],
  5: ["vie"], 6: ["sab", "sáb"], 0: ["dom"],
};

function normalizeStr(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function coversDay(daysStr: string, dayOfWeek: number): boolean {
  const norm = normalizeStr(daysStr);
  const tokens = DAY_TOKENS[dayOfWeek] ?? [];

  // Direct match (e.g. "dom", "sáb")
  if (tokens.some((t) => norm.startsWith(t))) return true;

  // Range match (e.g. "lun–vie", "lun-vie")
  const m = norm.match(/^(\w+)\s*[–\-]+\s*(\w+)$/);
  if (m) {
    const from = ORDERED_DAYS.findIndex((d) => m[1].startsWith(d));
    const to   = ORDERED_DAYS.findIndex((d) => m[2].startsWith(d));
    // map Sunday (0) to index 6 in ORDERED_DAYS
    const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    if (from !== -1 && to !== -1) {
      return from <= to ? todayIdx >= from && todayIdx <= to
                        : todayIdx >= from || todayIdx <= to;
    }
  }
  return false;
}

/**
 * Calcula si el negocio está abierto en este momento
 * según las entradas de horario configuradas.
 */
export function getOpenStatus(entries: ScheduleEntry[]): OpenStatus {
  if (!entries || entries.length === 0) return { isOpen: false, label: "" };

  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const todayEntry = entries.find((e) => coversDay(e.days, dayOfWeek));

  if (!todayEntry?.open || !todayEntry?.close) {
    const nextOpen = entries.find((e) => e.open && e.close);
    const nextLabel = nextOpen ? ` · Abre el ${nextOpen.days} a las ${nextOpen.open}` : "";
    return { isOpen: false, label: `Cerrado${nextLabel}` };
  }

  const openMin  = toMinutes(todayEntry.open);
  const closeMin = toMinutes(todayEntry.close);

  if (currentMin >= openMin && currentMin < closeMin) {
    return { isOpen: true, label: `Abierto ahora · Cierra a las ${todayEntry.close}` };
  }

  if (currentMin < openMin) {
    return { isOpen: false, label: `Cerrado · Abre hoy a las ${todayEntry.open}` };
  }

  // Ya cerró hoy — buscar próximo día con horario
  const nextOpen = entries.find((e) => e.open && e.close && !coversDay(e.days, dayOfWeek));
  const nextLabel = nextOpen ? ` · Abre el ${nextOpen.days} a las ${nextOpen.open}` : "";
  return { isOpen: false, label: `Cerrado${nextLabel}` };
}
