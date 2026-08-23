"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("erro") === "sem_acesso"
      ? "Esta conta não tem acesso ao painel administrativo."
      : null
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push("/admin");
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white border border-hotel-200 rounded-xl p-8">
        <h1 className="text-2xl font-serif font-semibold text-hotel-800 mb-6 text-center">
          Acesso administrativo
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-hotel-700">E-mail</span>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-hotel-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hotel-400"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-hotel-700">Senha</span>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-hotel-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hotel-400"
            />
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-hotel-800 text-white px-6 py-3 font-medium hover:bg-hotel-900 transition disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
