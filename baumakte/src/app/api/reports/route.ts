import { createHash, randomUUID } from "node:crypto";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Bericht, type BerichtBaum } from "@/features/reports/Bericht";
import { formatDate } from "@/lib/format";
import { createClient, requireSession } from "@/lib/supabase/server";
import type { Inspection, Measure, Site, Tree } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const Anfrage = z.object({
  site_id: z.string().uuid(),
  period_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  period_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export async function POST(request: Request) {
  const { org, profile } = await requireSession();

  const parsed = Anfrage.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ fehler: "Ungueltige Anfrage." }, { status: 400 });
  }
  const { site_id, period_from = null, period_to = null } = parsed.data;

  const supabase = await createClient();

  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("id", site_id)
    .maybeSingle<Site>();

  if (!site) return NextResponse.json({ fehler: "Objekt nicht gefunden." }, { status: 404 });

  const { data: trees } = await supabase
    .from("trees")
    .select("*")
    .eq("site_id", site_id)
    .order("number");

  const baeume = (trees ?? []) as Tree[];
  const treeIds = baeume.map((t) => t.id);

  let inspections: Inspection[] = [];
  let measures: Measure[] = [];

  if (treeIds.length > 0) {
    let abfrage = supabase
      .from("inspections")
      .select("*")
      .in("tree_id", treeIds)
      .order("inspected_at", { ascending: false });

    if (period_from) abfrage = abfrage.gte("inspected_at", `${period_from}T00:00:00Z`);
    if (period_to) abfrage = abfrage.lte("inspected_at", `${period_to}T23:59:59Z`);

    const [{ data: i }, { data: m }] = await Promise.all([
      abfrage,
      supabase.from("measures").select("*").in("tree_id", treeIds),
    ]);
    inspections = (i ?? []) as Inspection[];
    measures = (m ?? []) as Measure[];
  }

  // Je Baum die juengste Kontrolle im Zeitraum.
  const letzte = new Map<string, Inspection>();
  for (const k of inspections) {
    if (!letzte.has(k.tree_id)) letzte.set(k.tree_id, k);
  }
  const stornierteIds = new Set(
    inspections.map((k) => k.voids_inspection_id).filter((id): id is string => id !== null),
  );

  const eintraege: BerichtBaum[] = baeume.map((tree) => {
    const inspection = letzte.get(tree.id) ?? null;
    return {
      tree,
      inspection,
      measures: measures.filter((m) => m.inspection_id === inspection?.id),
      storniert: inspection ? stornierteIds.has(inspection.id) : false,
    };
  });

  // Erstellungszeitpunkt setzt die App, nicht der Nutzer.
  const generatedAt = new Date();
  const reportId = randomUUID();

  const buffer = await renderToBuffer(
    Bericht({
      org,
      site,
      reportId,
      generatedAt,
      periodFrom: period_from,
      periodTo: period_to,
      baeume: eintraege,
      inspectorName: org.inspector_name ?? profile.full_name,
    }),
  );

  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const pfad = `${org.id}/${site.id}/${reportId}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("berichte")
    .upload(pfad, buffer, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return NextResponse.json({ fehler: "Der Bericht konnte nicht abgelegt werden." }, { status: 500 });
  }

  const titel = `${site.name} — Baumkontrolle ${formatDate(generatedAt)}`;

  const { error: insertError } = await supabase.from("reports").insert({
    id: reportId,
    org_id: org.id,
    site_id: site.id,
    created_by: profile.id,
    title: titel,
    period_from,
    period_to,
    tree_count: eintraege.length,
    storage_path: pfad,
    sha256,
    share_token: randomUUID().replace(/-/g, ""),
    generated_at: generatedAt.toISOString(),
  });

  if (insertError) {
    return NextResponse.json({ fehler: "Der Bericht konnte nicht gespeichert werden." }, { status: 500 });
  }

  return NextResponse.json({ id: reportId, titel, sha256 });
}
