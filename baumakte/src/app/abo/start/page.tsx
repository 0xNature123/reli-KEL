import { redirect } from "next/navigation";
import { Button } from "@/components/Button";
import { checkoutStarten } from "@/features/billing/actions";
import { formatEuro } from "@/lib/format";
import { isPlanKey, PLANS } from "@/lib/stripe/plans";
import { requireSession } from "@/lib/supabase/server";

export const metadata = { title: "Paket bestaetigen — BaumAkte" };

/**
 * Zwischenschritt zwischen Landingpage und Stripe.
 * Die Middleware schuetzt diesen Pfad: Wer hier ankommt, ist angemeldet.
 */
export default async function AboStartPage({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string; abrechnung?: string }>;
}) {
  const { paket, abrechnung } = await searchParams;
  if (!isPlanKey(paket)) redirect("/app/abo");

  const plan = PLANS[paket];
  if (!plan.selfService) redirect("/app/abo?fehler=angebot");

  const { org } = await requireSession(`/abo/start?paket=${paket}`);
  const jaehrlich = abrechnung === "jahr" && plan.yearlyCents !== null;

  return (
    <main className="min-h-dvh bg-[var(--gray-50)] px-5 py-10 safe-top safe-bottom">
      <div className="max-w-[520px] mx-auto">
        <h1 className="text-2xl font-semibold mb-1">Paket {plan.name}</h1>
        <p className="text-[var(--gray-500)] mb-6">
          Angemeldet als Betrieb <strong>{org.name}</strong>. Im naechsten Schritt zahlen Sie
          bei Stripe mit Kreditkarte oder PayPal.
        </p>

        <div className="bg-white rounded-[10px] border border-[var(--gray-200)] p-5 mb-5">
          <ul className="list-none p-0 m-0 mb-5">
            {plan.features.map((f) => (
              <li
                key={f}
                className="py-2 border-b border-[var(--gray-200)] last:border-b-0 text-[15px]"
              >
                {f}
              </li>
            ))}
          </ul>

          <form action={checkoutStarten}>
            <input type="hidden" name="paket" value={plan.key} />

            <fieldset className="mb-5 border-0 p-0 m-0">
              <legend className="text-sm font-medium mb-2">Zahlungsweise</legend>
              <div className="grid gap-2">
                <label className="flex items-center gap-3 min-h-[48px] px-3 rounded-[10px] border border-[var(--gray-200)] bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="abrechnung"
                    value="monat"
                    defaultChecked={!jaehrlich}
                    className="w-5 h-5 accent-[var(--violet-600)]"
                  />
                  <span className="flex-1">
                    Monatlich —{" "}
                    <span className="tnum font-semibold">
                      {formatEuro(plan.monthlyCents)}
                    </span>{" "}
                    <span className="text-[var(--gray-500)]">zzgl. MwSt.</span>
                  </span>
                </label>

                {plan.yearlyCents !== null && (
                  <label className="flex items-center gap-3 min-h-[48px] px-3 rounded-[10px] border border-[var(--gray-200)] bg-white cursor-pointer">
                    <input
                      type="radio"
                      name="abrechnung"
                      value="jahr"
                      defaultChecked={jaehrlich}
                      className="w-5 h-5 accent-[var(--violet-600)]"
                    />
                    <span className="flex-1">
                      Jaehrlich —{" "}
                      <span className="tnum font-semibold">
                        {formatEuro(plan.yearlyCents)}
                      </span>{" "}
                      <span className="text-[var(--gray-500)]">zzgl. MwSt.</span>
                    </span>
                  </label>
                )}
              </div>
            </fieldset>

            <Button type="submit" variant="primary" full>
              Weiter zur Zahlung
            </Button>
          </form>
        </div>

        <p className="text-[13px] text-[var(--gray-500)]">
          12 Monate Laufzeit, danach monatlich kuendbar. Die Zahlung wickelt Stripe ab —
          Kartendaten erreichen unsere Server nicht. Kuendigung jederzeit im Konto.
        </p>
        <p className="mt-4">
          <a href="/app/abo" className="text-[var(--violet-700)] underline">
            Abbrechen und zurueck zur App
          </a>
        </p>
      </div>
    </main>
  );
}
