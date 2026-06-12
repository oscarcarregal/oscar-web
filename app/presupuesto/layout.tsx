/* Layout de la página de presupuesto — aporta metadata SEO */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto · Pide Presupuesto de Fontanería y Reformas",
  description:
    "Contacta con Oscar Carregal para reformas, fontanería, gas o calefacción en San Sebastián (Donostia), Gipuzkoa. Trato personalizado y presupuesto sin compromiso.",
};

export default function PresupuestoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
