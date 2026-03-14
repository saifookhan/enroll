import Link from "next/link";
import { INTERVIEW_MONTHS } from "./interview-months";

export default function InterviewsPage() {
  return (
    <>
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Interviews
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Select a month to view and manage interviews (January–December 2026).
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {INTERVIEW_MONTHS.map(({ slug, label }) => (
          <Link
            key={slug}
            href={`/interviews/${slug}`}
            className="rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
