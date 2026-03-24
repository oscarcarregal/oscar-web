/* Página 404 personalizada */
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-carbon px-6 text-center text-white">
      {/* Orbes decorativos */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-copper/8 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-steel-blue/8 blur-[100px]" />

      <span className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-medium tracking-widest uppercase text-white/60 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-copper" />
        Error 404
      </span>

      <h1 className="font-heading text-5xl leading-tight md:text-6xl lg:text-7xl">
        Página no <span className="text-gradient-copper">encontrada</span>
      </h1>

      <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/50">
        La página que buscas no existe o ha sido movida. Vuelve al inicio para
        seguir navegando.
      </p>

      <Link
        href="/"
        className="group mt-10 inline-flex items-center gap-2 rounded-full bg-copper px-8 py-4 text-base font-semibold text-white shadow-lg shadow-copper/25 transition-all duration-300 hover:bg-copper-light hover:shadow-xl"
      >
        Volver al inicio
        <ArrowRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>
    </main>
  );
}
