import Link from "next/link";
import type { ReactNode } from "react";

export function RechtSeite({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-white px-5 py-10 safe-top safe-bottom">
      <div className="max-w-[720px] mx-auto">
        <Link href="/" className="text-[15px] text-[var(--violet-700)] underline">
          ‹ Startseite
        </Link>
        <h1 className="text-[28px] leading-[34px] font-semibold mt-3 mb-6">{titel}</h1>
        <div className="space-y-4 text-[17px] leading-[1.6]">{children}</div>
      </div>
    </main>
  );
}

/** Sichtbarer Hinweis, dass hier vor dem Start echter Text stehen muss. */
export function Platzhalter() {
  return (
    <p className="border border-[var(--amber)] rounded-[10px] p-4 text-[15px]">
      <strong>Platzhalter.</strong> Dieser Text ist noch nicht rechtsverbindlich formuliert.
      Vor dem oeffentlichen Start muss er von einer fachkundigen Stelle erstellt oder
      geprueft werden. Bis dahin darf die Seite nicht oeffentlich beworben werden.
    </p>
  );
}
