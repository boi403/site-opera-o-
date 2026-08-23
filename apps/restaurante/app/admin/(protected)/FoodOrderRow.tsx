"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FOOD_STATUS_COLORS, FOOD_STATUS_LABELS, formatBRL } from "@/lib/format";

const NEXT_STATUS: Record<string, string | null> = {
  recebido: "preparando",
  preparando: "pronto",
  pronto: "entregue",
  entregue: null,
};

export default function FoodOrderRow({ order }: { order: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = NEXT_STATUS[order.status];

  async function advanceStatus() {
    if (!next) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/food-orders/${order.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao atualizar status.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="bg-white border border-hotel-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-hotel-800">
              {order.profiles?.full_name || "Cliente"}
            </span>
            <span className="text-xs text-hotel-500">
              #{order.id.slice(0, 8)}
            </span>
            <span className="text-xs text-hotel-500">
              · Quarto {order.room_number}
            </span>
          </div>
          <ul className="text-sm text-hotel-700">
            {order.food_order_items?.map((item: any) => (
              <li key={item.id}>
                {item.quantity}× {item.name_snapshot}
              </li>
            ))}
          </ul>
          {order.notes && (
            <p className="text-xs text-hotel-500 mt-1">Obs: {order.notes}</p>
          )}
          <p className="text-xs text-hotel-500 mt-1">
            {formatBRL(order.total_cents)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${FOOD_STATUS_COLORS[order.status]}`}
          >
            {FOOD_STATUS_LABELS[order.status]}
          </span>
          {next && (
            <button
              onClick={advanceStatus}
              disabled={loading}
              className="text-xs rounded-full bg-hotel-600 text-white px-3 py-1.5 hover:bg-hotel-700 transition disabled:opacity-60 whitespace-nowrap"
            >
              {loading
                ? "Atualizando..."
                : `Marcar como "${FOOD_STATUS_LABELS[next]}"`}
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  );
}
