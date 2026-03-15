"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FlowTernLogo from "@/components/FlowTernLogo";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { isLoggedIn, login } = useAuth();
  const router = useRouter();
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
      login(remember);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
        <main className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            FlowTern — enrollments, interviews by month, and internships by class.
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
      <div className="relative flex-1 flex flex-col justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] dark:[mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-8 w-full flex flex-col justify-center">
          <header className="text-center mb-10 flex-shrink-0">
            <h1 className="flex flex-col items-center gap-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
              <FlowTernLogo size={64} className="justify-center" />
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              Manage classes, interviews by month, and internships in one place.
            </p>
          </header>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-14 lg:items-center flex-shrink-0">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/15 w-fit">
                  Enrollments by year
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 dark:bg-amber-500/15 w-fit">
                  Interviews by month
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 dark:bg-red-500/15 w-fit">
                  Internships by class
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                Sign in to get started.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-[280px] rounded-xl border border-zinc-200/60 bg-white p-4 shadow-lg shadow-zinc-200/50 ring-1 ring-zinc-200/50 transition-shadow hover:shadow-xl dark:border-zinc-800/60 dark:bg-zinc-900/95 dark:shadow-zinc-950/50 dark:ring-zinc-800/50">
                <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Sign in
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Use your email and password.
                </p>
                <form onSubmit={handleSubmit} className="mt-3 space-y-3">
                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2">{error}</p>
                  )}
                  <div>
                    <label htmlFor="home-email" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Email</label>
                    <input
                      id="home-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-400/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-800 dark:focus:ring-zinc-500/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="home-password" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Password</label>
                    <input
                      id="home-password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-400/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-800 dark:focus:ring-zinc-500/20"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-zinc-900 transition focus:ring-2 focus:ring-zinc-400 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-800" />
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Keep me logged in</span>
                    </label>
                    <Link href="/forgot-password" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 whitespace-nowrap transition-colors">Forgot password?</Link>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 hover:shadow disabled:opacity-50"
                  >
                    {loading ? "Signing in…" : "Sign in"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
