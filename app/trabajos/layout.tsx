/* Layout de la página de trabajos — aporta metadata SEO */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trabajos · Fontanería y Reformas en Donostia",
  description:
    "Galería de reformas integrales, instalaciones de fontanería y proyectos realizados por Oscar Carregal en San Sebastián (Donostia), Gipuzkoa.",
  alternates: {
    canonical: "/trabajos",
  },
};

export default function TrabajosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
