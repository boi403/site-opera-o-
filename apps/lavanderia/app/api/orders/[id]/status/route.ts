import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage, buildReadyMessage } from "@/lib/whatsapp";

const VALID_STATUSES = ["recebido", "lavando", "pronto", "entregue"];

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { status } = await request.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  // RLS garante que só admins conseguem atualizar (orders_update_admin).
  const patch: Record<string, unknown> = { status };
  if (status === "pronto") patch.ready_at = new Date().toISOString();
  if (status === "entregue") patch.delivered_at = new Date().toISOString();

  const { data: order, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", params.id)
    .select("*, profiles(full_name, phone, whatsapp)")
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: error?.message || "Não foi possível atualizar o pedido." },
      { status: 403 }
    );
  }

  // Ao ficar pronto, avisa o cliente automaticamente pelo WhatsApp.
  if (status === "pronto") {
    const to = order.profiles?.whatsapp || order.profiles?.phone;
    if (to) {
      try {
        await sendWhatsAppMessage(
          to,
          buildReadyMessage({
            customerName: order.profiles?.full_name || "cliente",
            orderId: order.id,
          })
        );
        await supabase
          .from("orders")
          .update({ notified_at: new Date().toISOString() })
          .eq("id", order.id);
      } catch (err) {
        console.error("[whatsapp] falha ao notificar cliente:", err);
        // Não falha a requisição por causa do WhatsApp — o status já mudou.
      }
    }
  }

  return NextResponse.json({ order });
}
