/* Layout de la página de presupuesto — aporta metadata SEO */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto · Cuéntame tu proyecto",
  description:
    "Contacta directamente conmigo para reformas, fontanería, gas o calefacción en San Sebastián. Trato personalizado y comunicación directa.",
};

export default function PresupuestoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
