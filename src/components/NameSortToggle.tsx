"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { NameSortMode } from "@/lib/nameSort";

export default function NameSortToggle({
  value,
  onChange,
  className = "",
}: {
  value: NameSortMode;
  onChange: (v: NameSortMode) => void;
  className?: string;
}) {
  const { t } = useLanguage();
  const btn = (mode: NameSortMode) =>
    `rounded px-2.5 py-1 text-xs font-medium transition ${
      value === mode
        ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-50"
        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
    }`;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {t("sortBy")}
      </span>
      <div className="flex rounded-md border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
        <button
          type="button"
          onClick={() => onChange("firstName")}
          className={btn("firstName")}
        >
          {t("sortByFirstName")}
        </button>
        <button
          type="button"
          onClick={() => onChange("lastName")}
          className={btn("lastName")}
        >
          {t("sortByLastName")}
        </button>
      </div>
    </div>
  );
}
