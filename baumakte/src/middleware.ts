import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieList = Array<{ name: string; value: string; options?: CookieOptions }>;

/**
 * Erneuert die Supabase-Sitzung bei jedem Aufruf und schuetzt alles unter /app.
 * Wer nicht angemeldet ist, landet auf dem Login und kommt danach genau dorthin
 * zurueck, wo er hin wollte - das traegt auch den Abo-Ablauf: Paket waehlen,
 * anmelden, bezahlen.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list: CookieList) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const geschuetzt = pathname.startsWith("/app") || pathname.startsWith("/abo/start");

  if (!user && geschuetzt) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/registrieren")) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Statische Dateien und die Landingpage bleiben aussen vor.
    "/((?!_next/static|_next/image|favicon.ico|landing|api/stripe/webhook|.*\\.(?:png|jpg|jpeg|svg|webp|ico|pdf|webmanifest)$).*)",
  ],
};
