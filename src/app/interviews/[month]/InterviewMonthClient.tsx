"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/translations";
import NameSortToggle from "@/components/NameSortToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { compareByNameSort, type NameSortMode } from "@/lib/nameSort";
import { EnrollmentStatusDot } from "@/components/EnrollmentStatusDot";
import {
  ENROLLMENT_STATUS_DOT_COLORS,
  normalizeEnrollmentStatus,
  STATUS_OPTIONS,
} from "@/lib/enrollmentStatusShared";

const STORAGE_PREFIX = "enroll-interviews-";
const API_KEY_PREFIX = "interviews-";
const SLOT_COUNT = 4;

type InterviewSlot = {
  time: string;
  firstName: string;
  lastName: string;
};

function emptySlots(): InterviewSlot[] {
  return Array.from({ length: SLOT_COUNT }, () => ({
    time: "",
    firstName: "",
    lastName: "",
  }));
}

/** Da stringa unica (dati vecchi) a nome + cognome (ultima parola = cognome). */
function splitLegacyFullName(raw: string): { firstName: string; lastName: string } {
  const t = raw.trim();
  if (!t) return { firstName: "", lastName: "" };
  const i = t.lastIndexOf(" ");
  if (i <= 0) return { firstName: t, lastName: "" };
  return { firstName: t.slice(0, i).trim(), lastName: t.slice(i + 1).trim() };
}

function normalizeSlots(raw: unknown): InterviewSlot[] {
  const base = emptySlots();
  if (!Array.isArray(raw)) return base;
  for (let i = 0; i < SLOT_COUNT; i++) {
    const s = raw[i] as Record<string, unknown> | undefined;
    if (!s) continue;
    let firstName = String(s.firstName ?? "").trim();
    let lastName = String(s.lastName ?? "").trim();
    const nameSingle = String(s.name ?? "").trim();
    if (nameSingle && !firstName && !lastName) {
      const sp = splitLegacyFullName(nameSingle);
      firstName = sp.firstName;
      lastName = sp.lastName;
    }
    base[i] = {
      time: String(s.time ?? ""),
      firstName,
      lastName,
    };
  }
  return base;
}

