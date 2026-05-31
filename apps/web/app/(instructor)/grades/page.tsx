"use client"

import * as React from "react"
import { ClipboardList } from "lucide-react"
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
      if (newLimit !== limit) {
        setLimit(newLimit)
      }
      fetchGradebook(courseId, newPage, newLimit)
    },
    [courseId, limit, fetchGradebook]
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Grades</h1>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Course</label>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="w-56">
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
        <div className="flex flex-col items-center gap-3 py-16">
          <ClipboardList className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a course to view grades</p>
        </div>
      ) : loadingGradebook ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : gradebook ? (
        <GradebookDataTable
          gradebook={gradebook}
          onPaginationChange={handlePaginationChange}
          onScoreSaved={() => fetchGradebook(courseId, page, limit)}
        />
      ) : null}
    </div>
  )
}
