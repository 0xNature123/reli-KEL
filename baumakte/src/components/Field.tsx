import type { ComponentProps, ReactNode } from "react";

const CONTROL =
  "w-full min-h-[48px] px-3 py-2 rounded-[10px] bg-white text-base text-[var(--ink)] " +
  "border border-[var(--gray-200)] placeholder:text-[var(--gray-500)] " +
  "focus:border-[var(--violet-600)] outline-none";

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  /** Fehler stehen unter dem Feld, nicht in einem Popup. */
  error?: string | null;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="block mb-1 text-sm font-medium text-[var(--ink)]"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-[13px] text-[var(--gray-500)]">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-[13px] font-medium text-[var(--red)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={[CONTROL, className ?? ""].join(" ")} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <select className={[CONTROL, className ?? ""].join(" ")} {...rest}>
      {children}
    </select>
  );
}

export function TextArea({ className, ...rest }: ComponentProps<"textarea">) {
  return (
    <textarea
      rows={3}
      className={[CONTROL, "min-h-[80px]", className ?? ""].join(" ")}
      {...rest}
    />
  );
}
