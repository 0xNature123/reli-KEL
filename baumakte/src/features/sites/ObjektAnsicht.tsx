"use client";

import dynamicImport from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/Card";
import { Input } from "@/components/Field";
import { BaumSetzen } from "@/features/trees/BaumSetzen";
import { formatDate } from "@/lib/format";

const Karte = dynamicImport(() => import("@/features/trees/Karte").then((m) => m.Karte), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full grid place-items-center bg-[var(--gray-50)] text-[var(--gray-500)]">
      Karte wird geladen …
    </div>
  ),
});

export interface ObjektBaum {
  id: string;
  number: string;
  species: string;
  lat: number;
  lng: number;
  status: "neu" | "kontrolliert" | "sofort";
  lastInspectedAt: string | null;
  nextDueOn: string | null;
}

export function ObjektAnsicht({
  siteId,
  center,
  trees,
}: {
  siteId: string;
  center: [number, number];
  trees: ObjektBaum[];
}) {
  const router = useRouter();
  const [setzen, setSetzen] = useState(false);
  const [suche, setSuche] = useState("");

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase();
    if (!q) return trees;
    return trees.filter((t) => `${t.number} ${t.species}`.toLowerCase().includes(q));
  }, [suche, trees]);

  const vorschlag = useMemo(() => {
    const hoechste = trees.reduce((max, t) => {
      const n = Number.parseInt(t.number.replace(/\D/g, ""), 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    return String(hoechste + 1).padStart(3, "0");
  }, [trees]);

  return (
    <>
      {trees.length > 0 && (
        <div className="h-[42dvh] min-h-[240px] rounded-[10px] overflow-hidden border border-[var(--gray-200)] mb-4">
          <Karte
            center={center}
            trees={trees.map((t) => ({ id: t.id, number: t.number, lat: t.lat, lng: t.lng, status: t.status }))}
            onSelect={(id) => router.push(`/app/baum/${id}`)}
          />
        </div>
      )}

      {trees.length === 0 ? (
        <EmptyState
          title="Noch kein Baum erfasst"
          action={
            <Button variant="primary" onClick={() => setSetzen(true)}>
              Ersten Baum setzen
            </Button>
          }
        >
          Stellen Sie sich an den Baum und tippen Sie auf „An meiner Position“, oder
          verschieben Sie die Karte, bis der Kreis stimmt.
        </EmptyState>
      ) : (
        <>
          <label htmlFor="baumsuche" className="sr-only">
            Baum in diesem Objekt suchen
          </label>
          <Input
            id="baumsuche"
            type="search"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Baumnummer oder Art"
            className="mb-3"
          />

          <div className="bg-white rounded-[10px] border border-[var(--gray-200)] overflow-hidden mb-24">
            {gefiltert.map((t) => (
              <Link
                key={t.id}
                href={`/app/baum/${t.id}`}
                className="flex items-center gap-3 min-h-[64px] px-4 py-3 no-underline
                           border-b border-[var(--gray-200)] last:border-b-0 hover:bg-[var(--gray-50)]"
              >
                <span className="tnum font-semibold w-[52px] shrink-0">{t.number}</span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate">{t.species}</span>
                  <span className="block text-[13px] text-[var(--gray-500)] tnum">
                    {t.lastInspectedAt
                      ? `kontrolliert ${formatDate(t.lastInspectedAt)}${t.nextDueOn ? ` · naechste ${formatDate(t.nextDueOn)}` : ""}`
                      : "noch nicht kontrolliert"}
                  </span>
                </span>
                {t.status === "sofort" && <Badge tone="red">sofort</Badge>}
              </Link>
            ))}
            {gefiltert.length === 0 && (
              <p className="px-4 py-4 text-[var(--gray-500)] m-0">
                Kein Baum passt zu „{suche}“.
              </p>
            )}
          </div>

          {/* Primaeraktion im Feld: unten fixiert, in Daumenreichweite. */}
          <div className="fixed left-0 right-0 bottom-0 z-20 bg-white border-t border-[var(--gray-200)] p-3 safe-bottom">
            <div className="max-w-[1100px] mx-auto">
              <Button variant="primary" full onClick={() => setSetzen(true)}>
                Baum setzen
              </Button>
            </div>
          </div>
        </>
      )}

      {setzen && (
        <BaumSetzen
          siteId={siteId}
          center={center}
          vorschlagNummer={vorschlag}
          trees={trees.map((t) => ({
            id: t.id,
            number: t.number,
            lat: t.lat,
            lng: t.lng,
            status: t.status,
          }))}
        />
      )}
    </>
  );
}
