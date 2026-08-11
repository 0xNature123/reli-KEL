import { createClient } from "@/lib/supabase/server";
import type { Measure, Report, Site, Uuid } from "@/types";

export interface SiteSummary extends Site {
  treeCount: number;
  openMeasures: number;
  overdueMeasures: number;
  lastInspectedAt: string | null;
}

export interface TreeIndexEntry {
  id: Uuid;
  site_id: Uuid;
  siteName: string;
  number: string;
  species: string;
}

export interface DashboardData {
  sites: SiteSummary[];
  reports: Report[];
  trees: TreeIndexEntry[];
  openMeasures: Measure[];
  overdueCount: number;
  dueSoonCount: number;
}

/**
 * Alles, was die Startseite braucht, in wenigen Abfragen.
 * Zaehlungen entstehen im Speicher statt in einer Abfrage pro Objekt.
 */
export async function ladeDashboard(orgId: Uuid): Promise<DashboardData> {
  const supabase = await createClient();

  const [sitesRes, treesRes, measuresRes, reportsRes, inspectionsRes] = await Promise.all([
    supabase.from("sites").select("*").eq("org_id", orgId).order("name"),
    supabase.from("trees").select("id, site_id, number, species").eq("org_id", orgId).limit(5000),
    supabase.from("measures").select("*").eq("org_id", orgId).eq("status", "offen").order("due_on"),
    supabase.from("reports").select("*").eq("org_id", orgId).order("generated_at", { ascending: false }),
    supabase
      .from("inspections")
      .select("tree_id, inspected_at")
      .eq("org_id", orgId)
      .order("inspected_at", { ascending: false })
      .limit(2000),
  ]);

  const sites = (sitesRes.data ?? []) as Site[];
  const trees = (treesRes.data ?? []) as Array<Pick<TreeIndexEntry, "id" | "site_id" | "number" | "species">>;
  const measures = (measuresRes.data ?? []) as Measure[];
  const reports = (reportsRes.data ?? []) as Report[];
  const inspections = (inspectionsRes.data ?? []) as Array<{ tree_id: Uuid; inspected_at: string }>;

  const siteById = new Map(sites.map((s) => [s.id, s]));
  const siteOfTree = new Map(trees.map((t) => [t.id, t.site_id]));

  const treeCount = new Map<Uuid, number>();
  for (const t of trees) treeCount.set(t.site_id, (treeCount.get(t.site_id) ?? 0) + 1);

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const inDreissig = new Date(heute.getTime() + 30 * 86_400_000);

  const open = new Map<Uuid, number>();
  const overdue = new Map<Uuid, number>();
  let overdueCount = 0;
  let dueSoonCount = 0;

  for (const m of measures) {
    const siteId = siteOfTree.get(m.tree_id);
    if (!siteId) continue;
    open.set(siteId, (open.get(siteId) ?? 0) + 1);

    const due = new Date(`${m.due_on}T00:00:00`);
    if (due < heute) {
      overdue.set(siteId, (overdue.get(siteId) ?? 0) + 1);
      overdueCount += 1;
    } else if (due <= inDreissig) {
      dueSoonCount += 1;
    }
  }

  // Letzte Kontrolle je Objekt: die Liste ist absteigend sortiert, der erste Treffer gewinnt.
  const lastBySite = new Map<Uuid, string>();
  for (const i of inspections) {
    const siteId = siteOfTree.get(i.tree_id);
    if (!siteId || lastBySite.has(siteId)) continue;
    lastBySite.set(siteId, i.inspected_at);
  }

  return {
    sites: sites.map((s) => ({
      ...s,
      treeCount: treeCount.get(s.id) ?? 0,
      openMeasures: open.get(s.id) ?? 0,
      overdueMeasures: overdue.get(s.id) ?? 0,
      lastInspectedAt: lastBySite.get(s.id) ?? null,
    })),
    reports,
    trees: trees.map((t) => ({
      ...t,
      siteName: siteById.get(t.site_id)?.name ?? "",
    })),
    openMeasures: measures,
    overdueCount,
    dueSoonCount,
  };
}
