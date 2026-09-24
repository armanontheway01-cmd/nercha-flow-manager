import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Ambient, Field, inputClass } from "@/components/nercha/ui";
import { login } from "@/lib/nercha.functions";
import { homeForRole, saveSession, type Role } from "@/lib/session";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · Mamburam Aandu Nercha" },
      {
        name: "description",
        content:
          "Sign in to the Mamburam Aandu Nercha distribution console as head teacher, duty incharge, student volunteer or food distributor.",
      },
      { property: "og:title", content: "Sign in · Mamburam Aandu Nercha" },
      {
        property: "og:description",
        content: "Head teacher, incharge, student volunteer and food distributor sign-in.",
      },
    ],
  }),
  component: LoginPage,
});

const roles: { key: Role; label: string; hint: string }[] = [
  { key: "admin", label: "Head teacher", hint: "Your mobile number and password" },
  { key: "incharge", label: "Incharge", hint: "Login given to you by the head teacher" },
  { key: "student", label: "Student", hint: "Your admission number as both username and password" },
  { key: "distributor", label: "Food distributor", hint: "Login given to you by the head teacher" },
];

function LoginPage() {
  const navigate = useNavigate();
  const doLogin = useServerFn(login);
  const [role, setRole] = useState<Role>("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const active = roles.find((r) => r.key === role)!;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await doLogin({ data: { role, username, password } });
      if (!result.session) {
        setError(result.error ?? "Wrong login details");
        return;
      }
      saveSession({
        token: result.session.token,
        role: result.session.role as Role,
        name: result.session.name,
        loginId: result.session.loginId,
      });
      navigate({ to: homeForRole[result.session.role as Role] });
    } catch {
      setError("Could not sign in just now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-paper text-ink font-sans antialiased relative overflow-x-hidden">
      <Ambient />
      <div className="relative mx-auto max-w-[520px] px-6 py-16">
        <p className="text-[11px] uppercase tracking-[0.14em] text-moss/70">
          Darul Huda Islamic University
        </p>
        <h1 className="font-display text-4xl leading-tight mt-1">Mamburam Aandu Nercha</h1>
        <p className="mt-2 text-sm text-moss/80">Sign in to manage or view your duty.</p>

        <div className="mt-6 flex flex-wrap items-center gap-1 rounded-[12px] bg-cream/70 backdrop-blur-md ring-1 ring-black/5 p-1 w-fit">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => {
                setRole(r.key);
                setError(null);
              }}
              className={`px-4 py-2 text-sm rounded-[10px] ${
                role === r.key ? "bg-forest text-cream font-semibold shadow-sm" : "text-moss/70"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={submit}
          className="mt-5 rounded-[14px] bg-glass/60 backdrop-blur-xl ring-1 ring-black/5 shadow-lg p-5 space-y-4"
        >
          <p className="text-xs text-moss/70">{active.hint}</p>
          <Field label={role === "student" ? "Admission number" : "User ID"}>
            <input
              className={inputClass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </Field>
          <Field label="Password">
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>
          {error && <p className="text-xs font-medium text-absent">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-md bg-forest text-cream text-sm font-semibold hover:bg-forest-deep disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
