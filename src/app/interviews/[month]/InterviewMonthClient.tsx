"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const STORAGE_PREFIX = "enroll-interviews-";
const API_KEY_PREFIX = "interviews-";

const INTERVIEW_STATUSES = [
  { value: "confirmed", labelKey: "confirmed" as const, color: "green" as const },
  { value: "awaiting-reply", labelKey: "awaiting" as const, color: "yellow" as const },
  { value: "annulled", labelKey: "annulled" as const, color: "red" as const },
];

const STATUS_COLORS: Record<string, "red" | "yellow" | "green"> = {
  annulled: "red",
  "awaiting-reply": "yellow",
  confirmed: "green",
};

function StatusDot({ status, size = "md", title }: { status: string; size?: "sm" | "md"; title?: string }) {
  const color = STATUS_COLORS[status] ?? "yellow";
  const sizeClass = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${sizeClass} ${
        color === "red"
          ? "bg-red-500"
          : color === "yellow"
            ? "bg-amber-400"
            : "bg-emerald-500"
      }`}
      title={title ?? status}
      aria-hidden
    />
  );
}

function StatusDropdown({
  value,
  onChange,
  size = "md",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = INTERVIEW_STATUSES.find((s) => s.value === value) ?? INTERVIEW_STATUSES[1];

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-left text-sm text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <StatusDot status={current.value} size={size} title={t(current.labelKey)} />
        <span>{t(current.labelKey)}</span>
        <span className="ml-0.5 text-zinc-400">▼</span>
      </button>
      {open && (
        <ul
          className="absolute left-0 top-full z-10 mt-1 min-w-[10rem] rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-600 dark:bg-zinc-800"
          role="listbox"
        >
          {INTERVIEW_STATUSES.map((s) => (
            <li key={s.value} role="option" aria-selected={value === s.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(s.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-700"
              >
                <StatusDot status={s.value} size={size} title={t(s.labelKey)} />
                <span>{t(s.labelKey)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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

function normalizeInterviews(raw: unknown): Interview[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Record<string, unknown>[]).map((i) => ({
    id: String(i?.id ?? uid()),
    applicant: String(i?.applicant ?? ""),
    dateTime: String(i?.dateTime ?? ""),
    status: String(i?.status ?? INTERVIEW_STATUSES[1].value),
  }));
}

export default function InterviewMonthClient({
  month,
  label,
}: {
  month: string;
  label: string;
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [applicant, setApplicant] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [status, setStatus] = useState(INTERVIEW_STATUSES[1].value);

  const apiKey = API_KEY_PREFIX + month;

  useEffect(() => {
    if (user?.token) {
      fetch("/api/user/data/" + encodeURIComponent(apiKey), {
        headers: { Authorization: "Bearer " + user.token },
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setInterviews(normalizeInterviews(data)))
        .catch(() => setInterviews(loadInterviews(month)));
    } else {
      setInterviews(loadInterviews(month));
    }
  }, [month, apiKey, user?.userId, user?.token]);

  const persist = useCallback(
    (list: Interview[]) => {
      setInterviews(list);
      if (user?.token) {
        fetch("/api/user/data/" + encodeURIComponent(apiKey), {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + user.token },
          body: JSON.stringify(list),
        }).catch(() => {});
      } else {
        saveInterviews(month, list);
      }
    },
    [month, apiKey, user?.token]
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
    setStatus(INTERVIEW_STATUSES[1].value);
    setShowForm(false);
  }, [interviews, applicant, dateTime, status, persist]);

  const removeInterview = useCallback(
    (id: string) => {
      persist(interviews.filter((i) => i.id !== id));
    },
    [interviews, persist]
  );

  const updateStatus = useCallback(
    (id: string, newStatus: string) => {
      const next = interviews.map((i) =>
        i.id === id ? { ...i, status: newStatus } : i
      );
      persist(next);
    },
    [interviews, persist]
  );

  const updateInterview = useCallback(
    (id: string, patch: Partial<Pick<Interview, "applicant" | "dateTime">>) => {
      const next = interviews.map((i) =>
        i.id === id ? { ...i, ...patch } : i
      );
      persist(next);
    },
    [interviews, persist]
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {label}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Schedule and manage interviews for {label}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xl text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          aria-label={t("addInterview")}
        >
          +
        </button>
      </div>

      {showForm && (
        <div className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("applicant")}</label>
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
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("dateTime")}</label>
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
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("status")}</label>
            <div className="mt-1">
              <StatusDropdown value={status} onChange={setStatus} size="md" />
            </div>
          </div>
          <button
            type="button"
            onClick={addInterview}
            className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {t("addInterview")}
          </button>
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t("applicant")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t("dateTime")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t("status")}
              </th>
              <th className="px-6 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {interviews.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {t("noInterviewsThisMonth")}
                </td>
              </tr>
            ) : (
              interviews.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-2 align-middle">
                    <input
                      type="text"
                      value={i.applicant}
                      onChange={(e) =>
                        updateInterview(i.id, { applicant: e.target.value })
                      }
                      className="w-full min-w-[8rem] rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                      placeholder={t("applicant")}
                      aria-label={t("applicant")}
                    />
                  </td>
                  <td className="px-6 py-2 align-middle">
                    <input
                      type="text"
                      value={i.dateTime}
                      onChange={(e) =>
                        updateInterview(i.id, { dateTime: e.target.value })
                      }
                      className="w-full min-w-[8rem] rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      placeholder={t("dateTime")}
                      aria-label={t("dateTime")}
                    />
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <StatusDropdown
                      value={INTERVIEW_STATUSES.some((s) => s.value === i.status) ? i.status : INTERVIEW_STATUSES[1].value}
                      onChange={(v) => updateStatus(i.id, v)}
                      size="sm"
                    />
                  </td>
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
