import { db, type OutboxEntry } from "./dexie";

/** Reihenfolge der Uebertragung. Ein Baum muss existieren, bevor die Kontrolle kommt. */
const ORDER: Record<OutboxEntry["type"], number> = {
  tree: 0,
  inspection: 1,
  measure: 2,
  photo: 3,
};

export async function outboxAnzahl(): Promise<number> {
  if (typeof indexedDB === "undefined") return 0;
  try {
    return await db.outbox.count();
  } catch {
    return 0;
  }
}

export async function outboxEinreihen(
  id: string,
  type: OutboxEntry["type"],
  payload: unknown,
): Promise<void> {
  await db.outbox.put({
    id,
    type,
    payload,
    attempts: 0,
    lastError: null,
    createdAt: Date.now(),
  });
}

/** Naechste zu uebertragende Eintraege, in der richtigen Reihenfolge. */
export async function outboxNaechste(limit = 25): Promise<OutboxEntry[]> {
  const alle = await db.outbox.toArray();
  return alle
    .sort((a, b) => ORDER[a.type] - ORDER[b.type] || a.createdAt - b.createdAt)
    .slice(0, limit);
}

export async function outboxErledigt(id: string): Promise<void> {
  await db.outbox.delete(id);
  await db.photoBlobs.delete(id);
}

export async function outboxFehler(entry: OutboxEntry, message: string): Promise<void> {
  await db.outbox.update(entry.id, {
    attempts: entry.attempts + 1,
    lastError: message,
  });
}
