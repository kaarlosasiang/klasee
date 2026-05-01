"use client"

import * as React from "react"
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  Layers,
  CalendarDays,
  TrendingUp,
} from "lucide-react"
import { useSession } from "@/lib/config/auth-client"
import { useStudentDashboard } from "@/hooks/use-student-dashboard"
import { cn } from "@workspace/ui/lib/utils"

// ─── Constants ─────────────────────────────────────────────────────────────────

const SEMESTER_LABELS: Record<string, string> = {
  "1st": "1st Sem",
  "2nd": "2nd Sem",
  summer: "Summer",
}

const ASSESSMENT_TYPE_COLORS: Record<string, string> = {
  quiz: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  exam: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  assignment: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
}

const ASSESSMENT_TYPE_LABELS: Record<string, string> = {
  quiz: "Quiz",
  exam: "Exam",
  assignment: "Assignment",
}

// ─── Greeting ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", color)}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MyDashboardPage() {
  const { data: session } = useSession()
  const user = session?.user
  const studentId = user?.id
  const firstName = user?.name?.split(" ")[0] ?? "Student"

  const { enrollments, upcomingAssessments, attendanceSummary, loading } =
    useStudentDashboard(studentId)

  const attendanceRate =
    attendanceSummary.total > 0
      ? Math.round(
          ((attendanceSummary.present + attendanceSummary.late) / attendanceSummary.total) * 100
        )
      : null

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-8">
      {/* ── Greeting ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s an overview of your learning progress.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Enrolled Courses"
          value={enrollments.length}
          color="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
        />
        <StatCard
          icon={ClipboardList}
          label="Upcoming Assessments"
          value={upcomingAssessments.length}
          color="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Attendance Rate"
          value={attendanceRate !== null ? `${attendanceRate}%` : "—"}
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        {/* Left column */}
        <div className="space-y-8">

          {/* My Courses */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">My Courses</h2>
              <span className="text-xs text-muted-foreground">{enrollments.length} enrolled</span>
            </div>

            {enrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                  <GraduationCap className="size-5 text-muted-foreground" />
                </div>
                <p className="mt-3 font-medium">Not enrolled in any courses yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ask your instructor to enroll you in a section.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {enrollments.map((enrollment) => {
                  const course = enrollment.courseId
                  const section = enrollment.sectionId
                  return (
                    <div
                      key={enrollment._id}
                      className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
                    >
                      {/* Cover */}
                      <div className="relative h-28 w-full overflow-hidden">
                        {course.cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.cover}
                            alt={`${course.name} cover`}
                            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-linear-to-br from-blue-400 via-indigo-500 to-violet-600" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <GraduationCap className="size-10 text-white/70" />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <p className="font-semibold leading-tight text-foreground line-clamp-2">
                          {course.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          <span className="font-mono">{course.code}</span>
                          <span className="text-border">·</span>
                          <span>{SEMESTER_LABELS[course.semester] ?? course.semester}</span>
                        </div>
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Layers className="size-3 shrink-0" />
                            <span>{section.name}</span>
                          </div>
                          {section.schedule && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <CalendarDays className="size-3 shrink-0" />
                              <span>{section.schedule}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Upcoming Assessments */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Upcoming Assessments</h2>
              <span className="text-xs text-muted-foreground">{upcomingAssessments.length} upcoming</span>
            </div>

            {upcomingAssessments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                  <ClipboardList className="size-5 text-muted-foreground" />
                </div>
                <p className="mt-3 font-medium">No upcoming assessments</p>
                <p className="mt-1 text-sm text-muted-foreground">You&apos;re all caught up!</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {upcomingAssessments.map((a) => (
                  <li
                    key={a._id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4"
                  >
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium",
                        ASSESSMENT_TYPE_COLORS[a.type]
                      )}
                    >
                      {ASSESSMENT_TYPE_LABELS[a.type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{a.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.courseName}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {a.dueDate ? (
                        <>
                          <p className="text-xs font-medium text-foreground">
                            {new Date(a.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">{a.totalPoints} pts</p>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">{a.totalPoints} pts</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right column: Attendance Summary */}
        <div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <CalendarCheck className="size-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Attendance Summary</h2>
            </div>

            {attendanceSummary.total === 0 ? (
              <p className="text-sm text-muted-foreground">No attendance records yet.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-bold tabular-nums text-foreground">
                      {attendanceRate}%
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">overall attendance</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{attendanceSummary.total} sessions</p>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>

                {/* Breakdown */}
                <div className="space-y-3 pt-1">
                  {[
                    { label: "Present", value: attendanceSummary.present, color: "bg-emerald-500" },
                    { label: "Late", value: attendanceSummary.late, color: "bg-amber-400" },
                    { label: "Absent", value: attendanceSummary.absent, color: "bg-red-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", color)} />
                        <span className="text-sm text-muted-foreground">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium tabular-nums text-foreground">
                          {value}
                        </span>
                        <span className="w-8 text-right text-xs text-muted-foreground">
                          {attendanceSummary.total > 0
                            ? `${Math.round((value / attendanceSummary.total) * 100)}%`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

