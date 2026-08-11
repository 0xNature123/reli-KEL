import { Badge } from "@/components/Badge";
import { SectionTitle } from "@/components/Card";
import { areaLabel, findingLabel, habitatLabel, VITALITY_STUFEN } from "@/lib/fll/catalog";
import { formatDate, formatDateTime } from "@/lib/format";
import type { AreaKey, Inspection, Photo } from "@/types";

/** Zeitachse der Kontrollen. Stornierte Eintraege bleiben sichtbar, durchgestrichen. */
export function Historie({ kontrollen, fotos }: { kontrollen: Inspection[]; fotos: Photo[] }) {
  if (kontrollen.length === 0) {
    return (
      <section>
        <SectionTitle>Kontrollhistorie</SectionTitle>
        <p className="text-[var(--gray-500)]">
          Noch keine Kontrolle erfasst. Die erste legt den Anfang der Nachweiskette.
        </p>
      </section>
    );
  }

  const storniert = new Set(
    kontrollen.map((k) => k.voids_inspection_id).filter((id): id is string => id !== null),
  );

  return (
    <section>
      <SectionTitle>Kontrollhistorie</SectionTitle>

      <div className="space-y-3">
        {kontrollen.map((k) => {
          const istStorniert = storniert.has(k.id);
          const bereiche = Object.entries(k.findings) as Array<[AreaKey, (typeof k.findings)[AreaKey]]>;
          const mitBefund = bereiche.filter(([, f]) => !f.ok || f.not_visible);
          const eigene = fotos.filter((f) => f.inspection_id === k.id);

          return (
            <details
              key={k.id}
              className="bg-white rounded-[10px] border border-[var(--gray-200)] overflow-hidden"
            >
              <summary className="flex items-center gap-3 min-h-[64px] px-4 py-3 cursor-pointer">
                <span className="flex-1 min-w-0">
                  <span
                    className={[
                      "block font-semibold tnum",
                      istStorniert ? "line-through text-[var(--gray-500)]" : "",
                    ].join(" ")}
                  >
                    {formatDate(k.inspected_at)} · {k.inspector_name}
                  </span>
                  <span className="block text-[13px] text-[var(--gray-500)]">
                    {mitBefund.length === 0
                      ? "ohne Befund"
                      : `${mitBefund.length} ${mitBefund.length === 1 ? "Bereich" : "Bereiche"} mit Eintrag`}
                    {k.voids_inspection_id ? " · Storno" : ""}
                  </span>
                </span>
                <Badge
                  tone={
                    k.assessment === "nicht_gegeben"
                      ? "red"
                      : k.assessment === "eingeschraenkt"
                        ? "amber"
                        : "green"
                  }
                >
                  {k.assessment === "nicht_gegeben"
                    ? "nicht gegeben"
                    : k.assessment === "eingeschraenkt"
                      ? "eingeschraenkt"
                      : "gegeben"}
                </Badge>
              </summary>

              <div className="px-4 pb-4 border-t border-[var(--gray-200)] pt-3">
                {k.voids_inspection_id && (
                  <p className="mb-3 text-[15px]">
                    <strong>Storno.</strong> Begruendung: {k.void_reason}
                  </p>
                )}

                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1 mb-3 text-[15px]">
                  <Zeile label="Verfahren">Regelkontrolle, Sichtkontrolle vom Boden</Zeile>
                  <Zeile label="Vitalitaet">
                    {VITALITY_STUFEN.find((v) => v.code === k.vitality)?.label ?? k.vitality}
                  </Zeile>
                  <Zeile label="Entwicklungsphase">{k.dev_phase}</Zeile>
                  <Zeile label="Naechste Kontrolle">
                    {formatDate(k.next_due_on)} ({k.next_interval_months} Monate)
                  </Zeile>
                </dl>

                {mitBefund.length === 0 ? (
                  <p className="text-[15px] mb-3">In allen sechs Bereichen ohne Befund.</p>
                ) : (
                  <ul className="list-none p-0 m-0 mb-3">
                    {mitBefund.map(([key, f]) => (
                      <li key={key} className="py-2 border-b border-[var(--gray-200)] last:border-b-0">
                        <span className="block font-medium text-[15px]">{areaLabel(key)}</span>
                        {f.codes.length > 0 && (
                          <span className="block text-[15px] text-[var(--gray-500)]">
                            {f.codes.map(findingLabel).join(" · ")}
                          </span>
                        )}
                        {f.note && <span className="block text-[15px]">{f.note}</span>}
                        {f.not_visible && (
                          <span className="block text-[13px] text-[var(--amber)]">
                            nicht einsehbar
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {k.habitat_features.length > 0 && (
                  <p className="text-[15px] mb-3">
                    <strong>Artenschutz:</strong>{" "}
                    {k.habitat_features.map((h) => habitatLabel(h.kind)).join(" · ")}
                  </p>
                )}

                {k.note && <p className="text-[15px] mb-3">{k.note}</p>}

                {eigene.length > 0 && (
                  <p className="text-[13px] text-[var(--gray-500)] mb-3">
                    {eigene.length} {eigene.length === 1 ? "Foto" : "Fotos"} mit Zeit- und
                    Positionsstempel hinterlegt.
                  </p>
                )}

                <p className="text-[13px] text-[var(--gray-500)] tnum m-0">
                  erfasst {formatDateTime(k.created_at)} Uhr · Pruefsumme{" "}
                  <span title={k.hash}>{k.hash.slice(0, 12)}</span>
                  {k.prev_hash ? ` · Vorgaenger ${k.prev_hash.slice(0, 12)}` : " · Kettenanfang"}
                </p>
              </div>
            </details>
          );
        })}
      </div>

      <p className="text-[13px] text-[var(--gray-500)] mt-4">
        Kontrollen sind unveraenderlich protokolliert. Eine Korrektur entsteht als neuer,
        gekennzeichneter Datensatz — der urspruengliche Eintrag bleibt lesbar.
      </p>
    </section>
  );
}

function Zeile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="text-[var(--gray-500)] shrink-0">{label}:</dt>
      <dd className="m-0">{children}</dd>
    </div>
  );
}
