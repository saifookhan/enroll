"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "enroll-classes";
const VIEW_KEY = "enroll-view";
const MIN_YEAR = 2027;
const MAX_YEAR = 2032;

type ViewMode = "list" | "grid" | "compact";

type Student = {
  id: string;
  student: string;
  grade: string;
  origin: string;
  status: string;
};

type ClassItem = {
  id: string;
  year: number;
  students: Student[];
};

function uid() {
  return Math.random().toString(36).slice(2);
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
      students: Array.isArray(c.students)
        ? c.students.map((s) => ({
            id: s.id || uid(),
            student: String(s.student ?? ""),
            grade: String(s.grade ?? ""),
            origin: String(s.origin ?? ""),
            status: String(s.status ?? ""),
          }))
        : [],
    }));
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

export default function EnrollmentsPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [yearToAdd, setYearToAdd] = useState(2027);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    setClasses(loadClasses());
    setViewMode(loadView());
  }, []);

  const setView = useCallback((v: ViewMode) => {
    setViewMode(v);
    if (typeof window !== "undefined") localStorage.setItem(VIEW_KEY, v);
  }, []);

  const persist = useCallback((next: ClassItem[]) => {
    setClasses(next);
    saveClasses(next);
  }, []);

  const addClass = useCallback(() => {
    setError("");
    if (yearToAdd < MIN_YEAR || yearToAdd > MAX_YEAR) {
      setError(`Year must be between ${MIN_YEAR} and ${MAX_YEAR}.`);
      return;
    }
    const next = [
      ...classes,
      { id: uid(), year: yearToAdd, students: [] },
    ].sort((a, b) => b.year - a.year);
    persist(next);
  }, [yearToAdd, classes, persist]);

  const addStudent = useCallback(
    (classId: string, student: string, grade: string, origin: string, status: string) => {
      const next = classes.map((c) =>
        c.id === classId
          ? {
              ...c,
              students: [
                ...c.students,
                {
                  id: uid(),
                  student: student.trim(),
                  grade: grade.trim(),
                  origin: origin.trim(),
                  status: status.trim(),
                },
              ],
            }
          : c
      );
      persist(next);
    },
    [classes, persist]
  );

  const removeStudent = useCallback(
    (classId: string, studentId: string) => {
      const next = classes.map((c) =>
        c.id === classId
          ? { ...c, students: c.students.filter((s) => s.id !== studentId) }
          : c
      );
      persist(next);
    },
    [classes, persist]
  );

  const removeClass = useCallback(
    (classId: string) => {
      if (typeof window === "undefined") return;
      if (!window.confirm("Remove this class and all its students?")) return;
      persist(classes.filter((c) => c.id !== classId));
    },
    [classes, persist]
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Enrollments
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Add classes by year (you can have multiple classes for the same year). Add students to each class.
        </p>

        <div className="mt-8 flex flex-wrap items-end gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <label
              htmlFor="year"
              className="block text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              Year
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
            Add class
          </button>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        {classes.length > 0 && (
          <div className="mt-6 flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              View:
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
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className={
            viewMode === "grid"
              ? "mt-8 grid gap-6 sm:grid-cols-2"
              : "mt-8 space-y-8"
          }
        >
          {classes.length === 0 ? (
            <p className="rounded-lg border border-zinc-200 bg-white py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              No classes yet. Add a class above.
            </p>
          ) : viewMode === "compact" ? (
            classes.map((c) => (
              <ClassBlockCompact
                key={c.id}
                classItem={c}
                onAddStudent={addStudent}
                onRemoveStudent={removeStudent}
                onRemoveClass={removeClass}
              />
            ))
          ) : (
            classes.map((c) => (
              <ClassBlock
                key={c.id}
                classItem={c}
                onAddStudent={addStudent}
                onRemoveStudent={removeStudent}
                onRemoveClass={removeClass}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function ClassBlockCompact({
  classItem,
  onAddStudent,
  onRemoveStudent,
  onRemoveClass,
}: {
  classItem: ClassItem;
  onAddStudent: (classId: string, student: string, grade: string, origin: string, status: string) => void;
  onRemoveStudent: (classId: string, studentId: string) => void;
  onRemoveClass: (classId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState("");
  const [grade, setGrade] = useState("");
  const [origin, setOrigin] = useState("");
  const [status, setStatus] = useState("");

  const handleAdd = () => {
    if (!student.trim()) return;
    onAddStudent(classItem.id, student, grade, origin, status);
    setStudent("");
    setGrade("");
    setOrigin("");
    setStatus("");
  };

  return (
    <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      >
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
          Class {classItem.year}
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {classItem.students.length} student{classItem.students.length !== 1 ? "s" : ""}
        </span>
      </button>
      {open && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-1.5 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Student</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Grade</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Origin</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Status</th>
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {classItem.students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-zinc-500 dark:text-zinc-400">No students yet.</td>
                  </tr>
                ) : (
                  classItem.students.map((s) => (
                    <tr key={s.id}>
                      <td className="px-3 py-1.5 text-zinc-900 dark:text-zinc-50">{s.student || "—"}</td>
                      <td className="px-3 py-1.5 text-zinc-700 dark:text-zinc-300">{s.grade || "—"}</td>
                      <td className="px-3 py-1.5 text-zinc-700 dark:text-zinc-300">{s.origin || "—"}</td>
                      <td className="px-3 py-1.5 text-zinc-700 dark:text-zinc-300">{s.status || "—"}</td>
                      <td className="px-3 py-1.5">
                        <button type="button" onClick={() => onRemoveStudent(classItem.id, s.id)} className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400" aria-label="Remove">×</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
            <input type="text" placeholder="Student" value={student} onChange={(e) => setStudent(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 min-w-[100px]" />
            <input type="text" placeholder="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 w-16" />
            <input type="text" placeholder="Origin" value={origin} onChange={(e) => setOrigin(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 min-w-[80px]" />
            <input type="text" placeholder="Status" value={status} onChange={(e) => setStatus(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 min-w-[80px]" />
            <button type="button" onClick={handleAdd} className="rounded bg-zinc-800 px-2 py-1.5 text-xs font-medium text-white dark:bg-zinc-200 dark:text-zinc-900">Add student</button>
          </div>
          <div className="mt-2 flex justify-end">
            <button type="button" onClick={() => onRemoveClass(classItem.id)} className="text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400">Remove class</button>
          </div>
        </div>
      )}
    </section>
  );
}

function ClassBlock({
  classItem,
  onAddStudent,
  onRemoveStudent,
  onRemoveClass,
}: {
  classItem: ClassItem;
  onAddStudent: (classId: string, student: string, grade: string, origin: string, status: string) => void;
  onRemoveStudent: (classId: string, studentId: string) => void;
  onRemoveClass: (classId: string) => void;
}) {
  const [student, setStudent] = useState("");
  const [grade, setGrade] = useState("");
  const [origin, setOrigin] = useState("");
  const [status, setStatus] = useState("");

  const handleAdd = () => {
    if (!student.trim()) return;
    onAddStudent(classItem.id, student, grade, origin, status);
    setStudent("");
    setGrade("");
    setOrigin("");
    setStatus("");
  };

  return (
    <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          Class {classItem.year}
        </h3>
        <button
          type="button"
          onClick={() => onRemoveClass(classItem.id)}
          className="text-xs text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
        >
          Remove class
        </button>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Student
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Grade
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Origin
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-2 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {classItem.students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No students yet. Add one below.
                  </td>
                </tr>
              ) : (
                classItem.students.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2 text-sm text-zinc-900 dark:text-zinc-50">{s.student || "—"}</td>
                    <td className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300">{s.grade || "—"}</td>
                    <td className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300">{s.origin || "—"}</td>
                    <td className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300">{s.status || "—"}</td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => onRemoveStudent(classItem.id, s.id)}
                        className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                        aria-label="Remove student"
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
        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <input
            type="text"
            placeholder="Student name"
            value={student}
            onChange={(e) => setStudent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 min-w-[140px]"
          />
          <input
            type="text"
            placeholder="Grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 min-w-[80px]"
          />
          <input
            type="text"
            placeholder="Origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 min-w-[100px]"
          />
          <input
            type="text"
            placeholder="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 min-w-[100px]"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Add student
          </button>
        </div>
      </div>
    </section>
  );
}
