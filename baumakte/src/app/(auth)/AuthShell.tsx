import Link from "next/link";
import type { ReactNode } from "react";

/** Navy-Flaeche, Logo, ein Formular. Die Marke zeigt sich hier, nicht in der Arbeitsflaeche. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[var(--navy-900)] flex flex-col items-center justify-center px-5 py-12 safe-top safe-bottom">
      <Link href="/" className="flex items-center gap-3 mb-8 no-underline">
        <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden focusable="false">
          <rect width="64" height="64" rx="15" fill="#101A33" />
          <path d="M32 11 L48 33 L32 53 Z" fill="#5836E0" />
          <path d="M32 11 L16 33 L32 53 Z" fill="#8A6BFF" />
        </svg>
        <span className="text-2xl font-semibold text-white">
          Baum<span className="text-[#8A6BFF]">Akte</span>
        </span>
      </Link>

      <div className="w-full max-w-[420px] bg-white rounded-[10px] p-6">
        <h1 className="text-2xl font-semibold mb-1">{title}</h1>
        {subtitle && <p className="text-[var(--gray-500)] mb-5">{subtitle}</p>}
        {children}
      </div>

      {footer && <div className="mt-6 text-center text-[#A9B4CC] text-sm">{footer}</div>}
    </main>
  );
}
