import { z } from "zod";

/** Ein Schema fuer Client und Server. Serverseitig gilt es verbindlich. */

export const AreaFindingSchema = z.object({
  ok: z.boolean(),
  codes: z.array(z.string().max(60)).max(30),
  note: z.string().trim().max(500).nullable(),
  not_visible: z.boolean().optional(),
});

export const FindingsSchema = z.object({
  umfeld: AreaFindingSchema,
  stammfuss: AreaFindingSchema,
  stamm: AreaFindingSchema,
  kronenansatz: AreaFindingSchema,
  starkaeste: AreaFindingSchema,
  krone: AreaFindingSchema,
});

export const HabitatSchema = z.object({
  kind: z.enum(["hoehle", "spalte", "nest", "totholz_stehend", "fledermausquartier"]),
  area: z
    .enum(["umfeld", "stammfuss", "stamm", "kronenansatz", "starkaeste", "krone"])
    .nullable(),
  note: z.string().trim().max(300).nullable(),
});

export const MeasureInputSchema = z.object({
  id: z.string().uuid(),
  kind: z.string().min(2).max(60),
  urgency: z.enum(["sofort", "drei_monate", "naechste_kontrolle"]),
  due_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ungueltiges Datum"),
  note: z.string().trim().max(500).nullable(),
});

export const PhotoInputSchema = z.object({
  id: z.string().uuid(),
  area: z.string().max(30).nullable(),
  storage_path: z.string().min(3).max(300),
  taken_at: z.string(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/, "Ungueltige Pruefsumme"),
});

export const InspectionInputSchema = z
  .object({
    id: z.string().uuid(),
    tree_id: z.string().uuid(),
    inspected_at: z.string(),
    dev_phase: z.enum(["jugend", "reife", "alterung"]),
    vitality: z.enum(["0", "1", "2", "3"]),
    assessment: z.enum(["gegeben", "eingeschraenkt", "nicht_gegeben"]),
    findings: FindingsSchema,
    habitat_features: z.array(HabitatSchema).max(20),
    next_interval_months: z.number().int().min(0).max(60),
    next_due_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    note: z.string().trim().max(2000).nullable(),
    voids_inspection_id: z.string().uuid().nullable(),
    void_reason: z.string().trim().max(500).nullable(),
    measures: z.array(MeasureInputSchema).max(20),
    photos: z.array(PhotoInputSchema).max(30),
  })
  .refine(
    (v) => v.assessment === "gegeben" || v.measures.length > 0,
    {
      message:
        "Bei eingeschraenkter oder nicht gegebener Verkehrssicherheit ist mindestens eine Massnahme noetig.",
      path: ["measures"],
    },
  )
  .refine((v) => v.voids_inspection_id === null || (v.void_reason?.length ?? 0) >= 5, {
    message: "Ein Storno braucht eine Begruendung.",
    path: ["void_reason"],
  });

export type InspectionInput = z.infer<typeof InspectionInputSchema>;
