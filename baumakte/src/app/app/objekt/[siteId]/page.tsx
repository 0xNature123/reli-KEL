import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjektAnsicht } from "@/features/sites/ObjektAnsicht";
import { createClient, requireSession } from "@/lib/supabase/server";
import type { Measure, Site, Tree } from "@/types";

export const dynamic = "force-dynamic";

export default async function ObjektPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  await requireSession(`/app/objekt/${siteId}`);
  const supabase = await createClient();

  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .maybeSingle<Site>();

  if (!site) notFound();

  const [{ data: trees }, { data: inspections }, { data: measures }] = await Promise.all([
    supabase.from("trees").select("*").eq("site_id", siteId).order("number"),
    supabase
      .from("inspections")
      .select("tree_id, inspected_at, next_due_on")
      .eq("org_id", site.org_id)
      .order("inspected_at", { ascending: false })
      .limit(5000),
    supabase.from("measures").select("*").eq("org_id", site.org_id).eq("status", "offen"),
  ]);

  const baeume = (trees ?? []) as Tree[];
  const idsImObjekt = new Set(baeume.map((t) => t.id));

  const letzteKontrolle = new Map<string, { inspected_at: string; next_due_on: string }>();
  for (const i of (inspections ?? []) as Array<{
    tree_id: string;
    inspected_at: string;
    next_due_on: string;
  }>) {
    if (!idsImObjekt.has(i.tree_id) || letzteKontrolle.has(i.tree_id)) continue;
    letzteKontrolle.set(i.tree_id, { inspected_at: i.inspected_at, next_due_on: i.next_due_on });
  }

  const sofort = new Set(
    ((measures ?? []) as Measure[])
      .filter((m) => m.urgency === "sofort" && idsImObjekt.has(m.tree_id))
      .map((m) => m.tree_id),
  );

  const zentrum: [number, number] =
    site.lng !== null && site.lat !== null
      ? [site.lng, site.lat]
      : baeume[0]
        ? [baeume[0].lng, baeume[0].lat]
        : [11.0767, 49.4521]; // Fallback: Mitte Deutschlands Naeherung, wird beim ersten Baum ersetzt

  return (
    <>
      <Link href="/app/objekte" className="text-[15px] text-[var(--violet-700)] underline">
        ‹ Objekte
      </Link>
      <h1 className="text-[28px] leading-[34px] font-semibold mt-2 mb-1">{site.name}</h1>
      <p className="text-[var(--gray-500)] mb-4">
        {site.address ?? "ohne Adresse"} · {baeume.length}{" "}
        {baeume.length === 1 ? "Baum" : "Baeume"}
      </p>

      <ObjektAnsicht
        siteId={site.id}
        center={zentrum}
        trees={baeume.map((t) => ({
          id: t.id,
          number: t.number,
          species: t.species,
          lat: t.lat,
          lng: t.lng,
          status: sofort.has(t.id)
            ? ("sofort" as const)
            : letzteKontrolle.has(t.id)
              ? ("kontrolliert" as const)
              : ("neu" as const),
          lastInspectedAt: letzteKontrolle.get(t.id)?.inspected_at ?? null,
          nextDueOn: letzteKontrolle.get(t.id)?.next_due_on ?? null,
        }))}
      />
    </>
  );
}
