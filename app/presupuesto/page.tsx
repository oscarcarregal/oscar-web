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
  AlertCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import { fetchConfig, type SiteConfig } from "../lib/data";
import { formatPhoneNumber } from "../lib/phone";
import { SidebarSkeleton } from "../components/Skeletons";

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

/* ─────────────────────── VALIDATION ─────────────────────── */

type FieldErrors = Partial<
  Record<
    "nombre" | "contacto" | "servicio" | "descripcion" | "submit" | "telefono" | "email",
    string
  >
>;

function isValidEmail(email: string) {
  // Simple RFC-like check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  // Allow local 9-digit numbers or international up to 15 digits
  return digits.length >= 9 && digits.length <= 15;
}

function validate(form: FormData): FieldErrors {
  const errs: FieldErrors = {};
  if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio.";

  // Contact validation: at least one method
  if (!form.telefono && !form.email) {
    errs.contacto = "Indica al menos un método de contacto: teléfono o email.";
  } else {
    if (form.telefono && !isValidPhone(form.telefono)) {
      errs.telefono = "El teléfono no tiene un formato válido.";
    }
    if (form.email && !isValidEmail(form.email)) {
      errs.email = "El email no tiene un formato válido.";
    }
  }

  if (!form.servicio) errs.servicio = "Selecciona el tipo de servicio.";
  if (!form.descripcion.trim()) errs.descripcion = "Describe brevemente tu proyecto.";
  return errs;
}

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
  const [errors, setErrors] = useState<FieldErrors>({});
  // Campos que el usuario ya ha tocado (blur), para mostrar su error antes del submit
  const [blurred, setBlurred] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field: keyof FormData, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    // Re-validar en vivo si el campo ya fue tocado o ya se intentó enviar
    if (submitted || blurred.has(field) || blurred.has("contacto")) {
      setErrors(validate(updated));
    }
  };

  const handleBlur = (field: string) => {
    setFocused(null);
    const next = new Set(blurred).add(field);
    // telefono y email comparten el error "contacto"; también almacenamos blur individual
    if (field === "telefono" || field === "email") {
      next.add("contacto");
      next.add(field);
    }
    setBlurred(next);
    setErrors(validate(form));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // If server returned fieldErrors, show them
        if (data?.fieldErrors) {
          setErrors((prev) => ({ ...prev, ...(data.fieldErrors as FieldErrors) }));
          return;
        }
        throw new Error("Error al enviar");
      }
      setSent(true);
    } catch {
      setErrors((prev) => ({
        ...prev,
        submit: "Hubo un error al enviar la consulta. Por favor, inténtalo de nuevo.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Devuelve el mensaje de error de un campo solo si debe mostrarse
  const fieldErr = (key: keyof FieldErrors) =>
    submitted || blurred.has(key) ? errors[key] : undefined;

  const inputClass = (field: string, hasError?: boolean) =>
    `w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-carbon outline-none transition-all duration-300 placeholder:text-silver/60 ${hasError
      ? "border-red-400 ring-2 ring-red-100 shadow-sm"
      : focused === field
        ? "border-gray-400 ring-2 ring-gray-100 shadow-sm"
        : "border-gray-200 hover:border-gray-300"
    }`;

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-green-200 bg-green-50 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h3 className="mt-6 font-heading text-2xl text-carbon">
          ¡Mensaje recibido!
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-silver">
          He recibido tu consulta. Me pondré en contacto contigo personalmente
          para hablar de tu proyecto en detalle.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 rounded-full border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-dark transition-colors hover:bg-cream"
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Nombre */}
      <div>
        <label
          htmlFor="nombre"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-dark"
        >
          Nombre completo <span className="text-silver">*</span>
        </label>
        <input
          id="nombre"
          type="text"
          placeholder="Tu nombre y apellidos"
          value={form.nombre}
          onChange={(e) => update("nombre", e.target.value)}
          onFocus={() => setFocused("nombre")}
          onBlur={() => handleBlur("nombre")}
          className={inputClass("nombre", !!fieldErr("nombre"))}
        />
        {fieldErr("nombre") && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={12} className="shrink-0" />
            {fieldErr("nombre")}
          </p>
        )}
      </div>

      {/* Teléfono + Email — al menos uno obligatorio */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-gray-dark">
          Método de contacto <span className="text-silver">*</span>
          <span className="ml-2 font-normal normal-case tracking-normal text-silver">
            (teléfono, email o ambos)
          </span>
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="telefono" className="mb-2 block text-xs text-silver">
              Teléfono
            </label>
            <input
              id="telefono"
              type="tel"
              placeholder="600 00 00 00"
              value={form.telefono}
              onChange={(e) => update("telefono", e.target.value)}
              onFocus={() => setFocused("telefono")}
              onBlur={() => handleBlur("telefono")}
              className={inputClass("telefono", !!fieldErr("telefono") || (!!fieldErr("contacto") && !form.telefono))}
            />
            {fieldErr("telefono") && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} className="shrink-0" />
                {fieldErr("telefono")}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-xs text-silver">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => handleBlur("email")}
              className={inputClass("email", !!fieldErr("email") || (!!fieldErr("contacto") && !form.email))}
            />
            {fieldErr("email") && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} className="shrink-0" />
                {fieldErr("email")}
              </p>
            )}
          </div>
        </div>
        {fieldErr("contacto") && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={12} className="shrink-0" />
            {fieldErr("contacto")}
          </p>
        )}
      </div>

      {/* Servicio */}
      <div>
        <label
          htmlFor="servicio"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-dark"
        >
          Tipo de servicio <span className="text-silver">*</span>
        </label>
        <div className="relative">
          <select
            id="servicio"
            value={form.servicio}
            onChange={(e) => update("servicio", e.target.value)}
            onFocus={() => setFocused("servicio")}
            onBlur={() => handleBlur("servicio")}
            className={`${inputClass("servicio", !!fieldErr("servicio"))} appearance-none pr-10`}
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
        {fieldErr("servicio") && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={12} className="shrink-0" />
            {fieldErr("servicio")}
          </p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label
          htmlFor="descripcion"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-dark"
        >
          Describe tu proyecto <span className="text-silver">*</span>
        </label>
        <textarea
          id="descripcion"
          rows={5}
          placeholder="Cuéntanos qué necesitas: tipo de trabajo, medidas aproximadas, materiales preferidos, plazo deseado…"
          value={form.descripcion}
          onChange={(e) => update("descripcion", e.target.value)}
          onFocus={() => setFocused("descripcion")}
          onBlur={() => handleBlur("descripcion")}
          className={`${inputClass("descripcion", !!fieldErr("descripcion"))} resize-none`}
        />
        {fieldErr("descripcion") && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={12} className="shrink-0" />
            {fieldErr("descripcion")}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-carbon px-8 py-4 text-base font-semibold text-white shadow-lg shadow-black/10 transition-all duration-300 hover:bg-[#333333] hover:shadow-xl sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span className="relative z-10 flex items-center gap-2">
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <>
              <Send
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
              Enviar consulta
            </>
          )}
        </span>
        {!isSubmitting && <span className="absolute inset-0 animate-shimmer" />}
      </button>

      {/* Error de red al enviar */}
      {errors.submit && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={12} className="shrink-0" />
          {errors.submit}
        </p>
      )}

      <p className="text-xs text-silver">
        * Nombre, método de contacto (teléfono o email), servicio y descripción
        son obligatorios.
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
      text: config?.storeAddress?.serviceArea,
      sub: config?.storeAddress
        ? `${config.storeAddress.street}, ${config.storeAddress.postalCode} ${config.storeAddress.city}`
        : undefined,
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
          ¿Prefieres el contacto directo?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-silver">
          Llámame o escríbeme directamente. Estoy disponible para atenderte de
          forma personal.
        </p>

        <div className="mt-6 space-y-5">
          {contactItems.map((c) => (
            <div key={c.title} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <c.icon className="text-gray-500" size={18} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-silver">
                  {c.title}
                </p>
                {c.href ? (
                  <a
                    href={c.href}
                    className="text-sm font-medium text-carbon transition-colors hover:text-gray-500"
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
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/3" />
        <div className="relative">
          <h3 className="font-heading text-xl">Trato directo y personal</h3>
          <ul className="mt-5 space-y-3.5 text-sm text-white/50">
            {[
              "Comunicación directa conmigo",
              "Valoración adaptada a tu proyecto",
              "Sin letra pequeña ni sorpresas",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle
                  size={14}
                  className="shrink-0 text-silver"
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const config = await fetchConfig();
        setSiteConfig(config);
      } catch (error) {
        console.error("Error loading presupuesto config:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const business = siteConfig?.business;

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-carbon py-24 md:py-32">
        <div className="pointer-events-none absolute -top-32 left-1/3 h-64 w-64 rounded-full bg-white/3 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 right-1/3 h-48 w-48 rounded-full bg-white/3 blur-[100px]" />
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 text-center animate-fade-up">
          <span className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-medium tracking-widest uppercase text-white/60 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-copper" />
            Sin compromiso
          </span>
          <h1 className="font-heading text-3xl leading-tight text-white md:text-4xl lg:text-5xl">
            Cuéntame{" "}
            <span className="text-gradient-copper">tu proyecto</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50 md:text-lg">
            Ponte en contacto conmigo por teléfono o email, cuéntame qué
            necesitas y te daré una respuesta personalizada.
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
                Cuéntame tu proyecto
              </h2>
              <span className="mt-3 decorative-line" />
              <p className="mt-4 mb-8 text-sm text-silver">
                Rellena el formulario con los detalles de tu proyecto y me
                pondré en contacto contigo personalmente.
              </p>
              <PresupuestoForm />
            </div>

            {/* Sidebar */}
            <aside>
              {loading ? <SidebarSkeleton /> : <ContactSidebar config={siteConfig} />}
            </aside>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingActions phoneNumber={business?.phoneNumber} />
    </>
  );
}
