"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireSession } from "@/lib/supabase/server";
import { InspectionInputSchema } from "./schema";

export interface SaveResult {
  ok: boolean;
  fehler?: string;
  inspectionId?: string;
}

/**
 * Speichert die Kontrolle: inspections, dann measures und photos.
 *
 * Die Hash-Kette entsteht im Datenbank-Trigger, nicht hier - so kann auch ein
 * manipulierter Client sie nicht umgehen. Auf inspections gibt es weder eine
 * update- noch eine delete-Policy; ein zweiter Aufruf mit derselben Kennung
 * prallt am Primaerschluessel ab und bleibt damit idempotent.
 */
export async function kontrolleSpeichern(rohdaten: unknown): Promise<SaveResult> {
  const { org, profile } = await requireSession();

  const parsed = InspectionInputSchema.safeParse(rohdaten);
  if (!parsed.success) {
    return { ok: false, fehler: parsed.error.issues[0]?.message ?? "Eingabe unvollstaendig." };
  }
  const input = parsed.data;

  const supabase = await createClient();

  // Gehoert der Baum zum eigenen Betrieb? RLS wuerde es ohnehin abweisen,
  // aber so bekommt der Nutzer eine verstaendliche Meldung.
  const { data: tree } = await supabase
    .from("trees")
    .select("id, site_id")
    .eq("id", input.tree_id)
    .maybeSingle<{ id: string; site_id: string }>();

  if (!tree) return { ok: false, fehler: "Der Baum wurde nicht gefunden." };

  const { error: inspectionError } = await supabase.from("inspections").insert({
    id: input.id,
    org_id: org.id,
    tree_id: input.tree_id,
    inspector_id: profile.id,
    inspector_name: profile.full_name,
    inspected_at: input.inspected_at,
    method: "regelkontrolle_sicht",
    dev_phase: input.dev_phase,
    vitality: input.vitality,
    assessment: input.assessment,
    findings: input.findings,
    habitat_features: input.habitat_features,
    next_interval_months: input.next_interval_months,
    next_due_on: input.next_due_on,
    note: input.note,
    voids_inspection_id: input.voids_inspection_id,
    void_reason: input.void_reason,
  });

  if (inspectionError) {
    // 23505 = derselbe Datensatz kam schon an. Das ist kein Fehler, sondern ein
    // wiederholter Upload aus der Offline-Warteschlange.
    if (inspectionError.code !== "23505") {
      return { ok: false, fehler: "Die Kontrolle konnte nicht gespeichert werden." };
    }
  }

  if (input.measures.length > 0) {
    const { error } = await supabase.from("measures").insert(
      input.measures.map((m) => ({
        id: m.id,
        org_id: org.id,
        tree_id: input.tree_id,
        inspection_id: input.id,
        kind: m.kind,
        urgency: m.urgency,
        due_on: m.due_on,
        note: m.note,
        status: "offen",
      })),
    );
    if (error && error.code !== "23505") {
      return { ok: false, fehler: "Die Massnahmen konnten nicht gespeichert werden." };
    }
  }

  if (input.photos.length > 0) {
    const { error } = await supabase.from("photos").insert(
      input.photos.map((p) => ({
        id: p.id,
        org_id: org.id,
        inspection_id: input.id,
        tree_id: input.tree_id,
        area: p.area,
        storage_path: p.storage_path,
        taken_at: p.taken_at,
        lat: p.lat,
        lng: p.lng,
        sha256: p.sha256,
      })),
    );
    if (error && error.code !== "23505") {
      return { ok: false, fehler: "Die Fotos konnten nicht zugeordnet werden." };
    }
  }

  revalidatePath(`/app/baum/${input.tree_id}`);
  revalidatePath(`/app/objekt/${tree.site_id}`);
  revalidatePath("/app");

  return { ok: true, inspectionId: input.id };
}

/** Massnahme abhaken - mit Durchfuehrungsnachweis: wann und von wem. */
export async function massnahmeErledigen(
  measureId: string,
  ausgefuehrtVon: string,
  bemerkung: string | null,
): Promise<SaveResult> {
  const { profile } = await requireSession();
  const name = ausgefuehrtVon.trim() || profile.full_name;

  if (name.length < 2) {
    return { ok: false, fehler: "Bitte angeben, wer die Massnahme ausgefuehrt hat." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("measures")
    .update({
      status: "erledigt",
      done_at: new Date().toISOString(),
      done_by_name: name,
      done_note: bemerkung?.trim() || null,
    })
    .eq("id", measureId)
    .select("tree_id")
    .maybeSingle<{ tree_id: string }>();

  if (error || !data) {
    return { ok: false, fehler: "Die Massnahme konnte nicht abgeschlossen werden." };
  }

  revalidatePath(`/app/baum/${data.tree_id}`);
  revalidatePath("/app/massnahmen");
  revalidatePath("/app");
  return { ok: true };
}
