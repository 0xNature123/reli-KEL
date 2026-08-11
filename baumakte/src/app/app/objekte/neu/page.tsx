import Link from "next/link";
import { ObjektForm } from "./ObjektForm";

export const metadata = { title: "Objekt anlegen — BaumAkte" };

export default function NeuesObjektPage() {
  return (
    <div className="max-w-[520px]">
      <Link href="/app/objekte" className="text-[15px] text-[var(--violet-700)] underline">
        ‹ Objekte
      </Link>
      <h1 className="text-[28px] leading-[34px] font-semibold mt-2 mb-1">Objekt anlegen</h1>
      <p className="text-[var(--gray-500)] mb-6">
        Ein Objekt ist die Liegenschaft, die Sie kontrollieren. Die Baeume setzen Sie
        anschliessend auf der Karte.
      </p>
      <ObjektForm />
    </div>
  );
}
