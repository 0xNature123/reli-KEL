import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "text" | "danger";

const BASE =
  "inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-[10px] " +
  "text-base font-semibold no-underline border transition-colors " +
  "disabled:opacity-50 disabled:pointer-events-none";

const VARIANTS: Record<Variant, string> = {
  // Genau ein Primaerbutton pro Screen.
  primary:
    "bg-[var(--violet-600)] text-white border-transparent hover:bg-[var(--violet-700)]",
  outline:
    "bg-white text-[var(--ink)] border-[var(--gray-200)] hover:border-[var(--gray-500)]",
  text: "bg-transparent text-[var(--violet-700)] border-transparent px-2 hover:underline",
  danger: "bg-white text-[var(--red)] border-[var(--gray-200)] hover:border-[var(--red)]",
};

function classes(variant: Variant, full: boolean, extra?: string): string {
  return [BASE, VARIANTS[variant], full ? "w-full" : "", extra ?? ""]
    .filter(Boolean)
    .join(" ");
}

interface ButtonProps extends Omit<ComponentProps<"button">, "className"> {
  variant?: Variant;
  full?: boolean;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "outline",
  full = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={classes(variant, full, className)} {...rest}>
      {children}
    </button>
  );
}

interface LinkButtonProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  full?: boolean;
  className?: string;
  children: ReactNode;
}

export function LinkButton({
  variant = "outline",
  full = false,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link className={classes(variant, full, className)} {...rest}>
      {children}
    </Link>
  );
}

/** Icon-Button. aria-label ist Pflicht, damit er ohne Sicht bedienbar bleibt. */
export function IconButton({
  label,
  children,
  className,
  ...rest
}: Omit<ComponentProps<"button">, "className"> & {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      className={[
        "inline-flex items-center justify-center min-h-[48px] min-w-[48px] rounded-[10px]",
        "text-[var(--ink)] hover:bg-[var(--gray-50)]",
        className ?? "",
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
