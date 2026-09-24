import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Btn, Field, Modal, Panel, Pill, Th, inputClass } from "@/components/nercha/ui";
import { downloadCsv, parseCsv, studentTemplate } from "@/lib/csv";
import {
  bulkAddStudents,
  deleteRow,
  saveStudent,
  setStudentPresence,
  unassignStudent,
} from "@/lib/nercha.functions";
import { whatsappLink, type AdminData, type PanelProps } from "./types";

type Student = AdminData["students"][number];

export function StudentsPanel({ data, token, refresh }: PanelProps) {
  const save = useServerFn(saveStudent);
  const remove = useServerFn(deleteRow);
  const bulk = useServerFn(bulkAddStudents);
  const presence = useServerFn(setStudentPresence);
  const unassign = useServerFn(unassignStudent);
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState<Partial<Student> | null>(null);
  const [filter, setFilter] = useState<"all" | "free" | "assigned">("all");
  const [search, setSearch] = useState("");

  const dutyName = (id: string | null) => data.duties.find((d) => d.id === id)?.name ?? null;

  const rows = data.students
    .filter((s) => (filter === "free" ? !s.duty_id : filter === "assigned" ? !!s.duty_id : true))
    .filter((s) =>
      search
        ? `${s.name} ${s.adno} ${s.dept ?? ""}`.toLowerCase().includes(search.toLowerCase())
        : true,
    );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await save({
      data: {
        token,
        id: editing?.id,
        adno: String(form.get("adno") ?? ""),
        name: String(form.get("name") ?? ""),
        dept: String(form.get("dept") ?? ""),
        phone: String(form.get("phone") ?? ""),
        present: form.get("present") === "on",
      },
    });
    if (!result.ok) {
      toast.error(result.error ?? "Could not save");
      return;
    }
    setEditing(null);
    refresh();
    toast.success("Volunteer saved");
  }

  async function upload(file: File) {
    const rowsIn = parseCsv(await file.text()).map((r) => ({
      adno: r["adno"] ?? "",
      name: r["name"] ?? "",
      dept: r["dept"] ?? "",
      phone: r["phone"] ?? "",
      present: (r["present"] ?? "yes").toLowerCase() !== "no",
    }));
    const result = await bulk({ data: { token, rows: rowsIn } });
    if (result.error) toast.error(result.error);
    else toast.success(`${result.added} volunteers added`);
    refresh();
  }

  return (
    <Panel
      title="Student volunteers"
      subtitle={`${data.students.length} enrolled · ${data.students.filter((s) => !s.duty_id).length} without duty`}
      actions={
        <>
          <input
            className={`${inputClass} w-44`}
            placeholder="Search name or adno"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex rounded-md ring-1 ring-black/5 overflow-hidden">
            {(["all", "free", "assigned"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 text-xs font-medium ${
                  filter === key ? "bg-forest text-cream" : "bg-glass/70 text-moss/80"
                }`}
              >
                {key === "all" ? "All" : key === "free" ? "Available" : "On duty"}
              </button>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
          <Btn onClick={() => fileRef.current?.click()}>Bulk upload</Btn>
          <Btn onClick={() => downloadCsv("student-template.csv", studentTemplate)}>Template</Btn>
          <Btn variant="solid" onClick={() => setEditing({ present: true })}>
            + Add student
          </Btn>
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5">
              <Th>Adno</Th>
              <Th>Name</Th>
              <Th>Dept</Th>
              <Th>Status</Th>
              <Th>Duty</Th>
              <Th right>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {rows.map((s) => (
              <tr key={s.id} className="hover:bg-glass/50">
                <td className="px-4 py-3 text-moss/80">{s.adno}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink flex items-center gap-2">
                    {s.name}
                    {s.is_captain && <Pill tone="saffron">Captain</Pill>}
                  </div>
                  <div className="text-xs text-moss/70">{s.phone ?? "No number"}</div>
                </td>
                <td className="px-4 py-3 text-ink/80">{s.dept ?? "—"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={async () => {
                      await presence({ data: { token, studentId: s.id, present: !s.present } });
                      refresh();
                    }}
                  >
                    <Pill tone={s.present ? "present" : "absent"}>
                      <span className={`size-1.5 rounded-full ${s.present ? "bg-present" : "bg-absent"}`} />
                      {s.present ? "Present" : "Absent"}
                    </Pill>
                  </button>
                </td>
                <td className="px-4 py-3">
                  {s.duty_id ? (
                    <span className="flex items-center gap-2">
                      <Pill tone="forest">{dutyName(s.duty_id)}</Pill>
                      <button
                        className="text-[11px] text-moss/70 hover:text-absent"
                        onClick={async () => {
                          await unassign({ data: { token, studentId: s.id } });
                          refresh();
                        }}
                      >
                        clear
                      </button>
                    </span>
                  ) : (
                    <Pill tone="clay">Available</Pill>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <Btn onClick={() => setEditing(s)}>Edit</Btn>
                    <a
                      href={whatsappLink(
                        s.phone,
                        `Assalamu alaikum ${s.name}, your Aandu Nercha duty: ${dutyName(s.duty_id) ?? "not assigned yet"}.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs px-3 py-1.5 rounded-md bg-present/15 text-present font-semibold hover:bg-present/25"
                    >
                      WhatsApp
                    </a>
                    <Btn
                      variant="danger"
                      onClick={async () => {
                        await remove({ data: { token, table: "students", id: s.id } });
                        refresh();
                        toast.success("Volunteer removed");
                      }}
                    >
                      Delete
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-sm text-moss/70">
                  No volunteers to show.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!editing}
        title={editing?.id ? "Edit volunteer" : "Add volunteer"}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={submit} className="space-y-3">
          <Field label="Admission number">
            <input name="adno" className={inputClass} defaultValue={editing?.adno ?? ""} required />
          </Field>
          <Field label="Name">
            <input name="name" className={inputClass} defaultValue={editing?.name ?? ""} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department">
              <input name="dept" className={inputClass} defaultValue={editing?.dept ?? ""} />
            </Field>
            <Field label="Phone number">
              <input name="phone" className={inputClass} defaultValue={editing?.phone ?? ""} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="present" defaultChecked={editing?.present ?? true} className="accent-forest" />
            Present today
          </label>
          <p className="text-xs text-moss/70">
            The volunteer signs in with the admission number as both username and password.
          </p>
          <Btn variant="solid" className="w-full py-2" type="submit">
            Save volunteer
          </Btn>
        </form>
      </Modal>
    </Panel>
  );
}
