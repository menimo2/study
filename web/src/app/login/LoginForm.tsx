"use client";

import { useState, type FormEvent } from "react";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "ההתחברות נכשלה");
        setPending(false);
        return;
      }
      window.location.href = "/";
    } catch {
      setError("ההתחברות נכשלה");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        שם משתמש
        <input
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2.5 text-base font-normal outline-none focus:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        סיסמה
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2.5 text-base font-normal outline-none focus:border-accent"
        />
      </label>
      {error ? <p className="text-sm text-[#e74c3c]">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg bg-accent px-4 py-2.5 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "מתחבר…" : "כניסה"}
      </button>
    </form>
  );
}
