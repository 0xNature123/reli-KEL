"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDateTime } from "@/lib/format";
import type { Report } from "@/types";
import type { SiteSummary, TreeIndexEntry } from "./data";

interface Treffer {
  key: string;
  href: string;
  art: "Objekt" | "Baum" | "Bericht";
  titel: string;
  zeile: string;
}

/**
 * Suche ueber Objekte, Baeume und Berichte. Laeuft im Browser ueber die bereits
 * geladene Liste - dadurch ohne Wartezeit und auch offline benutzbar.
 */
export function Suche({
  sites,
  trees,
  reports,
}: {
  sites: SiteSummary[];
  trees: TreeIndexEntry[];
  reports: Report[];
}) {
  const [frage, setFrage] = useState("");
  const q = frage.trim().toLowerCase();

  const treffer = useMemo<Treffer[]>(() => {
    if (q.length < 1) return [];

    const objekte: Treffer[] = sites
      .filter((s) => `${s.name} ${s.address ?? ""} ${s.client_name ?? ""}`.toLowerCase().includes(q))
      .slice(0, 6)
      .map((s) => ({
        key: `s-${s.id}`,
        href: `/app/objekt/${s.id}`,
        art: "Objekt",
        titel: s.name,
        zeile: `${s.treeCount} ${s.treeCount === 1 ? "Baum" : "Baeume"}${s.address ? ` · ${s.address}` : ""}`,
      }));

    const baeume: Treffer[] = trees
      .filter((t) => `${t.number} ${t.species} ${t.siteName}`.toLowerCase().includes(q))
      .slice(0, 8)
      .map((t) => ({
        key: `t-${t.id}`,
        href: `/app/baum/${t.id}`,
        art: "Baum",
        titel: `Baum ${t.number} — ${t.species}`,
        zeile: t.siteName,
      }));

    const berichte: Treffer[] = reports
      .filter((r) => r.title.toLowerCase().includes(q))
      .slice(0, 6)
      .map((r) => ({
        key: `r-${r.id}`,
        href: `/app/berichte/${r.id}`,
        art: "Bericht",
        titel: r.title,
        zeile: `PDF · erstellt am ${formatDateTime(r.generated_at)} Uhr`,
      }));

    return [...objekte, ...baeume, ...berichte];
  }, [q, sites, trees, reports]);

  return (
    <div className="relative mb-6">
      <label htmlFor="suche" className="sr-only">
        Objekte, Baeume und Berichte durchsuchen
      </label>
      <input
        id="suche"
        type="search"
        value={frage}
        onChange={(e) => setFrage(e.target.value)}
        placeholder="Suchen: Objekt, Baumnummer, Art oder Bericht"
        autoComplete="off"
        className="w-full min-h-[52px] px-4 rounded-[10px] bg-white text-base
                   border border-[var(--gray-200)] placeholder:text-[var(--gray-500)]
                   focus:border-[var(--violet-600)] outline-none"
      />

      {q.length > 0 && (
        <div
          className="absolute left-0 right-0 top-[58px] z-20 bg-white rounded-[10px]
                     border border-[var(--gray-200)] overflow-hidden
                     shadow-[0_1px_2px_rgba(10,11,15,.06),0_1px_3px_rgba(10,11,15,.10)]"
          role="listbox"
          aria-label="Suchergebnisse"
        >
          {treffer.length === 0 ? (
            <p className="px-4 py-4 text-[var(--gray-500)] m-0">
              Nichts gefunden zu „{frage}“. Suchen Sie nach einem Objektnamen, einer
              Baumnummer oder einer Baumart.
            </p>
          ) : (
            treffer.map((t) => (
              <Link
                key={t.key}
                href={t.href}
                onClick={() => setFrage("")}
                className="flex items-center gap-3 min-h-[56px] px-4 py-2 no-underline
                           border-b border-[var(--gray-200)] last:border-b-0 hover:bg-[var(--gray-50)]"
              >
                <span className="text-[12px] font-semibold uppercase tracking-wide
                                 text-[var(--gray-500)] w-[62px] shrink-0">
                  {t.art}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-[var(--ink)] truncate">{t.titel}</span>
                  <span className="block text-[13px] text-[var(--gray-500)] truncate">{t.zeile}</span>
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
