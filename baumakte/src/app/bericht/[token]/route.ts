import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Oeffentlicher Berichtslink. Ohne Anmeldung, aber ausschliesslich ueber den
 * Token: nachgeschlagen wird nur nach share_token, es gibt keinen Parameter,
 * mit dem sich etwas anderes erreichen liesse. Ein falscher Token liefert 404.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  if (!/^[a-f0-9]{32}$/.test(token)) {
    return new NextResponse("Nicht gefunden", { status: 404 });
  }

  const supabase = createServiceClient();
  const { data: report } = await supabase
    .from("reports")
    .select("storage_path, title")
    .eq("share_token", token)
    .maybeSingle<{ storage_path: string; title: string }>();

  if (!report) {
    return new NextResponse("Nicht gefunden", { status: 404 });
  }

  const { data: signed } = await supabase.storage
    .from("berichte")
    .createSignedUrl(report.storage_path, 600);

  if (!signed?.signedUrl) {
    return new NextResponse("Nicht gefunden", { status: 404 });
  }

  return NextResponse.redirect(signed.signedUrl, { status: 302 });
}
