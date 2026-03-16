"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className="flex rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-0.5"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded px-2.5 py-1 text-xs font-medium transition ${
          locale === "en"
            ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-50"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("it")}
        className={`rounded px-2.5 py-1 text-xs font-medium transition ${
          locale === "it"
            ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-50"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        }`}
      >
        IT
      </button>
    </div>
  );
}
