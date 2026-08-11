import Link from "next/link";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/Card";
import { measureLabel } from "@/lib/fll/catalog";
import { URGENCY_LABEL, URGENCY_TOKEN } from "@/lib/fll/intervals";
import { dueLabel, formatDate } from "@/lib/format";
import { createClient, requireSession } from "@/lib/supabase/server";
import type { Measure, Tree } from "@/types";

export const metadata = { title: "Massnahmen — BaumAkte" };
export const dynamic = "force-dynamic";

export default async function MassnahmenPage() {
  const { org } = await requireSession("/app/massnahmen");
  const supabase = await createClient();

  const [{ data: measures }, { data: trees }] = await Promise.all([
    supabase
      .from("measures")
      .select("*")
      .eq("org_id", org.id)
      .eq("status", "offen")
      .order("due_on"),
    supabase.from("trees").select("id, number, species, site_id").eq("org_id", org.id),
  ]);

  const offen = (measures ?? []) as Measure[];
  const baumById = new Map(
    ((trees ?? []) as Array<Pick<Tree, "id" | "number" | "species" | "site_id">>).map((t) => [
      t.id,
      t,
    ]),
  );

  return (
    <>
      <h1 className="text-[28px] leading-[34px] font-semibold mb-1">Offene Massnahmen</h1>
      <p className="text-[var(--gray-500)] mb-6">
        Nach Frist sortiert. Abhaken koennen Sie sie am jeweiligen Baum — dabei wird
        festgehalten, wann und von wem sie ausgefuehrt wurde.
      </p>

      {offen.length === 0 ? (
        <EmptyState title="Keine offene Massnahme">
          Alles erledigt. Neue Massnahmen entstehen bei der naechsten Kontrolle.
        </EmptyState>
      ) : (
        <div className="bg-white rounded-[10px] border border-[var(--gray-200)] overflow-hidden">
          {offen.map((m) => {
            const baum = baumById.get(m.tree_id);
            return (
              <Link
                key={m.id}
                href={`/app/baum/${m.tree_id}`}
                className="flex items-center gap-3 min-h-[68px] px-4 py-3 no-underline
                           border-b border-[var(--gray-200)] last:border-b-0 hover:bg-[var(--gray-50)]"
              >
                <span className="flex-1 min-w-0">
                  <span className="block font-medium truncate">
                    {measureLabel(m.kind)}
                    {baum ? ` — Baum ${baum.number}, ${baum.species}` : ""}
                  </span>
                  <span className="block text-[13px] text-[var(--gray-500)] tnum">
                    {URGENCY_LABEL[m.urgency]} · Frist {formatDate(m.due_on)} · {dueLabel(m.due_on)}
                  </span>
                </span>
                <Badge tone={URGENCY_TOKEN[m.urgency]}>{URGENCY_LABEL[m.urgency]}</Badge>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
