import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { isPlanKey } from "@/lib/stripe/plans";
import { createServiceClient } from "@/lib/supabase/server";
import type { PlanKey, SubscriptionStatus } from "@/types";

export const runtime = "nodejs";
// Der Rohtext wird fuer die Signaturpruefung gebraucht - kein Caching, keine Umwandlung.
export const dynamic = "force-dynamic";

/** Stripe-Status auf unseren Status abbilden. */
function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    default:
      return "none";
  }
}

function planFrom(sub: Stripe.Subscription): PlanKey | null {
  const value = sub.metadata?.plan;
  return isPlanKey(value) ? value : null;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook nicht konfiguriert" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signatur fehlt" }, { status: 400 });
  }

  // Signaturpruefung ueber den unveraenderten Rohtext. Ohne sie koennte jeder
  // ein Abo freischalten, indem er diesen Endpunkt aufruft.
  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, secret);
  } catch {
    return NextResponse.json({ error: "Signatur ungueltig" }, { status: 400 });
  }

  const supabase = createServiceClient();

  async function applySubscription(sub: Stripe.Subscription): Promise<void> {
    const orgId = sub.metadata?.org_id;
    if (!orgId) return;

    const periodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;

    const patch: Record<string, unknown> = {
      subscription_status: mapStatus(sub.status),
      current_period_end: periodEnd,
      stripe_subscription_id: sub.id,
    };

    const plan = planFrom(sub);
    if (plan) patch.plan = plan;

    await supabase.from("orgs").update(patch).eq("id", orgId);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode !== "subscription" || typeof session.subscription !== "string") break;
      const sub = await stripe().subscriptions.retrieve(session.subscription);
      await applySubscription(sub);
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await applySubscription(event.data.object);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const orgId = invoice.subscription_details?.metadata?.org_id;
      if (orgId) {
        await supabase
          .from("orgs")
          .update({ subscription_status: "past_due" })
          .eq("id", orgId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
