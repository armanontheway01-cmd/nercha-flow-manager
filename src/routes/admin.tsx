import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { DonationsPanel } from "@/components/admin/DonationsPanel";
import { DutiesPanel } from "@/components/admin/DutiesPanel";
import { InchargesPanel } from "@/components/admin/InchargesPanel";
import { InventoryPanel } from "@/components/admin/InventoryPanel";
import { SitePanel } from "@/components/admin/SitePanel";
import { StudentsPanel } from "@/components/admin/StudentsPanel";
import { TokensPanel } from "@/components/admin/TokensPanel";
import { AppShell, Loading } from "@/components/nercha/AppShell";
import { getAdminData } from "@/lib/nercha.functions";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Head teacher console — Mamburam Aandu Nercha" },
      {
        name: "description",
        content:
          "Head teacher console for Mamburam Aandu Nercha: duties, volunteers, incharges, inventory, donations and tokens.",
      },
      { property: "og:title", content: "Head teacher console — Mamburam Aandu Nercha" },
      {
        property: "og:description",
        content: "Assign duties, manage volunteers and issue donor tokens for the Nercha distribution.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { id: "duties", label: "Duties & assignment" },
  { id: "students", label: "Student volunteers" },
  { id: "incharges", label: "Duty incharges" },
  { id: "inventory", label: "Inventory" },
  { id: "donations", label: "Donations" },
  { id: "tokens", label: "Tokens & QR" },
  { id: "site", label: "Home page & logins" },
] as const;

function AdminPage() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const fetchData = useServerFn(getAdminData);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("duties");

  useEffect(() => {
    if (ready && (!session || session.role !== "admin")) void navigate({ to: "/login" });
  }, [ready, session, navigate]);

  const token = session?.token ?? "";
  const query = useQuery({
    queryKey: ["admin", token],
    queryFn: () => fetchData({ data: { token } }),
    enabled: !!token && session?.role === "admin",
  });

  if (!ready || !session) return <Loading />;
  if (query.isError) return <Loading label="Could not load the console. Please sign in again." />;
  if (!query.data) return <Loading label="Loading the console…" />;

  const data = query.data;
  const panelProps = { data, token, refresh: () => void query.refetch() };

  return (
    <AppShell
      title="Head teacher console"
      who={`${session.name} · head teacher`}
      tabs={TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors ${
            tab === t.id
              ? "bg-forest text-cream"
              : "bg-glass/70 ring-1 ring-black/5 text-ink/70 hover:bg-glass"
          }`}
        >
          {t.label}
        </button>
      ))}
    >
      {tab === "duties" && <DutiesPanel {...panelProps} />}
      {tab === "students" && <StudentsPanel {...panelProps} />}
      {tab === "incharges" && <InchargesPanel {...panelProps} />}
      {tab === "inventory" && <InventoryPanel {...panelProps} />}
      {tab === "donations" && <DonationsPanel {...panelProps} />}
      {tab === "tokens" && <TokensPanel {...panelProps} />}
      {tab === "site" && <SitePanel {...panelProps} />}
    </AppShell>
  );
}
