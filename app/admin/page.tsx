"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.replace("/admin/dashboard");
      } else {
        setError(data.error || "Error de autenticación");
        setPassword("");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0A0A0A] px-4">
      {/* Subtle background orb */}
      <div className="pointer-events-none fixed -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-copper/5 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        {/* Lock icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/8 bg-white/5">
          <Lock size={24} className="text-copper" />
        </div>

        <h1 className="mt-6 text-center font-heading text-2xl text-white">
          Acceso Privado
        </h1>
        <p className="mt-2 text-center text-sm text-white/30">
          Panel de administración
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 pr-12 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-copper/40 focus:ring-2 focus:ring-copper/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 transition-colors hover:text-white/60"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-copper py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-copper-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Acceder"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-white/15">
          Acceso restringido · Intentos limitados
        </p>
      </div>

      <button
        type="button"
        onClick={() => router.back()}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white/70 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
      >
        Volver
      </button>
    </div>
  );
}
