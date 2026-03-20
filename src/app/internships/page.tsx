"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  type Internship,
  internshipStatusLabelKey,
  normalizeInternshipList,
} from "./InternshipsClassClient";

export default function InternshipsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [class1, setClass1] = useState<Internship[]>([]);
  const [class2, setClass2] = useState<Internship[]>([]);
  const [class1Name, setClass1Name] = useState("");
  const [class2Name, setClass2Name] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) {
      setClass1([]);
      setClass2([]);
      setClass1Name("");
      setClass2Name("");
      setLoading(false);
      return;
    }
    const token = user.token;
    Promise.all([
      fetch("/api/user/data/internships-class-1", {
        headers: { Authorization: "Bearer " + token },
      }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/user/data/internships-class-2", {
        headers: { Authorization: "Bearer " + token },
      }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/user/data/internships-class-names", {
        headers: { Authorization: "Bearer " + token },
      }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([data1, data2, namesData]) => {
        setClass1(normalizeInternshipList(data1));
        setClass2(normalizeInternshipList(data2));
        setClass1Name(
          namesData && typeof namesData.class1 === "string"
            ? namesData.class1.trim()
            : ""
        );
        setClass2Name(
          namesData && typeof namesData.class2 === "string"
            ? namesData.class2.trim()
            : ""
        );
      })
      .catch(() => {
        setClass1([]);
        setClass2([]);
        setClass1Name("");
        setClass2Name("");
      })
      .finally(() => setLoading(false));
  }, [user?.userId, user?.token]);

  const persistClassNames = (nextClass1: string, nextClass2: string) => {
    if (!user?.token) return;
    fetch("/api/user/data/internships-class-names", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + user.token,
      },
      body: JSON.stringify({ class1: nextClass1.trim(), class2: nextClass2.trim() }),
    }).catch(() => {});
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("internships")}
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {t("manageInternshipsByClass")}
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          {t("loading")}
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                <input
                  type="text"
                  value={class1Name}
                  onChange={(e) => setClass1Name(e.target.value)}
                  onBlur={() => persistClassNames(class1Name, class2Name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="rounded border border-zinc-300 bg-white px-2 py-1 text-xl font-semibold text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                  placeholder={t("class1")}
                />
              </h3>
              <Link
                href="/internships/class-1"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {t("manage")} →
              </Link>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {t("nameSurname")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {t("companyProgram")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {t("status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {class1.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                      >
                        {t("noInternshipsYetClass1")}
                      </td>
                    </tr>
                  ) : (
                    class1.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                          {item.nameSurname || "—"}
                        </td>
                        <td className="px-6 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                          {item.companyProgram || "—"}
                        </td>
                        <td className="px-6 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                          {item.status
                            ? internshipStatusLabelKey(item.status)
                              ? t(internshipStatusLabelKey(item.status) as string)
                              : item.status
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                <input
                  type="text"
                  value={class2Name}
                  onChange={(e) => setClass2Name(e.target.value)}
                  onBlur={() => persistClassNames(class1Name, class2Name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="rounded border border-zinc-300 bg-white px-2 py-1 text-xl font-semibold text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                  placeholder={t("class2")}
                />
              </h3>
              <Link
                href="/internships/class-2"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {t("manage")} →
              </Link>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {t("nameSurname")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {t("companyProgram")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {t("status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {class2.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                      >
                        {t("noInternshipsYetClass2")}
                      </td>
                    </tr>
                  ) : (
                    class2.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                          {item.nameSurname || "—"}
                        </td>
                        <td className="px-6 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                          {item.companyProgram || "—"}
                        </td>
                        <td className="px-6 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                          {item.status
                            ? internshipStatusLabelKey(item.status)
                              ? t(internshipStatusLabelKey(item.status) as string)
                              : item.status
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
