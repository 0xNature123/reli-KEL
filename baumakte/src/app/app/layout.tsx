import Link from "next/link";
import { OfflineLeiste } from "@/features/offline/OfflineLeiste";
import { requireSession } from "@/lib/supabase/server";

const NAV = [
  { href: "/app", label: "Start" },
  { href: "/app/objekte", label: "Objekte" },
  { href: "/app/berichte", label: "Berichte" },
  { href: "/app/betrieb", label: "Betrieb" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { org, profile } = await requireSession();

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="bg-[var(--navy-900)] text-white safe-top sticky top-0 z-30">
        <div className="max-w-[1100px] mx-auto px-4 flex items-center gap-3 min-h-[56px]">
          <Link href="/app" className="flex items-center gap-2 no-underline shrink-0">
            <svg viewBox="0 0 64 64" width="26" height="26" aria-hidden focusable="false">
              <rect width="64" height="64" rx="15" fill="#101A33" />
              <path d="M32 11 L48 33 L32 53 Z" fill="#5836E0" />
              <path d="M32 11 L16 33 L32 53 Z" fill="#8A6BFF" />
            </svg>
            <span className="font-semibold text-white hidden sm:inline">
              Baum<span className="text-[#8A6BFF]">Akte</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 ml-auto" aria-label="Hauptbereiche">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 min-h-[48px] inline-flex items-center text-[15px] text-white
                           no-underline rounded-[10px] hover:bg-[var(--navy-700)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <OfflineLeiste />
      </header>

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 py-5 safe-bottom">{children}</main>

      <footer className="border-t border-[var(--gray-200)] bg-white">
        <div className="max-w-[1100px] mx-auto px-4 py-4 text-[13px] text-[var(--gray-500)] flex flex-wrap gap-x-4 gap-y-1">
          <span>
            {org.name} · {profile.full_name}
          </span>
          <Link href="/app/abo" className="text-[var(--gray-500)] underline">
            Abonnement
          </Link>
          <a href="/impressum" className="text-[var(--gray-500)] underline">
            Impressum
          </a>
          <a href="/datenschutz" className="text-[var(--gray-500)] underline">
            Datenschutz
          </a>
        </div>
      </footer>
    </div>
  );
}
