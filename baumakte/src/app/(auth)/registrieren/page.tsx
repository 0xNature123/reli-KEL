import Link from "next/link";
import { safeNext } from "@/lib/nav";
import { AuthShell } from "../AuthShell";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Betrieb anlegen — BaumAkte" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; beta?: string }>;
}) {
  const { next, beta } = await searchParams;
  const ziel = safeNext(next);

  return (
    <AuthShell
      title="Betrieb anlegen"
      subtitle={
        beta
          ? "Beta-Programm: Sie legen zunaechst ein normales Konto an. Schreiben Sie uns danach, dann schalten wir den Beta-Zugang frei."
          : "14 Tage testen. Keine Zahlungsdaten noetig."
      }
      footer={
        <>
          Schon registriert?{" "}
          <Link
            href={`/login${ziel !== "/app" ? `?next=${encodeURIComponent(ziel)}` : ""}`}
            className="text-white underline"
          >
            Anmelden
          </Link>
        </>
      }
    >
      <RegisterForm next={ziel} />
    </AuthShell>
  );
}
