"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Field, Input, Select } from "@/components/Field";

export function BerichtErstellen({ objekte }: { objekte: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [siteId, setSiteId] = useState(objekte[0]?.id ?? "");
  const [von, setVon] = useState("");
  const [bis, setBis] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  if (objekte.length === 0) {
    return (
      <p className="text-[var(--gray-500)]">
        Legen Sie zuerst ein Objekt an und erfassen Sie mindestens eine Kontrolle.
      </p>
    );
  }

  async function erstellen() {
    setLaeuft(true);
    setFehler(null);

    try {
      const antwort = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: siteId,
          period_from: von || null,
          period_to: bis || null,
        }),
      });

      if (!antwort.ok) {
        const daten = (await antwort.json().catch(() => null)) as { fehler?: string } | null;
        throw new Error(daten?.fehler ?? "Der Bericht konnte nicht erzeugt werden.");
      }

      const { id } = (await antwort.json()) as { id: string };
      router.push(`/app/berichte/${id}`);
      router.refresh();
    } catch (e) {
      setFehler(
        e instanceof Error
          ? e.message
          : "Der Bericht konnte nicht erzeugt werden. Bitte erneut versuchen.",
      );
      setLaeuft(false);
    }
  }

  return (
    <div className="bg-white rounded-[10px] border border-[var(--gray-200)] p-4">
      <h2 className="text-xl font-semibold mb-3">Bericht erstellen</h2>

      <Field label="Objekt" htmlFor="site">
        <Select id="site" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          {objekte.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Zeitraum von" htmlFor="von" hint="Leer lassen: alle Kontrollen.">
          <Input id="von" type="date" className="tnum" value={von} onChange={(e) => setVon(e.target.value)} />
        </Field>
        <Field label="bis" htmlFor="bis">
          <Input id="bis" type="date" className="tnum" value={bis} onChange={(e) => setBis(e.target.value)} />
        </Field>
      </div>

      {fehler && (
        <p className="mb-3 text-[15px] text-[var(--red)]" role="alert">
          {fehler}
        </p>
      )}

      <Button type="button" variant="primary" onClick={erstellen} disabled={laeuft || !siteId}>
        {laeuft ? "PDF wird erzeugt …" : "Bericht erstellen"}
      </Button>
    </div>
  );
}
