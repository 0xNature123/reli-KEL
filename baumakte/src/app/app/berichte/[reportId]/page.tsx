import Link from "next/link";
import { notFound } from "next/navigation";
import { LinkButton } from "@/components/Button";
import { TeilenLink } from "@/features/reports/TeilenLink";
import { formatDate, formatDateTime } from "@/lib/format";
import { createClient, requireSession } from "@/lib/supabase/server";
import type { Report } from "@/types";

export const dynamic = "force-dynamic";

export default async function BerichtPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  await requireSession(`/app/berichte/${reportId}`);

  const supabase = await createClient();
  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .maybeSingle<Report>();

  if (!report) notFound();

  // Signierte URL, eine Stunde gueltig. Der Bucket bleibt privat.
  const { data: signed } = await supabase.storage
    .from("berichte")
    .createSignedUrl(report.storage_path, 3600, { download: `${report.title}.pdf` });

  const basis = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const teilen = report.share_token ? `${basis}/bericht/${report.share_token}` : null;

  return (
    <div className="max-w-[640px]">
      <Link href="/app/berichte" className="text-[15px] text-[var(--violet-700)] underline">
        ‹ Berichte
      </Link>
      <h1 className="text-[28px] leading-[34px] font-semibold mt-2 mb-4">{report.title}</h1>

      <dl className="bg-white rounded-[10px] border border-[var(--gray-200)] p-4 mb-5">
        <Zeile label="Erstellt am">{`${formatDateTime(report.generated_at)} Uhr`}</Zeile>
        <Zeile label="Baeume im Bericht">{String(report.tree_count)}</Zeile>
        <Zeile label="Zeitraum">
          {report.period_from && report.period_to
            ? `${formatDate(report.period_from)} bis ${formatDate(report.period_to)}`
            : "alle erfassten Kontrollen"}
        </Zeile>
        <Zeile label="Pruefsumme des PDF">
          <span className="break-all">{report.sha256}</span>
        </Zeile>
      </dl>

      {signed?.signedUrl ? (
        <LinkButton href={signed.signedUrl} variant="primary" target="_blank">
          PDF herunterladen
        </LinkButton>
      ) : (
        <p className="text-[var(--red)]" role="alert">
          Die Datei konnte nicht geladen werden. Bitte erzeugen Sie den Bericht erneut.
        </p>
      )}

      {teilen && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-1">Link fuer den Auftraggeber</h2>
          <p className="text-[13px] text-[var(--gray-500)] mb-2">
            Wer den Link hat, kann das PDF ohne Anmeldung oeffnen. Sonst nichts.
          </p>
          <TeilenLink url={teilen} />
        </div>
      )}
    </div>
  );
}

function Zeile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2 py-2 border-b border-[var(--gray-200)] last:border-b-0">
      <dt className="text-[var(--gray-500)] w-[180px] shrink-0">{label}</dt>
      <dd className="m-0 tnum flex-1 min-w-0">{children}</dd>
    </div>
  );
}
