/**
 * Foto-Stempel.
 *
 * Der Weg ueber Canvas verwirft EXIF - das ist gewollt. Die Beweisdaten stehen
 * sichtbar im Bild und zusaetzlich in der Datenbank, statt in Metadaten, die
 * jedes Programm ueberschreibt.
 */

export interface StampInfo {
  takenAt: Date;
  lat: number | null;
  lng: number | null;
  accuracyM: number | null;
  inspectorName: string;
  treeNumber: string;
}

export interface StampedPhoto {
  blob: Blob;
  sha256: string;
  width: number;
  height: number;
}

const MAX_KANTE = 1600;
const QUALITAET = 0.82;

export function stampText(info: StampInfo): string {
  const zeit = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(info.takenAt);

  const ort =
    info.lat !== null && info.lng !== null
      ? `${info.lat.toFixed(4)} N, ${info.lng.toFixed(4)} E${info.accuracyM !== null ? ` ±${Math.round(info.accuracyM)} m` : ""}`
      : "ohne Positionsangabe";

  return `${zeit} Uhr · ${ort} · ${info.inspectorName} · Baum ${info.treeNumber}`;
}

async function ladeBild(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Bild konnte nicht gelesen werden"));
      img.src = url;
    });
    return img;
  } finally {
    // Nach dem Zeichnen freigeben - erst im naechsten Tick, damit decode fertig ist.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export async function sha256Hex(blob: Blob): Promise<string> {
  const bytes = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Skalieren, Stempelzeile einbrennen, als JPEG exportieren, Hash berechnen. */
export async function stampPhoto(file: File, info: StampInfo): Promise<StampedPhoto> {
  const img = await ladeBild(file);

  const faktor = Math.min(1, MAX_KANTE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * faktor);
  const h = Math.round(img.naturalHeight * faktor);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfuegbar");

  ctx.drawImage(img, 0, 0, w, h);

  // Halbtransparente Navy-Leiste am unteren Rand.
  const schrift = Math.max(13, Math.round(w * 0.022));
  const leiste = Math.round(schrift * 2.2);

  ctx.fillStyle = "rgba(16, 26, 51, 0.82)";
  ctx.fillRect(0, h - leiste, w, leiste);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `600 ${schrift}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillText(stampText(info), Math.round(schrift * 0.6), h - leiste / 2, w - schrift);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Bild konnte nicht erzeugt werden"))),
      "image/jpeg",
      QUALITAET,
    );
  });

  return { blob, sha256: await sha256Hex(blob), width: w, height: h };
}
