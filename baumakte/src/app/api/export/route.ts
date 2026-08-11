import { NextResponse } from "next/server";
import { areaLabel, findingLabel, measureLabel } from "@/lib/fll/catalog";
import { createClient, requireSession } from "@/lib/supabase/server";
import type { AreaKey, Inspection, Measure, Site, Tree } from "@/types";

export const runtime = "nodejs";

/**
 * Vollexport des Bestands als CSV.
 *
 * Bewusst nicht an ein laufendes Abonnement gebunden: ein Nachweis, an den man
 * nur mit aktiver Zahlung herankommt, waere als Nachweis wertlos.
 */
export async function GET() {
  const { org } = await requireSession("/app/betrieb");
  const supabase = await createClient();

  const [{ data: sites }, { data: trees }, { data: inspections }, { data: measures }] =
    await Promise.all([
      supabase.from("sites").select("*").eq("org_id", org.id),
      supabase.from("trees").select("*").eq("org_id", org.id).order("number"),
      supabase
        .from("inspections")
        .select("*")
        .eq("org_id", org.id)
        .order("inspected_at", { ascending: false }),
      supabase.from("measures").select("*").eq("org_id", org.id),
    ]);

  const siteById = new Map(((sites ?? []) as Site[]).map((s) => [s.id, s]));
  const alleMassnahmen = (measures ?? []) as Measure[];

  const kopf = [
    "Objekt",
    "Baumnummer",
    "Art",
    "Hoehenklasse",
    "Stammdurchmesser_cm",
    "Breitengrad",
    "Laengengrad",
    "Kontrolle_am",
    "Pruefer",
    "Verkehrssicherheit",
    "Vitalitaet",
    "Entwicklungsphase",
    "Naechste_Kontrolle",
    "Befunde",
    "Bemerkung",
    "Massnahmen",
    "Pruefsumme",
  ];

  const zeilen: string[][] = [];

  for (const tree of (trees ?? []) as Tree[]) {
    const kontrollen = ((inspections ?? []) as Inspection[]).filter((i) => i.tree_id === tree.id);
    const site = siteById.get(tree.site_id);
    const stamm = [
      site?.name ?? "",
      tree.number,
      tree.species,
      tree.height_class ?? "",
      tree.dbh_cm !== null ? String(tree.dbh_cm) : "",
      tree.lat.toFixed(6),
      tree.lng.toFixed(6),
    ];

    if (kontrollen.length === 0) {
      zeilen.push([...stamm, "", "", "", "", "", "", "", "", "", ""]);
      continue;
    }

    for (const k of kontrollen) {
      const befunde = (Object.entries(k.findings) as Array<[AreaKey, (typeof k.findings)[AreaKey]]>)
        .filter(([, f]) => !f.ok || f.not_visible)
        .map(([key, f]) => {
          const teile = [
            f.codes.map(findingLabel).join(", "),
            f.note ?? "",
            f.not_visible ? "nicht einsehbar" : "",
          ].filter(Boolean);
          return `${areaLabel(key)}: ${teile.join(" / ")}`;
        })
        .join(" | ");

      const massnahmen = alleMassnahmen
        .filter((m) => m.inspection_id === k.id)
        .map(
          (m) =>
            `${measureLabel(m.kind)} (${m.urgency}, Frist ${m.due_on}${
              m.status === "erledigt" ? `, ausgefuehrt ${m.done_at ?? ""} von ${m.done_by_name ?? ""}` : ""
            })`,
        )
        .join(" | ");

      zeilen.push([
        ...stamm,
        k.inspected_at,
        k.inspector_name,
        k.assessment,
        k.vitality,
        k.dev_phase,
        k.next_due_on,
        befunde || "ohne Befund",
        k.note ?? "",
        massnahmen,
        k.hash,
      ]);
    }
  }

  const csv = [kopf, ...zeilen].map((z) => z.map(feld).join(";")).join("\r\n");
  const datum = new Date().toISOString().slice(0, 10);

  // BOM, damit Excel die Umlaute richtig liest.
  return new NextResponse(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="baumakte-export-${datum}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Semikolon-CSV fuer deutsches Excel; Anfuehrungszeichen werden verdoppelt. */
function feld(wert: string): string {
  const text = wert ?? "";
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
