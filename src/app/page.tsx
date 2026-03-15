"use client";

import Link from "next/link";
import { useState } from "react";
import FlowTernLogo from "@/components/FlowTernLogo";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { isLoggedIn, ready, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Sign in failed.");
        return;
      }
      login(remember, data.userId, data.token);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
        <main className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Your hub for enrollments, interviews, and internships.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <Link
              href="/enrollments-2027"
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Enrollments
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Manage 2027 enrollments.
              </p>
            </Link>
            <Link
              href="/interviews"
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Interviews
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                By month (Jan–Dec 2026).
              </p>
            </Link>
            <Link
              href="/internships"
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Internships
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Class 1 and Class 2.
              </p>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] font-sans flex flex-col">
      <div className="relative flex-1 flex flex-col justify-center bg-[#f3f3f3] dark:bg-zinc-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e8e8e8_1px,transparent_1px),linear-gradient(to_bottom,#e8e8e8_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] dark:[mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-8 w-full flex flex-col justify-center">
          <header className="text-center mb-10 flex-shrink-0">
            <h1 className="flex flex-col items-center gap-3">
              <FlowTernLogo size={320} markOnly className="justify-center" />
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              All in one place.
            </p>
          </header>
          <div className="flex flex-col items-center gap-8 flex-shrink-0 max-w-md mx-auto">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: 'rgba(30, 30, 78, 0.15)', color: '#1e1e4e' }}>
                  Enrollments by year
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: 'rgba(163, 0, 49, 0.15)', color: '#a30031' }}>
                  Interviews by month
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: 'rgba(181, 23, 97, 0.15)', color: '#b51761' }}>
                  Internships by class
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                Sign in to get started.
              </p>
            </div>
            <div className="w-full flex justify-center">
              <div className="w-full max-w-[220px] rounded-lg border border-zinc-200/60 bg-white p-3 shadow-md dark:border-zinc-800/60 dark:bg-zinc-900/95">
                <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Sign in
                </h2>
                <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  Email and password.
                </p>
                <form onSubmit={handleSubmit} className="mt-2.5 space-y-2.5">
                  {error && (
                    <p className="text-xs text-red-600 dark:text-red-400 rounded bg-red-50 dark:bg-red-950/30 px-2 py-1.5">{error}</p>
                  )}
                  <div>
                    <label htmlFor="home-email" className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">Email</label>
                    <input
                      id="home-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded border border-zinc-200 bg-zinc-50/50 px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="home-password" className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">Password</label>
                    <input
                      id="home-password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded border border-zinc-200 bg-zinc-50/50 px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:placeholder-zinc-500"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800" />
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="text-[11px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Forgot?</Link>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Signing in…" : "Sign in"}
                  </button>
                  <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                    No account? <Link href="/register" className="font-medium text-primary hover:underline">Create one</Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
