import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Org, Profile } from "@/types";

type CookieList = Array<{ name: string; value: string; options?: CookieOptions }>;

/** Server-Client mit Nutzersitzung. Alle Abfragen laufen durch Row Level Security. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list: CookieList) => {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // In Server Components ist das Setzen nicht erlaubt; die Middleware erneuert die Sitzung.
          }
        },
      },
    },
  );
}

/**
 * Service-Client: umgeht RLS. Ausschliesslich fuer den Stripe-Webhook und die
 * Registrierung. Niemals in einer Route benutzen, die Nutzereingaben direkt abbildet.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY fehlt");

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

export interface SessionContext {
  userId: string;
  profile: Profile;
  org: Org;
}

/** Sitzung mit Profil und Betrieb. Leitet zum Login um, wenn nicht angemeldet. */
export async function requireSession(nextPath?: string): Promise<SessionContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const target = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";
    redirect(target);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) redirect("/login?fehler=kein_profil");

  const { data: org } = await supabase
    .from("orgs")
    .select("*")
    .eq("id", profile.org_id)
    .single<Org>();

  if (!org) redirect("/login?fehler=kein_betrieb");

  return { userId: user.id, profile, org };
}
