"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NameSortToggle from "@/components/NameSortToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { compareByNameSort, type NameSortMode } from "@/lib/nameSort";

const STATUS_OPTIONS = ["", "Enrolled", "Pending", "Withdrawn", "Completed", "Closed"] as const;
const DEFAULT_CLASS_SIZE = 20;

const STATUS_LABEL_KEYS: Record<string, string> = {
  Enrolled: "statusEnrolled",
  Pending: "statusPending",
  Withdrawn: "statusWithdrawn",
  Completed: "statusCompleted",
  Closed: "statusClosed",
};

export function internshipStatusLabelKey(status: string) {
  return STATUS_LABEL_KEYS[status];
}

const INTERNSHIP_STATUS_DOT: Record<string, string> = {
  Enrolled: "bg-emerald-500",
  Pending: "bg-sky-500",
  Withdrawn: "bg-orange-500",
  Completed: "bg-teal-500",
  Closed: "bg-red-500",
};

function InternshipStatusDot({ status, size = "md" }: { status: string; size?: "sm" | "md" }) {
  const { t } = useLanguage();
  const s = status.trim();
  const bg = INTERNSHIP_STATUS_DOT[s];
  const sizeClass = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  if (!bg) return null;
  const labelKey = internshipStatusLabelKey(s);
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${sizeClass} ${bg}`}
      title={labelKey ? t(labelKey) : s}
      aria-hidden
    />
  );
}

export type Internship = {
  id: string;
  nameSurname: string;
  companyProgram: string;
  status: string;
};

function uid() {
  return Math.random().toString(36).slice(2);
}

function emptyInternship(): Internship {
  return { id: uid(), nameSurname: "", companyProgram: "", status: "" };
}

function isInternshipEmpty(i: Internship) {
  return !i.nameSurname.trim() && !i.companyProgram.trim() && !i.status.trim();
}

function ensureMinInternships(list: Internship[]) {
  const next = [...list];
  while (next.length < DEFAULT_CLASS_SIZE) next.push(emptyInternship());
  return next;
}

export function normalizeInternshipList(raw: unknown): Internship[] {
  if (!Array.isArray(raw)) return [];
  return ensureMinInternships(raw.map((r: Record<string, unknown>) => ({
    id: String(r?.id ?? uid()),
    nameSurname: String(r?.nameSurname ?? r?.position ?? ""),
    companyProgram: String(r?.companyProgram ?? ""),
    status: String(r?.status ?? ""),
  })));
}

type Props = {
  dataKey: string;
  titleKey: string;
  title?: string;
  descriptionKey: string;
  emptyMessageKey: string;
};

export default function InternshipsClassClient({
  dataKey,
  titleKey,
  title,
  descriptionKey,
  emptyMessageKey,
}: Props) {
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const [list, setList] = useState<Internship[]>(ensureMinInternships([]));
  const [nameSurname, setNameSurname] = useState("");
  const [companyProgram, setCompanyProgram] = useState("");
  const [status, setStatus] = useState("");
  const [nameSort, setNameSort] = useState<NameSortMode>("firstName");

  const sortedList = useMemo(
    () =>
      [...list].sort((a, b) =>
        compareByNameSort(a.nameSurname, b.nameSurname, nameSort, locale)
      ),
    [list, nameSort, locale]
  );

  useEffect(() => {
    if (!user?.token) {
      setList(ensureMinInternships([]));
      return;
    }
    fetch("/api/user/data/" + encodeURIComponent(dataKey), {
      headers: { Authorization: "Bearer " + user.token },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setList(normalizeInternshipList(data)))
      .catch(() => setList(ensureMinInternships([])));
  }, [dataKey, user?.userId, user?.token]);

  const persist = useCallback(
    (next: Internship[]) => {
      setList(next);
      if (!user?.token) return;
      fetch("/api/user/data/" + encodeURIComponent(dataKey), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
        body: JSON.stringify(next),
      }).catch(() => {});
    },
    [dataKey, user?.token]
  );

  const addOne = useCallback(() => {
    const newItem: Internship = {
      id: uid(),
      nameSurname: nameSurname.trim(),
      companyProgram: companyProgram.trim(),
      status: status.trim(),
    };
    const emptyIndex = list.findIndex((i) => isInternshipEmpty(i));
    if (emptyIndex >= 0) {
      const next = [...list];
      next[emptyIndex] = { ...next[emptyIndex], ...newItem, id: next[emptyIndex].id };
      persist(next);
    } else {
      persist([...list, newItem]);
    }
    setNameSurname("");
    setCompanyProgram("");
    setStatus("");
  }, [list, nameSurname, companyProgram, status, persist]);

  const removeOne = useCallback(
    (id: string) => {
      if (list.length > DEFAULT_CLASS_SIZE) {
        persist(list.filter((i) => i.id !== id));
        return;
      }
      persist(
        list.map((i) =>
          i.id === id ? { ...i, nameSurname: "", companyProgram: "", status: "" } : i
        )
      );
    },
    [list, persist]
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<Omit<Internship, "id">>) => {
      const next = list.map((i) => (i.id === id ? { ...i, ...patch } : i));
      persist(next);
    },
    [list, persist]
  );

  return (
    <>
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {title?.trim() || t(titleKey)}
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {t(descriptionKey)}
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-2">
        <input
          type="text"
          placeholder={t("nameSurname")}
          value={nameSurname}
          onChange={(e) => setNameSurname(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addOne()}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 min-w-[180px]"
        />
        <input
          type="text"
          placeholder={t("companyProgram")}
          value={companyProgram}
          onChange={(e) => setCompanyProgram(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addOne()}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 min-w-[180px]"
        />
        <div className="relative min-w-[120px]">
          <span className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
            <InternshipStatusDot status={status} size="md" />
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addOne()}
            className={`w-full rounded-md border border-zinc-300 bg-white py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 ${INTERNSHIP_STATUS_DOT[status.trim()] ? "pl-9 pr-3" : "px-3"}`}
          >
            <option value="">{t("status")}</option>
            {STATUS_OPTIONS.filter((s) => s).map((s) => (
              <option key={s} value={s}>
                {t(internshipStatusLabelKey(s) ?? "status")}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={addOne}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          aria-label={t("addInternship")}
          title={t("addInternship")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <NameSortToggle
        value={nameSort}
        onChange={setNameSort}
        className="mt-4 justify-end sm:justify-start"
      />

      <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead>
            <tr>
              <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-12">
                {t("rowIndex")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t("nameSurname")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t("companyProgram")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t("status")}
              </th>
              <th className="px-6 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {list.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  {t(emptyMessageKey)}
                </td>
              </tr>
            ) : (
              sortedList.map((item, idx) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 text-center text-sm font-medium tabular-nums text-zinc-500 dark:text-zinc-400 align-middle">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-2 align-middle">
                    <input
                      type="text"
                      value={item.nameSurname}
                      onChange={(e) =>
                        updateItem(item.id, { nameSurname: e.target.value })
                      }
                      className="w-full min-w-[8rem] rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                      placeholder={t("nameSurname")}
                      aria-label={t("nameSurname")}
                    />
                  </td>
                  <td className="px-6 py-2 align-middle">
                    <input
                      type="text"
                      value={item.companyProgram}
                      onChange={(e) =>
                        updateItem(item.id, { companyProgram: e.target.value })
                      }
                      className="w-full min-w-[8rem] rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      placeholder={t("companyProgram")}
                      aria-label={t("companyProgram")}
                    />
                  </td>
                  <td className="px-6 py-2 align-middle">
                    <div className="relative w-full min-w-[8rem]">
                      <span className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
                        <InternshipStatusDot status={item.status} size="sm" />
                      </span>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          updateItem(item.id, { status: e.target.value })
                        }
                        className={`w-full min-w-[8rem] rounded-md border border-zinc-300 bg-white py-1.5 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 ${INTERNSHIP_STATUS_DOT[item.status.trim()] ? "pl-8 pr-2" : "px-2"}`}
                        aria-label={t("status")}
                      >
                        <option value="">—</option>
                        {STATUS_OPTIONS.filter((s) => s).map((s) => (
                          <option key={s} value={s}>
                            {t(internshipStatusLabelKey(s) ?? "status")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      onClick={() => removeOne(item.id)}
                      className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                      aria-label="Remove"
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
