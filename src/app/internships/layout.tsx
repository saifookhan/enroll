"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function InternshipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [class1Name, setClass1Name] = useState("");
  const [class2Name, setClass2Name] = useState("");

  useEffect(() => {
    if (!user?.token) {
      setClass1Name("");
      setClass2Name("");
      return;
    }
    fetch("/api/user/data/internships-class-names", {
      headers: { Authorization: "Bearer " + user.token },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setClass1Name(
          data && typeof data.class1 === "string" ? data.class1.trim() : ""
        );
        setClass2Name(
          data && typeof data.class2 === "string" ? data.class2.trim() : ""
        );
      })
      .catch(() => {
        setClass1Name("");
        setClass2Name("");
      });
  }, [user?.userId, user?.token]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("internships")}
            </h1>
            <div className="flex gap-4">
              <Link
                href="/internships"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {t("overview")}
              </Link>
              <Link
                href="/internships/class-1"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {class1Name || t("class1")}
              </Link>
              <Link
                href="/internships/class-2"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {class2Name || t("class2")}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
