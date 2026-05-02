"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookOpen,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Info,
  Layers,
  Megaphone,
  Trophy,
  CalendarDays,
  Clock,
} from "lucide-react"
import { useSession } from "@/lib/config/auth-client"
import { useStudentDashboard } from "@/hooks/use-student-dashboard"
import { cn } from "@workspace/ui/lib/utils"

// ─── Constants ─────────────────────────────────────────────────────────────────

const COURSE_GRADIENTS = [
  "from-violet-400 via-purple-500 to-indigo-600",
  "from-teal-400 via-cyan-500 to-blue-500",
  "from-orange-400 via-amber-500 to-yellow-400",
  "from-pink-400 via-rose-500 to-red-400",
  "from-emerald-400 via-green-500 to-teal-500",
  "from-blue-400 via-indigo-500 to-violet-500",
]

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

const SEMESTER_LABELS: Record<string, string> = {
  "1st": "1st Sem",
  "2nd": "2nd Sem",
  summer: "Summer",
}

// Static tags pool for visual variety
const COURSE_TAGS = [
  ["Core Course", "Active"],
  ["Elective", "Active"],
  ["Core Course", "Priority"],
  ["Lab", "Active"],
  ["Elective", "Priority"],
  ["Core Course", "Active"],
]

// Static leaderboard mock
const LEADERBOARD = [
  { rank: 1, name: "Maria Santos", score: 98, initials: "MS" },
  { rank: 2, name: "Juan dela Cruz", score: 95, initials: "JC" },
  { rank: 3, name: "Ana Reyes", score: 91, initials: "AR" },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function gradientForIndex(i: number) {
  return COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]
}

function daysUntil(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return "Overdue"
  if (diff === 0) return "Today"
  if (diff === 1) return "1 Day"
  return `${diff} Days`
}

function formatDue(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-14 animate-pulse rounded-2xl bg-muted" />
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
      <div className="hidden w-72 shrink-0 space-y-4 xl:block">
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  )
}

// ─── In-Progress Row ──────────────────────────────────────────────────────────

function InProgressRow({
  enrollment,
  index,
  nextDeadline,
}: {
  enrollment: {
    _id: string
    courseId: { name: string; code: string; semester: string }
    sectionId: { name: string; schedule?: string }
  }
  index: number
  nextDeadline?: string
}) {
  const course = enrollment.courseId
  const section = enrollment.sectionId
  const materialCount = (course.code.charCodeAt(0) % 8) + 4

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-3.5 transition-shadow hover:shadow-sm">
      {/* Thumbnail */}
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br",
          gradientForIndex(index)
        )}
      >
        <GraduationCap className="size-5 text-white/90" />
      </div>

      {/* Course info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <BookOpen className="size-3 shrink-0 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Course</span>
        </div>
        <p className="mt-0.5 truncate font-semibold text-foreground">{course.name}</p>
      </div>

      {/* Content */}
      <div className="hidden shrink-0 text-center sm:block">
        <p className="text-xs text-muted-foreground">Content</p>
        <div className="mt-0.5 flex items-center gap-1">
          <ClipboardList className="size-3 text-muted-foreground" />
          <span className="text-sm font-medium tabular-nums">{materialCount} Material</span>
        </div>
      </div>

      {/* Section */}
      <div className="hidden shrink-0 text-center lg:block">
        <p className="text-xs text-muted-foreground">Section</p>
        <div className="mt-0.5 flex items-center gap-1">
          <Layers className="size-3 text-muted-foreground" />
          <span className="text-sm font-medium">{section.name}</span>
        </div>
      </div>

      {/* Deadline */}
      <div className="shrink-0 text-right">
        <p className="text-xs text-muted-foreground">Deadline</p>
        {nextDeadline ? (
          <div className="mt-0.5 flex items-center gap-1">
            <Clock className="size-3 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {daysUntil(nextDeadline)}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>
    </div>
  )
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({
  enrollment,
  index,
}: {
  enrollment: {
    _id: string
    courseId: { _id: string; name: string; code: string; cover?: string; semester: string }
    sectionId: { name: string; schedule?: string }
  }
  index: number
}) {
  const course = enrollment.courseId
  const section = enrollment.sectionId
  const tags = COURSE_TAGS[index % COURSE_TAGS.length] ?? []
  const materialCount = (course.code.charCodeAt(0) % 8) + 4

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden">
        {course.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.cover}
            alt={course.name}
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-linear-to-br transition-transform duration-300 group-hover:scale-105",
              gradientForIndex(index)
            )}
          >
            <div className="absolute -right-6 -top-6 size-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 size-16 rounded-full bg-white/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="size-12 text-white/60" />
            </div>
          </div>
        )}
        {/* Material count badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
          <ClipboardList className="size-3 text-white" />
          <span className="text-xs font-medium text-white">{materialCount} materials</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center gap-1">
          <BookOpen className="size-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Course</span>
          <span className="mx-1 text-border">·</span>
          <span className="font-mono text-xs text-muted-foreground">{course.code}</span>
        </div>
        <p className="mt-1.5 font-semibold leading-snug text-foreground line-clamp-2">
          {course.name}
        </p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {SEMESTER_LABELS[course.semester] ?? course.semester}
          </span>
          {tags.map((tag) => (
            <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Section + status */}
        <div className="mt-3 flex items-center justify-between">
          {section.schedule ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3 shrink-0" />
              <span className="truncate">{section.schedule}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Layers className="size-3 shrink-0" />
              <span>{section.name}</span>
            </div>
          )}
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active</span>
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar Panels ───────────────────────────────────────────────────────────

