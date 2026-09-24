import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, Field, Modal, Panel, Pill, Th, inputClass } from "@/components/nercha/ui";
import { deleteRow, saveInventoryItem } from "@/lib/nercha.functions";
import type { AdminData, PanelProps } from "./types";

type Item = AdminData["inventory"][number];

const tones = { plenty: "present", moderate: "saffron", low: "absent" } as const;

export function InventoryPanel({ data, token, refresh }: PanelProps) {
  const save = useServerFn(saveInventoryItem);
  const remove = useServerFn(deleteRow);
  const [editing, setEditing] = useState<Partial<Item> | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await save({
      data: {
        token,
        id: editing?.id,
        name: String(form.get("name") ?? ""),
        quantity: Number(form.get("quantity") ?? 0),
        unit: String(form.get("unit") ?? "kg"),
        status: String(form.get("status") ?? "plenty"),
        note: String(form.get("note") ?? ""),
      },
    });
    setEditing(null);
    refresh();
    toast.success("Item saved");
  }

  return (
    <Panel
      title="Inventory & supply"
      subtitle={`${data.inventory.length} items tracked`}
      actions={
        <Btn variant="solid" onClick={() => setEditing({ unit: "kg", status: "plenty" })}>
          + Add item
        </Btn>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5">
              <Th>Item</Th>
              <Th>Quantity</Th>
              <Th>Level</Th>
              <Th>Note</Th>
              <Th right>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {data.inventory.map((item) => (
              <tr key={item.id} className="hover:bg-glass/50">
                <td className="px-4 py-3 font-medium text-ink">{item.name}</td>
                <td className="px-4 py-3 text-moss/80">
                  {item.quantity} {item.unit}
                </td>
                <td className="px-4 py-3">
                  <Pill tone={tones[item.status as keyof typeof tones] ?? "forest"}>
                    {item.status}
                  </Pill>
                </td>
                <td className="px-4 py-3 text-moss/80">{item.note ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Btn onClick={() => setEditing(item)}>Edit</Btn>
                    <Btn
                      variant="danger"
                      onClick={async () => {
                        await remove({ data: { token, table: "inventory_items", id: item.id } });
                        refresh();
                      }}
                    >
                      Delete
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
            {!data.inventory.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-sm text-moss/70">
                  Nothing in the store yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} title={editing?.id ? "Edit item" : "Add item"} onClose={() => setEditing(null)}>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Item name">
            <input name="name" className={inputClass} defaultValue={editing?.name ?? ""} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity">
              <input
                name="quantity"
                type="number"
                step="any"
                className={inputClass}
                defaultValue={String(editing?.quantity ?? 0)}
              />
            </Field>
            <Field label="Unit">
              <input name="unit" className={inputClass} defaultValue={editing?.unit ?? "kg"} />
            </Field>
          </div>
          <Field label="Level">
            <select name="status" className={inputClass} defaultValue={editing?.status ?? "plenty"}>
              <option value="plenty">plenty</option>
              <option value="moderate">moderate</option>
              <option value="low">low</option>
            </select>
          </Field>
          <Field label="Note">
            <input name="note" className={inputClass} defaultValue={editing?.note ?? ""} />
          </Field>
          <Btn variant="solid" className="w-full py-2" type="submit">
            Save item
          </Btn>
        </form>
      </Modal>
    </Panel>
  );
}
