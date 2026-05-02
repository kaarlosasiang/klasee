"use client"

import * as React from "react"
import { ClipboardList, CheckCircle2, Clock } from "lucide-react"
import { useSession } from "@/lib/config/auth-client"
import { useStudentAssessments, type AssessmentWithCourse } from "@/hooks/use-student-assessments"
import { cn } from "@workspace/ui/lib/utils"

// ─── Constants ─────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  quiz: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  exam: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  assignment: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
}

const TYPE_LABELS: Record<string, string> = {
  quiz: "Quiz",
  exam: "Exam",
  assignment: "Assignment",
}

const FILTER_TYPES = ["all", "quiz", "exam", "assignment"] as const
type FilterType = (typeof FILTER_TYPES)[number]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDueDate(dueDate: string) {
  return new Date(dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function isOverdue(dueDate?: string) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function AssessmentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  )
}

// ─── Assessment Row ────────────────────────────────────────────────────────────

function AssessmentRow({ assessment }: { assessment: AssessmentWithCourse }) {
  const graded = assessment.score !== undefined
  const overdue = !graded && isOverdue(assessment.dueDate)

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-shadow hover:shadow-sm">
      {/* Type badge */}
      <span
        className={cn(
          "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium",
          TYPE_COLORS[assessment.type]
        )}
      >
        {TYPE_LABELS[assessment.type]}
      </span>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{assessment.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{assessment.courseName}</p>
      </div>

      {/* Due date */}
      <div className="hidden shrink-0 text-right sm:block">
        {assessment.dueDate ? (
          <p
            className={cn(
              "text-xs font-medium",
              overdue ? "text-red-500" : "text-foreground"
            )}
          >
            {overdue ? "Overdue · " : ""}
            {formatDueDate(assessment.dueDate)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">No due date</p>
        )}
        <p className="text-xs text-muted-foreground">{assessment.totalPoints} pts</p>
      </div>

      {/* Score or status */}
      <div className="shrink-0">
        {graded ? (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {assessment.score}
                <span className="text-xs font-normal text-muted-foreground">
                  /{assessment.totalPoints}
                </span>
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round((assessment.score! / assessment.totalPoints) * 100)}%
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            <span>Pending</span>
          </div>
        )}
      </div>
    </li>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <ClipboardList className="size-5 text-muted-foreground" />
      </div>
      <p className="mt-3 font-medium">
        {filtered ? "No assessments match this filter" : "No assessments yet"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {filtered
          ? "Try selecting a different type."
          : "Assessments will appear here once your instructors add them."}
      </p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MyAssessmentsPage() {
  const { data: session } = useSession()
  const studentId = session?.user?.id

  const { assessments, loading, error } = useStudentAssessments(studentId)

  const [typeFilter, setTypeFilter] = React.useState<FilterType>("all")
  const [courseFilter, setCourseFilter] = React.useState<string>("all")
  const [tab, setTab] = React.useState<"upcoming" | "all">("upcoming")

  if (loading) return <AssessmentsSkeleton />

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
        {error}
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  // Unique courses for filter
  const courses = Array.from(
    new Map(assessments.map((a) => [a.courseId, a.courseName])).entries()
  )

  const filtered = assessments.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false
    if (courseFilter !== "all" && a.courseId !== courseFilter) return false
    if (tab === "upcoming") {
      const graded = a.score !== undefined
      const upcoming = !a.dueDate || a.dueDate >= today
      return !graded && upcoming
    }
    return true
  })

  const upcomingCount = assessments.filter(
    (a) => a.score === undefined && (!a.dueDate || a.dueDate >= today)
  ).length
  const gradedCount = assessments.filter((a) => a.score !== undefined).length

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Assessments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your quizzes, exams, and assignments across all enrolled courses.
        </p>
      </div>

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <ClipboardList className="size-4" />
          </div>
          <div>
            <p className="text-xl font-bold tabular-nums">{assessments.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Clock className="size-4" />
          </div>
          <div>
            <p className="text-xl font-bold tabular-nums">{upcomingCount}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <p className="text-xl font-bold tabular-nums">{gradedCount}</p>
            <p className="text-xs text-muted-foreground">Graded</p>
          </div>
        </div>
      </div>

      {/* ── Tab + Filters ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-border bg-muted p-1 w-fit">
          {(["upcoming", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                tab === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "upcoming" ? "Upcoming" : "All"}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type filter pills */}
          <div className="flex gap-1">
            {FILTER_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                  typeFilter === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "all" ? "All types" : TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Course filter */}
          {courses.length > 1 && (
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All courses</option>
              {courses.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <EmptyState filtered={typeFilter !== "all" || courseFilter !== "all"} />
      ) : (
        <ul className="space-y-2">
          {filtered.map((a) => (
            <AssessmentRow key={a._id} assessment={a} />
          ))}
        </ul>
      )}
    </div>
  )
}
