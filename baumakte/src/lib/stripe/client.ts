import Stripe from "stripe";

let cached: Stripe | null = null;

/** Stripe nur serverseitig. Der Secret Key darf nie im Browser-Bundle landen. */
export function stripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY fehlt");
  cached = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  return cached;
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}
