export default function Enrollments2027Page() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Enrollments 2027
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage student enrollments for 2027.
        </p>
        <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td colSpan={2} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No enrollments yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
