"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/Button";
import { Field, Input, TextArea } from "@/components/Field";
import { betriebSpeichern, type BetriebState } from "./actions";
import { createClient } from "@/lib/supabase/client";
import type { Org } from "@/types";

const MAX_LOGO = 2 * 1024 * 1024;

export function BetriebForm({ org }: { org: Org }) {
  const [state, action, laeuft] = useActionState<BetriebState, FormData>(betriebSpeichern, {});
  const fehler = state.fehler ?? {};

  const [logoFehler, setLogoFehler] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>(org.logo_path);
  const [logoLaeuft, setLogoLaeuft] = useState(false);

  async function logoHochladen(file: File) {
    setLogoFehler(null);

    if (file.size > MAX_LOGO) {
      setLogoFehler("Die Datei ist groesser als 2 MB. Bitte kleiner speichern.");
      return;
    }
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      setLogoFehler("Erlaubt sind PNG, JPG und SVG.");
      return;
    }

    setLogoLaeuft(true);
    const endung = file.type === "image/svg+xml" ? "svg" : file.type === "image/png" ? "png" : "jpg";
    const pfad = `${org.id}/logo.${endung}`;

    const supabase = createClient();
    const { error } = await supabase.storage
      .from("logos")
      .upload(pfad, file, { contentType: file.type, upsert: true });

    setLogoLaeuft(false);

    if (error) {
      setLogoFehler("Das Logo konnte nicht hochgeladen werden. Bitte erneut versuchen.");
      return;
    }

    await supabase.from("orgs").update({ logo_path: pfad }).eq("id", org.id);
    setLogoName(pfad);
  }

  return (
    <>
      <form action={action}>
        <Field label="Betriebsname" htmlFor="name" error={fehler.name}>
          <Input id="name" name="name" defaultValue={org.name} required />
        </Field>

        <Field label="Anschrift" htmlFor="address" error={fehler.address} hint="Erscheint im Briefkopf.">
          <TextArea id="address" name="address" defaultValue={org.address ?? ""} />
        </Field>

        <Field
          label="Name des Pruefers"
          htmlFor="inspector_name"
          error={fehler.inspector_name}
          hint="Erscheint als verantwortlicher Pruefer im Bericht."
        >
          <Input id="inspector_name" name="inspector_name" defaultValue={org.inspector_name ?? ""} />
        </Field>

        <Field
          label="Zertifikatsnummer"
          htmlFor="certificate_no"
          error={fehler.certificate_no}
          hint="Optional. Erscheint auf dem Deckblatt."
        >
          <Input id="certificate_no" name="certificate_no" defaultValue={org.certificate_no ?? ""} />
        </Field>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" disabled={laeuft}>
            {laeuft ? "Wird gespeichert …" : "Angaben speichern"}
          </Button>
          {state.gespeichert && (
            <span className="text-[15px] text-[var(--green)]" role="status">
              Gespeichert.
            </span>
          )}
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-[var(--gray-200)]">
        <h2 className="text-xl font-semibold mb-1">Logo</h2>
        <p className="text-[13px] text-[var(--gray-500)] mb-3">
          PNG, JPG oder SVG, hoechstens 2 MB. Erscheint auf dem Deckblatt des Berichts.
        </p>

        <input
          type="file"
          id="logo"
          accept="image/png,image/jpeg,image/svg+xml"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void logoHochladen(file);
          }}
        />
        <label
          htmlFor="logo"
          className="inline-flex items-center min-h-[48px] px-5 rounded-[10px] cursor-pointer
                     border border-[var(--gray-200)] bg-white font-semibold hover:border-[var(--gray-500)]"
        >
          {logoLaeuft ? "Wird hochgeladen …" : logoName ? "Logo ersetzen" : "Logo hochladen"}
        </label>

        {logoName && !logoFehler && (
          <p className="mt-2 text-[13px] text-[var(--gray-500)]">Hinterlegt: {logoName}</p>
        )}
        {logoFehler && (
          <p className="mt-2 text-[13px] text-[var(--red)]" role="alert">
            {logoFehler}
          </p>
        )}
      </div>
    </>
  );
}
