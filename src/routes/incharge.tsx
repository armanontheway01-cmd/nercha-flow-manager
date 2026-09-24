import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { toast } from "sonner";

import { AppShell, Loading } from "@/components/nercha/AppShell";
import { Btn, Panel, Pill, Th } from "@/components/nercha/ui";
import { whatsappLink } from "@/components/admin/types";
import { getInchargeData, setCaptain, setStudentPresence } from "@/lib/nercha.functions";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/incharge")({
  head: () => ({
    meta: [
      { title: "Duty incharge — Mamburam Aandu Nercha" },
      {
        name: "description",
        content: "Duty incharge view: your assigned duties, your volunteers, attendance and captains.",
      },
      { property: "og:title", content: "Duty incharge — Mamburam Aandu Nercha" },
      {
        property: "og:description",
        content: "Mark attendance and lead your assigned Nercha duty team.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InchargePage,
});

function InchargePage() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const fetchData = useServerFn(getInchargeData);
  const presence = useServerFn(setStudentPresence);
  const captain = useServerFn(setCaptain);

  useEffect(() => {
    if (ready && (!session || session.role !== "incharge")) void navigate({ to: "/login" });
  }, [ready, session, navigate]);

  const token = session?.token ?? "";
  const query = useQuery({
    queryKey: ["incharge", token],
    queryFn: () => fetchData({ data: { token } }),
    enabled: !!token && session?.role === "incharge",
  });

  if (!ready || !session) return <Loading />;
  if (!query.data) return <Loading label="Loading your duties…" />;

  const { duties, students } = query.data;
  const refresh = () => void query.refetch();

  return (
    <AppShell title="Duty incharge" who={`${session.name} · incharge`}>
      {!duties.length && (
        <Panel title="No duties yet">
          <p className="px-4 py-6 text-sm text-moss/70">
            The head teacher has not assigned you a duty yet. Please check back later.
          </p>
        </Panel>
      )}

      {duties.map((duty) => {
        const team = students.filter((s) => s.duty_id === duty.id);
        const presentCount = team.filter((s) => s.present).length;
        return (
          <Panel
            key={duty.id}
            title={duty.name}
            subtitle={`${duty.location ?? "Venue to be announced"} · ${duty.start_time ?? "—"} to ${duty.end_time ?? "—"} · ${presentCount}/${team.length} present`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5">
                    <Th>Ad. no</Th>
                    <Th>Name</Th>
                    <Th>Department</Th>
                    <Th>Phone</Th>
                    <Th>Attendance</Th>
                    <Th right>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {team.map((s) => (
                    <tr key={s.id} className="hover:bg-glass/50">
                      <td className="px-4 py-3 text-moss/80">{s.adno}</td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {s.name}
                        {s.is_captain && (
                          <span className="ml-2">
                            <Pill tone="saffron">Captain</Pill>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-moss/80">{s.dept ?? "—"}</td>
                      <td className="px-4 py-3 text-moss/80">{s.phone ?? "—"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            await presence({ data: { token, studentId: s.id, present: !s.present } });
                            refresh();
                          }}
                        >
                          <Pill tone={s.present ? "present" : "absent"}>
                            {s.present ? "Present" : "Absent"}
                          </Pill>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {!s.is_captain && (
                            <Btn
                              variant="soft"
                              onClick={async () => {
                                await captain({ data: { token, studentId: s.id, dutyId: duty.id } });
                                refresh();
                                toast.success(`${s.name} is now captain`);
                              }}
                            >
                              Make captain
                            </Btn>
                          )}
                          <a
                            href={whatsappLink(
                              s.phone,
                              `Assalamu alaikum ${s.name}, this is ${session.name} for the ${duty.name} duty at Aandu Nercha.`,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs px-3 py-1.5 rounded-md bg-present/15 text-present font-semibold hover:bg-present/25"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!team.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-sm text-moss/70">
                        No volunteers assigned to this duty yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        );
      })}
    </AppShell>
  );
}
