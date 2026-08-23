"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/format";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_cents: number;
  prep_time_minutes: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  pizza: "Pizzas",
  bebida: "Bebidas",
  sobremesa: "Sobremesas",
  outro: "Outros",
};

export default function CardapioCart({ menuItems }: { menuItems: MenuItem[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [roomNumber, setRoomNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const byCategory = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    for (const item of menuItems) {
      groups[item.category] ??= [];
      groups[item.category].push(item);
    }
    return groups;
  }, [menuItems]);

  const cartLines = useMemo(
    () =>
      menuItems
        .map((item) => ({ item, quantity: cart[item.id] || 0 }))
        .filter((line) => line.quantity > 0),
    [menuItems, cart]
  );

  const totalCents = cartLines.reduce(
    (sum, line) => sum + line.item.price_cents * line.quantity,
    0
  );
  const prepTimeMinutes = cartLines.reduce(
    (max, line) => Math.max(max, line.item.prep_time_minutes),
    0
  );

  function setQuantity(itemId: string, quantity: number) {
    setCart((prev) => ({ ...prev, [itemId]: Math.max(0, quantity) }));
  }

  async function handleSubmit() {
    setError(null);

    if (cartLines.length === 0) {
      setError("Adicione pelo menos um item ao pedido.");
      return;
    }
    if (!roomNumber.trim()) {
      setError("Informe o número do seu quarto.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Sessão expirada, faça login novamente.");
      setLoading(false);
      return;
    }

    const { data: order, error: orderError } = await supabase
      .from("food_orders")
      .insert({
        customer_id: user.id,
        room_number: roomNumber.trim(),
        notes: notes.trim() || null,
        total_cents: totalCents,
      })
      .select()
      .single();

    if (orderError || !order) {
      setError(orderError?.message || "Não foi possível enviar o pedido.");
      setLoading(false);
      return;
    }

    const { error: itemsError } = await supabase.from("food_order_items").insert(
      cartLines.map((line) => ({
        order_id: order.id,
        menu_item_id: line.item.id,
        name_snapshot: line.item.name,
        unit_price_cents: line.item.price_cents,
        quantity: line.quantity,
      }))
    );

    setLoading(false);
    if (itemsError) {
      setError(itemsError.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/"), 2000);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800 shadow-glass max-w-md mx-auto">
        Pedido enviado! Preparo estimado de {prepTimeMinutes} min.
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-start">
      <div className="space-y-10">
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-xl font-serif font-semibold text-hotel-900 mb-4">
              {CATEGORY_LABELS[category] || category}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <div key={item.id} className="card-glass rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-serif font-semibold text-hotel-800">
                      {item.name}
                    </h3>
                    <span className="text-hotel-700 font-semibold whitespace-nowrap">
                      {formatBRL(item.price_cents)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-hotel-500 mb-3">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-hotel-400">
                      ⏱ {item.prep_time_minutes} min
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, (cart[item.id] || 0) - 1)}
                        className="h-7 w-7 rounded-full border border-hotel-300 text-hotel-700 hover:bg-hotel-100 transition"
                        aria-label={`Diminuir quantidade de ${item.name}`}
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-sm">
                        {cart[item.id] || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, (cart[item.id] || 0) + 1)}
                        className="h-7 w-7 rounded-full bg-gold-gradient text-hotel-900 hover:shadow-gold transition"
                        aria-label={`Aumentar quantidade de ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {menuItems.length === 0 && (
          <p className="text-hotel-500 text-sm">
            Cardápio indisponível no momento.
          </p>
        )}
      </div>

      <div className="card-glass rounded-2xl p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-serif font-semibold text-hotel-900 mb-4">
          Seu pedido
        </h2>

        {cartLines.length === 0 ? (
          <p className="text-sm text-hotel-500 mb-4">
            Adicione itens do cardápio ao lado.
          </p>
        ) : (
          <ul className="space-y-2 mb-4">
            {cartLines.map((line) => (
              <li
                key={line.item.id}
                className="flex justify-between text-sm text-hotel-700"
              >
                <span>
                  {line.quantity}× {line.item.name}
                </span>
                <span>{formatBRL(line.item.price_cents * line.quantity)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-between font-semibold text-hotel-900 border-t border-hotel-200 pt-3 mb-5">
          <span>Total</span>
          <span>{formatBRL(totalCents)}</span>
        </div>

        <label className="block mb-4">
          <span className="label-lux">Número do quarto</span>
          <input
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="Ex.: 305"
            className="input-lux"
          />
        </label>

        <label className="block mb-5">
          <span className="label-lux">Observações — opcional</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ex.: sem cebola, tocar a campainha"
            className="input-lux"
          />
        </label>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-60"
        >
          {loading ? "Enviando..." : "Confirmar pedido"}
        </button>
      </div>
    </div>
  );
}
