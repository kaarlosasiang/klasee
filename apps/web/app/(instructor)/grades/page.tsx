"use client"

import * as React from "react"
import { ClipboardList, Users, BookOpen, TrendingUp, Award } from "lucide-react"
import { GradebookDataTable } from "@/components/data-table/gradebook-data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import { getCourses, type Course } from "@/lib/services/courses"
import { getCourseGradebook, type CourseGradebook } from "@/lib/services/gradebook"

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

export default function GradesPage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [courseId, setCourseId] = React.useState("")
  const [gradebook, setGradebook] = React.useState<CourseGradebook | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadingGradebook, setLoadingGradebook] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)

  React.useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setLoading(false))
  }, [])

  const fetchGradebook = React.useCallback(
    (courseId: string, p: number, l: number) => {
      setLoadingGradebook(true)
      getCourseGradebook(courseId, p, l)
        .then(setGradebook)
        .catch(() => toast.error("Failed to load gradebook"))
        .finally(() => setLoadingGradebook(false))
    },
    []
  )

  React.useEffect(() => {
    if (!courseId) {
      setGradebook(null)
      return
    }
    setPage(1)
    fetchGradebook(courseId, 1, limit)
  }, [courseId, limit, fetchGradebook])

  const handlePaginationChange = React.useCallback(
    (newPage: number, newLimit: number) => {
      setPage(newPage)
      if (newLimit !== limit) setLimit(newLimit)
      fetchGradebook(courseId, newPage, newLimit)
    },
    [courseId, limit, fetchGradebook]
  )

  const stats = React.useMemo(() => {
    if (!gradebook) return null
    const gradedStudents = gradebook.students.filter((s) => s.finalScore !== null)
    const avgScore =
      gradedStudents.length > 0
        ? gradedStudents.reduce((sum, s) => sum + s.finalScore!, 0) / gradedStudents.length
        : null
    const passing = gradedStudents.filter(
      (s) => s.gradeEntry && parseFloat(s.gradeEntry.grade) <= 3.0
    ).length
    return {
      total: gradebook.total,
      assessmentCount: gradebook.assessments.length,
      avgScore,
      passing,
      graded: gradedStudents.length,
    }
  }, [gradebook])

  const selectedCourse = courses.find((c) => c._id === courseId)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grades</h1>
          {selectedCourse && (
            <p className="mt-0.5 text-sm text-muted-foreground">{selectedCourse.name}</p>
          )}
        </div>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!courseId ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
            <ClipboardList className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No course selected</p>
            <p className="text-xs text-muted-foreground">Choose a course from the dropdown to view grades</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          {loadingGradebook ? (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={Users}
                label="Enrolled"
                value={stats.total}
                sub="students"
              />
              <StatCard
                icon={BookOpen}
                label="Assessments"
                value={stats.assessmentCount}
                sub="in this course"
              />
              <StatCard
                icon={TrendingUp}
                label="Class Average"
                value={stats.avgScore !== null ? `${Math.round(stats.avgScore)}%` : "—"}
                sub={stats.graded > 0 ? `${stats.graded} student${stats.graded !== 1 ? "s" : ""} graded` : "no grades yet"}
              />
              <StatCard
                icon={Award}
                label="Passing"
                value={stats.graded > 0 ? `${stats.passing} / ${stats.graded}` : "—"}
                sub={stats.graded > 0 ? `${Math.round((stats.passing / stats.graded) * 100)}% pass rate` : "no grades yet"}
              />
            </div>
          ) : null}

          {/* Table */}
          {loadingGradebook ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : gradebook ? (
            <GradebookDataTable
              courseId={courseId}
              gradebook={gradebook}
              onPaginationChange={handlePaginationChange}
              onScoreSaved={() => fetchGradebook(courseId, page, limit)}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
