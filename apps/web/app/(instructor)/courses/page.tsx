"use client"

import * as React from "react"
import { AlertCircle, RefreshCw, Upload } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@workspace/ui/components/pagination"
import { toast } from "sonner"
import {
  getCourses,
  getArchivedCourses,
  unarchiveCourse,
  deleteCourse,
  bulkArchiveCourses,
  bulkDeleteCourses,
  type Course,
  type PaginatedCourses,
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
import { ImportFacultyLoadDialog } from "@/components/common/import-faculty-load-dialog"

export default function CoursesPage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [pagination, setPagination] = React.useState<PaginatedCourses["pagination"] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [view, setView] = React.useState<"grid" | "table">("grid")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [sort, setSort] = React.useState<SortOption>("newest")
  const [page, setPage] = React.useState(1)
  const [showArchived, setShowArchived] = React.useState(false)
  const [courseDialogOpen, setCourseDialogOpen] = React.useState(false)
  const [editingCourse, setEditingCourse] = React.useState<Course | null>(null)
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)

  async function fetchCourses() {
    setLoading(true)
    setError(false)
    try {
      if (showArchived) {
        const archivedSort = sort === "semester" ? undefined : sort
        const data = await getArchivedCourses({ search: debouncedSearch, sort: archivedSort })
        setCourses(data)
        setPagination(null)
      } else {
        const data = await getCourses({ search: debouncedSearch, sort, page, limit: 12 })
        setCourses(data.courses)
        setPagination(data.pagination)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchCourses()
  }, [showArchived])

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  React.useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        if (showArchived) {
          const archivedSort = sort === "semester" ? undefined : sort
        const data = await getArchivedCourses({ search: debouncedSearch, sort: archivedSort })
          setCourses(data)
          setPagination(null)
        } else {
          const data = await getCourses({ search: debouncedSearch, sort, page, limit: 12 })
          setCourses(data.courses)
          setPagination(data.pagination)
        }
      } catch {
        toast.error("Failed to load courses")
      } finally {
        setLoading(false)
      }
    })()
  }, [debouncedSearch, sort, page])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return
    setPage(newPage)
  }

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
      const result = await bulkArchiveCourses(courseIds)
      toast.success(`${result.archived} courses archived`)
      fetchCourses()
    } catch {
      toast.error("Failed to archive courses")
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
      const result = await bulkDeleteCourses(courseIds)
      toast.success(`${result.deleted} courses deleted`)
      fetchCourses()
    } catch {
      toast.error("Failed to delete courses")
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

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading courses...</p>
      </div>
    )
  }

  if (error && courses.length === 0) {
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
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 size-4" />
            Import Faculty Load
          </Button>
          {courses.length > 0 && <ViewToggle value={view} onChange={setView} />}
        </div>
      </div>

      <CourseSearch
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        sort={sort}
        onSortChange={(v) => { setSort(v); setPage(1) }}
        showArchived={showArchived}
        onToggleArchived={(v) => { setShowArchived(v); setPage(1) }}
      />

      {courses.length === 0 && !loading ? (
        <CourseEmpty onCreateCourse={() => setCourseDialogOpen(true)} />
      ) : view === "grid" ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onEdit={handleEdit}
                showArchived={showArchived}
                onUnarchive={handleUnarchive}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(page - 1)}
                    aria-disabled={page <= 1}
                  />
                </PaginationItem>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    aria-disabled={page >= pagination.totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <CoursesDataTable
          data={courses}
          onEdit={handleEdit}
          showArchived={showArchived}
          onUnarchive={handleUnarchive}
          onDelete={handleDelete}
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

      <ImportFacultyLoadDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImported={fetchCourses}
      />
    </div>
  )
}
