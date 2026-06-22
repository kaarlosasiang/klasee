"use client"

import * as React from "react"
import { CalendarDays, Printer, Table2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import { toast } from "sonner"
import { useSidebar } from "@workspace/ui/components/sidebar"
import { getCourses, type Course } from "@/lib/services/courses"
import { getSectionsByCourse, type Section } from "@/lib/services/sections"
import { ScheduleCalendarView, type FlatSection } from "@/components/schedules/ScheduleCalendarView"
import { ScheduleTableView } from "@/components/schedules/ScheduleTableView"
import { ScheduleEditDialog } from "@/components/schedules/ScheduleEditDialog"
import { AttendancePanel } from "@/components/schedules/AttendancePanel"
import { ExportCourseOfferingDialog } from "@/components/common/export-course-offering-dialog"

const BG_CLASSES = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-teal-500",
]

export default function SchedulesPage() {
  const { setOpen } = useSidebar()
  const [items, setItems] = React.useState<FlatSection[]>([])
  const [courses, setCourses] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(true)
  const [view, setView] = React.useState<"calendar" | "table">("calendar")
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<{ section: Section; course: Course } | null>(null)
  const [attendanceTarget, setAttendanceTarget] = React.useState<{
    section: Section
    course: Course
    date: string
  } | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)

  React.useEffect(() => {
    setOpen(false)
    return () => setOpen(true)
  }, [setOpen])

  React.useEffect(() => {
    setLoading(true)
    getCourses()
      .then(async ({ courses: loadedCourses }) => {
        setCourses(loadedCourses)
        const nested = await Promise.all(
          loadedCourses.map((course, i) =>
            getSectionsByCourse(course._id).then((sections) =>
              sections.map((section) => ({
                section,
                course,
                bgClass: BG_CLASSES[i % BG_CLASSES.length] ?? "bg-gray-500",
              }))
            )
          )
        )
        setItems(nested.flat())
      })
      .catch(() => toast.error("Failed to load schedules"))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading) {
    return (
      <div className="flex gap-4">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
        <div className="hidden w-96 shrink-0 lg:block">
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as "calendar" | "table")}
          >
            <ToggleGroupItem value="calendar" aria-label="Calendar view">
              <CalendarDays className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <Table2 className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
          >
            <Printer className="mr-2 size-4" />
            Export Course Offering
          </Button>
        </div>
      </div>

      {/* Split layout: schedule left, attendance right */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <CalendarDays className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No courses available. Create a course first to generate a schedule.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left: calendar or table */}
          <div className="min-w-0 flex-1">
            {view === "calendar" ? (
              <ScheduleCalendarView
                items={items}
                onAttendance={(section, course, date) =>
                  setAttendanceTarget({ section, course, date })
                }
                onEdit={(section, course) => setEditTarget({ section, course })}
              />
            ) : (
              <ScheduleTableView
                items={items}
                onAttendance={(section, course, date) =>
                  setAttendanceTarget({ section, course, date })
                }
                onEdit={(section, course) => setEditTarget({ section, course })}
              />
            )}
          </div>

          {/* Right: attendance panel — sticky on desktop */}
          <div className="w-full lg:w-96 lg:shrink-0">
            <div className="lg:sticky lg:top-4">
              <AttendancePanel
                section={attendanceTarget?.section ?? null}
                course={attendanceTarget?.course ?? null}
                date={attendanceTarget?.date ?? null}
              />
            </div>
          </div>
        </div>
      )}

      <ScheduleEditDialog
        section={editTarget?.section ?? null}
        course={editTarget?.course ?? null}
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />

      <ExportCourseOfferingDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        courses={courses}
      />
    </div>
  )
}
