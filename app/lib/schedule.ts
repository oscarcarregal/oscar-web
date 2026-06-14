import type { WeeklySchedule, DaySchedule, Shift } from "./data";

export const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  monday: { isOpen: true, shifts: [{ open: "08:00", close: "19:00" }] },
  tuesday: { isOpen: true, shifts: [{ open: "08:00", close: "19:00" }] },
  wednesday: { isOpen: true, shifts: [{ open: "08:00", close: "19:00" }] },
  thursday: { isOpen: true, shifts: [{ open: "08:00", close: "19:00" }] },
  friday: { isOpen: true, shifts: [{ open: "08:00", close: "19:00" }] },
  saturday: { isOpen: true, shifts: [{ open: "09:00", close: "12:00" }] },
  sunday: { isOpen: false, shifts: [] },
};

export interface OpenStatus {
  isOpen: boolean;
  label: string; // "Abierto ahora · Cierra a las 19:00" | "Cerrado · Abre el Lun a las 08:00"
}

export interface GroupedSchedule {
  daysLabel: string;
  isOpen: boolean;
  shifts: Shift[];
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAYS_SHORT_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const WEEK_KEYS: (keyof WeeklySchedule)[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
];

/**
 * Calcula si el negocio está abierto en este momento.
 */
export function getOpenStatus(schedule: WeeklySchedule | undefined): OpenStatus {
  if (!schedule) return { isOpen: false, label: "" };

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const todayKey = WEEK_KEYS[dayOfWeek];
  const todayDay = schedule[todayKey];

  if (todayDay.isOpen && todayDay.shifts.length > 0) {
    // Buscar si estamos dentro de algún turno de hoy
    for (const shift of todayDay.shifts) {
      const openMin = toMinutes(shift.open);
      const closeMin = toMinutes(shift.close);

      if (currentMin >= openMin && currentMin < closeMin) {
        return { isOpen: true, label: `Abierto ahora · Cierra a las ${shift.close}` };
      }
    }

    // Buscar si hay algún turno más tarde hoy
    const nextShiftToday = todayDay.shifts.find(s => toMinutes(s.open) > currentMin);
    if (nextShiftToday) {
      return { isOpen: false, label: `Cerrado · Abre hoy a las ${nextShiftToday.open}` };
    }
  }

  // Ya cerró hoy (o nunca abrió) — buscar próximo día con horario
  for (let i = 1; i <= 7; i++) {
    const nextDayIdx = (dayOfWeek + i) % 7;
    const nextDayKey = WEEK_KEYS[nextDayIdx];
    const nextDay = schedule[nextDayKey];

    if (nextDay.isOpen && nextDay.shifts.length > 0) {
      // Ordenar los turnos por hora de apertura (por seguridad)
      const firstShift = [...nextDay.shifts].sort((a, b) => toMinutes(a.open) - toMinutes(b.open))[0];
      const dayName = i === 1 ? "mañana" : `el ${DAYS_ES[nextDayIdx]}`;
      return { isOpen: false, label: `Cerrado · Abre ${dayName} a las ${firstShift.open}` };
    }
  }

  return { isOpen: false, label: "Cerrado temporalmente" };
}

/** Formatea un turno ("08:00 – 19:00") */
export function formatShift(shift: Shift): string {
  return `${shift.open} – ${shift.close}`;
}

/**
 * Agrupa días consecutivos que tienen exactamente los mismos turnos.
 * Útil para mostrar "Lun - Vie: 08:00 - 19:00" en el frontend en lugar de 5 líneas.
 */
export function groupWeeklySchedule(schedule: WeeklySchedule): GroupedSchedule[] {
  // Orden visual empieza en Lunes (índices: 1, 2, 3, 4, 5, 6, 0)
  const orderedIndices = [1, 2, 3, 4, 5, 6, 0];
  
  const days: { index: number; data: DaySchedule }[] = orderedIndices.map(idx => ({
    index: idx,
    data: schedule[WEEK_KEYS[idx]],
  }));

  const grouped: GroupedSchedule[] = [];
  
  const areShiftsEqual = (a: Shift[], b: Shift[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].open !== b[i].open || a[i].close !== b[i].close) return false;
    }
    return true;
  };

  let currentGroup: { startIdx: number; endIdx: number; data: DaySchedule } | null = null;

  for (let i = 0; i < days.length; i++) {
    const day = days[i];

    if (!currentGroup) {
      currentGroup = { startIdx: day.index, endIdx: day.index, data: day.data };
    } else {
      if (currentGroup.data.isOpen === day.data.isOpen && areShiftsEqual(currentGroup.data.shifts, day.data.shifts)) {
        // Expandir grupo
        currentGroup.endIdx = day.index;
      } else {
        // Guardar grupo anterior
        grouped.push({
          daysLabel: getDaysLabel(currentGroup.startIdx, currentGroup.endIdx),
          isOpen: currentGroup.data.isOpen,
          shifts: currentGroup.data.shifts,
        });
        currentGroup = { startIdx: day.index, endIdx: day.index, data: day.data };
      }
    }
  }

  if (currentGroup) {
    grouped.push({
      daysLabel: getDaysLabel(currentGroup.startIdx, currentGroup.endIdx),
      isOpen: currentGroup.data.isOpen,
      shifts: currentGroup.data.shifts,
    });
  }

  return grouped;
}

function getDaysLabel(startIdx: number, endIdx: number): string {
  if (startIdx === endIdx) return DAYS_SHORT_ES[startIdx];
  return `${DAYS_SHORT_ES[startIdx]}–${DAYS_SHORT_ES[endIdx]}`;
}
