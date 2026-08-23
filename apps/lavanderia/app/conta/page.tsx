import { createClient } from "@/lib/supabase/server";
import { STATUS_COLORS, STATUS_LABELS, formatBRL } from "@/lib/format";
import Link from "next/link";
import SignOutButton from "./SignOutButton";

export default async function ContaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // middleware já redireciona

  const [{ data: profile }, { data: orders }, { data: subscriptions }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select("*, plans(*)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="badge-gold mb-3">Minha conta</span>
          <h1 className="text-3xl font-serif font-semibold text-hotel-900">
            Olá, {profile?.full_name || user.email}
          </h1>
          <p className="text-hotel-600">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-serif font-semibold text-hotel-900">
            Minhas assinaturas
          </h2>
          <Link href="/planos" className="text-sm underline text-hotel-600 hover:text-hotel-800">
            Ver planos
          </Link>
        </div>
        {subscriptions && subscriptions.length > 0 ? (
          <ul className="space-y-2">
            {subscriptions.map((s: any) => (
              <li
                key={s.id}
                className="card-glass rounded-xl px-4 py-3 flex justify-between text-sm"
              >
                <span>{s.plans?.name}</span>
                <span className="capitalize">{s.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-hotel-500">Nenhuma assinatura ativa.</p>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-serif font-semibold text-hotel-900">
            Meus pedidos de lavagem
          </h2>
          <Link href="/reservar" className="text-sm underline text-hotel-600 hover:text-hotel-800">
            Nova reserva
          </Link>
        </div>
        {orders && orders.length > 0 ? (
          <ul className="space-y-3">
            {orders.map((o: any) => (
              <li key={o.id} className="card-glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-hotel-500">
                    #{o.id.slice(0, 8)} ·{" "}
                    {new Date(o.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[o.status]}`}
                  >
                    {STATUS_LABELS[o.status]}
                  </span>
                </div>
                <p className="text-hotel-800">{o.description}</p>
                {o.price_cents ? (
                  <p className="text-sm text-hotel-600 mt-1">
                    {formatBRL(o.price_cents)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-hotel-500">Nenhum pedido ainda.</p>
        )}
      </section>
    </div>
  );
}
