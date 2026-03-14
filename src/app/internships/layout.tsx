import Link from "next/link";

export default function InternshipsLayout({
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
              Internships
            </h1>
            <div className="flex gap-4">
              <Link
                href="/internships"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Overview
              </Link>
              <Link
                href="/internships/class-1"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Class 1
              </Link>
              <Link
                href="/internships/class-2"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Class 2
              </Link>
            </div>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
