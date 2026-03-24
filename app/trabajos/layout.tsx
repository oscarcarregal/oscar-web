/* Layout de la página de trabajos — aporta metadata SEO */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nuestros Trabajos",
  description:
    "Galería de reformas integrales, instalaciones de fontanería y proyectos realizados por Oscar Carregal en San Sebastián y alrededores.",
};

export default function TrabajosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
