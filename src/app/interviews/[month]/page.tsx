import { notFound } from "next/navigation";
import { INTERVIEW_MONTHS } from "../interview-months";

const SLUGS: Set<string> = new Set(INTERVIEW_MONTHS.map((m) => m.slug));

export function generateStaticParams() {
  return INTERVIEW_MONTHS.map(({ slug }) => ({ month: slug }));
}

function monthLabel(slug: string): string {
  const found = INTERVIEW_MONTHS.find((m) => m.slug === slug);
  return found ? found.label : slug;
}

export default async function InterviewMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  if (!SLUGS.has(month)) notFound();
  const label = monthLabel(month);

  return (
    <>
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Interviews — {label}
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Schedule and manage interviews for {label}.
      </p>
      <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Date & time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            <tr>
              <td colSpan={3} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No interviews scheduled for this month.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
