"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarCheck, RefreshCw, WifiOff } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
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
import type { Section } from "@/lib/services/sections"
import type { Course } from "@/lib/services/courses"

function isNetworkError(err: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true
  const code = (err as { code?: string })?.code
  const msg = (err as { message?: string })?.message ?? ""
  return code === "ERR_NETWORK" || msg === "Network Error"
}

export interface AttendancePanelProps {
  section: Section | null
  course: Course | null
  date: string | null
  onSynced?: () => void
}

export function AttendancePanel({
  section,
  course,
  date,
  onSynced,
}: AttendancePanelProps) {
  const [enrolled, setEnrolled] = React.useState<
    { studentId: string; name: string; email: string }[]
  >([])
  const [recordMap, setRecordMap] = React.useState<Record<string, AttendanceRecord>>({})
  const [historyMap, setHistoryMap] = React.useState<Record<string, AttendanceRecord[]>>({})
  const [optimistic, setOptimistic] = React.useState<Record<string, AttendanceStatus>>({})
  const [noteMap, setNoteMap] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState<string | null>(null)
  const [sheetStudent, setSheetStudent] = React.useState<AttendanceRow | null>(null)

  const handleSynced = React.useCallback(() => {
    onSynced?.()
  }, [onSynced])

  const { pendingCount, isSyncing, isOnline } = useAttendanceSync(handleSynced)

  async function loadData() {
    if (!section || !date) return
    setLoading(true)
    try {
      const [enrollments, records, allRecords] = await Promise.all([
        getEnrollmentsBySection(section._id),
        getAttendance({ sectionId: section._id, date }),
        getAttendance({ sectionId: section._id }),
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
      setEnrolled(active)
      setRecordMap(map)
      setHistoryMap(hMap)
      setOptimistic({})
      setNoteMap({})
    } catch {
      toast.error("Failed to load attendance")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (section && date) {
      loadData()
    } else {
      setEnrolled([])
      setRecordMap({})
      setHistoryMap({})
      setOptimistic({})
      setNoteMap({})
    }
  }, [section?._id, date])

  const rows = React.useMemo<AttendanceRow[]>(
    () =>
      enrolled.map((s) => ({
        studentId: s.studentId,
        name: s.name,
        email: s.email,
        status: optimistic[s.studentId] ?? recordMap[s.studentId]?.status ?? null,
        note: noteMap[s.studentId] ?? recordMap[s.studentId]?.note ?? undefined,
        isPending: s.studentId in optimistic,
      })),
    [enrolled, recordMap, optimistic, noteMap]
  )

  async function handleStatusChange(
    studentId: string,
    status: AttendanceStatus | null,
    note?: string
  ) {
    if (!section || !course || !date || saving) return
    setSaving(studentId)

    if (status === null) {
      const existing = recordMap[studentId]
      if (!existing) {
        setOptimistic((prev) => {
          const next = { ...prev }
          delete next[studentId]
          return next
        })
        setSaving(null)
        return
      }
      try {
        await deleteAttendance(existing._id)
        setRecordMap((prev) => {
          const next = { ...prev }
          delete next[studentId]
          return next
        })
        setOptimistic((prev) => {
          const next = { ...prev }
          delete next[studentId]
          return next
        })
      } catch {
        toast.error("Failed to clear attendance")
      } finally {
        setSaving(null)
      }
      return
    }

    setOptimistic((prev) => ({ ...prev, [studentId]: status }))
    if (note !== undefined) setNoteMap((prev) => ({ ...prev, [studentId]: note }))

    if (!isOnline) {
      await queueOffline(studentId, status, note)
      setSaving(null)
      return
    }

    try {
      const existing = recordMap[studentId]
      if (existing) {
        await updateAttendance(existing._id, { status, note })
        setRecordMap((prev) => ({
          ...prev,
          [studentId]: { ...existing, status, note: note ?? existing.note },
        }))
      } else {
        const created = await createAttendance({
          courseId: course._id,
          sectionId: section._id,
          studentId,
          date,
          status,
          note,
        })
        setRecordMap((prev) => ({ ...prev, [studentId]: created }))
      }
      setOptimistic((prev) => {
        const next = { ...prev }
        delete next[studentId]
        return next
      })
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
    } finally {
      setSaving(null)
    }
  }

  async function handleNoteChange(studentId: string, note: string) {
    if (!section || !course || !date) return
    setNoteMap((prev) => ({ ...prev, [studentId]: note }))
    const existing = recordMap[studentId]
    if (!existing) return
    if (!isOnline) {
      await db.pendingAttendance.add({
        courseId: course._id,
        sectionId: section._id,
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
          courseId: course._id,
          sectionId: section._id,
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
    if (!section || !course || !date) return
    await db.pendingAttendance.add({
      courseId: course._id,
      sectionId: section._id,
      studentId,
      date,
      status,
      note,
      queuedAt: Date.now(),
    })
    toast.info("Saved offline — will sync when reconnected")
  }

  const formattedDate = date
    ? format(new Date(date + "T00:00:00"), "EEEE, MMMM d, yyyy")
    : ""

  const hasSession = !!section && !!date

  return (
    <>
      <div className="flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-lg border border-border bg-card">
        {/* Header */}
        <div className="shrink-0 border-b border-border px-4 py-3">
          {hasSession ? (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {course?.code} · {section?.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{formattedDate}</p>
              </div>
              {pendingCount > 0 && (
                <div className="flex shrink-0 items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                  {isSyncing ? (
                    <RefreshCw className="size-3 animate-spin" />
                  ) : (
                    <WifiOff className="size-3" />
                  )}
                  {isSyncing ? "Syncing…" : `${pendingCount} pending`}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm font-semibold text-foreground">Attendance</p>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!hasSession ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <CalendarCheck className="size-10 text-muted-foreground/50" />
              <div>
                <p className="text-sm font-medium text-foreground">Select a session</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click any class on the calendar to take attendance.
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : enrolled.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No students enrolled in this section.
              </p>
            </div>
          ) : (
            <div className="p-4">
              <AttendanceDataTable
                rows={rows}
                saving={saving}
                onStatusChange={handleStatusChange}
                onOpenSheet={setSheetStudent}
              />
            </div>
          )}
        </div>
      </div>

      <AttendanceSheet
        student={sheetStudent}
        history={sheetStudent ? (historyMap[sheetStudent.studentId] ?? []) : []}
        open={!!sheetStudent}
        onOpenChange={(open) => { if (!open) setSheetStudent(null) }}
        onStatusChange={handleStatusChange}
        onNoteChange={handleNoteChange}
        saving={saving}
      />
    </>
  )
}
