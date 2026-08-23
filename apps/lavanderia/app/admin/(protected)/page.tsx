import { createClient } from "@/lib/supabase/server";
import OrderRow from "./OrderRow";

export default async function AdminOrdersPage() {
  const supabase = createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, profiles(full_name, phone, whatsapp)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-serif font-semibold text-hotel-800 mb-6">
        Pedidos de lavagem
      </h1>

      <div className="space-y-3">
        {orders && orders.length > 0 ? (
          orders.map((order: any) => <OrderRow key={order.id} order={order} />)
        ) : (
          <p className="text-hotel-500 text-sm">Nenhum pedido ainda.</p>
        )}
      </div>
    </div>
  );
}
