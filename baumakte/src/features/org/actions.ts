"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, requireSession } from "@/lib/supabase/server";

const OrgSchema = z.object({
  name: z.string().trim().min(2, "Bitte den Betriebsnamen angeben.").max(120),
  address: z.string().trim().max(300).optional(),
  inspector_name: z.string().trim().max(120).optional(),
  certificate_no: z.string().trim().max(60).optional(),
});

export interface BetriebState {
  fehler?: Record<string, string>;
  gespeichert?: boolean;
}

export async function betriebSpeichern(
  _prev: BetriebState,
  formData: FormData,
): Promise<BetriebState> {
  const { org } = await requireSession("/app/betrieb");

  const parsed = OrgSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    inspector_name: formData.get("inspector_name") || undefined,
    certificate_no: formData.get("certificate_no") || undefined,
  });

  if (!parsed.success) {
    const fehler: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fehler[key]) fehler[key] = issue.message;
    }
    return { fehler };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orgs")
    .update({
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      inspector_name: parsed.data.inspector_name ?? null,
      certificate_no: parsed.data.certificate_no ?? null,
    })
    .eq("id", org.id);

  if (error) {
    return { fehler: { name: "Die Angaben konnten nicht gespeichert werden." } };
  }

  revalidatePath("/app/betrieb");
  revalidatePath("/app");
  return { gespeichert: true };
}
