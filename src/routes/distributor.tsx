import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell, Loading } from "@/components/nercha/AppShell";
import { Btn, Field, Panel, Pill, inputClass } from "@/components/nercha/ui";
import { lookupToken, redeemToken } from "@/lib/nercha.functions";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/distributor")({
  head: () => ({
    meta: [
      { title: "Food distributor — Mamburam Aandu Nercha" },
      {
        name: "description",
        content: "Scan a donor token and supply the exact number of food packets it carries.",
      },
      { property: "og:title", content: "Food distributor — Mamburam Aandu Nercha" },
      {
        property: "og:description",
        content: "Scan, verify and hand over the packets recorded on each donor token.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DistributorPage,
});

type Found = { code: string; donor_name: string; packets: number; status: string };

function DistributorPage() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const lookup = useServerFn(lookupToken);
  const redeem = useServerFn(redeemToken);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState<Found | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && (!session || session.role !== "distributor")) void navigate({ to: "/login" });
  }, [ready, session, navigate]);

  const token = session?.token ?? "";

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  useEffect(() => stopCamera, []);

  async function check(code: string) {
    const result = await lookup({ data: { token, code } });
    if (!result.tokenRow) {
      toast.error(result.error ?? "Token not found");
      return false;
    }
    setFound({
      code: result.tokenRow.code,
      donor_name: result.tokenRow.donor_name,
      packets: result.tokenRow.packets,
      status: result.tokenRow.status,
    });
    return true;
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setScanning(true);
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      const tick = async () => {
        const canvas = canvasRef.current;
        if (!canvas || !videoRef.current || !streamRef.current) return;
        const v = videoRef.current;
        if (v.readyState === v.HAVE_ENOUGH_DATA) {
          canvas.width = v.videoWidth;
          canvas.height = v.videoHeight;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(image.data, image.width, image.height);
          if (result?.data) {
            stopCamera();
            const ok = await check(result.data.trim());
            if (!ok) toast.error("That code is not a Nercha token");
            return;
          }
        }
        rafRef.current = requestAnimationFrame(() => void tick());
      };
      rafRef.current = requestAnimationFrame(() => void tick());
    } catch {
      toast.error("Camera not available. Type the token code instead.");
      setScanning(false);
    }
  }

  if (!ready || !session) return <Loading />;

  return (
    <AppShell title="Food distributor" who={`${session.name} · distributor`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Scan donor token" subtitle="Point the camera at the QR code on the donor's token">
          <div className="p-4 space-y-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-[12px] bg-forest-deep grid place-items-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`size-full object-cover ${scanning ? "" : "hidden"}`}
              />
              {!scanning && (
                <p className="text-xs text-sage px-6 text-center">
                  The camera preview appears here while scanning.
                </p>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            {scanning ? (
              <Btn className="w-full py-2" onClick={stopCamera}>
                Stop scanning
              </Btn>
            ) : (
              <Btn variant="solid" className="w-full py-2" onClick={() => void startCamera()}>
                Start camera scan
              </Btn>
            )}

            <form
              className="pt-3 border-t border-black/5 space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                await check(String(form.get("code") ?? ""));
              }}
            >
              <Field label="Or type the token code">
                <input name="code" className={inputClass} placeholder="NERCHA-…" required />
              </Field>
              <Btn className="w-full py-2" type="submit">
                Check token
              </Btn>
            </form>
          </div>
        </Panel>

        <Panel title="Token details" subtitle="Supply exactly the number of packets shown">
          {found ? (
            <div className="p-5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-moss/70">{found.code}</p>
              <p className="mt-3 font-display text-6xl leading-none text-ink">{found.packets}</p>
              <p className="text-sm text-moss/80">food packets</p>
              <p className="mt-4 text-sm text-ink">
                Donor: <span className="font-semibold">{found.donor_name}</span>
              </p>
              <div className="mt-3">
                <Pill tone={found.status === "active" ? "forest" : "absent"}>
                  {found.status === "active" ? "Not yet supplied" : "Already supplied"}
                </Pill>
              </div>
              {found.status === "active" && (
                <Btn
                  variant="solid"
                  className="mt-5 w-full py-2.5"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    const result = await redeem({ data: { token, code: found.code } });
                    setBusy(false);
                    if (!result.ok) {
                      toast.error(result.error ?? "Could not mark it supplied");
                      return;
                    }
                    setFound({ ...found, status: "redeemed" });
                    toast.success(`${result.packets} packets handed over`);
                  }}
                >
                  Confirm {found.packets} packets handed over
                </Btn>
              )}
            </div>
          ) : (
            <p className="px-5 py-8 text-sm text-moss/70">
              Scan a token or type its code to see how many packets to hand over.
            </p>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
