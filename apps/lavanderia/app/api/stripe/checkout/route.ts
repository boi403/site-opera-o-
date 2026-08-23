import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { planId } = await request.json();

  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan) {
    return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
  }

  if (!plan.stripe_price_id) {
    return NextResponse.json(
      {
        error:
          "Este plano ainda não tem um preço configurado no Stripe. Peça ao administrador para configurar STRIPE_PRICE_ID do plano.",
      },
      { status: 400 }
    );
  }

  // Usa a URL configurada do site, não o header Origin da requisição — ele
  // pode ser forjado por quem chamar esta rota diretamente (fora do
  // navegador), o que permitiria redirecionar o cliente para outro domínio
  // depois do checkout.
  const origin = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin") || "";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id, plan_id: plan.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan_id: plan.id },
      },
      success_url: `${origin}/conta?assinatura=sucesso`,
      cancel_url: `${origin}/planos?assinatura=cancelada`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Falha ao iniciar checkout no Stripe." },
      { status: 500 }
    );
  }
}
