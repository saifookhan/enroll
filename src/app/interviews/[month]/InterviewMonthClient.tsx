"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { GradeDot } from "@/components/GradeDot";
import { GRADE_DOT_COLORS, GRADE_OPTIONS, normalizeGrade } from "@/lib/gradeShared";

const STORAGE_PREFIX = "enroll-interviews-";
const API_KEY_PREFIX = "interviews-";
const SLOT_COUNT = 4;
const DEFAULT_SLOT_STATUS = "awaiting-reply";
const VALID_INTERVIEW_STATUSES = new Set(["confirmed", "awaiting-reply", "annulled"]);

type InterviewSlot = {
  time: string;
  firstName: string;
  lastName: string;
  status: string;
  outcome: string;
  notes: string;
};

function emptySlots(): InterviewSlot[] {
  return Array.from({ length: SLOT_COUNT }, () => ({
    time: "",
    firstName: "",
    lastName: "",
    status: DEFAULT_SLOT_STATUS,
    outcome: "",
    notes: "",
  }));
}

function normalizeSlotStatus(raw: string, slotIndex: number, rowFallback?: string): string {
  const v = raw.trim();
  if (VALID_INTERVIEW_STATUSES.has(v)) return v;
  if (slotIndex === 0 && rowFallback && VALID_INTERVIEW_STATUSES.has(rowFallback.trim())) {
    return rowFallback.trim();
  }
  return DEFAULT_SLOT_STATUS;
}

function coerceSlotStatus(raw: string): string {
  const v = raw.trim();
  return VALID_INTERVIEW_STATUSES.has(v) ? v : DEFAULT_SLOT_STATUS;
}

/** Da stringa unica (dati vecchi) a nome + cognome (ultima parola = cognome). */
function splitLegacyFullName(raw: string): { firstName: string; lastName: string } {
  const t = raw.trim();
  if (!t) return { firstName: "", lastName: "" };
  const i = t.lastIndexOf(" ");
  if (i <= 0) return { firstName: t, lastName: "" };
  return { firstName: t.slice(0, i).trim(), lastName: t.slice(i + 1).trim() };
}

function normalizeSlots(
  raw: unknown,
  row?: { status: string; outcome: string; notes: string }
): InterviewSlot[] {
  const base = emptySlots();
  if (!Array.isArray(raw)) return base;
  for (let i = 0; i < SLOT_COUNT; i++) {
    const s = raw[i] as Record<string, unknown> | undefined;
    if (!s) {
      if (i === 0 && row) {
        base[i] = {
          ...base[i],
          status: normalizeSlotStatus("", 0, row.status),
          outcome: normalizeGrade(row.outcome),
          notes: row.notes ?? "",
        };
      }
      continue;
    }
    let firstName = String(s.firstName ?? "").trim();
    let lastName = String(s.lastName ?? "").trim();
    const nameSingle = String(s.name ?? "").trim();
    if (nameSingle && !firstName && !lastName) {
      const sp = splitLegacyFullName(nameSingle);
      firstName = sp.firstName;
      lastName = sp.lastName;
    }
    let outcome = normalizeGrade(String(s.outcome ?? ""));
    if (!outcome && i === 0 && row?.outcome) outcome = normalizeGrade(row.outcome);
    let notes = String(s.notes ?? "");
    if (!notes.trim() && i === 0 && row?.notes) notes = row.notes;
    const status = normalizeSlotStatus(String(s.status ?? ""), i, row?.status);
    base[i] = {
      time: String(s.time ?? ""),
      firstName,
      lastName,
      status,
      outcome,
      notes,
    };
  }
  return base;
}

