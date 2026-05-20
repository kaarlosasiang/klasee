"use client"

import * as React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { toast } from "sonner"
import {
  getCourses,
  getArchivedCourses,
  archiveCourse,
  unarchiveCourse,
  deleteCourse,
  duplicateCourse,
  type Course,
} from "@/lib/services/courses"
import { CourseCard } from "@/components/common/course-card"
import { CoursesDataTable } from "@/components/data-table/courses-data-table"
import { ViewToggle } from "@/components/common/view-toggle"
import {
  CourseSearch,
  type SortOption,
} from "@/components/common/course-search"
import { CourseEmpty } from "@/components/common/course-empty"
import { NewCourseDialog } from "@/components/common/new-course-dialog"

export default function CoursesPage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [view, setView] = React.useState<"grid" | "table">("grid")
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<SortOption>("newest")
  const [showArchived, setShowArchived] = React.useState(false)
  const [courseDialogOpen, setCourseDialogOpen] = React.useState(false)
  const [editingCourse, setEditingCourse] = React.useState<Course | null>(null)

  async function fetchCourses() {
    setLoading(true)
    setError(false)
    try {
      const data = showArchived
        ? await getArchivedCourses()
        : await getCourses()
      setCourses(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchCourses()
  }, [showArchived])

  const filtered = React.useMemo(() => {
    let result = courses

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      )
    }

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        case "semester":
          return (a.semester || "").localeCompare(b.semester || "")
        default:
          return 0
      }
    })

    return result
  }, [courses, search, sort])

  async function handleDelete(course: Course) {
    try {
      await deleteCourse(course._id)
      toast.success(`${course.name} deleted`)
      fetchCourses()
    } catch {
      toast.error("Failed to delete course")
    }
  }

  async function handleBulkArchive(courseIds: string[]) {
    try {
      await Promise.all(courseIds.map((id) => archiveCourse(id)))
      toast.success(`${courseIds.length} courses archived`)
      fetchCourses()
    } catch {
      toast.error("Failed to archive some courses")
    }
  }

  async function handleBulkUnarchive(courseIds: string[]) {
    try {
      await Promise.all(courseIds.map((id) => unarchiveCourse(id)))
      toast.success(`${courseIds.length} courses unarchived`)
      fetchCourses()
    } catch {
      toast.error("Failed to unarchive some courses")
    }
  }

  async function handleBulkDelete(courseIds: string[]) {
    try {
      await Promise.all(courseIds.map((id) => deleteCourse(id)))
      toast.success(`${courseIds.length} courses deleted`)
      fetchCourses()
    } catch {
      toast.error("Failed to delete some courses")
    }
  }

  async function handleDuplicate(course: Course) {
    try {
      await duplicateCourse(course._id)
      toast.success(`${course.name} duplicated`)
      fetchCourses()
    } catch {
      toast.error("Failed to duplicate course")
    }
  }

  async function handleUnarchive(course: Course) {
    try {
      await unarchiveCourse(course._id)
      toast.success(`${course.name} unarchived`)
      fetchCourses()
    } catch {
      toast.error("Failed to unarchive course")
    }
  }

  function handleEdit(course: Course) {
    setEditingCourse(course)
    setCourseDialogOpen(true)
  }

  function handleDialogClose(open: boolean) {
    setCourseDialogOpen(open)
    if (!open) setEditingCourse(null)
  }

  function handleCreated() {
    fetchCourses()
    setEditingCourse(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading courses...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-6 text-destructive" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">Failed to load courses</p>
          <p className="mt-1 text-sm text-muted-foreground">Something went wrong. Please try again.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCourses}>
          <RefreshCw className="mr-2 size-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Courses</h1>
        {courses.length > 0 && (
          <div className="flex items-center gap-3">
            <ViewToggle value={view} onChange={setView} />
          </div>
        )}
      </div>

      {courses.length > 0 && (
        <CourseSearch
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          showArchived={showArchived}
          onToggleArchived={setShowArchived}
        />
      )}

      {filtered.length === 0 && !loading ? (
        <CourseEmpty onCreateCourse={() => setCourseDialogOpen(true)} />
      ) : view === "grid" ? (
        <div className="3xl:grid-cols-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onEdit={handleEdit}
              showArchived={showArchived}
              onUnarchive={handleUnarchive}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      ) : (
        <CoursesDataTable
          data={filtered}
          onEdit={handleEdit}
          showArchived={showArchived}
          onUnarchive={handleUnarchive}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onBulkArchive={handleBulkArchive}
          onBulkUnarchive={handleBulkUnarchive}
          onBulkDelete={handleBulkDelete}
        />
      )}

      <NewCourseDialog
        open={courseDialogOpen}
        onOpenChange={handleDialogClose}
        course={editingCourse ?? undefined}
        onCreated={handleCreated}
      />

    </div>
  )
}
