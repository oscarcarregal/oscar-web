"use client";

import { useState } from "react";
import { Calendar, Phone, Mail, X, CheckCircle, ChevronRight } from "lucide-react";

const APPOINTMENT_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3DOSviYvHcyeVAH6c3au6QsnyGtMfnpqVqO0g3xjqPMrf8uv1MXl8b0J_uc3MeMawQ0yKNOiCR";

const APPOINTMENT_EMBED_URL = `${APPOINTMENT_URL}?gv=true`;

interface AppointmentWidgetProps {
  /** Override the appointment URL from admin config */
  appointmentUrl?: string;
}

export default function AppointmentWidget({ appointmentUrl }: AppointmentWidgetProps) {
  const [open, setOpen] = useState(false);

  const url = appointmentUrl || APPOINTMENT_URL;
  const embedUrl = `${url}${url.includes("?") ? "&" : "?"}gv=true`;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="group mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-carbon px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all duration-300 hover:bg-[#333] hover:shadow-xl"
      >
        <Calendar size={16} className="transition-transform duration-300 group-hover:scale-110" />
        Solicitar visita al local
        <ChevronRight size={14} className="opacity-50 transition-transform duration-300 group-hover:translate-x-0.5" />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="relative flex w-full max-w-2xl flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-copper/10">
                  <Calendar size={18} className="text-copper" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-carbon">Reservar visita al local</p>
                  <p className="text-xs text-silver">Solo con cita previa</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-silver transition-colors hover:bg-gray-100 hover:text-carbon"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Info banner — always visible, not dismissable */}
            <div className="mx-6 mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-700">
                Cómo funciona la reserva
              </p>
              <ol className="space-y-2">
                {[
                  { icon: Calendar, text: "Elige la fecha y hora que mejor te vayan." },
                  {
                    icon: CheckCircle,
                    text: "Recibirás una confirmación automática de Google por email.",
                  },
                  {
                    icon: Phone,
                    text: "Oscar revisará su agenda. Si no puede ese día, te contactará por teléfono o email para proponerte otra fecha.",
                    highlight: true,
                  },
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${step.highlight ? "bg-amber-600 text-white" : "bg-amber-200 text-amber-700"}`}>
                      {i + 1}
                    </span>
                    <p className={`text-xs leading-relaxed ${step.highlight ? "font-medium text-amber-800" : "text-amber-700"}`}>
                      {step.text}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Iframe */}
            <div className="relative mx-6 mb-6 mt-4 overflow-hidden rounded-2xl border border-gray-100" style={{ height: "480px" }}>
              <iframe
                src={embedUrl}
                title="Reservar visita al local de Oscar Carregal"
                className="h-full w-full border-0"
                loading="eager"
                allow="payment"
              />
            </div>

            {/* Footer note */}
            <div className="flex items-center justify-center gap-4 border-t border-gray-100 px-6 py-4">
              <p className="text-center text-xs text-silver">
                ¿Prefieres contactar directamente?
              </p>
              <div className="flex gap-3">
                <a
                  href="tel:+34688885835"
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-dark transition-colors hover:text-carbon"
                >
                  <Phone size={12} />
                  Llamar
                </a>
                <a
                  href={`mailto:oscarcgs@gmail.com`}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-dark transition-colors hover:text-carbon"
                >
                  <Mail size={12} />
                  Email
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