/** Chronological by `date` (yyyy-mm-dd); rows without a date last. */
function compareInterviewByDate(a: Interview, b: Interview): number {
  const da = a.date.trim();
  const db = b.date.trim();
  const emptyA = !da;
  const emptyB = !db;
  if (emptyA && emptyB) return 0;
  if (emptyA) return 1;
  if (emptyB) return -1;
  return da.localeCompare(db);
}

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
  compact = false,
  className = "",
  buttonClassName = "",
}: {
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
  compact?: boolean;
  className?: string;
  buttonClassName?: string;
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

  const btnCl = compact
    ? "inline-flex items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-1 text-left text-xs text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
    : "inline-flex items-center gap-2 rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-left text-sm text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700";
  return (
    <div ref={ref} className={`relative min-w-0 ${className || "inline-block"}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${btnCl} ${buttonClassName}`.trim()}
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
  date: string;
  slots: InterviewSlot[];
};

function uid() {
  return Math.random().toString(36).slice(2);
}

function loadInterviews(month: string): Interview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + month);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return normalizeInterviews(parsed);
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
  return (raw as Record<string, unknown>[]).map((i) => {
    const id = String(i?.id ?? uid());
    const date = String(i?.date ?? "");
    const rowStatus = String(i?.status ?? DEFAULT_SLOT_STATUS);
    const rowOutcome = String(i?.outcome ?? "");
    const rowNotes = String(i?.notes ?? "");
    const rowFallback = { status: rowStatus, outcome: rowOutcome, notes: rowNotes };

    if (Array.isArray(i?.slots)) {
      return {
        id,
        date,
        slots: normalizeSlots(i.slots, rowFallback),
      };
    }

    const applicant = String(i?.applicant ?? "");
    const dateTime = String(i?.dateTime ?? "");
    const legacySlots = emptySlots();
    if (applicant.trim() || dateTime.trim()) {
      const sp = splitLegacyFullName(applicant);
      legacySlots[0] = {
        ...legacySlots[0],
        time: dateTime,
        firstName: sp.firstName,
        lastName: sp.lastName,
      };
    }
    return {
      id,
      date,
      slots: normalizeSlots(legacySlots, rowFallback),
    };
  });
}

