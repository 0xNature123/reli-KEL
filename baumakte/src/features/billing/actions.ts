"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, requireSession } from "@/lib/supabase/server";
import { siteUrl, stripe } from "@/lib/stripe/client";
import { isPlanKey, PLANS, priceIdFor } from "@/lib/stripe/plans";

const CheckoutSchema = z.object({
  paket: z.string().refine(isPlanKey, "Unbekanntes Paket"),
  abrechnung: z.enum(["monat", "jahr"]),
});

/**
 * Startet die Zahlung. Reihenfolge ist bewusst: erst Anmeldung (die Middleware
 * schuetzt /abo/start), dann Checkout. Der Betrag kommt aus der Preis-ID in der
 * Umgebung, niemals aus dem Formular.
 */
export async function checkoutStarten(formData: FormData): Promise<void> {
  const parsed = CheckoutSchema.safeParse({
    paket: formData.get("paket"),
    abrechnung: formData.get("abrechnung"),
  });

  if (!parsed.success) redirect("/app/abo?fehler=paket");
  const { paket, abrechnung } = parsed.data;

  const plan = PLANS[paket];
  if (!plan.selfService) redirect("/app/abo?fehler=angebot");

  const priceId = priceIdFor(paket, abrechnung);
  if (!priceId) redirect("/app/abo?fehler=preis_fehlt");

  const { userId, org } = await requireSession(`/abo/start?paket=${paket}`);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Kunde bei Stripe genau einmal anlegen und die Kennung am Betrieb festhalten.
  let customerId = org.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe().customers.create({
      email: user?.email ?? undefined,
      name: org.name,
      metadata: { org_id: org.id, user_id: userId },
    });
    customerId = customer.id;
    await supabase.from("orgs").update({ stripe_customer_id: customerId }).eq("id", org.id);
  }

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    // Kreditkarte und PayPal. Weitere Methoden schaltet Stripe im Dashboard frei.
    payment_method_types: ["card", "paypal"],
    line_items: [{ price: priceId, quantity: 1 }],
    locale: "de",
    allow_promotion_codes: true,
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: true },
    customer_update: { name: "auto", address: "auto" },
    // Die org_id ist der Anker: der Webhook ordnet die Zahlung darueber zu.
    subscription_data: { metadata: { org_id: org.id, plan: paket } },
    metadata: { org_id: org.id, plan: paket },
    success_url: `${siteUrl()}/app/abo?status=erfolg&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/app/abo?status=abgebrochen`,
  });

  if (!session.url) redirect("/app/abo?fehler=stripe");
  redirect(session.url);
}

/** Kuendigen, Zahlungsmittel wechseln, Rechnungen ansehen - alles im Stripe-Portal. */
export async function portalOeffnen(): Promise<void> {
  const { org } = await requireSession("/app/abo");
  if (!org.stripe_customer_id) redirect("/app/abo?fehler=kein_kunde");

  const portal = await stripe().billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${siteUrl()}/app/abo`,
  });

  redirect(portal.url);
}
