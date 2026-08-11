import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { LinkButton } from "@/components/Button";
import { Historie } from "@/features/inspections/Historie";
import { MassnahmenListe } from "@/features/measures/MassnahmenListe";
import { formatDate } from "@/lib/format";
import { createClient, requireSession } from "@/lib/supabase/server";
import type { Inspection, Measure, Photo, Site, Tree } from "@/types";

export const dynamic = "force-dynamic";

export default async function BaumPage({
  params,
  searchParams,
}: {
  params: Promise<{ treeId: string }>;
  searchParams: Promise<{ gespeichert?: string }>;
}) {
  const { treeId } = await params;
  const { gespeichert } = await searchParams;
  const { profile } = await requireSession(`/app/baum/${treeId}`);

  const supabase = await createClient();
  const { data: tree } = await supabase
    .from("trees")
    .select("*")
    .eq("id", treeId)
    .maybeSingle<Tree>();

  if (!tree) notFound();

  const [{ data: site }, { data: inspections }, { data: measures }, { data: photos }] =
    await Promise.all([
      supabase.from("sites").select("*").eq("id", tree.site_id).maybeSingle<Site>(),
      supabase
        .from("inspections")
        .select("*")
        .eq("tree_id", treeId)
        .order("inspected_at", { ascending: false }),
      supabase.from("measures").select("*").eq("tree_id", treeId).order("due_on"),
      supabase.from("photos").select("*").eq("tree_id", treeId),
    ]);

  const kontrollen = (inspections ?? []) as Inspection[];
  const alleMassnahmen = (measures ?? []) as Measure[];
  const offen = alleMassnahmen.filter((m) => m.status === "offen");
  const letzte = kontrollen[0];

  return (
    <>
      {gespeichert && (
        <p
          className="mb-4 bg-white border border-[var(--green)] rounded-[10px] px-4 py-3 text-[15px]"
          role="status"
        >
          Kontrolle gespeichert und unveraenderlich protokolliert.
        </p>
      )}

      <Link
        href={`/app/objekt/${tree.site_id}`}
        className="text-[15px] text-[var(--violet-700)] underline"
      >
        ‹ {site?.name ?? "Objekt"}
      </Link>

      <div className="flex items-start justify-between gap-3 mt-2 mb-1">
        <h1 className="text-[28px] leading-[34px] font-semibold tnum">
          Baum {tree.number}
        </h1>
        {letzte && (
          <Badge
            tone={
              letzte.assessment === "nicht_gegeben"
                ? "red"
                : letzte.assessment === "eingeschraenkt"
                  ? "amber"
                  : "green"
            }
          >
            {letzte.assessment === "nicht_gegeben"
              ? "nicht verkehrssicher"
              : letzte.assessment === "eingeschraenkt"
                ? "eingeschraenkt"
                : "verkehrssicher"}
          </Badge>
        )}
      </div>

      <p className="text-[var(--gray-500)] mb-1">
        {tree.species}
        {tree.height_class ? ` · ${tree.height_class} m` : ""}
        {tree.dbh_cm ? ` · ${tree.dbh_cm} cm Stammdurchmesser` : ""}
      </p>
      <p className="text-[13px] text-[var(--gray-500)] tnum mb-5">
        {tree.lat.toFixed(5)} N, {tree.lng.toFixed(5)} E
        {tree.gps_accuracy_m ? ` · ±${Math.round(Number(tree.gps_accuracy_m))} m` : ""}
        {letzte ? ` · naechste Kontrolle ${formatDate(letzte.next_due_on)}` : ""}
      </p>

      <div className="mb-8">
        <LinkButton href={`/app/baum/${treeId}/kontrolle`} variant="primary">
          Neue Kontrolle
        </LinkButton>
      </div>

      <MassnahmenListe
        massnahmen={offen}
        erledigte={alleMassnahmen.filter((m) => m.status === "erledigt")}
        standardName={profile.full_name}
      />

      <Historie kontrollen={kontrollen} fotos={(photos ?? []) as Photo[]} />
    </>
  );
}
