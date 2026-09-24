import QRCode from "qrcode";

export async function makeQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 512,
    margin: 2,
    color: { dark: "#142a1e", light: "#efe9dc" },
  });
}

/** Builds a shareable token card: QR + donor name only. The packet count stays hidden. */
export async function makeTokenCard(code: string, donorName: string): Promise<Blob> {
  const qr = await makeQrDataUrl(code);
  const image = new Image();
  image.src = qr;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 820;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#142a1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#efe9dc";
  ctx.font = "600 34px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("Mamburam Aandu Nercha", canvas.width / 2, 70);
  ctx.font = "400 20px Inter, sans-serif";
  ctx.fillStyle = "#9fb4a3";
  ctx.fillText("Food distribution token", canvas.width / 2, 104);

  ctx.fillStyle = "#efe9dc";
  ctx.fillRect(64, 140, 512, 512);
  ctx.drawImage(image, 64, 140, 512, 512);

  ctx.fillStyle = "#efe9dc";
  ctx.font = "600 26px Inter, sans-serif";
  ctx.fillText(donorName, canvas.width / 2, 706);
  ctx.font = "400 18px Inter, sans-serif";
  ctx.fillStyle = "#9fb4a3";
  ctx.fillText(code, canvas.width / 2, 740);
  ctx.fillText("Show this at the distribution counter", canvas.width / 2, 776);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), "image/png"));
}

export async function shareTokenCard(code: string, donorName: string) {
  const blob = await makeTokenCard(code, donorName);
  const file = new File([blob], `${code}.png`, { type: "image/png" });
  const shareable = navigator.canShare?.({ files: [file] });
  if (navigator.share && shareable) {
    await navigator.share({ files: [file], title: `Nercha token ${code}` });
    return "shared";
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${code}.png`;
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
