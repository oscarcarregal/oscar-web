"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  ChevronDown,
  Droplets,
  Flame,
  Thermometer,
  Hammer,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import { fetchConfig, type SiteConfig } from "../lib/data";
import { formatPhoneNumber } from "../lib/phone";

/* ─────────────────────── TYPES ─────────────────────── */

interface FormData {
  nombre: string;
  telefono: string;
  email: string;
  servicio: string;
  descripcion: string;
}

const servicios = [
  { value: "", label: "Selecciona un servicio", icon: null },
  { value: "fontaneria", label: "Fontanería", icon: Droplets },
  { value: "gas", label: "Gas", icon: Flame },
  { value: "calefaccion", label: "Calefacción", icon: Thermometer },
  { value: "reforma", label: "Reforma integral", icon: Hammer },
  { value: "otro", label: "Otro", icon: HelpCircle },
];

/* ─────────────────────── FORM ─────────────────────── */

function PresupuestoForm() {
  const [form, setForm] = useState<FormData>({
    nombre: "",
    telefono: "",
    email: "",
    servicio: "",
    descripcion: "",
  });
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const servicioLabel =
      servicios.find((s) => s.value === form.servicio)?.label ?? form.servicio;

    try {
      const res = await fetch("/api/presupuesto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          telefono: form.telefono,
          email: form.email,
          servicio: servicioLabel,
          descripcion: form.descripcion,
        }),
      });
      if (!res.ok) throw new Error("Error al enviar");
      setSent(true);
    } catch {
      setError("Hubo un error al enviar la solicitud. Por favor, inténtalo de nuevo.");
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-green-200 bg-green-50 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h3 className="mt-6 font-heading text-2xl text-carbon">
          ¡Solicitud enviada!
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-silver">
          Hemos recibido tu solicitud de presupuesto correctamente. Nos
          pondremos en contacto contigo lo antes posible, normalmente en menos
          de 24 horas.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 rounded-full border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-dark transition-colors hover:bg-cream"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-carbon outline-none transition-all duration-300 placeholder:text-silver/60 ${
      focused === field
        ? "border-copper/50 ring-2 ring-copper/10 shadow-sm"
        : "border-gray-200 hover:border-gray-300"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre */}
      <div>
        <label
          htmlFor="nombre"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-dark"
        >
          Nombre completo <span className="text-copper">*</span>
        </label>
        <input
          id="nombre"
          type="text"
          required
          placeholder="Tu nombre y apellidos"
          value={form.nombre}
          onChange={(e) => update("nombre", e.target.value)}
          onFocus={() => setFocused("nombre")}
          onBlur={() => setFocused(null)}
          className={inputClass("nombre")}
        />
      </div>

      {/* Teléfono + Email */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="telefono"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-dark"
          >
            Teléfono <span className="text-copper">*</span>
          </label>
          <input
            id="telefono"
            type="tel"
            required
            placeholder="600 00 00 00"
            value={form.telefono}
            onChange={(e) => update("telefono", e.target.value)}
            onFocus={() => setFocused("telefono")}
            onBlur={() => setFocused(null)}
            className={inputClass("telefono")}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-dark"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            className={inputClass("email")}
          />
        </div>
      </div>

      {/* Servicio */}
      <div>
        <label
          htmlFor="servicio"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-dark"
        >
          Tipo de servicio <span className="text-copper">*</span>
        </label>
        <div className="relative">
          <select
            id="servicio"
            required
            value={form.servicio}
            onChange={(e) => update("servicio", e.target.value)}
            onFocus={() => setFocused("servicio")}
            onBlur={() => setFocused(null)}
            className={`${inputClass("servicio")} appearance-none pr-10`}
          >
            {servicios.map((s) => (
              <option key={s.value} value={s.value} disabled={s.value === ""}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-silver"
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label
          htmlFor="descripcion"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-dark"
        >
          Describe tu proyecto <span className="text-copper">*</span>
        </label>
        <textarea
          id="descripcion"
          required
          rows={5}
          placeholder="Cuéntanos qué necesitas: tipo de trabajo, medidas aproximadas, materiales preferidos, plazo deseado…"
          value={form.descripcion}
          onChange={(e) => update("descripcion", e.target.value)}
          onFocus={() => setFocused("descripcion")}
          onBlur={() => setFocused(null)}
          className={`${inputClass("descripcion")} resize-none`}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-copper px-8 py-4 text-base font-semibold text-white shadow-lg shadow-copper/20 transition-all duration-300 hover:bg-copper-light hover:shadow-xl sm:w-auto"
      >
        <span className="relative z-10 flex items-center gap-2">
          <Send
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
          Solicitar Presupuesto
        </span>
        <span className="absolute inset-0 animate-shimmer" />
      </button>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <p className="text-xs text-silver">
        * Campos obligatorios. Nos pondremos en contacto contigo en menos de 24
        horas.
      </p>
    </form>
  );
}

/* ─────────────────────── SIDEBAR ─────────────────────── */

function ContactSidebar({ config }: { config: SiteConfig | null }) {
  const business = config?.business;
  const phoneHref = business?.phoneNumber ? `tel:+34${business.phoneNumber}` : undefined;

  const contactItems = [
    {
      icon: Phone,
      title: "Teléfono",
      text: formatPhoneNumber(business?.phoneNumber),
      sub:
        business?.schedule.days && business?.schedule.hours
          ? `${business.schedule.days} · ${business.schedule.hours}`
          : "",
      href: phoneHref,
    },
    {
      icon: Mail,
      title: "Email",
      text: business?.email,
      sub: business?.responseTime,
      href: business?.email ? `mailto:${business.email}` : undefined,
    },
    {
      icon: MapPin,
      title: "Zona de Trabajo",
      text: business?.location.serviceArea,
      sub: business?.location.region,
      href: undefined,
    },
    {
      icon: Clock,
      title: "Horario",
      text: business?.schedule.days,
      sub: business?.schedule.hours,
      href: undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Info card */}
      <div className="rounded-2xl bg-white p-8 shadow-sm hover-glow transition-all duration-300">
        <h3 className="font-heading text-xl text-carbon">
          ¿Prefieres contactarnos directamente?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-silver">
          Llámanos o escríbenos sin compromiso. Estaremos encantados de
          atenderte.
        </p>

        <div className="mt-6 space-y-5">
          {contactItems.map((c) => (
            <div key={c.title} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-copper/8">
                <c.icon className="text-copper" size={18} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-silver">
                  {c.title}
                </p>
                {c.href ? (
                  <a
                    href={c.href}
                    className="text-sm font-medium text-carbon transition-colors hover:text-copper"
                  >
                    {c.text}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-carbon">{c.text}</p>
                )}
                <p className="text-xs text-silver">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badge */}
      <div className="relative overflow-hidden rounded-2xl bg-carbon p-8 text-white shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-copper/5 via-transparent to-steel-blue/5" />
        <div className="relative">
          <h3 className="font-heading text-xl">Presupuesto sin compromiso</h3>
          <ul className="mt-5 space-y-3.5 text-sm text-white/50">
            {[
              "Respuesta en menos de 24 horas",
              "Visita gratuita a domicilio",
              "Presupuesto detallado por escrito",
              "Sin letra pequeña ni sorpresas",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle
                  size={14}
                  className="shrink-0 text-copper"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── PAGE ─────────────────────── */

export default function PresupuestoPage() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const config = await fetchConfig();
        setSiteConfig(config);
      } catch (error) {
        console.error("Error loading presupuesto config:", error);
      }
    })();
  }, []);

  const business = siteConfig?.business;

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-carbon py-24 md:py-32">
        <div className="pointer-events-none absolute -top-32 left-1/3 h-64 w-64 rounded-full bg-copper/8 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 right-1/3 h-48 w-48 rounded-full bg-steel-blue/8 blur-[100px]" />
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-copper/20 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 text-center animate-fade-up">
          <span className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-medium tracking-widest uppercase text-white/60 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-copper" />
            Sin compromiso
          </span>
          <h1 className="font-heading text-3xl leading-tight text-white md:text-4xl lg:text-5xl">
            Pide tu presupuesto{" "}
            <span className="text-gradient-copper">gratuito</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50 md:text-lg">
            Cuéntanos tu proyecto y recibe un presupuesto detallado y
            personalizado sin ningún compromiso.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
            {/* Form */}
            <div className="rounded-2xl bg-white p-8 shadow-sm md:p-10">
              <h2 className="font-heading text-2xl text-carbon">
                Datos del proyecto
              </h2>
              <span className="mt-3 decorative-line" />
              <p className="mt-4 mb-8 text-sm text-silver">
                Rellena el formulario y nos pondremos en contacto contigo lo
                antes posible.
              </p>
              <PresupuestoForm />
            </div>

            {/* Sidebar */}
            <aside>
              <ContactSidebar config={siteConfig} />
            </aside>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingActions phoneNumber={business?.phoneNumber} />
    </>
  );
}
