export default function InternshipsClass2Page() {
  return (
    <>
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Internships — Class 2
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Manage internship positions and applications for Class 2.
      </p>
      <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Company / Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            <tr>
              <td colSpan={3} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No internships yet for Class 2.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
