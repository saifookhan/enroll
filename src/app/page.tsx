import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Enrollments 2027, interviews by month, and internships by class.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <Link
            href="/enrollments-2027"
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Enrollments 2027
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
