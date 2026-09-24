import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, Field, Modal, Panel, Th, inputClass } from "@/components/nercha/ui";
import { addGalleryImage, deleteRow, saveDistributor, saveStatus } from "@/lib/nercha.functions";
import type { AdminData, PanelProps } from "./types";

type Distributor = AdminData["distributors"][number];

export function SitePanel({ data, token, refresh }: PanelProps) {
  const status = useServerFn(saveStatus);
  const addImage = useServerFn(addGalleryImage);
  const remove = useServerFn(deleteRow);
  const saveDist = useServerFn(saveDistributor);
  const [editing, setEditing] = useState<Partial<Distributor> | null>(null);

  async function submitStatus(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await status({
      data: {
        token,
        is_ongoing: form.get("is_ongoing") === "on",
        headline: String(form.get("headline") ?? ""),
        subline: String(form.get("subline") ?? ""),
        packets_issued: Number(form.get("packets_issued") ?? 0),
        notice: String(form.get("notice") ?? ""),
      },
    });
    refresh();
    toast.success("Home page updated");
  }

  async function submitImage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await addImage({
      data: {
        token,
        url: String(form.get("url") ?? ""),
        caption: String(form.get("caption") ?? ""),
      },
    });
    if (!result.ok) {
      toast.error(result.error ?? "Could not add the photo");
      return;
    }
    (event.target as HTMLFormElement).reset();
    refresh();
    toast.success("Photo added");
  }

  async function submitDistributor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const result = await saveDist({
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
    toast.success("Distributor saved");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Panel title="Public home page" subtitle="What visitors see on the status band">
        <form onSubmit={submitStatus} className="p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="is_ongoing"
              defaultChecked={data.status?.is_ongoing ?? true}
              className="accent-forest"
            />
            Distribution is ongoing right now
          </label>
          <Field label="Headline">
            <input name="headline" className={inputClass} defaultValue={data.status?.headline ?? ""} />
          </Field>
          <Field label="Sub line">
            <input name="subline" className={inputClass} defaultValue={data.status?.subline ?? ""} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Packets issued">
              <input
                name="packets_issued"
                type="number"
                className={inputClass}
                defaultValue={String(data.status?.packets_issued ?? 0)}
              />
            </Field>
            <Field label="Notice (optional)">
              <input name="notice" className={inputClass} defaultValue={data.status?.notice ?? ""} />
            </Field>
          </div>
          <Btn variant="solid" className="w-full py-2" type="submit">
            Update home page
          </Btn>
        </form>
      </Panel>

      <Panel title="Gallery" subtitle="Paste a photo link to show it on the home page">
        <form onSubmit={submitImage} className="p-4 space-y-3 border-b border-black/5">
          <Field label="Photo link">
            <input name="url" className={inputClass} placeholder="https://…" required />
          </Field>
          <Field label="Caption">
            <input name="caption" className={inputClass} />
          </Field>
          <Btn variant="solid" className="w-full py-2" type="submit">
            Add photo
          </Btn>
        </form>
        <ul className="divide-y divide-black/5 max-h-72 overflow-y-auto">
          {data.gallery.map((g) => (
            <li key={g.id} className="flex items-center gap-3 px-4 py-2.5">
              <img src={g.url} alt="" className="size-10 rounded object-cover ring-1 ring-black/5" />
              <span className="text-sm text-ink truncate flex-1">{g.caption ?? g.url}</span>
              <Btn
                variant="danger"
                onClick={async () => {
                  await remove({ data: { token, table: "gallery_images", id: g.id } });
                  refresh();
                }}
              >
                Delete
              </Btn>
            </li>
          ))}
          {!data.gallery.length && (
            <li className="px-4 py-5 text-sm text-moss/70">
              No photos yet — sample photos are shown on the home page.
            </li>
          )}
        </ul>
      </Panel>

      <Panel
        title="Food distributors"
        subtitle="They sign in to scan donor tokens"
        className="lg:col-span-2"
        actions={
          <Btn variant="solid" onClick={() => setEditing({})}>
            + Add distributor
          </Btn>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/5">
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th>Login ID</Th>
                <Th right>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {data.distributors.map((d) => (
                <tr key={d.id} className="hover:bg-glass/50">
                  <td className="px-4 py-3 font-medium text-ink">{d.name}</td>
                  <td className="px-4 py-3 text-moss/80">{d.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-moss/80">{d.login_id}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Btn onClick={() => setEditing(d)}>Edit</Btn>
                      <Btn
                        variant="danger"
                        onClick={async () => {
                          await remove({ data: { token, table: "distributors", id: d.id } });
                          refresh();
                        }}
                      >
                        Delete
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {!data.distributors.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-sm text-moss/70">
                    No distributors added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={!!editing}
        title={editing?.id ? "Edit distributor" : "Add distributor"}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={submitDistributor} className="space-y-3">
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
            <input name="password" className={inputClass} />
          </Field>
          <Btn variant="solid" className="w-full py-2" type="submit">
            Save distributor
          </Btn>
        </form>
      </Modal>
    </div>
  );
}