function UpcomingPanel({
  upcomingAssessments,
}: {
  upcomingAssessments: Array<{
    _id: string
    title: string
    type: string
    totalPoints: number
    dueDate?: string
    courseName: string
  }>
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Upcoming</h3>
        </div>
        <Link
          href="/my-assessments"
          className="flex items-center gap-0.5 text-xs text-primary hover:underline"
        >
          See all <ChevronRight className="size-3" />
        </Link>
      </div>

      {upcomingAssessments.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No upcoming assessments 🎉</p>
      ) : (
        <ul className="space-y-3">
          {upcomingAssessments.slice(0, 5).map((a) => (
            <li key={a._id} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-medium",
                  ASSESSMENT_TYPE_COLORS[a.type]
                )}
              >
                {ASSESSMENT_TYPE_LABELS[a.type]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.courseName}</p>
              </div>
              {a.dueDate && (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatDue(a.dueDate)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AttendancePanel({
  attendanceSummary,
  attendanceRate,
}: {
  attendanceSummary: { present: number; absent: number; late: number; total: number }
  attendanceRate: number | null
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="size-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Attendance</h3>
        </div>
        <Link
          href="/my-attendance"
          className="flex items-center gap-0.5 text-xs text-primary hover:underline"
        >
          Details <ChevronRight className="size-3" />
        </Link>
      </div>

      {attendanceSummary.total === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No attendance records yet.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold tabular-nums text-foreground">{attendanceRate}%</p>
            <p className="mb-1 text-xs text-muted-foreground">{attendanceSummary.total} sessions</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${attendanceRate ?? 0}%` }}
            />
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Present", value: attendanceSummary.present, dot: "bg-emerald-500" },
              { label: "Late", value: attendanceSummary.late, dot: "bg-amber-400" },
              { label: "Absent", value: attendanceSummary.absent, dot: "bg-red-400" },
            ].map(({ label, value, dot }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", dot)} />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium tabular-nums">{value}</span>
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
  )
}

function LeaderboardPanel() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="size-4 text-amber-500" />
        <h3 className="font-semibold text-foreground">Leaderboard</h3>
        <Info className="size-3.5 text-muted-foreground" />
      </div>
      <ul className="space-y-3">
        {LEADERBOARD.map(({ rank, name, score, initials }) => (
          <li key={rank} className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                rank === 1
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {rank}
            </span>
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {initials}
            </div>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{name}</p>
            <div className="flex items-center gap-0.5">
              <span className="text-sm font-bold tabular-nums text-foreground">{score}</span>
              <span className="text-xs text-amber-500">pts</span>
            </div>
          </li>
        ))}
      </ul>
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

  // Map courseId → earliest upcoming deadline
  const deadlineMap = React.useMemo(() => {
    const map: Record<string, string> = {}
    for (const a of upcomingAssessments) {
      if (a.dueDate && !map[a.courseId]) map[a.courseId] = a.dueDate
    }
    return map
  }, [upcomingAssessments])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="flex gap-6">
      {/* ── Main content ── */}
      <div className="min-w-0 flex-1 space-y-7">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome to Klasee — here&apos;s your learning overview.
          </p>
        </div>

        {/* Announcement banner */}
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 dark:border-emerald-900 dark:bg-emerald-950/40">
          <Megaphone className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
              New
            </span>
            <p className="truncate text-sm font-medium text-emerald-900 dark:text-emerald-100">
              Offline mode is now available.{" "}
              <span className="font-normal text-emerald-700 dark:text-emerald-300">
                Download your course materials to study without internet.
              </span>
            </p>
          </div>
          <button className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200">
            Learn more <ChevronRight className="size-3" />
          </button>
        </div>

        {/* In Progress */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="font-semibold text-foreground">In progress learning content</h2>
            <Info className="size-3.5 text-muted-foreground" />
            <span className="ml-auto text-xs text-muted-foreground">{enrollments.length} enrolled</span>
          </div>

          {enrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <GraduationCap className="size-5 text-muted-foreground" />
              </div>
              <p className="mt-3 font-medium">Not enrolled in any courses yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Browse the course catalog to get started.</p>
              <Link
                href="/my-courses"
                className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Browse Courses <ChevronRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 text-xs text-muted-foreground">
                <span>Course</span>
                <span className="hidden w-28 text-center sm:block">Content</span>
                <span className="hidden w-24 text-center lg:block">Section</span>
                <span className="w-20 text-right">Deadline</span>
              </div>
              {enrollments.map((e, i) => (
                <InProgressRow
                  key={e._id}
                  enrollment={e}
                  index={i}
                  nextDeadline={deadlineMap[e.courseId._id]}
                />
              ))}
            </div>
          )}
        </section>

        {/* My Courses Card Grid */}
        {enrollments.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="font-semibold text-foreground">My Courses</h2>
              <Info className="size-3.5 text-muted-foreground" />
              <Link
                href="/my-courses"
                className="ml-auto flex items-center gap-0.5 text-xs text-primary hover:underline"
              >
                View all <ChevronRight className="size-3" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.slice(0, 6).map((e, i) => (
                <CourseCard key={e._id} enrollment={e} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Right Sidebar ── */}
      <div className="hidden w-72 shrink-0 space-y-4 xl:block">
        <UpcomingPanel upcomingAssessments={upcomingAssessments} />
        <AttendancePanel attendanceSummary={attendanceSummary} attendanceRate={attendanceRate} />
        <LeaderboardPanel />
      </div>
    </div>
  )
}
