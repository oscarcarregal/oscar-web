/* Layout de la página de presupuesto — aporta metadata SEO */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pedir Presupuesto Gratuito",
  description:
    "Solicita un presupuesto sin compromiso para tu reforma, instalación de fontanería, gas o calefacción en San Sebastián. Respuesta en menos de 24 horas.",
};

export default function PresupuestoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
