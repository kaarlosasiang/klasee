"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookOpen,
  Clock,
  CalendarCheck,
  ArrowRight,
  Pin,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"
import { useSession } from "@/lib/config/auth-client"
import { getEnrollmentsByStudent } from "@/lib/services/enrollments"
import { getAssessments } from "@/lib/services/assessments"
import { getAnnouncements } from "@/lib/services/announcements"
import { getMyAttendance } from "@/lib/services/attendance"
import { timeAgo } from "@/lib/utils/time"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CourseItem {
  courseId: string
  courseName: string
  courseCode: string
  sectionName: string
  schedule?: string
}

interface AssessmentItem {
  id: string
  title: string
  type: "quiz" | "exam" | "assignment"
  courseName: string
  courseId: string
  daysUntil: number
}

interface AnnouncementItem {
  id: string
  title: string
  courseName: string
  time: string
  isPinned: boolean
  courseId: string
}

interface Stats {
  courses: number
  dueThisWeek: number
  attendanceRate: number
  present: number
  total: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

function dueDateLabel(daysUntil: number) {
  if (daysUntil < 0) return "Overdue"
  if (daysUntil === 0) return "Due today"
  if (daysUntil === 1) return "Due tomorrow"
  return `Due in ${daysUntil} days`
}

function computeDaysUntil(dueDate: string): number {
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

const TYPE_COLORS: Record<string, string> = {
  quiz: "bg-blue-100 text-blue-700 border-blue-200",
  exam: "bg-purple-100 text-purple-700 border-purple-200",
  assignment: "bg-amber-100 text-amber-700 border-amber-200",
}

const COURSE_BG_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatChip({
  icon: Icon,
  value,
  label,
  colorClass,
}: {
  icon: React.ElementType
  value: string | number
  label: string
  colorClass: string
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border bg-card px-4 py-2.5">
      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", colorClass)}>
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function AttendanceRing({ rate, present, total }: { rate: number; present: number; total: number }) {
  const C = 2 * Math.PI * 38
  const offset = C * (1 - rate / 100)
  return (
    <div className="flex items-center gap-4">
      <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0">
        <circle cx="42" cy="42" r="38" fill="none" stroke="currentColor" strokeWidth="7" className="text-muted/40" />
        <circle
          cx="42"
          cy="42"
          r="38"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
          className="text-primary transition-all duration-700"
        />
        <text
          x="42"
          y="47"
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="currentColor"
          className="fill-foreground"
        >
          {rate}%
        </text>
      </svg>
      <div className="space-y-1 text-sm">
        <p className="font-semibold">{rate}% rate</p>
        <p className="text-xs text-muted-foreground">{present} present</p>
        <p className="text-xs text-muted-foreground">{total} total records</p>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex gap-6">
      <main className="min-w-0 flex-1 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-14 w-32 rounded-xl" />
            <Skeleton className="h-14 w-32 rounded-xl" />
            <Skeleton className="h-14 w-32 rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      </main>
      <aside className="hidden w-72 shrink-0 space-y-4 lg:block">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </aside>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MyDashboard() {
  const { data: session } = useSession()
  const rawUser = session?.user as Record<string, unknown> | undefined
  const firstName = (rawUser?.firstName as string) || session?.user?.name?.split(" ")[0] || "Student"
  const userId = session?.user?.id

  const [loading, setLoading] = React.useState(true)
  const [courses, setCourses] = React.useState<CourseItem[]>([])
  const [assessments, setAssessments] = React.useState<AssessmentItem[]>([])
  const [announcements, setAnnouncements] = React.useState<AnnouncementItem[]>([])
  const [stats, setStats] = React.useState<Stats>({ courses: 0, dueThisWeek: 0, attendanceRate: 0, present: 0, total: 0 })

  React.useEffect(() => {
    if (!userId) return

    async function load() {
      setLoading(true)
      try {
        const enrollments = await getEnrollmentsByStudent(userId!)
        const active = enrollments.filter((e) => e.status === "active")

        const courseItems: CourseItem[] = active.map((e) => ({
          courseId: e.courseId._id,
          courseName: e.courseId.name,
          courseCode: e.courseId.code,
          sectionName: e.sectionId.name,
          schedule: e.sectionId.schedule,
        }))
        setCourses(courseItems)

        const uniqueCourses = Array.from(
          new Map(active.map((e) => [e.courseId._id, e.courseId])).values()
        )

        const now = Date.now()
        const weekMs = 7 * 24 * 60 * 60 * 1000

        const [assessmentResults, announcementResults, attendanceRecords] = await Promise.all([
          Promise.all(
            uniqueCourses.map((c) =>
              getAssessments(c._id).catch(() => [])
            )
          ),
          Promise.all(
            uniqueCourses.map((c) =>
              getAnnouncements(c._id)
                .then((anns) => anns.map((a) => ({ ...a, courseName: c.name, courseId: c._id })))
                .catch(() => [])
            )
          ),
          getMyAttendance({}).catch(() => []),
        ])

        const allAssessments: AssessmentItem[] = assessmentResults
          .flatMap((list, i) =>
            list
              .filter((a) => a.isPublished)
              .map((a) => ({
                id: a._id,
                title: a.title,
                type: a.type,
                courseName: uniqueCourses[i]!.name,
                courseId: uniqueCourses[i]!._id,
                daysUntil: a.dueDate ? computeDaysUntil(a.dueDate) : 999,
              }))
          )
          .filter((a) => a.daysUntil >= 0)
          .sort((a, b) => a.daysUntil - b.daysUntil)

        setAssessments(allAssessments)

        const allAnnouncements: AnnouncementItem[] = announcementResults
          .flat()
          .sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })
          .map((a) => ({
            id: a._id,
            title: a.title,
            courseName: (a as typeof a & { courseName: string }).courseName,
            time: timeAgo(a.createdAt),
            isPinned: a.isPinned,
            courseId: (a as typeof a & { courseId: string }).courseId,
          }))

        setAnnouncements(allAnnouncements)

        const presentCount = attendanceRecords.filter((r) => r.status === "present").length
        const total = attendanceRecords.length
        const attendanceRate = total > 0 ? Math.round((presentCount / total) * 100) : 0

        const dueThisWeek = allAssessments.filter((a) => {
          const ms = a.daysUntil * 24 * 60 * 60 * 1000
          return ms <= weekMs
        }).length

        setStats({
          courses: active.length,
          dueThisWeek,
          attendanceRate,
          present: presentCount,
          total,
        })
      } catch {
        // silently fail — partial data already set
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  if (loading) return <DashboardSkeleton />

  const pinnedAnnouncement = announcements.find((a) => a.isPinned)
  const displayedCourses = courses.slice(0, 3)
  const displayedAssessments = assessments.slice(0, 6)

  return (
    <div className="flex gap-6">
      {/* ── Main column ─────────────────────────────────────────────── */}
      <main className="min-w-0 flex-1 space-y-6">

        {/* Greeting + stat chips */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {firstName} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s what&apos;s happening in your classes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatChip
              icon={BookOpen}
              value={stats.courses}
              label="Courses"
              colorClass="bg-blue-100 text-blue-600"
            />
            <StatChip
              icon={Clock}
              value={stats.dueThisWeek}
              label="Due this week"
              colorClass="bg-amber-100 text-amber-600"
            />
            <StatChip
              icon={CalendarCheck}
              value={`${stats.attendanceRate}%`}
              label="Attendance"
              colorClass="bg-emerald-100 text-emerald-600"
            />
          </div>
        </div>

        {/* Pinned announcement banner */}
        {pinnedAnnouncement && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
            <Badge className="shrink-0 bg-emerald-500 text-white hover:bg-emerald-500">New</Badge>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{pinnedAnnouncement.title}</p>
              <p className="mt-0.5 text-xs text-emerald-700">{pinnedAnnouncement.courseName}</p>
            </div>
            <Link
              href={`/my-courses/${pinnedAnnouncement.courseId}`}
              className="shrink-0 text-xs font-medium text-emerald-700 hover:underline whitespace-nowrap"
            >
              Go to course →
            </Link>
          </div>
        )}

        {/* Continue Learning */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Continue Learning
            </h2>
            <Link
              href="/my-courses"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {displayedCourses.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
              No active courses yet.{" "}
              <Link href="/my-courses" className="text-primary hover:underline">Browse courses</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {displayedCourses.map((course, i) => (
                <div
                  key={course.courseId}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                      COURSE_BG_COLORS[i % COURSE_BG_COLORS.length]
                    )}
                  >
                    {course.courseCode.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{course.courseName}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.sectionName}
                      {course.schedule ? ` — ${course.schedule}` : ""}
                    </p>
                  </div>
                  <Link href={`/my-courses/${course.courseId}`}>
                    <Button size="sm" variant="outline" className="shrink-0">
                      Continue
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Assessments */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Upcoming Assessments
            </h2>
            <Link
              href="/my-assessments"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {displayedAssessments.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
              No upcoming assessments.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {displayedAssessments.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-3 rounded-xl border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize",
                        TYPE_COLORS[a.type]
                      )}
                    >
                      {a.type}
                    </span>
                    {a.daysUntil <= 1 && (
                      <span className="text-[10px] font-semibold text-destructive">Due soon</span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-sm font-semibold leading-snug">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.courseName}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs",
                        a.daysUntil < 0
                          ? "text-destructive"
                          : a.daysUntil <= 2
                            ? "text-amber-600"
                            : "text-muted-foreground"
                      )}
                    >
                      <Clock className="size-3" />
                      {dueDateLabel(a.daysUntil)}
                    </span>
                    <Link href={`/my-courses/${a.courseId}/${a.type === "assignment" ? "assignments" : "quizzes"}/${a.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Open
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── Right sidebar ───────────────────────────────────────────── */}
      <aside className="hidden w-72 shrink-0 space-y-4 lg:block">

        {/* Stat mini-cards */}
        <Link
          href="/my-assessments"
          className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
        >
          <div>
            <p className="text-2xl font-bold">{assessments.length}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Upcoming assessments</p>
          </div>
          <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
        </Link>

        <Link
          href="/my-assessments"
          className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
        >
          <div>
            <p className="text-2xl font-bold">{stats.dueThisWeek}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Due this week</p>
          </div>
          <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
        </Link>

        {/* Attendance ring */}
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-4 text-sm font-semibold">Attendance</p>
          <AttendanceRing
            rate={stats.attendanceRate}
            present={stats.present}
            total={stats.total}
          />
        </div>

        {/* Recent announcements */}
        {announcements.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Announcements</p>
              <Link href="/my-courses" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {announcements.slice(0, 4).map((a) => (
                <Link key={a.id} href={`/my-courses/${a.courseId}`} className="group block space-y-0.5">
                  <p className="flex items-start gap-1 text-xs font-medium leading-snug group-hover:text-primary">
                    {a.isPinned && <Pin className="mt-0.5 size-3 shrink-0 text-amber-500" />}
                    <span className="line-clamp-2">{a.title}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {a.courseName} · {a.time}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </aside>
    </div>
  )
}
