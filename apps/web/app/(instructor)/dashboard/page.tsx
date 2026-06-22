"use client"

import * as React from "react"
import { GraduationCap, CalendarCheck, Clock, Pencil } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { getCourses, type Course } from "@/lib/services/courses"
import { getSections, type Section } from "@/lib/services/sections"
import { getRecentSubmissions, type RecentSubmission } from "@/lib/services/assignment-submissions"
import { CourseCard } from "@/components/common/course-card"
import { NewCourseDialog } from "@/components/common/new-course-dialog"
import Link from "next/link"
import { LmsTipCard } from "@/components/lms-tip-card"
import { useSession } from "@/lib/config/auth-client"
import { timeAgo } from "@/lib/utils/time"

const DAY_ABBRS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

function parseScheduleTime(schedule: string): string {
  const match = schedule.match(/(\d{2}:\d{2}-\d{2}:\d{2})$/)
  return match?.[1] ?? ""
}

export default function InstructorDashboardPage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [sections, setSections] = React.useState<Section[]>([])
  const [recentSubmissions, setRecentSubmissions] = React.useState<RecentSubmission[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editCourse, setEditCourse] = React.useState<Course | null>(null)

  React.useEffect(() => {
    Promise.all([
      getCourses().then((d) => setCourses(d.courses)),
      getSections().then(setSections),
      getRecentSubmissions(6).then(setRecentSubmissions),
    ])
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const { data: session } = useSession()
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60000)
    return () => window.clearInterval(interval)
  }, [])

  const dateLabel = now
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    .toUpperCase()

  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const firstName = session?.user?.name?.split(" ")[0] || "there"

  const todayAbbr = DAY_ABBRS[now.getDay()]!
  const todaySections = sections.filter((s) => s.schedule?.includes(todayAbbr))

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-sm font-medium text-zinc-500 dark:text-white">{dateLabel}</span>
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">
          {greeting}, {firstName}!
        </h1>
        <LmsTipCard
          title="Stay Consistent with Your Learning"
          description="Dedicating just 30 minutes daily to your courses is more effective than cramming. Small, consistent efforts compound into significant progress over time."
        />
      </div>

      {/* Today's Classes */}
      {todaySections.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <CalendarCheck className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Today's Classes</h2>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border">
            {todaySections.map((section) => {
              const courseCode = typeof section.courseId === "object" ? section.courseId.code : ""
              const time = section.schedule ? parseScheduleTime(section.schedule) : ""
              return (
                <Link
                  key={section._id}
                  href="/schedules"
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/40"
                >
                  <span className="font-medium">
                    {courseCode && <span className="text-muted-foreground">{courseCode} · </span>}
                    {section.name}
                  </span>
                  <span className="flex items-center gap-3 text-xs text-muted-foreground">
                    {time && <span className="flex items-center gap-1"><Clock className="size-3" />{time}</span>}
                    {section.room && <span>{section.room}</span>}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      {recentSubmissions.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pencil className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Needs Grading</h2>
            </div>
            <Link href="/grades" className="text-xs font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border">
            {recentSubmissions.map((sub) => (
              <Link
                key={sub._id}
                href="/grades"
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/40"
              >
                <span>
                  <span className="font-medium">{sub.student.name}</span>
                  <span className="ml-2 text-muted-foreground">
                    · {sub.assessment.title}
                    {sub.assessment.courseId?.code && (
                      <span className="ml-1 text-xs">({sub.assessment.courseId.code})</span>
                    )}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">{timeAgo(sub.submittedAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Courses */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Courses</h2>
          {courses.length > 0 && (
            <Link href="/courses" className="text-sm font-medium text-primary hover:underline">
              View All →
            </Link>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <GraduationCap className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No courses yet</p>
            <Link href="/courses" className="text-sm font-medium text-primary hover:underline">
              Create your first course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {courses.slice(0, 8).map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onEdit={(c) => setEditCourse(c)}
              />
            ))}
          </div>
        )}
      </div>

      <NewCourseDialog
        open={editCourse !== null}
        onOpenChange={(open) => { if (!open) setEditCourse(null) }}
        course={editCourse ?? undefined}
        onCreated={() => { setEditCourse(null) }}
      />
    </div>
  )
}
