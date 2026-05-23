"use client"

import * as React from "react"
import { CalendarCheck, RefreshCw, WifiOff } from "lucide-react"
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
import { getSectionsByCourse, type Section } from "@/lib/services/sections"
import {
  getAttendance,
  createAttendance,
  updateAttendance,
  type AttendanceRecord,
  type AttendanceStatus,
} from "@/lib/services/attendance"
import { getEnrollmentsBySection } from "@/lib/services/enrollments"
import { db } from "@/lib/db"
import { useAttendanceSync } from "@/lib/hooks/useAttendanceSync"
import {
  AttendanceDataTable,
  type AttendanceRow,
} from "@/components/attendance/AttendanceDataTable"
import { AttendanceSheet } from "@/components/attendance/AttendanceSheet"
import { DatePicker } from "@/components/attendance/DatePicker"

function isNetworkError(err: unknown): boolean {
  if (!navigator.onLine) return true
  const code = (err as any)?.code
  const msg = (err as any)?.message ?? ""
  return code === "ERR_NETWORK" || msg === "Network Error"
}

export default function AttendancePage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [sections, setSections] = React.useState<Section[]>([])
  const [courseId, setCourseId] = React.useState("")
  const [sectionId, setSectionId] = React.useState("")
  const [date, setDate] = React.useState(
    new Date().toISOString().split("T")[0]!
  )

  const [enrolledIds, setEnrolledIds] = React.useState<
    { studentId: string; name: string; email: string }[]
  >([])
  const [recordMap, setRecordMap] = React.useState<
    Record<string, AttendanceRecord>
  >({})
  const [optimistic, setOptimistic] = React.useState<
    Record<string, AttendanceStatus>
  >({})
  const [loading, setLoading] = React.useState(false)

  const [saving, setSaving] = React.useState<string | null>(null)
  const [noteMap, setNoteMap] = React.useState<Record<string, string>>({})
  const [sheetStudent, setSheetStudent] = React.useState<AttendanceRow | null>(null)
  const [historyMap, setHistoryMap] = React.useState<
    Record<string, AttendanceRecord[]>
  >({})

  const handleSynced = React.useCallback(() => {
    refreshSession()
  }, [])

  const { pendingCount, isSyncing, isOnline } = useAttendanceSync(handleSynced)

  React.useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => toast.error("Failed to load courses"))
  }, [])

  React.useEffect(() => {
    if (!courseId) {
      setSections([])
      setSectionId("")
      return
    }
    getSectionsByCourse(courseId)
      .then(setSections)
      .catch(() => toast.error("Failed to load sections"))
  }, [courseId])

  async function fetchSession() {
    if (!courseId || !sectionId || !date) return
    setLoading(true)
    try {
      await loadData()
    } catch {
      toast.error("Failed to load attendance")
    } finally {
      setLoading(false)
    }
  }

  async function refreshSession() {
    if (!courseId || !sectionId || !date) return
    try {
      await loadData()
    } catch {
      // silent — user-facing error already shown by loadData
    }
  }

  async function loadData() {
    const [enrollments, records, allRecords] = await Promise.all([
      getEnrollmentsBySection(sectionId),
      getAttendance({ sectionId, date }),
      getAttendance({ sectionId }),
    ])
    const active = enrollments
      .filter((e) => e.status === "active")
      .map((e) => ({
        studentId: e.studentId._id,
        name: e.studentId.name,
        email: e.studentId.email,
      }))
    const map: Record<string, AttendanceRecord> = {}
    for (const r of records) map[r.studentId._id] = r
    const hMap: Record<string, AttendanceRecord[]> = {}
    for (const r of allRecords) {
      const sid = r.studentId._id
      if (!hMap[sid]) hMap[sid] = []
      hMap[sid]!.push(r)
    }
    setEnrolledIds(active)
    setRecordMap(map)
    setHistoryMap(hMap)
    setOptimistic({})
    setNoteMap({})
  }

  React.useEffect(() => {
    fetchSession()
  }, [courseId, sectionId, date])

  const rows = React.useMemo<AttendanceRow[]>(
    () =>
      enrolledIds.map((s) => ({
        studentId: s.studentId,
        name: s.name,
        email: s.email,
        status: optimistic[s.studentId] ?? recordMap[s.studentId]?.status ?? null,
        note: noteMap[s.studentId] ?? recordMap[s.studentId]?.note ?? undefined,
        isPending: s.studentId in optimistic,
      })),
    [enrolledIds, recordMap, optimistic, noteMap]
  )

  async function handleStatusChange(studentId: string, status: AttendanceStatus, note?: string) {
    if (saving) return
    setSaving(studentId)
    setOptimistic((prev) => ({ ...prev, [studentId]: status }))
    if (note !== undefined) {
      setNoteMap((prev) => ({ ...prev, [studentId]: note }))
    }

    if (!isOnline) {
      await queueOffline(studentId, status, note)
      setSaving(null)
      return
    }

    try {
      const existing = recordMap[studentId]
      if (existing) {
        await updateAttendance(existing._id, { status, note })
      } else {
        await createAttendance({ courseId, sectionId, studentId, date, status, note })
      }
    } catch (err) {
      if (isNetworkError(err)) {
        await queueOffline(studentId, status, note)
        return
      }
      toast.error("Failed to save attendance")
      setOptimistic((prev) => {
        const next = { ...prev }
        delete next[studentId]
        return next
      })
      return
    } finally {
      setSaving(null)
    }

    refreshSession()
  }

  async function handleNoteChange(studentId: string, note: string) {
    setNoteMap((prev) => ({ ...prev, [studentId]: note }))
    const existing = recordMap[studentId]
    if (!existing) return
    if (!isOnline) {
      await db.pendingAttendance.add({
        courseId,
        sectionId,
        studentId,
        date,
        status: optimistic[studentId] ?? existing.status,
        note,
        queuedAt: Date.now(),
      })
      toast.info("Saved offline — will sync when reconnected")
      return
    }
    try {
      await updateAttendance(existing._id, { note })
    } catch (err) {
      if (isNetworkError(err)) {
        await db.pendingAttendance.add({
          courseId,
          sectionId,
          studentId,
          date,
          status: optimistic[studentId] ?? existing.status,
          note,
          queuedAt: Date.now(),
        })
        toast.info("Saved offline — will sync when reconnected")
        return
      }
      toast.error("Failed to save note")
    }
  }

  async function queueOffline(studentId: string, status: AttendanceStatus, note?: string) {
    await db.pendingAttendance.add({
      courseId,
      sectionId,
      studentId,
      date,
      status,
      note,
      queuedAt: Date.now(),
    })
    toast.info("Saved offline — will sync when reconnected")
  }

  const ready = !!courseId && !!sectionId && !!date

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance</h1>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
            {isSyncing ? (
              <RefreshCw className="size-3 animate-spin" />
            ) : (
              <WifiOff className="size-3" />
            )}
            {isSyncing
              ? "Syncing…"
              : `${pendingCount} change${pendingCount === 1 ? "" : "s"} pending sync`}
          </div>
        )}
      </div>

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
              {courses.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
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
              {sections.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Date
          </label>
          <DatePicker value={date} onChange={setDate} />
        </div>
      </div>

      {!ready ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <CalendarCheck className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Select a course, section, and date to manage attendance
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : enrolledIds.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <CalendarCheck className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No students enrolled in this section
          </p>
        </div>
      ) : (
        <>
          <AttendanceDataTable
            rows={rows}
            saving={saving}
            onStatusChange={handleStatusChange}
            onOpenSheet={(student) => setSheetStudent(student)}
          />
          <AttendanceSheet
            student={sheetStudent}
            history={sheetStudent ? historyMap[sheetStudent.studentId] ?? [] : []}
            open={!!sheetStudent}
            onOpenChange={(open) => {
              if (!open) setSheetStudent(null)
            }}
            onStatusChange={handleStatusChange}
            onNoteChange={handleNoteChange}
            saving={saving}
          />
        </>
      )}
    </div>
  )
}
