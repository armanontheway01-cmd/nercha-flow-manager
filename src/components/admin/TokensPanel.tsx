import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Btn, Field, Panel, Pill, Th, inputClass } from "@/components/nercha/ui";
import { createToken, deleteRow } from "@/lib/nercha.functions";
import { makeQrDataUrl, shareTokenCard } from "@/lib/qr";
import type { PanelProps } from "./types";

export function TokensPanel({ data, token, refresh }: PanelProps) {
  const create = useServerFn(createToken);
  const remove = useServerFn(deleteRow);
  const [latest, setLatest] = useState<{ code: string; donor: string; packets: number } | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!latest) return;
    void makeQrDataUrl(latest.code).then(setQr);
  }, [latest]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await create({
      data: {
        token,
        donor_name: String(form.get("donor_name") ?? ""),
        packets: Number(form.get("packets") ?? 0),
      },
    });
    if (!result.ok || !result.tokenRow) {
      toast.error(result.error ?? "Could not create the token");
      return;
    }
    setLatest({
      code: result.tokenRow.code,
      donor: result.tokenRow.donor_name,
      packets: result.tokenRow.packets,
    });
    refresh();
    toast.success("Token created");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6">
        <Panel title="Generate token" subtitle="The packet count stays hidden inside the code">
          <form onSubmit={submit} className="p-4 space-y-3">
            <Field label="Donor name">
              <input name="donor_name" className={inputClass} required />
            </Field>
            <Field label="Number of packets">
              <input name="packets" type="number" min="1" className={inputClass} defaultValue="10" required />
            </Field>
            <Btn variant="solid" className="w-full py-2" type="submit">
              Create token
            </Btn>
          </form>
        </Panel>

        {latest && (
          <section className="rounded-[14px] bg-forest-deep text-cream shadow-xl ring-1 ring-black/20 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
              <span className="text-[11px] uppercase tracking-[0.14em] text-sage">{latest.code}</span>
              <span className="text-[11px] text-sage">Ready to share</span>
            </div>
            <div className="p-4 flex gap-4 items-center">
              {qr && (
                <img
                  src={qr}
                  alt={`QR code for token ${latest.code}`}
                  className="size-28 rounded-[10px] bg-cream"
                  width={512}
                  height={512}
                />
              )}
              <div className="min-w-0">
                <p className="font-display text-3xl leading-none">{latest.packets}</p>
                <p className="text-xs text-sage">packets hidden in token</p>
                <p className="mt-2 text-xs text-cream/90">Donor: {latest.donor}</p>
              </div>
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={async () => {
                  const how = await shareTokenCard(latest.code, latest.donor);
                  toast.success(how === "shared" ? "Token shared" : "Token image saved");
                }}
                className="w-full text-xs font-semibold py-2 rounded-md bg-saffron text-forest-deep hover:bg-saffron/90"
              >
                ↗ Share token image
              </button>
            </div>
          </section>
        )}
      </div>

      <Panel
        title="Issued tokens"
        subtitle={`${data.tokens.filter((t) => t.status === "active").length} still to be supplied`}
        className="lg:col-span-2"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/5">
                <Th>Code</Th>
                <Th>Donor</Th>
                <Th>Packets</Th>
                <Th>Status</Th>
                <Th right>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {data.tokens.map((t) => (
                <tr key={t.id} className="hover:bg-glass/50">
                  <td className="px-4 py-3 text-moss/80">{t.code}</td>
                  <td className="px-4 py-3 font-medium text-ink">{t.donor_name}</td>
                  <td className="px-4 py-3 text-ink/80">{t.packets}</td>
                  <td className="px-4 py-3">
                    <Pill tone={t.status === "active" ? "forest" : "present"}>
                      {t.status === "active" ? "Active" : `Supplied by ${t.redeemed_by ?? "—"}`}
                    </Pill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Btn
                        onClick={() =>
                          setLatest({ code: t.code, donor: t.donor_name, packets: t.packets })
                        }
                      >
                        Show QR
                      </Btn>
                      <Btn
                        variant="danger"
                        onClick={async () => {
                          await remove({ data: { token, table: "tokens", id: t.id } });
                          refresh();
                        }}
                      >
                        Delete
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {!data.tokens.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-moss/70">
                    No tokens created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
