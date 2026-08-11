import { BetriebForm } from "@/features/org/BetriebForm";
import { requireSession } from "@/lib/supabase/server";

export const metadata = { title: "Betrieb — BaumAkte" };
export const dynamic = "force-dynamic";

export default async function BetriebPage() {
  const { org } = await requireSession("/app/betrieb");

  return (
    <div className="max-w-[560px]">
      <h1 className="text-[28px] leading-[34px] font-semibold mb-1">Betrieb</h1>
      <p className="text-[var(--gray-500)] mb-6">
        Diese Angaben erscheinen im Briefkopf jedes Berichts.
      </p>
      <BetriebForm org={org} />
    </div>
  );
}
