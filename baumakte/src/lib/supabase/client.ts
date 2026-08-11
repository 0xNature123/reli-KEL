"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Browser-Client. Nutzt ausschliesslich den anon key - der Service-Key darf nie hierher. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
