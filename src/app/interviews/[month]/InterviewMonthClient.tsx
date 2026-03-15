"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "enroll-interviews-";

type Interview = {
  id: string;
  applicant: string;
  dateTime: string;
  status: string;
};

function uid() {
  return Math.random().toString(36).slice(2);
}

function loadInterviews(month: string): Interview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + month);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Interview[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveInterviews(month: string, list: Interview[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_PREFIX + month, JSON.stringify(list));
}

export default function InterviewMonthClient({
  month,
  label,
}: {
  month: string;
  label: string;
}) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [applicant, setApplicant] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setInterviews(loadInterviews(month));
  }, [month]);

  const persist = useCallback(
    (list: Interview[]) => {
      setInterviews(list);
      saveInterviews(month, list);
    },
    [month]
  );

  const addInterview = useCallback(() => {
    if (!applicant.trim()) return;
    const next = [
      ...interviews,
      {
        id: uid(),
        applicant: applicant.trim(),
        dateTime: dateTime.trim(),
        status: status.trim(),
      },
    ];
    persist(next);
    setApplicant("");
    setDateTime("");
    setStatus("");
    setShowForm(false);
  }, [interviews, applicant, dateTime, status, persist]);

  const removeInterview = useCallback(
    (id: string) => {
      persist(interviews.filter((i) => i.id !== id));
    },
    [interviews, persist]
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Interviews — {label}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Schedule and manage interviews for {label}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xl text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          aria-label="Add interview"
        >
          +
        </button>
      </div>

      {showForm && (
        <div className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Applicant</label>
            <input
              type="text"
              value={applicant}
              onChange={(e) => setApplicant(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addInterview()}
              placeholder="Name"
              className="mt-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 min-w-[160px]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Date & time</label>
            <input
              type="text"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addInterview()}
              placeholder="e.g. 15 Jan, 10:00"
              className="mt-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 min-w-[140px]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Status</label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addInterview()}
              placeholder="e.g. Scheduled"
              className="mt-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 min-w-[100px]"
            />
          </div>
          <button
            type="button"
            onClick={addInterview}
            className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Add interview
          </button>
        </div>
      )}

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
              <th className="px-6 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {interviews.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No interviews scheduled for this month. Use the + button to add one.
                </td>
              </tr>
            ) : (
              interviews.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-3 text-sm text-zinc-900 dark:text-zinc-50">{i.applicant || "—"}</td>
                  <td className="px-6 py-3 text-sm text-zinc-700 dark:text-zinc-300">{i.dateTime || "—"}</td>
                  <td className="px-6 py-3 text-sm text-zinc-700 dark:text-zinc-300">{i.status || "—"}</td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      onClick={() => removeInterview(i.id)}
                      className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                      aria-label="Remove interview"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
