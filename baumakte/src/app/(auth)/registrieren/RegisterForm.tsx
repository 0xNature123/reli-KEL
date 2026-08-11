"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [betrieb, setBetrieb] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const [laeuft, setLaeuft] = useState(false);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    const neu: Record<string, string> = {};
    if (betrieb.trim().length < 2) neu.betrieb = "Bitte den Namen des Betriebs angeben.";
    if (name.trim().length < 2) neu.name = "Bitte Ihren Namen angeben.";
    if (passwort.length < 8) neu.passwort = "Mindestens 8 Zeichen.";
    setFehler(neu);
    if (Object.keys(neu).length > 0) return;

    setLaeuft(true);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: passwort,
      options: { data: { full_name: name.trim() } },
    });

    if (signUpError) {
      setLaeuft(false);
      setFehler({
        email: signUpError.message.toLowerCase().includes("already")
          ? "Zu dieser E-Mail gibt es bereits ein Konto. Melden Sie sich an."
          : "Registrierung nicht moeglich. Bitte spaeter erneut versuchen.",
      });
      return;
    }

    // Betrieb und Profil entstehen in einer Transaktion in der Datenbank.
    const { error: orgError } = await supabase.rpc("register_org", {
      p_org_name: betrieb.trim(),
      p_full_name: name.trim(),
    });

    if (orgError) {
      setLaeuft(false);
      setFehler({
        betrieb:
          "Das Konto wurde angelegt, der Betrieb noch nicht. Melden Sie sich an, dann holen wir das nach.",
      });
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={absenden} noValidate>
      <Field label="Betrieb" htmlFor="betrieb" error={fehler.betrieb}>
        <Input
          id="betrieb"
          autoComplete="organization"
          required
          value={betrieb}
          onChange={(e) => setBetrieb(e.target.value)}
        />
      </Field>

      <Field label="Ihr Name" htmlFor="name" error={fehler.name} hint="Erscheint als Pruefer im Bericht.">
        <Input
          id="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field label="E-Mail" htmlFor="email" error={fehler.email}>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field label="Passwort" htmlFor="passwort" error={fehler.passwort} hint="Mindestens 8 Zeichen.">
        <Input
          id="passwort"
          type="password"
          autoComplete="new-password"
          required
          value={passwort}
          onChange={(e) => setPasswort(e.target.value)}
        />
      </Field>

      <Button type="submit" variant="primary" full disabled={laeuft}>
        {laeuft ? "Wird angelegt …" : "Betrieb anlegen"}
      </Button>

      <p className="mt-3 text-[13px] text-[var(--gray-500)]">
        Mit dem Anlegen stimmen Sie den{" "}
        <a href="/agb" className="underline">
          AGB
        </a>{" "}
        und der{" "}
        <a href="/datenschutz" className="underline">
          Datenschutzerklaerung
        </a>{" "}
        zu.
      </p>
    </form>
  );
}
