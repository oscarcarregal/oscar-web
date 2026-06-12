/* Layout de la página de trabajos — aporta metadata SEO */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trabajos Realizados · Fontanería y Reformas en San Sebastián",
  description:
    "Galería de reformas integrales, instalaciones de fontanería y proyectos realizados por Oscar Carregal en San Sebastián (Donostia), Gipuzkoa.",
};

export default function TrabajosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
