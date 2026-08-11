import Link from "next/link";
import { EmptyState, SectionTitle } from "@/components/Card";
import { BerichtErstellen } from "@/features/reports/BerichtErstellen";
import { formatDateTime } from "@/lib/format";
import { createClient, requireSession } from "@/lib/supabase/server";
import type { Report, Site } from "@/types";

export const metadata = { title: "Berichte — BaumAkte" };
export const dynamic = "force-dynamic";

export default async function BerichtePage() {
  const { org } = await requireSession("/app/berichte");
  const supabase = await createClient();

  const [{ data: reports }, { data: sites }] = await Promise.all([
    supabase
      .from("reports")
      .select("*")
      .eq("org_id", org.id)
      .order("generated_at", { ascending: false }),
    supabase.from("sites").select("*").eq("org_id", org.id).order("name"),
  ]);

  const berichte = (reports ?? []) as Report[];
  const objekte = (sites ?? []) as Site[];

  return (
    <>
      <h1 className="text-[28px] leading-[34px] font-semibold mb-1">Berichte</h1>
      <p className="text-[var(--gray-500)] mb-6">
        Datum und Uhrzeit der Erstellung setzt die App und schreibt sie in das PDF.
      </p>

      <div className="mb-8">
        <BerichtErstellen objekte={objekte.map((s) => ({ id: s.id, name: s.name }))} />
      </div>

      <SectionTitle>Erstellte Berichte</SectionTitle>

      {berichte.length === 0 ? (
        <EmptyState title="Noch kein Bericht erstellt">
          Waehlen Sie oben ein Objekt und einen Zeitraum. Der Bericht entsteht als PDF im
          Briefkopf Ihres Betriebs.
        </EmptyState>
      ) : (
        <div className="bg-white rounded-[10px] border border-[var(--gray-200)] overflow-hidden">
          {berichte.map((r) => (
            <Link
              key={r.id}
              href={`/app/berichte/${r.id}`}
              className="flex items-center gap-3 min-h-[68px] px-4 py-3 no-underline
                         border-b border-[var(--gray-200)] last:border-b-0 hover:bg-[var(--gray-50)]"
            >
              <span className="flex-1 min-w-0">
                <span className="block font-medium truncate">{r.title}</span>
                <span className="block text-[13px] text-[var(--gray-500)] tnum">
                  erstellt am {formatDateTime(r.generated_at)} Uhr · {r.tree_count}{" "}
                  {r.tree_count === 1 ? "Baum" : "Baeume"} · Pruefsumme {r.sha256.slice(0, 12)}
                </span>
              </span>
              <span aria-hidden className="text-[var(--gray-500)]">
                ›
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
