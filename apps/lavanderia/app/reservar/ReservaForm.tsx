"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReservaForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
    const description = String(form.get("description"));
    const weight = form.get("weight_kg");
    const roomNumber = String(form.get("room_number") || "");
    const notes = String(form.get("notes") || "");

    const { error } = await supabase.from("orders").insert({
      customer_id: user.id,
      description,
      weight_kg: weight ? Number(weight) : null,
      room_number: roomNumber || null,
      notes: notes || null,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/conta"), 1200);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800 shadow-glass">
        Reserva enviada! Redirecionando para sua conta...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass space-y-4 rounded-2xl p-7">
      <label className="block">
        <span className="label-lux">O que vai para lavar?</span>
        <textarea
          name="description"
          required
          rows={3}
          placeholder="Ex.: 2 camisas sociais, 3 calças, 1 terno"
          className="input-lux"
        />
      </label>

      <label className="block">
        <span className="label-lux">Peso aproximado (kg) — opcional</span>
        <input name="weight_kg" type="number" step="0.1" min="0" className="input-lux" />
      </label>

      <label className="block">
        <span className="label-lux">Nº do quarto (hóspedes) — opcional</span>
        <input name="room_number" className="input-lux" />
      </label>

      <label className="block">
        <span className="label-lux">Observações</span>
        <textarea name="notes" rows={2} className="input-lux" />
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
        {loading ? "Enviando..." : "Confirmar reserva"}
      </button>
    </form>
  );
}
