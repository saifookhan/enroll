"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const STATUS_OPTIONS = ["", "Enrolled", "Pending", "Withdrawn", "Completed"];

type Internship = {
  id: string;
  position: string;
  companyProgram: string;
  status: string;
};

function uid() {
  return Math.random().toString(36).slice(2);
}

function normalizeList(raw: unknown): Internship[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r: Record<string, unknown>) => ({
    id: String(r?.id ?? uid()),
    position: String(r?.position ?? ""),
    companyProgram: String(r?.companyProgram ?? ""),
    status: String(r?.status ?? ""),
  }));
}

type Props = {
  dataKey: string;
  titleKey: string;
  descriptionKey: string;
  emptyMessageKey: string;
};

export default function InternshipsClassClient({
  dataKey,
  titleKey,
  descriptionKey,
  emptyMessageKey,
}: Props) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [list, setList] = useState<Internship[]>([]);
  const [position, setPosition] = useState("");
  const [companyProgram, setCompanyProgram] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!user?.token) return;
    fetch("/api/user/data/" + encodeURIComponent(dataKey), {
      headers: { Authorization: "Bearer " + user.token },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setList(normalizeList(data)))
      .catch(() => setList([]));
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
      position: position.trim(),
      companyProgram: companyProgram.trim(),
      status: status.trim(),
    };
    persist([...list, newItem]);
    setPosition("");
    setCompanyProgram("");
    setStatus("");
  }, [list, position, companyProgram, status, persist]);

  const removeOne = useCallback(
    (id: string) => {
      persist(list.filter((i) => i.id !== id));
    },
    [list, persist]
  );

  return (
    <>
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t(titleKey)}
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {t(descriptionKey)}
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-2">
        <input
          type="text"
          placeholder={t("position")}
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addOne()}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 min-w-[140px]"
        />
        <input
          type="text"
          placeholder={t("companyProgram")}
          value={companyProgram}
          onChange={(e) => setCompanyProgram(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addOne()}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 min-w-[180px]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addOne()}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 min-w-[120px]"
        >
          <option value="">{t("status")}</option>
          {STATUS_OPTIONS.filter((s) => s).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
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

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t("position")}
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
                  colSpan={4}
                  className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  {t(emptyMessageKey)}
                </td>
              </tr>
            ) : (
              list.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                    {item.position || "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {item.companyProgram || "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {item.status || "—"}
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
