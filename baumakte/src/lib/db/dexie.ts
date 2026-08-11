import Dexie, { type EntityTable } from "dexie";
import type { Inspection, Measure, Photo, Site, Tree } from "@/types";

/** Ein Eintrag in der Outbox. Reihenfolge zaehlt: tree vor inspection vor measure/photo. */
export interface OutboxEntry {
  id: string;
  type: "tree" | "inspection" | "measure" | "photo";
  payload: unknown;
  attempts: number;
  lastError: string | null;
  createdAt: number;
}

/** Foto als Blob, bis es hochgeladen ist. Danach wird der Blob geloescht. */
export interface PhotoBlob {
  id: string;
  blob: Blob;
}

/** Entwurf einer laufenden Kontrolle. Ueberlebt das Beenden der App. */
export interface Draft {
  treeId: string;
  data: unknown;
  updatedAt: number;
}

const db = new Dexie("baumakte") as Dexie & {
  sites: EntityTable<Site, "id">;
  trees: EntityTable<Tree, "id">;
  inspections: EntityTable<Inspection, "id">;
  measures: EntityTable<Measure, "id">;
  photos: EntityTable<Photo, "id">;
  photoBlobs: EntityTable<PhotoBlob, "id">;
  outbox: EntityTable<OutboxEntry, "id">;
  drafts: EntityTable<Draft, "treeId">;
};

db.version(1).stores({
  sites: "id, org_id, name",
  trees: "id, site_id, number, species",
  inspections: "id, tree_id, inspected_at",
  measures: "id, tree_id, status, due_on",
  photos: "id, inspection_id",
  photoBlobs: "id",
  outbox: "id, type, createdAt",
  drafts: "treeId, updatedAt",
});

export { db };
