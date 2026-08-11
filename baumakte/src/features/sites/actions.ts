"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, requireSession } from "@/lib/supabase/server";

const SiteSchema = z.object({
  name: z.string().trim().min(2, "Bitte einen Objektnamen angeben.").max(120),
  address: z.string().trim().max(200).optional(),
  client_name: z.string().trim().max(120).optional(),
  lat: z.coerce.number().min(-90).max(90).nullable().optional(),
  lng: z.coerce.number().min(-180).max(180).nullable().optional(),
});

export interface FormState {
  fehler?: Record<string, string>;
  meldung?: string;
}

export async function objektAnlegen(_prev: FormState, formData: FormData): Promise<FormState> {
  const { org } = await requireSession();

  const parsed = SiteSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    client_name: formData.get("client_name") || undefined,
    lat: formData.get("lat") || null,
    lng: formData.get("lng") || null,
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
  const id = randomUUID();

  const { error } = await supabase.from("sites").insert({
    id,
    org_id: org.id,
    name: parsed.data.name,
    address: parsed.data.address ?? null,
    client_name: parsed.data.client_name ?? null,
    lat: parsed.data.lat ?? null,
    lng: parsed.data.lng ?? null,
  });

  if (error) {
    return { fehler: { name: "Das Objekt konnte nicht gespeichert werden. Bitte erneut versuchen." } };
  }

  revalidatePath("/app");
  revalidatePath("/app/objekte");
  redirect(`/app/objekt/${id}`);
}
