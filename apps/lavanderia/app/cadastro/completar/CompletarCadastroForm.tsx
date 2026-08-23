"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CompletarCadastroForm({
  defaultFullName,
  defaultPhone,
  next,
}: {
  defaultFullName: string;
  defaultPhone: string;
  next: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Sessão expirada, faça login novamente.");
      setLoading(false);
      return;
    }

    const form = new FormData(e.currentTarget);
    const fullName = String(form.get("full_name"));
    const phone = String(form.get("phone"));

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass space-y-4 rounded-2xl p-7">
      <label className="block">
        <span className="label-lux">Nome completo</span>
        <input
          name="full_name"
          required
          defaultValue={defaultFullName}
          className="input-lux"
        />
      </label>

      <label className="block">
        <span className="label-lux">Telefone / WhatsApp</span>
        <input
          name="phone"
          required
          defaultValue={defaultPhone}
          placeholder="(11) 91234-5678"
          className="input-lux"
        />
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
        {loading ? "Salvando..." : "Concluir cadastro"}
      </button>
    </form>
  );
}
