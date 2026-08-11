"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setFehler(null);
    setLaeuft(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: passwort });

    if (error) {
      setLaeuft(false);
      setFehler(
        error.message.toLowerCase().includes("invalid")
          ? "E-Mail oder Passwort stimmen nicht. Bitte erneut versuchen."
          : "Anmeldung nicht moeglich. Pruefen Sie Ihre Verbindung und versuchen Sie es erneut.",
      );
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={absenden} noValidate>
      <Field label="E-Mail" htmlFor="email">
        <Input
          id="email"
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field label="Passwort" htmlFor="passwort" error={fehler}>
        <Input
          id="passwort"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={passwort}
          onChange={(e) => setPasswort(e.target.value)}
        />
      </Field>

      <Button type="submit" variant="primary" full disabled={laeuft}>
        {laeuft ? "Wird angemeldet …" : "Anmelden"}
      </Button>
    </form>
  );
}
