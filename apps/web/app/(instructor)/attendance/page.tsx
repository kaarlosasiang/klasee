"use client"

import * as React from "react"
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "sonner"
import { getCourses, type Course } from "@/lib/services/courses"
import {
  getSectionsByCourse,
  type Section,
} from "@/lib/services/sections"
import {
  getAttendance,
  createAttendance,
  updateAttendance,
  type AttendanceRecord,
} from "@/lib/services/attendance"

const STATUS_OPTIONS = ["present", "absent", "late", "excused"] as const
const STATUS_COLORS: Record<string, string> = {
  present: "bg-emerald-500 hover:bg-emerald-600",
  absent: "bg-red-500 hover:bg-red-600",
  late: "bg-amber-500 hover:bg-amber-600",
  excused: "bg-gray-400 hover:bg-gray-500",
}

export default function AttendancePage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [sections, setSections] = React.useState<Section[]>([])
  const [courseId, setCourseId] = React.useState("")
  const [sectionId, setSectionId] = React.useState("")
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]!)
  const [records, setRecords] = React.useState<AttendanceRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState<string | null>(null)

  React.useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => toast.error("Failed to load courses"))
  }, [])

  React.useEffect(() => {
    if (!courseId) {
      setSections([])
      return
    }
    getSectionsByCourse(courseId)
      .then(setSections)
      .catch(() => toast.error("Failed to load sections"))
  }, [courseId])

  const fetchAttendance = React.useCallback(async () => {
    if (!courseId || !sectionId || !date) return
    setLoading(true)
    try {
      const data = await getAttendance({ courseId, sectionId, date })
      setRecords(data)
    } catch {
      toast.error("Failed to load attendance")
    } finally {
      setLoading(false)
    }
  }, [courseId, sectionId, date])

  React.useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const selectedCourse = courses.find((c) => c._id === courseId)
  const enrolledSections = selectedCourse
    ? sections
    : []

  async function handleStatusChange(
    studentId: string,
    status: (typeof STATUS_OPTIONS)[number],
    existingRecord?: AttendanceRecord
  ) {
    setSaving(studentId)
    try {
      if (existingRecord) {
        await updateAttendance(existingRecord._id, { status })
      } else {
        await createAttendance({
          courseId,
          sectionId,
          studentId,
          date,
          status,
        })
      }
      await fetchAttendance()
    } catch {
      toast.error("Failed to update attendance")
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Course
          </label>
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

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Section
          </label>
          <Select
            value={sectionId}
            onValueChange={setSectionId}
            disabled={!courseId}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select a section" />
            </SelectTrigger>
            <SelectContent>
              {enrolledSections.map((section) => (
                <SelectItem key={section._id} value={section._id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex h-9 w-40 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : !courseId || !sectionId ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <CalendarCheck className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Select a course, section, and date to manage attendance
          </p>
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <CalendarCheck className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No attendance records for this date. Select a student to mark
            attendance.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <div
              key={record.studentId._id}
              className="flex items-center justify-between rounded-xl border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {record.studentId.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {record.studentId.email}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={saving === record.studentId._id}
                    onClick={() =>
                      handleStatusChange(
                        record.studentId._id,
                        status,
                        record
                      )
                    }
                    className={`rounded-md px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-50 ${
                      record.status === status
                        ? STATUS_COLORS[status]
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {saving === record.studentId._id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      status.charAt(0).toUpperCase() + status.slice(1)
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
