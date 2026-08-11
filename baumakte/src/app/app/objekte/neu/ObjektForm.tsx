"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { objektAnlegen, type FormState } from "@/features/sites/actions";

export function ObjektForm() {
  const [state, action, laeuft] = useActionState<FormState, FormData>(objektAnlegen, {});
  const fehler = state.fehler ?? {};

  return (
    <form action={action}>
      <Field label="Objektname" htmlFor="name" error={fehler.name} hint="Zum Beispiel: Wohnanlage Ostpark">
        <Input id="name" name="name" required autoComplete="off" />
      </Field>

      <Field label="Adresse" htmlFor="address" error={fehler.address} hint="Optional. Hilft beim Wiederfinden.">
        <Input id="address" name="address" autoComplete="street-address" />
      </Field>

      <Field label="Auftraggeber" htmlFor="client_name" error={fehler.client_name} hint="Optional. Erscheint im Bericht.">
        <Input id="client_name" name="client_name" autoComplete="off" />
      </Field>

      <Button type="submit" variant="primary" full disabled={laeuft}>
        {laeuft ? "Wird angelegt …" : "Objekt anlegen"}
      </Button>
    </form>
  );
}
