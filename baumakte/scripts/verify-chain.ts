/**
 * Prueft die Hash-Kette eines Baums.
 *
 *   npm run verify -- <tree_id>
 *   npm run verify -- --alle
 *
 * Rechnet jede Pruefsumme aus dem Inhalt des Datensatzes neu und vergleicht sie
 * mit der gespeicherten. Weicht eine ab oder passt prev_hash nicht zum
 * Vorgaenger, ist der Datenbestand nachtraeglich veraendert worden.
 *
 * Braucht SUPABASE_SERVICE_ROLE_KEY, weil es bewusst an RLS vorbei liest.
 */
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

interface Row {
  id: string;
  tree_id: string;
  inspector_id: string;
  inspected_at: string;
  dev_phase: string;
  vitality: string;
  assessment: string;
  findings: unknown;
  habitat_features: unknown;
  note: string | null;
  voids_inspection_id: string | null;
  prev_hash: string | null;
  hash: string;
  created_at: string;
}

function berechne(row: Row, prev: string | null): string {
  // Muss zeichengenau zur Trigger-Funktion in 0001_init.sql passen.
  const text =
    (prev ?? "") +
    row.id +
    row.tree_id +
    row.inspector_id +
    row.inspected_at +
    row.dev_phase +
    row.vitality +
    row.assessment +
    JSON.stringify(row.findings) +
    JSON.stringify(row.habitat_features) +
    (row.note ?? "") +
    (row.voids_inspection_id ?? "");

  return createHash("sha256").update(text).digest("hex");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY werden gebraucht.");
    process.exit(2);
  }

  const argument = process.argv[2];
  if (!argument) {
    console.error("Aufruf: npm run verify -- <tree_id>   oder   npm run verify -- --alle");
    process.exit(2);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  let baumIds: string[];
  if (argument === "--alle") {
    const { data } = await supabase.from("trees").select("id");
    baumIds = (data ?? []).map((t) => t.id as string);
  } else {
    baumIds = [argument];
  }

  let gebrochen = 0;

  for (const treeId of baumIds) {
    const { data, error } = await supabase
      .from("inspections")
      .select("*")
      .eq("tree_id", treeId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(`Baum ${treeId}: Abfrage fehlgeschlagen — ${error.message}`);
      gebrochen += 1;
      continue;
    }

    const rows = (data ?? []) as Row[];
    if (rows.length === 0) {
      if (argument !== "--alle") console.log(`Baum ${treeId}: keine Kontrolle vorhanden.`);
      continue;
    }

    let prev: string | null = null;
    let heil = true;

    for (const [i, row] of rows.entries()) {
      if (row.prev_hash !== prev) {
        console.error(
          `Baum ${treeId}, Kontrolle ${i + 1} (${row.inspected_at}): prev_hash passt nicht zum Vorgaenger.`,
        );
        heil = false;
      }

      const erwartet = berechne(row, prev);
      if (erwartet !== row.hash) {
        console.error(
          `Baum ${treeId}, Kontrolle ${i + 1} (${row.inspected_at}): Pruefsumme weicht ab.\n` +
            `  gespeichert: ${row.hash}\n  berechnet:   ${erwartet}`,
        );
        heil = false;
      }

      prev = row.hash;
    }

    if (heil) {
      console.log(`Baum ${treeId}: Kette intakt (${rows.length} Kontrollen).`);
    } else {
      gebrochen += 1;
    }
  }

  if (gebrochen > 0) {
    console.error(`\n${gebrochen} Baum/Baeume mit Bruch in der Kette.`);
    process.exit(1);
  }
  console.log("\nAlle geprueften Ketten sind intakt.");
}

void main();
