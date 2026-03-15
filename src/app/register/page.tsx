"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          ...(setupKey ? { setupSecret: setupKey } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }
      login(true, data.userId, data.token);
      router.push("/");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-[280px] rounded-xl border border-zinc-200/60 bg-white p-4 shadow-lg dark:border-zinc-800/60 dark:bg-zinc-900/95">
        <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create account
        </h1>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Set up your FlowTern login.
        </p>
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="reg-email" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Password (min 6 characters)
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>
          <div>
            <label htmlFor="reg-setup" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Setup key <span className="text-zinc-400">(if required)</span>
            </label>
            <input
              id="reg-setup"
              type="password"
              autoComplete="off"
              value={setupKey}
              onChange={(e) => setSetupKey(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="font-medium text-primary hover:underline">Back to sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
