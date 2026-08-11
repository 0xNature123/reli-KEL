"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { limitsFor } from "@/lib/stripe/plans";
import { createClient, requireSession } from "@/lib/supabase/server";

const TreeSchema = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  number: z.string().trim().min(1, "Bitte eine Baumnummer angeben.").max(20),
  species: z.string().trim().min(2, "Bitte die Baumart angeben.").max(120),
  height_class: z.enum(["<5", "5-10", "10-15", "15-20", ">20"]).nullable(),
  dbh_cm: z.coerce.number().int().min(1).max(900).nullable(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  gps_accuracy_m: z.coerce.number().min(0).max(10000).nullable(),
});

export interface TreeFormState {
  fehler?: Record<string, string>;
}

/** Naechste freie Baumnummer im Objekt. Fortlaufend, aber ueberschreibbar. */
export async function naechsteBaumnummer(siteId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from("trees").select("number").eq("site_id", siteId);

  const hoechste = (data ?? []).reduce((max, row) => {
    const n = Number.parseInt(String(row.number).replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);

  return String(hoechste + 1).padStart(3, "0");
}

export async function baumAnlegen(
  _prev: TreeFormState,
  formData: FormData,
): Promise<TreeFormState> {
  const { org } = await requireSession();

  const parsed = TreeSchema.safeParse({
    id: formData.get("id"),
    site_id: formData.get("site_id"),
    number: formData.get("number"),
    species: formData.get("species"),
    height_class: formData.get("height_class") || null,
    dbh_cm: formData.get("dbh_cm") || null,
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    gps_accuracy_m: formData.get("gps_accuracy_m") || null,
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

  // Paketgrenze serverseitig durchsetzen, nicht nur anzeigen.
  const { count } = await supabase
    .from("trees")
    .select("id", { count: "exact", head: true })
    .eq("org_id", org.id);

  const { maxTrees } = limitsFor(org.plan);
  if ((count ?? 0) >= maxTrees) {
    return {
      fehler: {
        number: `Die Grenze von ${maxTrees} Baeumen in Ihrem Paket ist erreicht. Im Abonnement koennen Sie wechseln.`,
      },
    };
  }

  const { error } = await supabase.from("trees").insert({
    ...parsed.data,
    org_id: org.id,
  });

  if (error) {
    const doppelt = error.code === "23505";
    return {
      fehler: {
        number: doppelt
          ? "Diese Baumnummer gibt es in diesem Objekt bereits."
          : "Der Baum konnte nicht gespeichert werden. Bitte erneut versuchen.",
      },
    };
  }

  revalidatePath(`/app/objekt/${parsed.data.site_id}`);
  revalidatePath("/app");
  redirect(`/app/baum/${parsed.data.id}/kontrolle`);
}
