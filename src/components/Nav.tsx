import Link from "next/link";
import { Suspense } from "react";
import NavRight from "./NavRight";

function NavRightFallback() {
  return (
    <div className="flex items-center gap-4">
      <span
        className="inline-flex rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400"
        aria-hidden
      >
        Light · Dark · System
      </span>
      <Link
        href="/login"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        Log in
      </Link>
    </div>
  );
}

export default function Nav() {
  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-8 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Dashboard
          </Link>
          <div className="flex gap-6">
            <Link
              href="/enrollments-2027"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Enrollments
            </Link>
            <Link
              href="/interviews"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Interviews
            </Link>
            <Link
              href="/internships"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Internships
            </Link>
          </div>
        </div>
        <Suspense fallback={<NavRightFallback />}>
          <NavRight />
        </Suspense>
      </div>
    </nav>
  );
}
