"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NameSortToggle from "@/components/NameSortToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ITALIAN_PROVINCE_SET,
  ITALIAN_PROVINCE_SIGLE,
  PROVINCE_LEGACY_PREFIX,
  provinceFieldOnChange,
  provinceFieldValue,
} from "@/lib/italianProvinceSigle";
import { compareByNameSort, type NameSortMode } from "@/lib/nameSort";
import { EnrollmentStatusDot } from "@/components/EnrollmentStatusDot";
import {
  ENROLLMENT_STATUS_DOT_COLORS,
  normalizeEnrollmentStatus,
  STATUS_OPTIONS,
} from "@/lib/enrollmentStatusShared";

const STORAGE_KEY = "enroll-classes";
const VIEW_KEY = "enroll-view";
const API_KEY_CLASSES = "classes";
const API_KEY_VIEW = "view";
const MIN_YEAR = 2027;
const MAX_YEAR = 2032;
const DEFAULT_CLASS_SIZE = 20;

const GRADE_OPTIONS = ["", "A+", "A", "A-"];

const GRADE_DOT_COLORS: Record<string, string> = {
  "A+": "bg-emerald-700 dark:bg-emerald-600",
  "A": "bg-emerald-500",
  "A-": "bg-amber-400",
};

function GradeDot({ grade, size = "md" }: { grade: string; size?: "sm" | "md" }) {
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

const GENDER_OPTIONS = ["", "F", "M"] as const;

function normalizeGender(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  const u = s.toUpperCase();
  if (u === "F" || u === "FEMALE" || u === "FEMMINA") return "F";
  if (u === "M" || u === "MALE" || u === "MASCHIO") return "M";
  return "";
}

type ViewMode = "list" | "grid" | "compact";

type Student = {
  id: string;
  student: string;
  grade: string;
  origin: string;
  status: string;
  gender: string;
};

type ClassItem = {
  id: string;
  year: number;
  name: string;
  students: Student[];
};

function uid() {
  return Math.random().toString(36).slice(2);
}

function emptyStudent(): Student {
  return {
    id: uid(),
    student: "",
    grade: "",
    origin: "",
    status: "",
    gender: "",
  };
}

function isStudentEmpty(s: Student) {
  return !s.student.trim() && !s.grade.trim() && !s.origin.trim() && !s.status.trim() && !s.gender.trim();
}

function ensureMinStudents(students: Student[]) {
  const next = [...students];
  while (next.length < DEFAULT_CLASS_SIZE) next.push(emptyStudent());
  return next;
}

function normalizeStudentOrigin(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const u = t.toUpperCase();
  if (ITALIAN_PROVINCE_SET.has(u)) return u;
  return t;
}

function loadClasses(): ClassItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ClassItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c) => ({
      id: c.id || uid(),
      year: Number(c.year) || MIN_YEAR,
      name: typeof c.name === "string" ? c.name.trim() : "",
      students: Array.isArray(c.students)
        ? c.students.map((s) => ({
            id: s.id || uid(),
            student: String(s.student ?? ""),
            grade: String(s.grade ?? ""),
            origin: normalizeStudentOrigin(String(s.origin ?? "")),
            status: normalizeEnrollmentStatus(String(s.status ?? "")),
            gender: normalizeGender(String(s.gender ?? "")),
          }))
        : [],
    })).map((c) => ({ ...c, students: ensureMinStudents(c.students) }));
  } catch {
    return [];
  }
}

function saveClasses(classes: ClassItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
}

function loadView(): ViewMode {
  if (typeof window === "undefined") return "list";
  const v = localStorage.getItem(VIEW_KEY);
  return v === "grid" || v === "compact" ? v : "list";
}

function normalizeClasses(raw: unknown): ClassItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((c: Record<string, unknown>) => ({
    id: String(c?.id ?? uid()),
    year: Number(c?.year) ?? MIN_YEAR,
    name: typeof c?.name === "string" ? c.name.trim() : "",
    students: Array.isArray(c?.students)
      ? (c.students as Record<string, unknown>[]).map((s) => ({
          id: String(s?.id ?? uid()),
          student: String(s?.student ?? ""),
          grade: String(s?.grade ?? ""),
          origin: normalizeStudentOrigin(String(s?.origin ?? "")),
          status: normalizeEnrollmentStatus(String(s?.status ?? "")),
          gender: normalizeGender(String(s?.gender ?? "")),
        }))
      : [],
  })).map((c) => ({ ...c, students: ensureMinStudents(c.students) }));
}

