import Link from "next/link";
import { safeNext } from "@/lib/nav";
import { AuthShell } from "../AuthShell";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Anmelden — BaumAkte" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; fehler?: string }>;
}) {
  const { next, fehler } = await searchParams;
  const ziel = safeNext(next);

  return (
    <AuthShell
      title="Anmelden"
      subtitle={
        ziel.startsWith("/abo/start")
          ? "Noch ein Schritt: Nach der Anmeldung geht es weiter zur Zahlung."
          : undefined
      }
      footer={
        <>
          Noch kein Zugang?{" "}
          <Link
            href={`/registrieren${ziel !== "/app" ? `?next=${encodeURIComponent(ziel)}` : ""}`}
            className="text-white underline"
          >
            Betrieb anlegen
          </Link>
        </>
      }
    >
      {fehler === "kein_profil" && (
        <p className="mb-4 text-sm text-[var(--red)]" role="alert">
          Zu diesem Konto gehoert noch kein Betrieb. Legen Sie einen an.
        </p>
      )}
      <LoginForm next={ziel} />
    </AuthShell>
  );
}