/** Stringa per ordinamento nome. */
function sortDisplayNameFromSlots(slots: InterviewSlot[], locale: Locale): string {
  for (const s of slots) {
    const fn = s.firstName.trim();
    const ln = s.lastName.trim();
    if (!fn && !ln) continue;
    if (locale === "it") return `${ln} ${fn}`.trim();
    return `${fn} ${ln}`.trim();
  }
  return "";
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
  date: string;
  slots: InterviewSlot[];
  notes: string;
  status: string;
  outcome: string;
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
    const status = String(i?.status ?? INTERVIEW_STATUSES[1].value);
    const outcome = normalizeEnrollmentStatus(String(i?.outcome ?? ""));
    const notes = String(i?.notes ?? "");
    const date = String(i?.date ?? "");

    if (Array.isArray(i?.slots)) {
      return {
        id,
        date,
        slots: normalizeSlots(i.slots),
        notes,
        status,
        outcome,
      };
    }

    const applicant = String(i?.applicant ?? "");
    const dateTime = String(i?.dateTime ?? "");
    const legacySlots = emptySlots();
    if (applicant.trim() || dateTime.trim()) {
      const sp = splitLegacyFullName(applicant);
      legacySlots[0] = {
        time: dateTime,
        firstName: sp.firstName,
        lastName: sp.lastName,
      };
    }
    return {
      id,
      date,
      slots: legacySlots,
      notes,
      status,
      outcome,
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
  const inputCl = compact
    ? "rounded border border-zinc-300 bg-white px-1.5 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
    : "rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50";
  return (
    <div className="space-y-2">
      {slots.map((slot, idx) => (
        <div key={idx} className="flex min-w-[14rem] flex-nowrap items-center gap-2">
          <input
            type="text"
            value={slot.time}
            onChange={(e) => onSlotChange(idx, { time: e.target.value })}
            placeholder={t("time")}
            className={`${inputCl} w-[5rem] shrink-0 sm:w-[5.5rem]`}
            aria-label={`${t("time")} ${idx + 1}`}
          />
          <input
            type="text"
            value={slot.firstName}
            onChange={(e) => onSlotChange(idx, { firstName: e.target.value })}
            placeholder={t("firstName")}
            className={`${inputCl} min-w-0 flex-1`}
            aria-label={`${t("firstName")} ${idx + 1}`}
          />
          <input
            type="text"
            value={slot.lastName}
            onChange={(e) => onSlotChange(idx, { lastName: e.target.value })}
            placeholder={t("lastName")}
            className={`${inputCl} min-w-0 flex-1`}
            aria-label={`${t("lastName")} ${idx + 1}`}
          />
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
  const { t, locale } = useLanguage();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState("");
  const [formSlots, setFormSlots] = useState<InterviewSlot[]>(() => emptySlots());
  const [formNotes, setFormNotes] = useState("");
  const [status, setStatus] = useState(INTERVIEW_STATUSES[1].value);
  const [outcome, setOutcome] = useState("");
  const [nameSort, setNameSort] = useState<NameSortMode>("firstName");

  const apiKey = API_KEY_PREFIX + month;

  const sortedInterviews = useMemo(
    () =>
      [...interviews].sort((a, b) =>
        compareByNameSort(
          sortDisplayNameFromSlots(a.slots, locale),
          sortDisplayNameFromSlots(b.slots, locale),
          nameSort,
          locale
        )
      ),
    [interviews, nameSort, locale]
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
        })),
        notes: formNotes.trim(),
        status: status.trim(),
        outcome: normalizeEnrollmentStatus(outcome),
      },
    ];
    persist(next);
    setDate("");
    setFormSlots(emptySlots());
    setFormNotes("");
    setStatus(INTERVIEW_STATUSES[1].value);
    setOutcome("");
    setShowForm(false);
  }, [interviews, date, formSlots, formNotes, status, outcome, persist]);

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

  const updateOutcome = useCallback(
    (id: string, newOutcome: string) => {
      const next = interviews.map((i) =>
        i.id === id ? { ...i, outcome: normalizeEnrollmentStatus(newOutcome) } : i
      );
      persist(next);
    },
    [interviews, persist]
  );

  const updateDate = useCallback(
    (id: string, newDate: string) => {
      persist(interviews.map((i) => (i.id === id ? { ...i, date: newDate } : i)));
    },
    [interviews, persist]
  );

  const updateNotes = useCallback(
    (id: string, newNotes: string) => {
      persist(interviews.map((i) => (i.id === id ? { ...i, notes: newNotes } : i)));
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
          <div className="min-w-0 max-w-3xl">
            <SlotRows slots={formSlots} onSlotChange={formSlotChange} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("notes")}</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full max-w-2xl rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder={t("notes")}
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("status")}</label>
              <div className="mt-1">
                <StatusDropdown value={status} onChange={setStatus} size="md" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("outcome")}</label>
              <div className="relative mt-1 min-w-[10rem]">
                <span className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
                  <EnrollmentStatusDot status={outcome} size="md" />
                </span>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className={`w-full rounded-md border border-zinc-300 bg-white py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 ${ENROLLMENT_STATUS_DOT_COLORS[outcome.trim()] ? "pl-9 pr-3" : "px-3"}`}
                  aria-label={t("outcome")}
                >
                  <option value="">{t("outcome")}</option>
                  {STATUS_OPTIONS.filter((s) => s).map((s) => (
                    <option key={s} value={s}>
                      {t(s)}
                    </option>
                  ))}
                </select>
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
        </div>
      )}

      <NameSortToggle
        value={nameSort}
        onChange={setNameSort}
        className="mt-6 justify-end sm:justify-start"
      />

      <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead>
            <tr>
              <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-12">
                {t("rowIndex")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t("day")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 min-w-[16rem]">
                {t("interviewSlots")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t("status")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t("outcome")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 min-w-[10rem]">
                {t("notes")}
              </th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {interviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {t("noInterviewsThisMonth")}
                </td>
              </tr>
            ) : (
              sortedInterviews.map((i, idx) => (
                <tr key={i.id}>
                  <td className="px-3 py-2 text-center text-sm font-medium tabular-nums text-zinc-500 dark:text-zinc-400 align-middle">
                    {idx + 1}
                  </td>
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
                  <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 align-top">
                    <StatusDropdown
                      value={INTERVIEW_STATUSES.some((s) => s.value === i.status) ? i.status : INTERVIEW_STATUSES[1].value}
                      onChange={(v) => updateStatus(i.id, v)}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div className="relative min-w-[10rem]">
                      <span className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
                        <EnrollmentStatusDot status={i.outcome} size="sm" />
                      </span>
                      <select
                        value={i.outcome}
                        onChange={(e) => updateOutcome(i.id, e.target.value)}
                        className={`w-full min-w-[8rem] rounded-md border border-zinc-300 bg-white py-1.5 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 ${ENROLLMENT_STATUS_DOT_COLORS[i.outcome.trim()] ? "pl-8 pr-2" : "px-2"}`}
                        aria-label={t("outcome")}
                      >
                        <option value="">—</option>
                        {STATUS_OPTIONS.filter((s) => s).map((s) => (
                          <option key={s} value={s}>
                            {t(s)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <textarea
                      value={i.notes}
                      onChange={(e) => updateNotes(i.id, e.target.value)}
                      rows={4}
                      className="w-full min-w-[8rem] max-w-md rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                      placeholder={t("notes")}
                      aria-label={t("notes")}
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
