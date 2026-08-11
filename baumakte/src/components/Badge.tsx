import type { ReactNode } from "react";

type Tone = "neutral" | "red" | "amber" | "green" | "violet";

const TONES: Record<Tone, string> = {
  neutral: "text-[var(--gray-500)] border-[var(--gray-200)]",
  red: "text-[var(--red)] border-[var(--red)]",
  amber: "text-[var(--amber)] border-[var(--amber)]",
  green: "text-[var(--green)] border-[var(--green)]",
  violet: "text-[var(--violet-700)] border-[var(--violet-600)] bg-[var(--violet-50)]",
};

/** Ampelfarben erscheinen ausschliesslich hier - nie als Flaeche. */
export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-[999px]",
        "text-[13px] font-medium leading-none border bg-white",
        TONES[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}

/** Die Befundkachel. Klickziel mindestens 48 px hoch. */
export function Chip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={[
        "min-h-[48px] px-4 py-2 rounded-[10px] text-left text-[15px] font-medium border",
        selected
          ? "bg-[var(--violet-50)] border-[var(--violet-600)] text-[var(--violet-700)]"
          : "bg-white border-[var(--gray-200)] text-[var(--ink)] hover:border-[var(--gray-500)]",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
