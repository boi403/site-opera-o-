"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GoogleButton from "@/components/GoogleButton";

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const fullName = String(form.get("full_name"));
    const phone = String(form.get("phone"));

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-serif font-semibold text-hotel-900 mb-6 text-center">
        Criar conta
      </h1>

      {done ? (
        <div className="card-glass rounded-2xl p-7 text-emerald-700">
          Conta criada! Verifique seu e-mail se a confirmação estiver
          habilitada, ou faça login diretamente.
        </div>
      ) : (
        <div className="card-glass space-y-5 rounded-2xl p-7">
          <GoogleButton label="Criar conta com Google" />

          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-hotel-400">
            <span className="h-px flex-1 bg-hotel-200" />
            ou
            <span className="h-px flex-1 bg-hotel-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nome completo" name="full_name" required />
            <Field label="Telefone / WhatsApp" name="phone" required placeholder="(11) 91234-5678" />
            <Field label="E-mail" name="email" type="email" required />
            <Field label="Senha" name="password" type="password" required minLength={6} />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>
        </div>
      )}

      <p className="text-sm text-hotel-600 mt-6 text-center">
        Já tem conta?{" "}
        <Link href="/login" className="underline hover:text-hotel-800">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  minLength,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label-lux">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        className="input-lux"
      />
    </label>
  );
}