export default function EnrollmentsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [yearToAdd, setYearToAdd] = useState(2027);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  useEffect(() => {
    let cancelled = false;
    if (user?.token) {
      (async () => {
        try {
          const [classesRes, viewRes] = await Promise.all([
            fetch("/api/user/data/" + API_KEY_CLASSES, { headers: { Authorization: "Bearer " + user.token } }),
            fetch("/api/user/data/" + API_KEY_VIEW, { headers: { Authorization: "Bearer " + user.token } }),
          ]);
          if (cancelled) return;
          const classesData = classesRes.ok ? await classesRes.json() : [];
          const viewData = viewRes.ok ? await viewRes.json() : null;
          setClasses(normalizeClasses(classesData));
          setViewMode(viewData === "grid" || viewData === "compact" ? viewData : "list");
        } catch {
          setClasses(loadClasses());
          setViewMode(loadView());
        }
      })();
    } else {
      setClasses(loadClasses());
      setViewMode(loadView());
    }
    return () => {
      cancelled = true;
    };
  }, [user?.userId, user?.token]);

  const setView = useCallback(
    (v: ViewMode) => {
      setViewMode(v);
      if (typeof window === "undefined") return;
      if (user?.token) {
        fetch("/api/user/data/" + API_KEY_VIEW, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + user.token },
          body: JSON.stringify(v),
        }).catch(() => {});
      } else {
        localStorage.setItem(VIEW_KEY, v);
      }
    },
    [user?.token]
  );

  const persist = useCallback(
    (next: ClassItem[]) => {
      setClasses(next);
      if (typeof window === "undefined") return;
      if (user?.token) {
        fetch("/api/user/data/" + API_KEY_CLASSES, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + user.token },
          body: JSON.stringify(next),
        }).catch(() => {});
      } else {
        saveClasses(next);
      }
    },
    [user?.token]
  );

  const addClass = useCallback(() => {
    setError("");
    if (yearToAdd < MIN_YEAR || yearToAdd > MAX_YEAR) {
      setError(`${t("yearMustBe")} ${MIN_YEAR} ${t("and")} ${MAX_YEAR}.`);
      return;
    }
    const next = [
      ...classes,
      { id: uid(), year: yearToAdd, name: "", students: ensureMinStudents([]) },
    ].sort((a, b) => b.year - a.year);
    persist(next);
  }, [yearToAdd, classes, persist]);

  const addStudent = useCallback(
    (classId: string, student: string, grade: string, origin: string, status: string, gender: string) => {
      const next = classes.map((c) => {
        if (c.id !== classId) return c;
        const payload: Student = {
          id: uid(),
          student: student.trim(),
          grade: grade.trim(),
          origin: normalizeStudentOrigin(origin),
          status: status.trim(),
          gender: normalizeGender(gender),
        };
        const emptyIndex = c.students.findIndex((s) => isStudentEmpty(s));
        if (emptyIndex >= 0) {
          const students = [...c.students];
          students[emptyIndex] = { ...students[emptyIndex], ...payload, id: students[emptyIndex].id };
          return { ...c, students };
        }
        return { ...c, students: [...c.students, payload] };
      });
      persist(next);
    },
    [classes, persist]
  );

  const removeStudent = useCallback(
    (classId: string, studentId: string) => {
      const next = classes.map((c) => {
        if (c.id !== classId) return c;
        if (c.students.length > DEFAULT_CLASS_SIZE) {
          return { ...c, students: c.students.filter((s) => s.id !== studentId) };
        }
        return {
          ...c,
          students: c.students.map((s) =>
            s.id === studentId ? { ...s, student: "", grade: "", origin: "", status: "", gender: "" } : s
          ),
        };
      });
      persist(next);
    },
    [classes, persist]
  );

  const updateStudent = useCallback(
    (
      classId: string,
      studentId: string,
      patch: Partial<Pick<Student, "student" | "grade" | "origin" | "status" | "gender">>
    ) => {
      const p = { ...patch };
      if (p.origin !== undefined) p.origin = normalizeStudentOrigin(p.origin);
      if (p.gender !== undefined) p.gender = normalizeGender(p.gender);
      const next = classes.map((c) =>
        c.id === classId
          ? {
              ...c,
              students: c.students.map((s) =>
                s.id === studentId ? { ...s, ...p } : s
              ),
            }
          : c
      );
      persist(next);
    },
    [classes, persist]
  );

  const removeClass = useCallback(
    (classId: string) => {
      if (typeof window === "undefined") return;
      if (!window.confirm(t("confirmRemoveClass"))) return;
      persist(classes.filter((c) => c.id !== classId));
    },
    [classes, persist, t]
  );

  const renameClass = useCallback(
    (classId: string, newName: string) => {
      const next = classes.map((c) =>
        c.id === classId ? { ...c, name: newName.trim() } : c
      );
      persist(next);
    },
    [classes, persist]
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main
        className={`mx-auto px-6 py-8 ${viewMode === "grid" ? "max-w-7xl" : "max-w-5xl"}`}
      >
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {t("enrollments")}
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {t("enrollmentsIntro")}
        </p>

        <div className="mt-8 flex flex-wrap items-end gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <label
              htmlFor="year"
              className="block text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              {t("year")}
            </label>
            <select
              id="year"
              value={yearToAdd}
              onChange={(e) => setYearToAdd(Number(e.target.value))}
              className="mt-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            >
              {Array.from(
                { length: MAX_YEAR - MIN_YEAR + 1 },
                (_, i) => MIN_YEAR + i
              )
                .reverse()
                .map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
            </select>
          </div>
          <button
            type="button"
            onClick={addClass}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t("addClass")}
          </button>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        {classes.length > 0 && (
          <div className="mt-6 flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t("view")}
            </span>
            <div className="flex rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-0.5">
              {(["list", "grid", "compact"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition ${
                    viewMode === v
                      ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-50"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
                >
                  {t(v)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className={
            viewMode === "grid"
              ? "mt-8 grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2"
              : "mt-8 space-y-8"
          }
        >
          {classes.length === 0 ? (
            <p className="rounded-lg border border-zinc-200 bg-white py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              {t("noClassesYet")}
            </p>
          ) : viewMode === "compact" ? (
            classes.map((c) => (
              <ClassBlockCompact
                key={c.id}
                classItem={c}
                onAddStudent={addStudent}
                onRemoveStudent={removeStudent}
                onUpdateStudent={updateStudent}
                onRemoveClass={removeClass}
                onRenameClass={renameClass}
              />
            ))
          ) : (
            classes.map((c) => (
              <ClassBlock
                key={c.id}
                classItem={c}
                dense={viewMode === "grid"}
                onAddStudent={addStudent}
                onRemoveStudent={removeStudent}
                onUpdateStudent={updateStudent}
                onRemoveClass={removeClass}
                onRenameClass={renameClass}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function EditableStudentRow({
  classId,
  student: s,
  compact,
  squeezeColumns,
  rowIndex,
  onUpdateStudent,
  onRemoveStudent,
}: {
  classId: string;
  student: Student;
  compact: boolean;
  /** Narrow layout: no fixed min-width on status so table can fit grid cards */
  squeezeColumns?: boolean;
  /** 1-based position in the visible list */
  rowIndex: number;
  onUpdateStudent: (
    classId: string,
    studentId: string,
    patch: Partial<Pick<Student, "student" | "grade" | "origin" | "status" | "gender">>
  ) => void;
  onRemoveStudent: (classId: string, studentId: string) => void;
}) {
  const { t } = useLanguage();
  const cellPad = compact ? "px-3 py-1.5" : "px-4 py-2";
  const inputCl = compact
    ? "w-full min-w-[4rem] rounded border border-zinc-300 bg-white px-1.5 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
    : "w-full min-w-[5rem] rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50";
  const selectCl = inputCl;
  const statusWrapCl = squeezeColumns ? "relative w-full min-w-0" : "relative w-full min-w-[12rem]";
  const statusSelectMin = squeezeColumns ? "" : " min-w-[12rem]";

  return (
    <tr>
      <td
        className={`${cellPad} w-10 text-center text-sm font-medium tabular-nums text-zinc-500 dark:text-zinc-400`}
      >
        {rowIndex}
      </td>
      <td className={`${cellPad}`}>
        <select
          value={s.gender}
          onChange={(e) => onUpdateStudent(classId, s.id, { gender: e.target.value })}
          className={selectCl}
          aria-label={t("gender")}
        >
          <option value="">—</option>
          {GENDER_OPTIONS.filter((g) => g).map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </td>
      <td className={`${cellPad}${squeezeColumns ? " min-w-0" : ""}`}>
        <input
          type="text"
          value={s.student}
          onChange={(e) => onUpdateStudent(classId, s.id, { student: e.target.value })}
          className={`${inputCl}${squeezeColumns ? " min-w-0" : ""}`}
          placeholder={t("student")}
          aria-label={t("student")}
        />
      </td>
      <td className={`${cellPad}`}>
        <div className="relative w-full min-w-0">
          <span className="pointer-events-none absolute left-1.5 top-1/2 z-10 -translate-y-1/2">
            <GradeDot grade={s.grade} size={compact ? "sm" : "md"} />
          </span>
          <select
            value={s.grade}
            onChange={(e) => onUpdateStudent(classId, s.id, { grade: e.target.value })}
            className={`${selectCl} w-full ${s.grade.trim() && GRADE_DOT_COLORS[s.grade.trim()] ? "pl-7" : "pl-2"}`}
            aria-label={t("grade")}
          >
            <option value="">—</option>
            {GRADE_OPTIONS.filter((g) => g).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </td>
      <td className={`${cellPad}`}>
        <select
          value={provinceFieldValue(s.origin)}
          onChange={(e) =>
            onUpdateStudent(classId, s.id, {
              origin: provinceFieldOnChange(e.target.value),
            })
          }
          className={inputCl}
          aria-label={t("origin")}
        >
          <option value="">{t("origin")}</option>
          {provinceFieldValue(s.origin).startsWith(PROVINCE_LEGACY_PREFIX) && (
            <option value={provinceFieldValue(s.origin)}>
              {provinceFieldValue(s.origin).slice(PROVINCE_LEGACY_PREFIX.length)}
            </option>
          )}
          {ITALIAN_PROVINCE_SIGLE.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </td>
      <td className={`${cellPad}${squeezeColumns ? " min-w-0" : ""}`}>
        <div className={statusWrapCl}>
          <span className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
            <EnrollmentStatusDot status={s.status} size={compact ? "sm" : "md"} />
          </span>
          <select
            value={s.status}
            onChange={(e) => onUpdateStudent(classId, s.id, { status: e.target.value })}
            className={`${selectCl} w-full${statusSelectMin} max-w-full ${ENROLLMENT_STATUS_DOT_COLORS[s.status.trim()] ? "pl-8" : "pl-2"}`}
            aria-label={t("status")}
          >
            <option value="">—</option>
            {STATUS_OPTIONS.filter((st) => st).map((st) => (
              <option key={st} value={st}>
                {t(st)}
              </option>
            ))}
          </select>
        </div>
      </td>
      <td className={cellPad}>
        <button
          type="button"
          onClick={() => onRemoveStudent(classId, s.id)}
          className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
          aria-label="Remove"
        >
          ×
        </button>
      </td>
    </tr>
  );
}

function ClassBlockCompact({
  classItem,
  onAddStudent,
  onRemoveStudent,
  onUpdateStudent,
  onRemoveClass,
  onRenameClass,
}: {
  classItem: ClassItem;
  onAddStudent: (classId: string, student: string, grade: string, origin: string, status: string, gender: string) => void;
  onRemoveStudent: (classId: string, studentId: string) => void;
  onUpdateStudent: (
    classId: string,
    studentId: string,
    patch: Partial<Pick<Student, "student" | "grade" | "origin" | "status" | "gender">>
  ) => void;
  onRemoveClass: (classId: string) => void;
  onRenameClass: (classId: string, name: string) => void;
}) {
  const { t, locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(classItem.name || "");
  const [student, setStudent] = useState("");
  const [grade, setGrade] = useState("");
  const [origin, setOrigin] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [nameSort, setNameSort] = useState<NameSortMode>("firstName");
  const displayName = (classItem.name && classItem.name.trim()) ? classItem.name.trim() : `${t("class")} ${classItem.year}`;

  const sortedStudents = useMemo(
    () =>
      [...classItem.students].sort((a, b) =>
        compareByNameSort(a.student, b.student, nameSort, locale)
      ),
    [classItem.students, nameSort, locale]
  );

  const handleAdd = () => {
    if (!student.trim()) return;
    onAddStudent(classItem.id, student, grade, origin, status, gender);
    setStudent("");
    setGrade("");
    setOrigin("");
    setStatus("");
    setGender("");
  };

  return (
    <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      >
        <span className="font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          {editingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={() => {
                onRenameClass(classItem.id, nameInput);
                setEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRenameClass(classItem.id, nameInput);
                  setEditingName(false);
                }
                if (e.key === "Escape") {
                  setNameInput(classItem.name || "");
                  setEditingName(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder={t("classNamePlaceholder")}
              className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 min-w-[100px]"
            />
          ) : (
            <>
              {displayName}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setNameInput(classItem.name || "");
                  setEditingName(true);
                }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded p-0.5"
                aria-label={t("classNamePlaceholder")}
                title={t("classNamePlaceholder")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
            </>
          )}
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {classItem.students.length} {classItem.students.length !== 1 ? t("studentsCountPlural") : t("studentsCount")}
        </span>
      </button>
      {open && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
          <NameSortToggle
            value={nameSort}
            onChange={setNameSort}
            className="mb-2 justify-end sm:justify-start"
          />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-1.5 text-center text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400 w-10">
                    {t("rowIndex")}
                  </th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">{t("gender")}</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">{t("student")}</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">{t("grade")}</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">{t("origin")}</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">{t("status")}</th>
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {classItem.students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-zinc-500 dark:text-zinc-400">{t("noStudentsYet")}</td>
                  </tr>
                ) : (
                  sortedStudents.map((s, idx) => (
                    <EditableStudentRow
                      key={s.id}
                      classId={classItem.id}
                      student={s}
                      compact
                      rowIndex={idx + 1}
                      onUpdateStudent={onUpdateStudent}
                      onRemoveStudent={onRemoveStudent}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
            <select value={gender} onChange={(e) => setGender(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 min-w-[52px]">
              <option value="">{t("gender")}</option>
              {GENDER_OPTIONS.filter((g) => g).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <input type="text" placeholder={t("student")} value={student} onChange={(e) => setStudent(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 min-w-[100px]" />
            <div className="relative min-w-[72px]">
              <span className="pointer-events-none absolute left-1.5 top-1/2 z-10 -translate-y-1/2">
                <GradeDot grade={grade} size="sm" />
              </span>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className={`w-full rounded border border-zinc-300 bg-white py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 ${grade.trim() && GRADE_DOT_COLORS[grade.trim()] ? "pl-7 pr-2" : "px-2"}`}
              >
                <option value="">{t("grade")}</option>
                {GRADE_OPTIONS.filter((g) => g).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <select
              value={provinceFieldValue(origin)}
              onChange={(e) => setOrigin(provinceFieldOnChange(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 min-w-[72px]"
              aria-label={t("origin")}
            >
              <option value="">{t("origin")}</option>
              {provinceFieldValue(origin).startsWith(PROVINCE_LEGACY_PREFIX) && (
                <option value={provinceFieldValue(origin)}>
                  {provinceFieldValue(origin).slice(PROVINCE_LEGACY_PREFIX.length)}
                </option>
              )}
              {ITALIAN_PROVINCE_SIGLE.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <div className="relative min-w-[100px]">
              <span className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
                <EnrollmentStatusDot status={status} size="sm" />
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className={`w-full rounded border border-zinc-300 bg-white py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 ${ENROLLMENT_STATUS_DOT_COLORS[status.trim()] ? "pl-8 pr-2" : "px-2"}`}
              >
                <option value="">{t("status")}</option>
                {STATUS_OPTIONS.filter((s) => s).map((s) => (
                  <option key={s} value={s}>{t(s)}</option>
                ))}
              </select>
            </div>
            <button type="button" onClick={handleAdd} className="rounded bg-zinc-800 px-2 py-1.5 text-xs font-medium text-white dark:bg-zinc-200 dark:text-zinc-900">{t("addStudent")}</button>
          </div>
          <div className="mt-2 flex justify-end">
            <button type="button" onClick={() => onRemoveClass(classItem.id)} className="text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400">{t("removeClass")}</button>
          </div>
        </div>
      )}
    </section>
  );
}

function ClassBlock({
  classItem,
  dense,
  onAddStudent,
  onRemoveStudent,
  onUpdateStudent,
  onRemoveClass,
  onRenameClass,
}: {
  classItem: ClassItem;
  /** Grid view: narrower card — compact table + fixed layout so all columns stay in view */
  dense?: boolean;
  onAddStudent: (classId: string, student: string, grade: string, origin: string, status: string, gender: string) => void;
  onRemoveStudent: (classId: string, studentId: string) => void;
  onUpdateStudent: (
    classId: string,
    studentId: string,
    patch: Partial<Pick<Student, "student" | "grade" | "origin" | "status" | "gender">>
  ) => void;
  onRemoveClass: (classId: string) => void;
  onRenameClass: (classId: string, name: string) => void;
}) {
  const { t, locale } = useLanguage();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(classItem.name || "");
  const [student, setStudent] = useState("");
  const [grade, setGrade] = useState("");
  const [origin, setOrigin] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [nameSort, setNameSort] = useState<NameSortMode>("firstName");
  const displayName = (classItem.name && classItem.name.trim()) ? classItem.name.trim() : `${t("class")} ${classItem.year}`;

  const sortedStudents = useMemo(
    () =>
      [...classItem.students].sort((a, b) =>
        compareByNameSort(a.student, b.student, nameSort, locale)
      ),
    [classItem.students, nameSort, locale]
  );

  const handleAdd = () => {
    if (!student.trim()) return;
    onAddStudent(classItem.id, student, grade, origin, status, gender);
    setStudent("");
    setGrade("");
    setOrigin("");
    setStatus("");
    setGender("");
  };

  const thPad = dense ? "px-2 py-1.5" : "px-4 py-2";
  const tableWrapCl = dense ? "overflow-x-auto min-w-0" : "overflow-x-auto";

  return (
    <section
      className={`rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden${dense ? " min-w-0" : ""}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 flex min-w-0 flex-1 items-center gap-2">
          {editingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={() => {
                onRenameClass(classItem.id, nameInput);
                setEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRenameClass(classItem.id, nameInput);
                  setEditingName(false);
                }
                if (e.key === "Escape") {
                  setNameInput(classItem.name || "");
                  setEditingName(false);
                }
              }}
              placeholder={t("classNamePlaceholder")}
              className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 min-w-[120px]"
            />
          ) : (
            <>
              <span className="min-w-0 truncate" title={displayName}>
                {displayName}
              </span>
              <button
                type="button"
                onClick={() => {
                  setNameInput(classItem.name || "");
                  setEditingName(true);
                }}
                className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded p-1"
                aria-label={t("classNamePlaceholder")}
                title={t("classNamePlaceholder")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
            </>
          )}
        </h3>
        <button
          type="button"
          onClick={() => onRemoveClass(classItem.id)}
          className="shrink-0 text-xs text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
        >
          {t("removeClass")}
        </button>
      </div>
      <div className={dense ? "min-w-0 p-3" : "p-4"}>
        <NameSortToggle
          value={nameSort}
          onChange={setNameSort}
          className={`mb-3 justify-end sm:justify-start${dense ? " min-w-0" : ""}`}
        />
        <div className={tableWrapCl}>
          <table
            className={`w-full divide-y divide-zinc-200 dark:divide-zinc-800${dense ? " table-fixed text-xs" : " min-w-full"}`}
          >
            {dense && (
              <colgroup>
                <col className="w-8" />
                <col className="w-11" />
                <col />
                <col className="w-[4.25rem]" />
                <col className="w-[3.25rem]" />
                <col className="w-[36%]" />
                <col className="w-7" />
              </colgroup>
            )}
            <thead>
              <tr>
                <th
                  className={`${thPad} text-center text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-10`}
                >
                  {t("rowIndex")}
                </th>
                <th
                  className={`${thPad} text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400`}
                >
                  {t("gender")}
                </th>
                <th
                  className={`${thPad} text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400`}
                >
                  {t("student")}
                </th>
                <th
                  className={`${thPad} text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400`}
                >
                  {t("grade")}
                </th>
                <th
                  className={`${thPad} text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400`}
                >
                  {t("origin")}
                </th>
                <th
                  className={`${thPad} text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400`}
                >
                  {t("status")}
                </th>
                <th className={`${thPad} w-8`} />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {classItem.students.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className={`${dense ? "px-2 py-4 text-xs" : "px-4 py-6 text-sm"} text-center text-zinc-500 dark:text-zinc-400`}
                  >
                    {t("noStudentsYetAddBelow")}
                  </td>
                </tr>
              ) : (
                sortedStudents.map((s, idx) => (
                  <EditableStudentRow
                    key={s.id}
                    classId={classItem.id}
                    student={s}
                    compact={!!dense}
                    squeezeColumns={!!dense}
                    rowIndex={idx + 1}
                    onUpdateStudent={onUpdateStudent}
                    onRemoveStudent={onRemoveStudent}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        <div
          className={`mt-4 flex flex-wrap items-end border-t border-zinc-200 dark:border-zinc-800 pt-4${dense ? " gap-2" : " gap-3"}`}
        >
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className={
              dense
                ? "min-w-[48px] rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                : "min-w-[56px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            }
          >
            <option value="">{t("gender")}</option>
            {GENDER_OPTIONS.filter((g) => g).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder={t("studentName")}
            value={student}
            onChange={(e) => setStudent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className={
              dense
                ? "min-w-0 max-w-full flex-1 rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 sm:min-w-[100px] sm:flex-none"
                : "min-w-[140px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
            }
          />
          <div className={dense ? "relative min-w-[68px]" : "relative min-w-[88px]"}>
            <span className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
              <GradeDot grade={grade} size={dense ? "sm" : "md"} />
            </span>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className={
                dense
                  ? `w-full rounded border border-zinc-300 bg-white py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 ${grade.trim() && GRADE_DOT_COLORS[grade.trim()] ? "pl-7 pr-2" : "px-2"}`
                  : `w-full rounded-md border border-zinc-300 bg-white py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 ${grade.trim() && GRADE_DOT_COLORS[grade.trim()] ? "pl-9 pr-3" : "px-3"}`
              }
            >
              <option value="">{t("grade")}</option>
              {GRADE_OPTIONS.filter((g) => g).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <select
            value={provinceFieldValue(origin)}
            onChange={(e) => setOrigin(provinceFieldOnChange(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className={
              dense
                ? "min-w-[64px] rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                : "min-w-[88px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            }
            aria-label={t("origin")}
          >
            <option value="">{t("origin")}</option>
            {provinceFieldValue(origin).startsWith(PROVINCE_LEGACY_PREFIX) && (
              <option value={provinceFieldValue(origin)}>
                {provinceFieldValue(origin).slice(PROVINCE_LEGACY_PREFIX.length)}
              </option>
            )}
            {ITALIAN_PROVINCE_SIGLE.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <div className={dense ? "relative min-w-0 flex-1 basis-[8rem] sm:min-w-[92px] sm:flex-none" : "relative min-w-[110px]"}>
            <span className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
              <EnrollmentStatusDot status={status} size={dense ? "sm" : "md"} />
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className={
                dense
                  ? `w-full min-w-0 max-w-full rounded border border-zinc-300 bg-white py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 ${ENROLLMENT_STATUS_DOT_COLORS[status.trim()] ? "pl-8 pr-2" : "px-2"}`
                  : `w-full rounded-md border border-zinc-300 bg-white py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 ${ENROLLMENT_STATUS_DOT_COLORS[status.trim()] ? "pl-9 pr-3" : "px-3"}`
              }
            >
              <option value="">{t("status")}</option>
              {STATUS_OPTIONS.filter((s) => s).map((s) => (
                <option key={s} value={s}>{t(s)}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className={
              dense
                ? "shrink-0 rounded bg-zinc-800 px-2 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
                : "rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            }
          >
            {t("addStudent")}
          </button>
        </div>
      </div>
    </section>
  );
}
