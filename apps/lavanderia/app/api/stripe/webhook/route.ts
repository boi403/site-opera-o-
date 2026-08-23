import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";

// O Stripe precisa do corpo "cru" (sem parsing) para validar a assinatura.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET não configurado." },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("[stripe] assinatura inválida:", err.message);
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.client_reference_id;
      const planId = session.metadata?.plan_id;
      const subscriptionId = session.subscription as string | null;

      if (customerId && planId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await supabase.from("subscriptions").upsert(
          {
            customer_id: customerId,
            plan_id: planId,
            stripe_customer_id: String(session.customer),
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          },
          { onConflict: "stripe_subscription_id" }
        );
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({
          status: subscription.status,
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
