import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";

import { AppShell, Loading } from "@/components/nercha/AppShell";
import { Panel, Pill } from "@/components/nercha/ui";
import { getStudentData } from "@/lib/nercha.functions";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "My duty — Mamburam Aandu Nercha" },
      {
        name: "description",
        content: "Student volunteer view: your assigned duty, timing, incharge and team for Aandu Nercha.",
      },
      { property: "og:title", content: "My duty — Mamburam Aandu Nercha" },
      {
        property: "og:description",
        content: "See where you serve, when, and who leads your team.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentPage,
});

function StudentPage() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const fetchData = useServerFn(getStudentData);

  useEffect(() => {
    if (ready && (!session || session.role !== "student")) void navigate({ to: "/login" });
  }, [ready, session, navigate]);

  const token = session?.token ?? "";
  const query = useQuery({
    queryKey: ["student", token],
    queryFn: () => fetchData({ data: { token } }),
    enabled: !!token && session?.role === "student",
  });

  if (!ready || !session) return <Loading />;
  if (!query.data) return <Loading label="Loading your duty…" />;

  const { student, duty, incharges, mates } = query.data;

  return (
    <AppShell title="My duty" who={`${session.name} · ${session.loginId}`}>
      <section className="rounded-[14px] bg-forest-deep text-cream ring-1 ring-black/20 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.16em] text-sage">Your assignment</span>
          <span className="text-[11px] text-sage">
            {student?.present ? "Marked present" : "Marked absent"}
          </span>
        </div>
        <div className="p-5">
          {duty ? (
            <>
              <h2 className="font-display text-3xl leading-tight">{duty.name}</h2>
              {duty.description && <p className="mt-2 text-sm text-cream/85">{duty.description}</p>}
              <dl className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-sage">Place</dt>
                  <dd className="mt-0.5">{duty.location ?? "To be announced"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-sage">Time</dt>
                  <dd className="mt-0.5">
                    {duty.start_time ?? "—"} — {duty.end_time ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-sage">Your role</dt>
                  <dd className="mt-0.5">{student?.is_captain ? "Duty captain" : "Volunteer"}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="text-sm text-cream/85">
              You have not been assigned a duty yet. Please check again later.
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Your incharge" subtitle="Contact them for anything about the duty">
          <ul className="divide-y divide-black/5">
            {incharges.map((i) => (
              <li key={i.name} className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{i.name}</span>
                {i.phone && (
                  <a
                    href={`tel:${i.phone}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-md bg-forest/10 text-forest hover:bg-forest/20"
                  >
                    {i.phone}
                  </a>
                )}
              </li>
            ))}
            {!incharges.length && (
              <li className="px-4 py-6 text-sm text-moss/70">No incharge assigned yet.</li>
            )}
          </ul>
        </Panel>

        <Panel title="Your team" subtitle={`${mates.length} volunteers on this duty`}>
          <ul className="divide-y divide-black/5 max-h-80 overflow-y-auto">
            {mates.map((m) => (
              <li key={m.id} className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-sm text-ink">
                  {m.name} <span className="text-moss/60">· {m.adno}</span>
                </span>
                {m.is_captain && <Pill tone="saffron">Captain</Pill>}
              </li>
            ))}
            {!mates.length && <li className="px-4 py-6 text-sm text-moss/70">No team members yet.</li>}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
