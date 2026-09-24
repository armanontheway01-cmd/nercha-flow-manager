import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, Field, Modal, Panel, Th, inputClass } from "@/components/nercha/ui";
import { addDonation, deleteRow } from "@/lib/nercha.functions";
import type { PanelProps } from "./types";

export function DonationsPanel({ data, token, refresh }: PanelProps) {
  const add = useServerFn(addDonation);
  const remove = useServerFn(deleteRow);
  const [open, setOpen] = useState(false);

  const totalAmount = data.donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalPackets = data.donations.reduce((sum, d) => sum + d.packets, 0);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await add({
      data: {
        token,
        donor_name: String(form.get("donor_name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        amount: Number(form.get("amount") ?? 0),
        packets: Number(form.get("packets") ?? 0),
        note: String(form.get("note") ?? ""),
      },
    });
    if (!result.ok) {
      toast.error(result.error ?? "Could not save");
      return;
    }
    setOpen(false);
    refresh();
    toast.success(`Receipt ${result.receipt} recorded`);
  }

  return (
    <Panel
      title="Donation receipts"
      subtitle={`₹${totalAmount.toLocaleString()} received · ${totalPackets} packets sponsored`}
      actions={
        <Btn variant="solid" onClick={() => setOpen(true)}>
          + Record donation
        </Btn>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5">
              <Th>Receipt</Th>
              <Th>Donor</Th>
              <Th>Phone</Th>
              <Th>Amount</Th>
              <Th>Packets</Th>
              <Th>Note</Th>
              <Th right>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {data.donations.map((d) => (
              <tr key={d.id} className="hover:bg-glass/50">
                <td className="px-4 py-3 text-moss/80">{d.receipt_no}</td>
                <td className="px-4 py-3 font-medium text-ink">{d.donor_name}</td>
                <td className="px-4 py-3 text-moss/80">{d.phone ?? "—"}</td>
                <td className="px-4 py-3 text-ink/80">₹{Number(d.amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-ink/80">{d.packets}</td>
                <td className="px-4 py-3 text-moss/80">{d.note ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Btn
                      variant="danger"
                      onClick={async () => {
                        await remove({ data: { token, table: "donations", id: d.id } });
                        refresh();
                      }}
                    >
                      Delete
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
            {!data.donations.length && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-sm text-moss/70">
                  No donations recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} title="Record donation" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Donor name">
            <input name="donor_name" className={inputClass} required />
          </Field>
          <Field label="Phone number">
            <input name="phone" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (₹)">
              <input name="amount" type="number" step="any" className={inputClass} defaultValue="0" />
            </Field>
            <Field label="Packets sponsored">
              <input name="packets" type="number" className={inputClass} defaultValue="0" />
            </Field>
          </div>
          <Field label="Note">
            <input name="note" className={inputClass} />
          </Field>
          <Btn variant="solid" className="w-full py-2" type="submit">
            Save receipt
          </Btn>
        </form>
      </Modal>
    </Panel>
  );
}
