const encoder = new TextEncoder();

function bytes(value: string): Uint8Array<ArrayBuffer> {
  const src = encoder.encode(value);
  const out = new Uint8Array(new ArrayBuffer(src.length));
  out.set(src);
  return out;
}

export type Role = "admin" | "incharge" | "student" | "distributor";

export type Session = {
  role: Role;
  id: string;
  name: string;
  loginId: string;
  exp: number;
};

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env["NERCHA_SESSION_SECRET"];
  if (!secret) throw new Error("Session secret is not configured");
  return crypto.subtle.importKey(
    "raw",
    bytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signSession(payload: Omit<Session, "exp">): Promise<string> {
  const body: Session = { ...payload, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 };
  const data = b64url(bytes(JSON.stringify(body)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), bytes(data));
  return `${data}.${b64url(new Uint8Array(sig))}`;
}

export async function readSession(token: string | null | undefined): Promise<Session | null> {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const ok = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(),
    fromB64url(sig),
    bytes(data),
  );
  if (!ok) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(data))) as Session;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function requireRole(token: string | undefined, ...roles: Role[]): Promise<Session> {
  const session = await readSession(token);
  if (!session || !roles.includes(session.role)) throw new Error("Not authorised");
  return session;
}

export async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
