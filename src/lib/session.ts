import { useEffect, useState } from "react";

export type Role = "admin" | "incharge" | "student" | "distributor";

export type StoredSession = {
  token: string;
  role: Role;
  name: string;
  loginId: string;
};

const KEY = "nercha.session";

export function saveSession(session: StoredSession) {
  localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("nercha-session"));
}

export function clearSession() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("nercha-session"));
}

export function getSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function useSession() {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setSession(getSession());
      setReady(true);
    };
    sync();
    window.addEventListener("nercha-session", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("nercha-session", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { session, ready };
}

export const homeForRole: Record<Role, string> = {
  admin: "/admin",
  incharge: "/incharge",
  student: "/student",
  distributor: "/distributor",
};
