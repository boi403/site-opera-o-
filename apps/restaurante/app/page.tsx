import { createClient } from "@/lib/supabase/server";
import CardapioCart from "./CardapioCart";

const LAVANDERIA_URL = process.env.NEXT_PUBLIC_LAVANDERIA_URL || "http://localhost:3002";

export default async function RestaurantePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <span className="badge-gold mb-4">Room service</span>
        <h1 className="text-4xl font-serif font-semibold text-hotel-900 mb-2">
          Restaurante do hotel
        </h1>
        <p className="text-hotel-600 max-w-md mx-auto">
          Peça pizza e bebida direto para o seu quarto. Avisamos por WhatsApp
          assim que o pedido estiver pronto.
        </p>
      </div>

      {user ? (
        <CardapioCart menuItems={menuItems || []} />
      ) : (
        <div className="card-glass rounded-2xl p-8 text-center max-w-md mx-auto">
          <p className="mb-5 text-hotel-700">
            Você precisa entrar (ou criar uma conta) para pedir pelo
            room service. Sua conta é a mesma do LavaPronto.
          </p>
          <div className="flex justify-center gap-3">
            <a
              href={`${LAVANDERIA_URL}/login?next=${encodeURIComponent("/restaurante")}`}
              className="btn-primary"
            >
              Entrar
            </a>
            <a href={`${LAVANDERIA_URL}/cadastro`} className="btn-secondary">
              Criar conta
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
