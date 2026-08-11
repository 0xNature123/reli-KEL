import { Badge } from "@/components/Badge";
import { LinkButton } from "@/components/Button";
import { EmptyState } from "@/components/Card";
import { ladeDashboard } from "@/features/dashboard/data";
import { requireSession } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Objekte — BaumAkte" };
export const dynamic = "force-dynamic";

export default async function ObjektePage() {
  const { org } = await requireSession();
  const { sites } = await ladeDashboard(org.id);

  return (
    <>
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h1 className="text-[28px] leading-[34px] font-semibold">Objekte</h1>
        <span className="text-[15px] text-[var(--gray-500)] tnum">{sites.length}</span>
      </div>

      {sites.length === 0 ? (
        <EmptyState
          title="Noch kein Objekt erfasst"
          action={
            <LinkButton href="/app/objekte/neu" variant="primary">
              Objekt anlegen
            </LinkButton>
          }
        >
          Legen Sie die Liegenschaft an, die Sie kontrollieren. Die Baeume setzen Sie danach
          auf der Karte.
        </EmptyState>
      ) : (
        <>
          <div className="bg-white rounded-[10px] border border-[var(--gray-200)] overflow-hidden mb-6">
            {sites.map((s) => (
              <Link
                key={s.id}
                href={`/app/objekt/${s.id}`}
                className="flex items-center gap-3 min-h-[68px] px-4 py-3 no-underline
                           border-b border-[var(--gray-200)] last:border-b-0 hover:bg-[var(--gray-50)]"
              >
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-[var(--ink)] truncate">{s.name}</span>
                  <span className="block text-sm text-[var(--gray-500)] truncate">
                    {s.address ?? "ohne Adresse"}
                    {s.client_name ? ` · ${s.client_name}` : ""}
                  </span>
                  <span className="block text-[13px] text-[var(--gray-500)] tnum mt-0.5">
                    {s.treeCount} {s.treeCount === 1 ? "Baum" : "Baeume"} ·{" "}
                    {s.openMeasures} offene {s.openMeasures === 1 ? "Massnahme" : "Massnahmen"}
                  </span>
                </span>
                {s.overdueMeasures > 0 && <Badge tone="red">{s.overdueMeasures} ueberfaellig</Badge>}
                <span aria-hidden className="text-[var(--gray-500)]">
                  ›
                </span>
              </Link>
            ))}
          </div>

          <LinkButton href="/app/objekte/neu" variant="primary">
            Objekt anlegen
          </LinkButton>
        </>
      )}
    </>
  );
}
