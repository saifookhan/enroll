"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { ENROLLMENT_STATUS_DOT_COLORS } from "@/lib/enrollmentStatusShared";

export function EnrollmentStatusDot({ status, size = "md" }: { status: string; size?: "sm" | "md" }) {
  const { t } = useLanguage();
  const s = status.trim();
  const bg = ENROLLMENT_STATUS_DOT_COLORS[s];
  const sizeClass = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  if (!bg) return null;
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${sizeClass} ${bg}`}
      title={s ? t(s) : ""}
      aria-hidden
    />
  );
}
