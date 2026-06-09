"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookOpen,
  Clock,
  CalendarCheck,
  ArrowRight,
  Pin,
  ClipboardList,
  GraduationCap,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useSession } from "@/lib/config/auth-client"

// ---------------------------------------------------------------------------
// Mock data — replace with real API calls in Phase 2
// ---------------------------------------------------------------------------

const MOCK_COURSES = [
  { id: "1", name: "Introduction to Programming", code: "CS101", section: "Section A", schedule: "MWF 9:00–10:00 AM" },
  { id: "2", name: "Data Structures & Algorithms", code: "CS201", section: "Section B", schedule: "TTh 1:00–2:30 PM" },
  { id: "3", name: "Web Development", code: "CS301", section: "Section A", schedule: "MWF 2:00–3:00 PM" },
]

const MOCK_ASSESSMENTS = [
  { id: "1", title: "Midterm Quiz: Arrays & Loops", type: "quiz" as const, course: "Introduction to Programming", daysUntil: 1 },
  { id: "2", title: "Assignment 3: Binary Search Tree", type: "assignment" as const, course: "Data Structures & Algorithms", daysUntil: 3 },
  { id: "3", title: "Lab Report: REST APIs", type: "assignment" as const, course: "Web Development", daysUntil: 5 },
  { id: "4", title: "Final Exam", type: "exam" as const, course: "Introduction to Programming", daysUntil: 14 },
  { id: "5", title: "Quiz 4: React Hooks", type: "quiz" as const, course: "Web Development", daysUntil: 7 },
  { id: "6", title: "Project 2: Sorting Visualizer", type: "assignment" as const, course: "Data Structures & Algorithms", daysUntil: 10 },
]

const MOCK_ANNOUNCEMENTS = [
  { id: "1", title: "Midterm schedule has been updated", course: "Introduction to Programming", time: "2h ago", isPinned: true },
  { id: "2", title: "Lab session moved to Room 204", course: "Web Development", time: "5h ago", isPinned: false },
  { id: "3", title: "Assignment 3 deadline extended", course: "Data Structures & Algorithms", time: "Yesterday", isPinned: false },
  { id: "4", title: "Guest lecture this Friday", course: "Introduction to Programming", time: "2 days ago", isPinned: false },
]

const MOCK_STATS = { courses: 3, dueThisWeek: 2, attendanceRate: 87, present: 26, total: 30 }

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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MyDashboard() {
  const { data: session } = useSession()
  const rawUser = session?.user as Record<string, unknown> | undefined
  const firstName = (rawUser?.firstName as string) || session?.user?.name?.split(" ")[0] || "Student"

  const pinnedAnnouncement = MOCK_ANNOUNCEMENTS.find((a) => a.isPinned)

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
              Here's what's happening in your classes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatChip
              icon={BookOpen}
              value={MOCK_STATS.courses}
              label="Courses"
              colorClass="bg-blue-100 text-blue-600"
            />
            <StatChip
              icon={Clock}
              value={MOCK_STATS.dueThisWeek}
              label="Due this week"
              colorClass="bg-amber-100 text-amber-600"
            />
            <StatChip
              icon={CalendarCheck}
              value={`${MOCK_STATS.attendanceRate}%`}
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
              <p className="mt-0.5 text-xs text-emerald-700">{pinnedAnnouncement.course}</p>
            </div>
            <Link
              href="/my-courses"
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
          <div className="space-y-2">
            {MOCK_COURSES.map((course, i) => (
              <div
                key={course.id}
                className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                    COURSE_BG_COLORS[i % COURSE_BG_COLORS.length]
                  )}
                >
                  {course.code.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{course.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.section}
                    {course.schedule ? ` — ${course.schedule}` : ""}
                  </p>
                </div>
                <Link href={`/my-courses/${course.id}`}>
                  <Button size="sm" variant="outline" className="shrink-0">
                    Continue
                  </Button>
                </Link>
              </div>
            ))}
          </div>
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_ASSESSMENTS.map((a) => (
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
                <p className="text-xs text-muted-foreground">{a.course}</p>
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
                  <Link href="/my-assessments">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Open
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
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
            <p className="text-2xl font-bold">{MOCK_ASSESSMENTS.length}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Total assessments</p>
          </div>
          <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
        </Link>

        <Link
          href="/my-assessments"
          className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
        >
          <div>
            <p className="text-2xl font-bold">{MOCK_STATS.dueThisWeek}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Due this week</p>
          </div>
          <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
        </Link>

        {/* Attendance ring */}
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-4 text-sm font-semibold">Attendance</p>
          <AttendanceRing
            rate={MOCK_STATS.attendanceRate}
            present={MOCK_STATS.present}
            total={MOCK_STATS.total}
          />
        </div>

        {/* Recent announcements */}
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Announcements</p>
            <Link href="/my-courses" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_ANNOUNCEMENTS.map((a) => (
              <Link key={a.id} href="/my-courses" className="group block space-y-0.5">
                <p className="flex items-start gap-1 text-xs font-medium leading-snug group-hover:text-primary">
                  {a.isPinned && <Pin className="mt-0.5 size-3 shrink-0 text-amber-500" />}
                  <span className="line-clamp-2">{a.title}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {a.course} · {a.time}
                </p>
              </Link>
            ))}
          </div>
        </div>

      </aside>
    </div>
  )
}
