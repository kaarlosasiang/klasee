"use client"

import * as React from "react"
import { CalendarCheck, TrendingUp, UserCheck, UserX, Clock } from "lucide-react"
import { useSession } from "@/lib/config/auth-client"
import { useStudentAttendance, type CourseSummary } from "@/hooks/use-student-attendance"
import { cn } from "@workspace/ui/lib/utils"

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  present: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  absent: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  late: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
}

const STATUS_LABELS: Record<string, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function RateBar({ rate }: { rate: number }) {
  const color =
    rate >= 80
      ? "bg-emerald-500"
      : rate >= 60
        ? "bg-amber-500"
        : "bg-red-500"
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${rate}%` }}
      />
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function AttendanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  )
}

// ─── Course Attendance Card ────────────────────────────────────────────────────

function CourseAttendanceCard({
  summary,
  expanded,
  onToggle,
}: {
  summary: CourseSummary
  expanded: boolean
  onToggle: () => void
}) {
  const rateColor =
    summary.rate >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : summary.rate >= 60
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400"

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
      >
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{summary.courseName}</p>
          {summary.sectionName && (
            <p className="mt-0.5 text-xs text-muted-foreground">{summary.sectionName}</p>
          )}
        </div>

        {/* Mini stats */}
        <div className="hidden items-center gap-4 sm:flex">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Present</p>
            <p className="font-semibold tabular-nums text-foreground">{summary.present}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Absent</p>
            <p className="font-semibold tabular-nums text-foreground">{summary.absent}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Late</p>
            <p className="font-semibold tabular-nums text-foreground">{summary.late}</p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className={cn("text-2xl font-bold tabular-nums", rateColor)}>{summary.rate}%</p>
          <p className="text-xs text-muted-foreground">{summary.total} sessions</p>
        </div>

        <svg
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Rate bar */}
      <div className="px-5 pb-1">
        <RateBar rate={summary.rate} />
      </div>

      {/* Expanded records */}
      {expanded && (
        <div className="px-5 pb-4 pt-3">
          {summary.records.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">No records yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="pb-2 text-left font-medium">Date</th>
                  <th className="pb-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.records.map((r) => (
                  <tr key={r._id}>
                    <td className="py-2 text-foreground">{formatDate(r.date)}</td>
                    <td className="py-2 text-right">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs font-medium",
                          STATUS_COLORS[r.status]
                        )}
                      >
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <CalendarCheck className="size-5 text-muted-foreground" />
      </div>
      <p className="mt-3 font-medium">No attendance records yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Records will appear here once your instructor marks attendance.
      </p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MyAttendancePage() {
  const { data: session } = useSession()
  const studentId = session?.user?.id

  const { byCourse, overall, loading, error } = useStudentAttendance(studentId)

  const [expandedCourse, setExpandedCourse] = React.useState<string | null>(null)
  const [courseFilter, setCourseFilter] = React.useState<string>("all")

  function toggleCourse(courseId: string) {
    setExpandedCourse((prev) => (prev === courseId ? null : courseId))
  }

  if (loading) return <AttendanceSkeleton />

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
        {error}
      </div>
    )
  }

  const filteredCourses =
    courseFilter === "all" ? byCourse : byCourse.filter((c) => c.courseId === courseFilter)

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View your attendance records across all enrolled courses.
        </p>
      </div>

      {/* ── Overall Stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <TrendingUp className="size-4" />
          </div>
          <div>
            <p className="text-xl font-bold tabular-nums">
              {overall.total > 0 ? `${overall.rate}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Overall Rate</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <UserCheck className="size-4" />
          </div>
          <div>
            <p className="text-xl font-bold tabular-nums">{overall.present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
            <UserX className="size-4" />
          </div>
          <div>
            <p className="text-xl font-bold tabular-nums">{overall.absent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <Clock className="size-4" />
          </div>
          <div>
            <p className="text-xl font-bold tabular-nums">{overall.late}</p>
            <p className="text-xs text-muted-foreground">Late</p>
          </div>
        </div>
      </div>

      {/* ── Filter + Course List ── */}
      {byCourse.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Course filter */}
          {byCourse.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setCourseFilter("all")}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    courseFilter === "all"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  All courses
                </button>
                {byCourse.map((c) => (
                  <button
                    key={c.courseId}
                    onClick={() => setCourseFilter(c.courseId)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      courseFilter === c.courseId
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {c.courseName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {filteredCourses.map((summary) => (
              <CourseAttendanceCard
                key={summary.courseId}
                summary={summary}
                expanded={expandedCourse === summary.courseId}
                onToggle={() => toggleCourse(summary.courseId)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
