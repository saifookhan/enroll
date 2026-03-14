import Link from "next/link";

export default function InternshipsPage() {
  return (
    <>
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Internships
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Manage internship programs by class. Choose a class below.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Link
          href="/internships/class-1"
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Class 1
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Positions and applications for Class 1.
          </p>
        </Link>
        <Link
          href="/internships/class-2"
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Class 2
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Positions and applications for Class 2.
          </p>
        </Link>
      </div>
    </>
  );
}
