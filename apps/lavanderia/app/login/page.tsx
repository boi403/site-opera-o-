"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GoogleButton from "@/components/GoogleButton";
import { safeNext } from "@/lib/safeNext";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    router.push(safeNext(params.get("next")));
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-serif font-semibold text-hotel-900 mb-6 text-center">
        Entrar
      </h1>

      <div className="card-glass space-y-5 rounded-2xl p-7">
        <GoogleButton next={params.get("next") ?? undefined} label="Entrar com Google" />

        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-hotel-400">
          <span className="h-px flex-1 bg-hotel-200" />
          ou
          <span className="h-px flex-1 bg-hotel-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="label-lux">E-mail</span>
            <input name="email" type="email" required className="input-lux" />
          </label>
          <label className="block">
            <span className="label-lux">Senha</span>
            <input name="password" type="password" required className="input-lux" />
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      <p className="text-sm text-hotel-600 mt-6 text-center">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="underline hover:text-hotel-800">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
