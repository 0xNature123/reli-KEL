import Link from "next/link";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "bg-white rounded-[10px] border border-[var(--gray-200)] p-4",
        "shadow-[0_1px_2px_rgba(10,11,15,.06),0_1px_3px_rgba(10,11,15,.10)]",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

interface ListRowProps {
  href: string;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  right?: ReactNode;
}

export function ListRow({ href, title, subtitle, meta, right }: ListRowProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 min-h-[64px] px-4 py-3 bg-white no-underline
                 border-b border-[var(--gray-200)] last:border-b-0 hover:bg-[var(--gray-50)]"
    >
      <span className="flex-1 min-w-0">
        <span className="block font-semibold text-[var(--ink)] truncate">{title}</span>
        {subtitle && (
          <span className="block text-sm text-[var(--gray-500)] truncate">{subtitle}</span>
        )}
        {meta && <span className="block text-[13px] text-[var(--gray-500)] mt-0.5">{meta}</span>}
      </span>
      {right}
      <span aria-hidden className="text-[var(--gray-500)] shrink-0">
        ›
      </span>
    </Link>
  );
}

/** Leere Zustaende sind Aufforderungen, keine Entschuldigungen. */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="text-center px-6 py-12 bg-white rounded-[10px] border border-[var(--gray-200)]">
      <p className="text-lg font-semibold mb-1">{title}</p>
      {children && (
        <p className="text-[var(--gray-500)] max-w-[46ch] mx-auto mb-4">{children}</p>
      )}
      {action}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-3">
      <h2 className="text-xl font-semibold">{children}</h2>
      {right}
    </div>
  );
}
