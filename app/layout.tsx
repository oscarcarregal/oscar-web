/* Layout raíz — carga fuentes optimizadas y metadata global */
import type { Metadata } from "next";
import { DM_Serif_Display, Outfit } from "next/font/google";
import "./globals.css";
import { LocalBusinessSEO } from "./components/SEO";
import { fetchConfig } from "./lib/data";

/* Fuentes optimizadas con next/font (se sirven como assets estáticos) */
const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-serif",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oscarcarregal.es"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Oscar Carregal · Fontanero en San Sebastián · Donostia | Reformas Integrales",
    template: "%s | Oscar Carregal · Fontanero San Sebastián",
  },
  description:
    "Fontanero profesional en San Sebastián (Donostia). Servicios de fontanería, gas, calefacción y reformas integrales en Gipuzkoa. Más de 15 años de experiencia. Presupuesto sin compromiso.",
  icons: {
    icon: "/assets/logo_sin_fondo.png",
    shortcut: "/assets/logo_sin_fondo.png",
    apple: "/assets/logo_sin_fondo.png",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Oscar Carregal · Fontanería & Reformas en San Sebastián",
    images: [
      {
        url: "/assets/logo_sin_fondo.png",
        width: 800,
        height: 800,
        alt: "Oscar Carregal - Fontanero y Reformas en San Sebastián, Donostia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    google: "RKSxJFzK6Z2x6XJ_0m03zPVqmRK7MHpLa6DvQDya1H4",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await fetchConfig();

  return (
    <html lang="es" className={`${dmSerif.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <LocalBusinessSEO config={config} />
      </head>
      <body suppressHydrationWarning className="grain-overlay">
        {children}
      </body>
    </html>
  );
}
