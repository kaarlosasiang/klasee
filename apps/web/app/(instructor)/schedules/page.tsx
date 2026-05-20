"use client"

import * as React from "react"
import { CalendarDays, Printer } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import { getCourses, type Course } from "@/lib/services/courses"
import { ExportCourseOfferingDialog } from "@/components/common/export-course-offering-dialog"

export default function SchedulesPage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(true)
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false)

  React.useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setLoading(false))
  }, [])

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Schedules</h1>
        <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}>
          <Printer className="mr-2 size-4" />
          Export Course Offering
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <CalendarDays className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No courses available. Create a course first to generate a schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{course.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {course.code} &middot; {course.semester === "1st" ? "1st Sem" : course.semester === "2nd" ? "2nd Sem" : "Summer"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{course.sectionCount} section{course.sectionCount !== 1 ? "s" : ""}</span>
                  <span>{course.enrolledCount} student{course.enrolledCount !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ExportCourseOfferingDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        courses={courses}
      />
    </div>
  )
}
