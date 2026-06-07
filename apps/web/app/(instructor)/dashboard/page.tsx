"use client"

import * as React from "react"
import { GraduationCap, Users, BookOpen, ClipboardList, LayoutGrid, type LucideIcon } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { getCourses, type Course } from "@/lib/services/courses"
import { CourseCard } from "@/components/common/course-card"
import { NewCourseDialog } from "@/components/common/new-course-dialog"
import Link from "next/link"
import { LmsTipCard } from "@/components/lms-tip-card"
import { useSession } from "@/lib/config/auth-client"

interface StatCardProps {
  icon: LucideIcon
  value: number
  label: string
  iconClass: string
  iconBgClass: string
}

function StatCard({ icon: Icon, value, label, iconClass, iconBgClass }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconBgClass}`}>
        <Icon className={`size-5 ${iconClass}`} />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export default function InstructorDashboardPage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editCourse, setEditCourse] = React.useState<Course | null>(null)

  async function loadCourses() {
    try {
      const data = await getCourses()
      setCourses(data.courses)
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={Users}
            value={totalStudents}
            label="Students"
            iconBgClass="bg-blue-50 dark:bg-blue-950/40"
            iconClass="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={BookOpen}
            value={courses.length}
            label="Courses"
            iconBgClass="bg-purple-50 dark:bg-purple-950/40"
            iconClass="text-purple-600 dark:text-purple-400"
          />
          <StatCard
            icon={LayoutGrid}
            value={totalSections}
            label="Sections"
            iconBgClass="bg-emerald-50 dark:bg-emerald-950/40"
            iconClass="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={ClipboardList}
            value={totalAssessments}
            label="Assessments"
            iconBgClass="bg-amber-50 dark:bg-amber-950/40"
            iconClass="text-amber-600 dark:text-amber-400"
          />
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Courses</h2>
          {courses.length > 0 && (
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
