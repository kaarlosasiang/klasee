"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { toast } from "sonner"
import { getCourses, getArchivedCourses, archiveCourse, type Course } from "@/lib/services/courses"
import { CourseCard } from "@/components/common/course-card"
import { CoursesDataTable } from "@/components/data-table/courses-data-table"
import { ViewToggle } from "@/components/common/view-toggle"
import { CourseSearch, type SortOption } from "@/components/common/course-search"
import { ArchiveCourseDialog } from "@/components/common/archive-course-dialog"
import { CourseEmpty } from "@/components/common/course-empty"
import { NewCourseDialog } from "@/components/common/new-course-dialog"

export default function CoursesPage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(true)
  const [view, setView] = React.useState<"grid" | "table">("grid")
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<SortOption>("newest")
  const [showArchived, setShowArchived] = React.useState(false)
  const [archiveTarget, setArchiveTarget] = React.useState<Course | null>(null)
  const [courseDialogOpen, setCourseDialogOpen] = React.useState(false)
  const [editingCourse, setEditingCourse] = React.useState<Course | null>(null)

  async function fetchCourses() {
    setLoading(true)
    try {
      const data = showArchived ? await getArchivedCourses() : await getCourses()
      setCourses(data)
    } catch {
      toast.error("Failed to load courses")
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
        (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      )
    }

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "semester":
          return (a.semester || "").localeCompare(b.semester || "")
        default:
          return 0
      }
    })

    return result
  }, [courses, search, sort])

  async function handleArchive(course: Course) {
    try {
      await archiveCourse(course._id)
      toast.success(`${course.name} archived`)
      setArchiveTarget(null)
      fetchCourses()
    } catch {
      toast.error("Failed to archive course")
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Courses</h1>
        {courses.length > 0 && (
          <div className="flex items-center gap-3">
            <ViewToggle value={view} onChange={setView} />
            <Button onClick={() => setCourseDialogOpen(true)} className="gap-2">
              <Plus className="size-4" />
              New Course
            </Button>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onArchive={setArchiveTarget}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <CoursesDataTable
          data={filtered}
          onArchive={setArchiveTarget}
          onEdit={handleEdit}
        />
      )}

      <ArchiveCourseDialog
        course={archiveTarget}
        open={!!archiveTarget}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null)
        }}
        onConfirm={handleArchive}
      />

      <NewCourseDialog
        open={courseDialogOpen}
        onOpenChange={handleDialogClose}
        course={editingCourse ?? undefined}
        onCreated={handleCreated}
      />
    </div>
  )
}
