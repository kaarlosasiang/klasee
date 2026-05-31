"use client"

import * as React from "react"
import { CalendarDays, Printer, Save, BookOpen } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Input } from "@workspace/ui/components/input"
import { toast } from "sonner"
import { getCourses, type Course } from "@/lib/services/courses"
import { getSectionsByCourse, updateSection, type Section } from "@/lib/services/sections"
import { SchedulePicker } from "@/components/common/schedule-picker"
import { ExportCourseOfferingDialog } from "@/components/common/export-course-offering-dialog"

interface SectionDraft {
  schedule: string
  labSchedule: string
  room: string
}

interface SectionRowProps {
  section: Section
}

function SectionRow({ section }: SectionRowProps) {
  const [draft, setDraft] = React.useState<SectionDraft>({
    schedule: section.schedule ?? "",
    labSchedule: section.labSchedule ?? "",
    room: section.room ?? "",
  })
  const [saving, setSaving] = React.useState(false)

  const isDirty =
    draft.schedule !== (section.schedule ?? "") ||
    draft.labSchedule !== (section.labSchedule ?? "") ||
    draft.room !== (section.room ?? "")

  async function handleSave() {
    setSaving(true)
    try {
      await updateSection(section._id, {
        schedule: draft.schedule || undefined,
        labSchedule: draft.labSchedule || undefined,
        room: draft.room || undefined,
      })
      toast.success(`${section.name} schedule saved`)
    } catch {
      toast.error("Failed to save schedule")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-medium">{section.name}</p>
          <p className="text-xs text-muted-foreground">
            {section.enrolledCount} student{section.enrolledCount !== 1 ? "s" : ""}
            {section.room || draft.room
              ? ` · Room ${draft.room || section.room}`
              : ""}
          </p>
        </div>
        {isDirty && (
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="mr-1.5 size-3.5" />
            {saving ? "Saving…" : "Save"}
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Lecture schedule</label>
          <SchedulePicker
            value={draft.schedule}
            onChange={(v) => setDraft((d) => ({ ...d, schedule: v }))}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Lab schedule</label>
          <SchedulePicker
            value={draft.labSchedule}
            onChange={(v) => setDraft((d) => ({ ...d, labSchedule: v }))}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Room</label>
          <Input
            value={draft.room}
            onChange={(e) => setDraft((d) => ({ ...d, room: e.target.value }))}
            placeholder="e.g. Room 301"
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  )
}

interface CourseGroupProps {
  course: Course
}

function CourseGroup({ course }: CourseGroupProps) {
  const [sections, setSections] = React.useState<Section[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    getSectionsByCourse(course._id)
      .then(setSections)
      .catch(() => toast.error(`Failed to load sections for ${course.name}`))
      .finally(() => setLoading(false))
  }, [course._id, course.name])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="size-4 text-muted-foreground" />
        <h2 className="font-semibold">{course.name}</h2>
        <span className="text-xs text-muted-foreground">
          {course.code} &middot;{" "}
          {course.semester === "1st"
            ? "1st Sem"
            : course.semester === "2nd"
            ? "2nd Sem"
            : "Summer"}
        </span>
      </div>

      {loading ? (
        <Skeleton className="h-32 w-full rounded-lg" />
      ) : sections.length === 0 ? (
        <p className="pl-6 text-xs text-muted-foreground">No sections yet</p>
      ) : (
        <div className="space-y-2 pl-6">
          {sections.map((section) => (
            <SectionRow key={section._id} section={section} />
          ))}
        </div>
      )}
    </div>
  )
}

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
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
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
        <div className="space-y-8">
          {courses.map((course) => (
            <CourseGroup key={course._id} course={course} />
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
