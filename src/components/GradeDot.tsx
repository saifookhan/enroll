"use client";

import { GRADE_DOT_COLORS } from "@/lib/gradeShared";

export function GradeDot({ grade, size = "md" }: { grade: string; size?: "sm" | "md" }) {
  const g = grade.trim();
  const bg = GRADE_DOT_COLORS[g];
  const sizeClass = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  if (!bg) return null;
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${sizeClass} ${bg}`}
      title={g}
      aria-hidden
    />
  );
}
