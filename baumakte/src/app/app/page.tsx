import Link from "next/link";
import { Badge } from "@/components/Badge";
import { LinkButton } from "@/components/Button";
import { EmptyState, SectionTitle } from "@/components/Card";
import { ladeDashboard } from "@/features/dashboard/data";
import { Suche } from "@/features/dashboard/Suche";
import { formatDateLong, formatDateTime } from "@/lib/format";
import { requireSession } from "@/lib/supabase/server";

export const metadata = { title: "Start — BaumAkte" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { org, profile } = await requireSession();
  const daten = await ladeDashboard(org.id);

  const jetzt = new Date();
  const stunde = jetzt.getHours();
  const gruss = stunde < 11 ? "Guten Morgen" : stunde < 18 ? "Guten Tag" : "Guten Abend";
  const vorname = profile.full_name.split(" ")[0] ?? profile.full_name;

  return (
    <>
      <div className="mb-5">
        <p className="text-[13px] text-[var(--gray-500)] tnum">{formatDateLong(jetzt)}</p>
        <h1 className="text-[28px] leading-[34px] font-semibold">
          {gruss}, {vorname}
        </h1>
      </div>

      <Suche sites={daten.sites} trees={daten.trees} reports={daten.reports} />

      {/* Kennzahlen: nur das, was zu einer Handlung fuehrt. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Kennzahl label="Objekte" wert={daten.sites.length} />
        <Kennzahl
          label="Baeume"
          wert={daten.sites.reduce((sum, s) => sum + s.treeCount, 0)}
        />
        <Kennzahl
          label="Massnahmen offen"
          wert={daten.openMeasures.length}
          href="/app/massnahmen"
        />
        <Kennzahl
          label="ueberfaellig"
          wert={daten.overdueCount}
          tone={daten.overdueCount > 0 ? "red" : "neutral"}
          href="/app/massnahmen"
        />
      </div>

      {/* Ordner = Objekte */}
      <section className="mb-10">
        <SectionTitle
          right={
            <Link href="/app/objekte" className="text-[15px] text-[var(--violet-700)] underline">
              Alle Objekte
            </Link>
          }
        >
          Ihre Ordner
        </SectionTitle>

        {daten.sites.length === 0 ? (
          <EmptyState
            title="Noch kein Objekt angelegt"
            action={
              <LinkButton href="/app/objekte/neu" variant="primary">
                Erstes Objekt anlegen
              </LinkButton>
            }
          >
            Ein Objekt ist die Liegenschaft, die Sie kontrollieren — eine Wohnanlage, ein
            Friedhof, ein Betriebsgelaende. Die Baeume liegen darin.
          </EmptyState>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {daten.sites.slice(0, 6).map((s) => (
              <Link
                key={s.id}
                href={`/app/objekt/${s.id}`}
                className="block bg-white rounded-[10px] border border-[var(--gray-200)] p-4 no-underline
                           hover:border-[var(--gray-500)]"
              >
                <div className="flex items-start gap-2 mb-2">
                  <OrdnerSymbol />
                  <span className="font-semibold text-[var(--ink)] leading-snug">{s.name}</span>
                </div>
                <p className="text-[13px] text-[var(--gray-500)] m-0 tnum">
                  {s.treeCount} {s.treeCount === 1 ? "Baum" : "Baeume"}
                  {s.lastInspectedAt
                    ? ` · zuletzt kontrolliert ${formatDateTime(s.lastInspectedAt)}`
                    : " · noch nicht kontrolliert"}
                </p>
                {(s.overdueMeasures > 0 || s.openMeasures > 0) && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {s.overdueMeasures > 0 && (
                      <Badge tone="red">{s.overdueMeasures} ueberfaellig</Badge>
                    )}
                    {s.openMeasures - s.overdueMeasures > 0 && (
                      <Badge tone="amber">
                        {s.openMeasures - s.overdueMeasures} offen
                      </Badge>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* PDF-Berichte mit Erstellungsdatum und Uhrzeit */}
      <section className="mb-10">
        <SectionTitle
          right={
            <Link href="/app/berichte" className="text-[15px] text-[var(--violet-700)] underline">
              Alle Berichte
            </Link>
          }
        >
          Ihre PDF-Berichte
        </SectionTitle>

        {daten.reports.length === 0 ? (
          <EmptyState title="Noch kein Bericht erstellt">
            Sobald an einem Objekt Kontrollen gespeichert sind, erzeugen Sie den Bericht
            mit einem Klick. Datum und Uhrzeit der Erstellung setzt die App selbst.
          </EmptyState>
        ) : (
          <div className="bg-white rounded-[10px] border border-[var(--gray-200)] overflow-hidden">
            {daten.reports.slice(0, 8).map((r) => (
              <Link
                key={r.id}
                href={`/app/berichte/${r.id}`}
                className="flex items-center gap-3 min-h-[64px] px-4 py-3 no-underline
                           border-b border-[var(--gray-200)] last:border-b-0 hover:bg-[var(--gray-50)]"
              >
                <PdfSymbol />
                <span className="flex-1 min-w-0">
                  <span className="block font-medium text-[var(--ink)] truncate">{r.title}</span>
                  <span className="block text-[13px] text-[var(--gray-500)] tnum">
                    erstellt am {formatDateTime(r.generated_at)} Uhr · {r.tree_count}{" "}
                    {r.tree_count === 1 ? "Baum" : "Baeume"}
                  </span>
                </span>
                <span aria-hidden className="text-[var(--gray-500)]">
                  ›
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Kennzahl({
  label,
  wert,
  tone = "neutral",
  href,
}: {
  label: string;
  wert: number;
  tone?: "neutral" | "red";
  href?: string;
}) {
  const inhalt = (
    <>
      <span
        className={[
          "block text-[26px] font-semibold leading-none tnum",
          tone === "red" && wert > 0 ? "text-[var(--red)]" : "text-[var(--ink)]",
        ].join(" ")}
      >
        {wert}
      </span>
      <span className="block text-[13px] text-[var(--gray-500)] mt-1">{label}</span>
    </>
  );

  const klasse =
    "block bg-white rounded-[10px] border border-[var(--gray-200)] px-4 py-3 no-underline";

  return href ? (
    <Link href={href} className={`${klasse} hover:border-[var(--gray-500)]`}>
      {inhalt}
    </Link>
  ) : (
    <div className={klasse}>{inhalt}</div>
  );
}

function OrdnerSymbol() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden focusable="false" className="shrink-0 mt-0.5">
      <path
        d="M2 5.5A1.5 1.5 0 0 1 3.5 4h3.2l1.5 1.8h8.3A1.5 1.5 0 0 1 18 7.3v7.2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 14.5z"
        fill="var(--violet-50)"
        stroke="var(--violet-600)"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function PdfSymbol() {
  return (
    <svg width="20" height="24" viewBox="0 0 20 24" aria-hidden focusable="false" className="shrink-0">
      <path
        d="M2.5 1.5h9L17.5 7v15.5h-15z"
        fill="var(--white)"
        stroke="var(--gray-500)"
        strokeWidth="1.2"
      />
      <path d="M11.5 1.5V7h6" fill="none" stroke="var(--gray-500)" strokeWidth="1.2" />
      <text x="10" y="18" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="var(--red)">
        PDF
      </text>
    </svg>
  );
}
