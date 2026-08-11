import Link from "next/link";
import { notFound } from "next/navigation";
import { KontrolleFormular } from "@/features/inspections/KontrolleFormular";
import { createClient, requireSession } from "@/lib/supabase/server";
import type { Tree } from "@/types";

export const dynamic = "force-dynamic";

export default async function KontrollePage({
  params,
}: {
  params: Promise<{ treeId: string }>;
}) {
  const { treeId } = await params;
  const { org, profile } = await requireSession(`/app/baum/${treeId}/kontrolle`);

  const supabase = await createClient();
  const { data: tree } = await supabase
    .from("trees")
    .select("*")
    .eq("id", treeId)
    .maybeSingle<Tree>();

  if (!tree) notFound();

  return (
    <>
      <Link href={`/app/baum/${treeId}`} className="text-[15px] text-[var(--violet-700)] underline">
        ‹ Baum {tree.number}
      </Link>
      <h1 className="text-[28px] leading-[34px] font-semibold mt-2 mb-4">Regelkontrolle</h1>

      <KontrolleFormular
        treeId={tree.id}
        treeNumber={tree.number}
        species={tree.species}
        orgId={org.id}
        inspectorName={profile.full_name}
      />
    </>
  );
}