function SlotRows({
  slots,
  onSlotChange,
  compact,
}: {
  slots: InterviewSlot[];
  onSlotChange: (index: number, patch: Partial<InterviewSlot>) => void;
  compact?: boolean;
}) {
  const { t } = useLanguage();
  const ctrlH = compact ? "h-8" : "h-9";
  const labelCl =
    "mb-0 block text-[10px] font-medium uppercase leading-none text-zinc-500 dark:text-zinc-400";
  const inputCl = compact
    ? "rounded border border-zinc-300 bg-white px-1.5 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
    : "rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50";
  const notesCl = compact
    ? `box-border w-full min-w-0 rounded border border-zinc-300 bg-white px-1.5 py-1 text-xs leading-tight dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 ${ctrlH} resize-none overflow-y-auto`
    : `box-border w-full min-w-0 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm leading-tight dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 ${ctrlH} resize-none overflow-y-auto`;
  const gradeSelectBase = (outcome: string) =>
    compact
      ? `box-border h-full min-h-0 w-full min-w-0 rounded border border-zinc-300 bg-white pr-1 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 ${outcome.trim() && GRADE_DOT_COLORS[outcome.trim()] ? "pl-6" : "pl-1.5"}`
    : `box-border h-full min-h-0 w-full min-w-0 rounded-md border border-zinc-300 bg-white pr-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 ${outcome.trim() && GRADE_DOT_COLORS[outcome.trim()] ? "pl-8" : "pl-2"}`;
  const statusBtnExtra = compact
    ? `${ctrlH} !min-h-0 !max-h-none w-full min-w-0 !py-0 !px-2 justify-between gap-1 [&>span:nth-child(2)]:truncate`
    : `${ctrlH} !min-h-0 !max-h-none w-full min-w-0 !py-0 justify-between gap-1 [&>span:nth-child(2)]:truncate`;

  return (
    <div className={compact ? "space-y-1.5" : "space-y-3"}>
      {slots.map((slot, idx) => (
        <div
          key={idx}
          className={
            compact
              ? "rounded border border-zinc-200/90 p-1.5 dark:border-zinc-700"
              : "rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={slot.time}
              onChange={(e) => onSlotChange(idx, { time: e.target.value })}
              placeholder={t("time")}
              className={`${inputCl} w-[4.75rem] shrink-0 sm:w-[5.25rem]`}
              aria-label={t("time")}
            />
            <input
              type="text"
              value={slot.firstName}
              onChange={(e) => onSlotChange(idx, { firstName: e.target.value })}
              placeholder={t("firstName")}
              className={`${inputCl} min-w-[4rem] flex-1`}
              aria-label={t("firstName")}
            />
            <input
              type="text"
              value={slot.lastName}
              onChange={(e) => onSlotChange(idx, { lastName: e.target.value })}
              placeholder={t("lastName")}
              className={`${inputCl} min-w-[4rem] flex-1`}
              aria-label={t("lastName")}
            />
          </div>
          <div
            className={
              compact
                ? "mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,7.5rem)_minmax(0,4.5rem)_minmax(0,1fr)]"
                : "mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,9rem)_minmax(0,5.5rem)_minmax(0,1fr)]"
            }
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className={labelCl}>{t("status")}</span>
              <div className={`min-w-0 ${ctrlH}`}>
                <StatusDropdown
                  value={
                    INTERVIEW_STATUSES.some((s) => s.value === slot.status)
                      ? slot.status
                      : DEFAULT_SLOT_STATUS
                  }
                  onChange={(v) => onSlotChange(idx, { status: v })}
                  size="sm"
                  compact={compact}
                  className="block h-full w-full min-w-0"
                  buttonClassName={statusBtnExtra}
                />
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className={labelCl}>{t("outcome")}</span>
              <div className={`relative min-w-0 ${ctrlH}`}>
                <span className="pointer-events-none absolute left-1.5 top-1/2 z-10 -translate-y-1/2">
                  <GradeDot grade={slot.outcome} size="sm" />
                </span>
                <select
                  value={slot.outcome}
                  onChange={(e) =>
                    onSlotChange(idx, { outcome: normalizeGrade(e.target.value) })
                  }
                  className={gradeSelectBase(slot.outcome)}
                  aria-label={t("outcome")}
                >
                  <option value="">—</option>
                  {GRADE_OPTIONS.filter((g) => g).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className={labelCl}>{t("notes")}</span>
              <textarea
                value={slot.notes}
                onChange={(e) => onSlotChange(idx, { notes: e.target.value })}
                rows={1}
                className={notesCl}
                placeholder={t("notes")}
                aria-label={t("notes")}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
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
  const [date, setDate] = useState("");
  const [formSlots, setFormSlots] = useState<InterviewSlot[]>(() => emptySlots());

  const apiKey = API_KEY_PREFIX + month;

  const sortedInterviews = useMemo(
    () => [...interviews].sort(compareInterviewByDate),
    [interviews]
  );

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
    if (!date.trim()) return;
    const next = [
      ...interviews,
      {
        id: uid(),
        date: date.trim(),
        slots: formSlots.map((s) => ({
          time: s.time.trim(),
          firstName: s.firstName.trim(),
          lastName: s.lastName.trim(),
          status: coerceSlotStatus(s.status),
          outcome: normalizeGrade(s.outcome),
          notes: s.notes.trim(),
        })),
      },
    ];
    persist(next);
    setDate("");
    setFormSlots(emptySlots());
    setShowForm(false);
  }, [interviews, date, formSlots, persist]);

  const removeInterview = useCallback(
    (id: string) => {
      if (typeof window !== "undefined" && !window.confirm(t("confirmRemoveInterviewDay"))) return;
      persist(interviews.filter((i) => i.id !== id));
    },
    [interviews, persist, t]
  );

  const updateDate = useCallback(
    (id: string, newDate: string) => {
      persist(interviews.map((i) => (i.id === id ? { ...i, date: newDate } : i)));
    },
    [interviews, persist]
  );

  const updateSlot = useCallback(
    (id: string, slotIndex: number, patch: Partial<InterviewSlot>) => {
      const next = interviews.map((i) => {
        if (i.id !== id) return i;
        const slots = i.slots.map((s, j) => (j === slotIndex ? { ...s, ...patch } : s));
        return { ...i, slots };
      });
      persist(next);
    },
    [interviews, persist]
  );

  const formSlotChange = useCallback((index: number, patch: Partial<InterviewSlot>) => {
    setFormSlots((prev) => prev.map((s, j) => (j === index ? { ...s, ...patch } : s)));
  }, []);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {label}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {t("manageInterviewsFor")} {label}.
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
        <div className="mt-6 space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("interviewSlotsHint")}</p>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("day")}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <div className="min-w-0 max-w-5xl">
            <SlotRows slots={formSlots} onSlotChange={formSlotChange} />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <button
              type="button"
              onClick={addInterview}
              className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {t("addInterview")}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t("day")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 min-w-[20rem]">
                {t("interviewSlots")}
              </th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {interviews.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {t("noInterviewsThisMonth")}
                </td>
              </tr>
            ) : (
              sortedInterviews.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-2 align-top">
                    <input
                      type="date"
                      value={i.date}
                      onChange={(e) => updateDate(i.id, e.target.value)}
                      className="w-full min-w-[10rem] rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                      aria-label={t("day")}
                    />
                  </td>
                  <td className="px-4 py-2 align-top">
                    <SlotRows
                      slots={i.slots}
                      onSlotChange={(idx, patch) => updateSlot(i.id, idx, patch)}
                      compact
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
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
