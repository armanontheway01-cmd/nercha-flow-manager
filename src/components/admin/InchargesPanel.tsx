import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Btn, Field, Modal, Panel, Pill, Th, inputClass } from "@/components/nercha/ui";
import { downloadCsv, inchargeTemplate, parseCsv } from "@/lib/csv";
import {
  bulkAddIncharges,
  deleteRow,
  saveIncharge,
  setInchargeDuties,
} from "@/lib/nercha.functions";
import { whatsappLink, type AdminData, type PanelProps } from "./types";

type Incharge = AdminData["incharges"][number];

export function InchargesPanel({ data, token, refresh }: PanelProps) {
  const save = useServerFn(saveIncharge);
  const remove = useServerFn(deleteRow);
  const bulk = useServerFn(bulkAddIncharges);
  const setDuties = useServerFn(setInchargeDuties);
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState<Partial<Incharge> | null>(null);
  const [assigning, setAssigning] = useState<Incharge | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  const dutiesOf = (id: string) =>
    data.inchargeDuties.filter((l) => l.incharge_id === id).map((l) => l.duty_id);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const result = await save({
      data: {
        token,
        id: editing?.id,
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        login_id: String(form.get("login_id") ?? ""),
        ...(password ? { password } : {}),
      },
    });
    if (!result.ok) {
      toast.error(result.error ?? "Could not save");
      return;
    }
    setEditing(null);
    refresh();
    toast.success("Incharge saved");
  }

  async function upload(file: File) {
    const rows = parseCsv(await file.text()).map((r) => ({
      name: r["name"] ?? "",
      phone: r["phone"] ?? "",
      login_id: r["login_id"] ?? "",
      password: r["password"] ?? "",
    }));
    const result = await bulk({ data: { token, rows } });
    if (result.error) toast.error(result.error);
    else toast.success(`${result.added} incharges added`);
    refresh();
  }

  return (
    <Panel
      title="Duty incharges"
      subtitle={`${data.incharges.length} teachers · they sign in with the login you set here`}
      actions={
        <>
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
          <Btn onClick={() => downloadCsv("incharge-template.csv", inchargeTemplate)}>Template</Btn>
          <Btn variant="solid" onClick={() => setEditing({})}>
            + Add incharge
          </Btn>
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5">
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>Login ID</Th>
              <Th>Assigned duties</Th>
              <Th right>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {data.incharges.map((i) => {
              const assigned = data.duties.filter((d) => dutiesOf(i.id).includes(d.id));
              return (
                <tr key={i.id} className="hover:bg-glass/50">
                  <td className="px-4 py-3 font-medium text-ink">{i.name}</td>
                  <td className="px-4 py-3 text-moss/80">{i.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-moss/80">{i.login_id}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {assigned.map((d) => (
                        <Pill key={d.id} tone="forest">
                          {d.name}
                        </Pill>
                      ))}
                      {!assigned.length && <Pill tone="clay">None</Pill>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Btn
                        variant="soft"
                        onClick={() => {
                          setAssigning(i);
                          setPicked(dutiesOf(i.id));
                        }}
                      >
                        Assign duties
                      </Btn>
                      <Btn onClick={() => setEditing(i)}>Edit</Btn>
                      <a
                        href={whatsappLink(
                          i.phone,
                          `Assalamu alaikum ${i.name}, your Aandu Nercha duties: ${assigned.map((d) => d.name).join(", ") || "not assigned yet"}.`,
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
                          await remove({ data: { token, table: "incharges", id: i.id } });
                          refresh();
                        }}
                      >
                        Delete
                      </Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!data.incharges.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-sm text-moss/70">
                  Add the teachers who will lead each duty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!editing}
        title={editing?.id ? "Edit incharge" : "Add incharge"}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={submit} className="space-y-3">
          <Field label="Name">
            <input name="name" className={inputClass} defaultValue={editing?.name ?? ""} required />
          </Field>
          <Field label="Phone number">
            <input name="phone" className={inputClass} defaultValue={editing?.phone ?? ""} />
          </Field>
          <Field label="Login ID">
            <input name="login_id" className={inputClass} defaultValue={editing?.login_id ?? ""} required />
          </Field>
          <Field label={editing?.id ? "New password (leave blank to keep)" : "Password"}>
            <input name="password" className={inputClass} type="text" />
          </Field>
          <Btn variant="solid" className="w-full py-2" type="submit">
            Save incharge
          </Btn>
        </form>
      </Modal>

      <Modal
        open={!!assigning}
        title={`Duties for ${assigning?.name ?? ""}`}
        onClose={() => setAssigning(null)}
      >
        <div className="space-y-3">
          <div className="rounded-md ring-1 ring-black/5 divide-y divide-black/5">
            {data.duties.map((d) => (
              <label key={d.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-forest"
                  checked={picked.includes(d.id)}
                  onChange={(e) =>
                    setPicked((prev) =>
                      e.target.checked ? [...prev, d.id] : prev.filter((id) => id !== d.id),
                    )
                  }
                />
                <span className="font-medium text-ink">{d.name}</span>
              </label>
            ))}
          </div>
          <Btn
            variant="solid"
            className="w-full py-2"
            onClick={async () => {
              if (!assigning) return;
              await setDuties({ data: { token, inchargeId: assigning.id, dutyIds: picked } });
              setAssigning(null);
              refresh();
              toast.success("Duties updated");
            }}
          >
            Save duties
          </Btn>
        </div>
      </Modal>
    </Panel>
  );
}
