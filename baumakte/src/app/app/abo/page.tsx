import { Badge } from "@/components/Badge";
import { Button, LinkButton } from "@/components/Button";
import { portalOeffnen } from "@/features/billing/actions";
import { formatDate, formatEuro } from "@/lib/format";
import { PLANS } from "@/lib/stripe/plans";
import { requireSession } from "@/lib/supabase/server";

export const metadata = { title: "Abonnement — BaumAkte" };
export const dynamic = "force-dynamic";

const FEHLERTEXT: Record<string, string> = {
  paket: "Das gewaehlte Paket gibt es nicht.",
  angebot: "Fuer dieses Paket erstellen wir ein Angebot. Schreiben Sie uns.",
  preis_fehlt: "Fuer dieses Paket ist noch kein Preis hinterlegt. Bitte melden Sie sich bei uns.",
  stripe: "Die Zahlung liess sich nicht starten. Bitte erneut versuchen.",
  kein_kunde: "Es liegt noch kein Abonnement vor.",
};

export default async function AboPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; fehler?: string }>;
}) {
  const { status, fehler } = await searchParams;
  const { org } = await requireSession("/app/abo");

  const paket = org.plan ? PLANS[org.plan] : null;
  const imTest = org.subscription_status === "trial";
  const aktiv = org.subscription_status === "active";

  return (
    <div className="max-w-[640px]">
      <h1 className="text-[28px] leading-[34px] font-semibold mb-4">Abonnement</h1>

      {status === "erfolg" && (
        <p
          className="mb-4 bg-white border border-[var(--green)] rounded-[10px] px-4 py-3"
          role="status"
        >
          Zahlung eingerichtet. Die Freischaltung erfolgt, sobald Stripe die Bestaetigung
          sendet — das dauert meist nur Sekunden. Laden Sie die Seite danach neu.
        </p>
      )}
      {status === "abgebrochen" && (
        <p className="mb-4 bg-white border border-[var(--gray-200)] rounded-[10px] px-4 py-3">
          Die Zahlung wurde abgebrochen. Es ist nichts abgebucht worden.
        </p>
      )}
      {fehler && (
        <p
          className="mb-4 bg-white border border-[var(--red)] rounded-[10px] px-4 py-3"
          role="alert"
        >
          {FEHLERTEXT[fehler] ?? "Es ist ein Fehler aufgetreten."}
        </p>
      )}

      <div className="bg-white rounded-[10px] border border-[var(--gray-200)] p-4 mb-8">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="text-xl font-semibold">{paket ? paket.name : "Testphase"}</h2>
          <Badge tone={aktiv ? "green" : imTest ? "violet" : "amber"}>
            {aktiv
              ? "aktiv"
              : imTest
                ? "Test"
                : org.subscription_status === "past_due"
                  ? "Zahlung offen"
                  : "beendet"}
          </Badge>
        </div>

        {imTest && (
          <p className="text-[var(--gray-500)] m-0">
            Ihre Testphase laeuft{" "}
            {org.trial_ends_at ? `bis ${formatDate(org.trial_ends_at)}` : ""}. Zahlungsdaten
            sind dafuer nicht noetig.
          </p>
        )}
        {aktiv && org.current_period_end && (
          <p className="text-[var(--gray-500)] m-0 tnum">
            Naechste Abrechnung am {formatDate(org.current_period_end)}.
          </p>
        )}

        {org.stripe_customer_id && (
          <form action={portalOeffnen} className="mt-4">
            <Button type="submit">Zahlungsdaten, Rechnungen und Kuendigung</Button>
          </form>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-3">Pakete</h2>
      <div className="grid gap-3">
        {Object.values(PLANS).map((p) => (
          <div
            key={p.key}
            className={[
              "bg-white rounded-[10px] p-4 border",
              org.plan === p.key ? "border-[var(--violet-600)] border-2" : "border-[var(--gray-200)]",
            ].join(" ")}
          >
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <span className="tnum font-semibold">
                {p.key === "eigentuemer" ? "ab " : ""}
                {formatEuro(p.monthlyCents)} / Monat
              </span>
            </div>
            <ul className="list-none p-0 m-0 mb-3">
              {p.features.map((f) => (
                <li key={f} className="text-[15px] py-1 text-[var(--gray-500)]">
                  {f}
                </li>
              ))}
            </ul>

            {p.selfService ? (
              org.plan === p.key && aktiv ? (
                <p className="text-[15px] text-[var(--gray-500)] m-0">Ihr aktuelles Paket.</p>
              ) : (
                <LinkButton
                  href={`/abo/start?paket=${p.key}`}
                  variant={p.key === "betrieb" ? "primary" : "outline"}
                >
                  {p.name} waehlen
                </LinkButton>
              )
            ) : (
              <LinkButton href="mailto:kontakt@baumakte.de?subject=Angebot%20Paket%20Eigentuemer">
                Angebot anfragen
              </LinkButton>
            )}
          </div>
        ))}
      </div>

      <p className="text-[13px] text-[var(--gray-500)] mt-6">
        Alle Preise zzgl. MwSt. Zahlung per Kreditkarte oder PayPal ueber Stripe;
        Zahlungsdaten erreichen unsere Server nicht. Export als PDF und CSV bleibt auch nach
        Vertragsende moeglich.
      </p>
    </div>
  );
}
