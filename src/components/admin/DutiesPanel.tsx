import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, Field, Modal, Panel, Pill, Th, inputClass } from "@/components/nercha/ui";
import {
  assignStudentsToDuty,
  deleteRow,
  saveDuty,
  setCaptain,
  unassignStudent,
} from "@/lib/nercha.functions";
import type { AdminData, PanelProps } from "./types";

type Duty = AdminData["duties"][number];

export function DutiesPanel({ data, token, refresh }: PanelProps) {
  const save = useServerFn(saveDuty);
  const remove = useServerFn(deleteRow);
  const assign = useServerFn(assignStudentsToDuty);
  const unassign = useServerFn(unassignStudent);
  const promote = useServerFn(setCaptain);

  const [editing, setEditing] = useState<Partial<Duty> | null>(null);
  const [selectedDuty, setSelectedDuty] = useState<string | null>(data.duties[0]?.id ?? null);
  const [picked, setPicked] = useState<string[]>([]);

  const duty = data.duties.find((d) => d.id === selectedDuty) ?? null;
  const onDuty = data.students.filter((s) => s.duty_id === selectedDuty);
  const available = data.students.filter((s) => !s.duty_id);
  const dutyIncharges = data.incharges.filter((i) =>
    data.inchargeDuties.some((l) => l.incharge_id === i.id && l.duty_id === selectedDuty),
  );

  async function submitDuty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await save({
      data: {
        token,
        id: editing?.id,
        name: String(form.get("name") ?? ""),
        description: String(form.get("description") ?? ""),
        location: String(form.get("location") ?? ""),
        start_time: String(form.get("start_time") ?? ""),
        end_time: String(form.get("end_time") ?? ""),
      },
    });
    setEditing(null);
    refresh();
    toast.success("Duty saved");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Panel
        title="Duties"
        subtitle={`${data.duties.length} duties`}
        className="lg:col-span-2"
        actions={
          <Btn variant="solid" onClick={() => setEditing({})}>
            + New duty
          </Btn>
        }
      >
        <ul className="divide-y divide-black/5">
          {data.duties.map((d) => {
            const count = data.students.filter((s) => s.duty_id === d.id).length;
            const isActive = d.id === selectedDuty;
            return (
              <li
                key={d.id}
                className={`px-4 py-3 cursor-pointer ${isActive ? "bg-forest/10" : "hover:bg-glass/50"}`}
                onClick={() => {
                  setSelectedDuty(d.id);
                  setPicked([]);
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{d.name}</span>
                  <Pill tone={count ? "forest" : "clay"}>{count} volunteers</Pill>
                </div>
                <p className="text-xs text-moss/70 mt-1">
                  {[d.location, d.start_time && `${d.start_time} – ${d.end_time ?? ""}`]
                    .filter(Boolean)
                    .join(" · ") || "No timing set"}
                </p>
                <div className="mt-2 flex gap-2">
                  <Btn
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(d);
                    }}
                  >
                    Edit
                  </Btn>
                  <Btn
                    variant="danger"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await remove({ data: { token, table: "duties", id: d.id } });
                      refresh();
                      toast.success("Duty removed");
                    }}
                  >
                    Delete
                  </Btn>
                </div>
              </li>
            );
          })}
          {!data.duties.length && (
            <li className="px-4 py-6 text-sm text-moss/70">Add your first duty to begin.</li>
          )}
        </ul>
      </Panel>

      <div className="lg:col-span-3 space-y-6">
        <Panel
          title={duty ? `Assign to ${duty.name}` : "Assign volunteers"}
          subtitle={`${available.length} volunteers still free · ${onDuty.length} on this duty`}
          actions={
            <Btn
              variant="solid"
              disabled={!duty || !picked.length}
              onClick={async () => {
                if (!duty) return;
                await assign({ data: { token, dutyId: duty.id, studentIds: picked } });
                setPicked([]);
                refresh();
                toast.success("Volunteers assigned");
              }}
            >
              Assign {picked.length ? `(${picked.length})` : ""}
            </Btn>
          }
        >
          <div className="p-4 space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-moss/70 mb-2">
                Incharges on this duty
              </p>
              <div className="flex flex-wrap gap-2">
                {dutyIncharges.map((i) => (
                  <Pill key={i.id} tone="forest">
                    {i.name}
                  </Pill>
                ))}
                {!dutyIncharges.length && (
                  <p className="text-xs text-moss/70">
                    None yet — assign duties from the Incharges section.
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-moss/70 mb-2">
                Available volunteers (not on any duty)
              </p>
              <div className="max-h-64 overflow-y-auto rounded-md ring-1 ring-black/5 divide-y divide-black/5">
                {available.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-forest/5"
                  >
                    <input
                      type="checkbox"
                      className="accent-forest"
                      checked={picked.includes(s.id)}
                      onChange={(e) =>
                        setPicked((prev) =>
                          e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id),
                        )
                      }
                    />
                    <span className="font-medium text-ink">{s.name}</span>
                    <span className="ml-auto text-xs text-moss/70">
                      {s.adno} · {s.dept ?? "—"}
                    </span>
                  </label>
                ))}
                {!available.length && (
                  <p className="px-3 py-4 text-xs text-moss/70">Every volunteer already has a duty.</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-moss/70 mb-2">
                On this duty — promote a captain
              </p>
              <div className="rounded-md ring-1 ring-black/5 divide-y divide-black/5">
                {onDuty.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <span className="font-medium text-ink">{s.name}</span>
                    {s.is_captain && <Pill tone="saffron">Captain</Pill>}
                    <span className="ml-auto flex gap-2">
                      {!s.is_captain && duty && (
                        <Btn
                          onClick={async () => {
                            await promote({ data: { token, studentId: s.id, dutyId: duty.id } });
                            refresh();
                            toast.success(`${s.name} is now captain`);
                          }}
                        >
                          Make captain
                        </Btn>
                      )}
                      <Btn
                        variant="danger"
                        onClick={async () => {
                          await unassign({ data: { token, studentId: s.id } });
                          refresh();
                        }}
                      >
                        Remove
                      </Btn>
                    </span>
                  </div>
                ))}
                {!onDuty.length && (
                  <p className="px-3 py-4 text-xs text-moss/70">No volunteers on this duty yet.</p>
                )}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Duty overview">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5">
                  <Th>Duty</Th>
                  <Th>Captain</Th>
                  <Th>Volunteers</Th>
                  <Th>Incharges</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {data.duties.map((d) => {
                  const list = data.students.filter((s) => s.duty_id === d.id);
                  const captain = list.find((s) => s.is_captain);
                  const inch = data.incharges.filter((i) =>
                    data.inchargeDuties.some((l) => l.incharge_id === i.id && l.duty_id === d.id),
                  );
                  return (
                    <tr key={d.id}>
                      <td className="px-4 py-3 font-medium text-ink">{d.name}</td>
                      <td className="px-4 py-3 text-moss/80">{captain?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-moss/80">{list.length}</td>
                      <td className="px-4 py-3 text-moss/80">
                        {inch.map((i) => i.name).join(", ") || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Modal open={!!editing} title={editing?.id ? "Edit duty" : "New duty"} onClose={() => setEditing(null)}>
        <form onSubmit={submitDuty} className="space-y-3">
          <Field label="Duty name">
            <input name="name" className={inputClass} defaultValue={editing?.name ?? ""} required />
          </Field>
          <Field label="Description">
            <input name="description" className={inputClass} defaultValue={editing?.description ?? ""} />
          </Field>
          <Field label="Place">
            <input name="location" className={inputClass} defaultValue={editing?.location ?? ""} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From">
              <input name="start_time" className={inputClass} defaultValue={editing?.start_time ?? ""} />
            </Field>
            <Field label="To">
              <input name="end_time" className={inputClass} defaultValue={editing?.end_time ?? ""} />
            </Field>
          </div>
          <Btn variant="solid" className="w-full py-2" type="submit">
            Save duty
          </Btn>
        </form>
      </Modal>
    </div>
  );
}
