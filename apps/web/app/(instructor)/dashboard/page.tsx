"use client"

import * as React from "react"
import { GraduationCap, Users, BookOpen, ClipboardList } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { getCourses, type Course } from "@/lib/services/courses"
import { CourseCard } from "@/components/common/course-card"
import { NewCourseDialog } from "@/components/common/new-course-dialog"
import Link from "next/link"
import { LmsTipCard } from "@/components/lms-tip-card"
import { useSession } from "@/lib/config/auth-client"

export default function InstructorDashboardPage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editCourse, setEditCourse] = React.useState<Course | null>(null)

  async function loadCourses() {
    try {
      const data = await getCourses()
      setCourses(data)
    } catch {
      // handled by error boundary
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadCourses()
  }, [])

  const { data: session } = useSession()
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60000)
    return () => window.clearInterval(interval)
  }, [])

  const dateLabel = now
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase()

  const hour = now.getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const firstName = session?.user?.name?.split(" ")[0] || "there"

  const totalStudents = courses.reduce((sum, c) => sum + c.enrolledCount, 0)
  const totalSections = courses.reduce((sum, c) => sum + c.sectionCount, 0)
  const totalAssessments = courses.reduce((sum, c) => sum + c.assessmentCount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <span className="text-sm font-medium text-zinc-500 dark:text-white">
          {dateLabel}
        </span>
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">
          {greeting}, {firstName}!
        </h1>
        <LmsTipCard
          title="Stay Consistent with Your Learning"
          description="Dedicating just 30 minutes daily to your courses is more effective than cramming. Small, consistent efforts compound into significant progress over time."
        />
      </div>

      {courses.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <Users className="size-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold tabular-nums">{totalStudents}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <BookOpen className="size-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold tabular-nums">{totalSections}</p>
              <p className="text-xs text-muted-foreground">Sections</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <ClipboardList className="size-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold tabular-nums">{totalAssessments}</p>
              <p className="text-xs text-muted-foreground">Assessments</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Courses</h2>
          {courses.length > 9 && (
            <Link
              href="/courses"
              className="text-sm font-medium text-primary hover:underline"
            >
              View All →
            </Link>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <GraduationCap className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No courses yet</p>
            <Link
              href="/courses"
              className="text-sm font-medium text-primary hover:underline"
            >
              Create your first course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 9).map((course) => (
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
        onCreated={() => { setEditCourse(null); loadCourses() }}
      />
    </div>
  )
}
