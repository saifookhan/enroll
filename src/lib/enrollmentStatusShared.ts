/** Valori salvati; etichette in translations (enrollmentFull, …). */
export const ENROLLMENT_STATUS_VALUES = [
  "enrollmentFull",
  "enrollmentInProgress",
  "enrollmentReserved",
  "enrollmentRegulation",
  "enrollmentPayment",
] as const;

export const STATUS_OPTIONS = ["", ...ENROLLMENT_STATUS_VALUES] as const;

const LEGACY_ENROLLMENT_STATUS: Record<string, string> = {
  Enrolled: "enrollmentFull",
  Pending: "enrollmentReserved",
  Withdrawn: "enrollmentPayment",
  Completed: "enrollmentFull",
};

export function normalizeEnrollmentStatus(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (LEGACY_ENROLLMENT_STATUS[s]) return LEGACY_ENROLLMENT_STATUS[s];
  if ((ENROLLMENT_STATUS_VALUES as readonly string[]).includes(s)) return s;
  return "";
}

export const ENROLLMENT_STATUS_DOT_COLORS: Record<string, string> = {
  enrollmentFull: "bg-emerald-500",
  enrollmentInProgress: "bg-violet-500",
  enrollmentReserved: "bg-sky-500",
  enrollmentRegulation: "bg-orange-500",
  enrollmentPayment: "bg-red-500",
};
