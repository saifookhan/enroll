import Link from "next/link";
import { INTERVIEW_MONTHS } from "./interview-months";

export default function InterviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Interviews
            </h1>
            <nav className="flex flex-wrap gap-2">
              {INTERVIEW_MONTHS.map(({ slug, label }) => (
                <Link
                  key={slug}
                  href={`/interviews/${slug}`}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
