import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Ambient } from "./ui";
import { clearSession } from "@/lib/session";

export function AppShell({
  title,
  who,
  tabs,
  children,
}: {
  title: string;
  who: string;
  tabs?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-paper overflow-hidden">
      <Ambient />
      <div className="relative">
        <header className="border-b border-black/5 bg-glass/60 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3.5 flex flex-wrap items-center gap-3 justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-moss/70">
                Mamburam Aandu Nercha
              </p>
              <h1 className="font-display text-xl text-ink leading-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-moss/80">{who}</span>
              <button
                onClick={() => {
                  clearSession();
                  void navigate({ to: "/login" });
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-glass/70 ring-1 ring-black/5 text-ink/80 hover:bg-glass"
              >
                Sign out
              </button>
            </div>
          </div>
          {tabs && (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-3 flex flex-wrap gap-1.5">{tabs}</div>
          )}
        </header>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-paper text-sm text-moss/70">{label}</div>
  );
}
