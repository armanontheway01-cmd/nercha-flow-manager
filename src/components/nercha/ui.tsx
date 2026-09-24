import type { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[14px] bg-glass/55 backdrop-blur-xl ring-1 ring-black/5 shadow-lg overflow-hidden ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 border-b border-black/5">
          <div>
            {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="text-xs text-moss/70">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Btn({
  children,
  variant = "ghost",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "ghost" | "soft" | "danger" }) {
  const styles = {
    solid: "bg-forest text-cream hover:bg-forest-deep font-semibold",
    ghost: "bg-glass/70 ring-1 ring-black/5 text-ink/80 hover:bg-glass font-medium",
    soft: "bg-forest/10 text-forest hover:bg-forest/20 font-semibold",
    danger: "bg-absent/10 text-absent hover:bg-absent/20 font-semibold",
  }[variant];
  return (
    <button
      {...rest}
      className={`text-xs px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.08em] text-moss/70">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full rounded-md bg-glass/80 ring-1 ring-black/10 px-3 py-2 text-sm text-ink placeholder:text-moss/50 focus:outline-none focus:ring-2 focus:ring-forest/40";

export function Pill({ tone, children }: { tone: "present" | "absent" | "forest" | "clay" | "saffron"; children: ReactNode }) {
  const styles = {
    present: "bg-present/15 text-present",
    absent: "bg-absent/15 text-absent",
    forest: "bg-forest/10 text-forest",
    clay: "bg-clay/15 text-clay",
    saffron: "bg-saffron/20 text-saffron",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${styles}`}>
      {children}
    </span>
  );
}

export function Th({ children, right = false }: { children: ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-4 py-2.5 font-medium text-[11px] uppercase tracking-[0.08em] text-moss/70 ${right ? "text-right" : ""}`}
    >
      {children}
    </th>
  );
}

export function Ambient() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute -top-40 -left-24 size-[520px] rounded-full bg-moss/30 blur-3xl" />
      <div className="absolute top-10 right-0 size-[460px] rounded-full bg-saffron/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 size-[420px] rounded-full bg-forest/20 blur-3xl" />
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-[14px] bg-paper ring-1 ring-black/10 shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="text-moss/70 hover:text-ink text-sm" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="p-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}
