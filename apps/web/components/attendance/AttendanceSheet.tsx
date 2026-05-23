"use client"

import * as React from "react"
import { CalendarCheck } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import type { AttendanceRecord, AttendanceStatus } from "@/lib/services/attendance"
import type { AttendanceRow } from "./AttendanceDataTable"

const STATUS_OPTIONS: AttendanceStatus[] = ["present", "absent", "late", "excused"]

const STATUS_DOTS: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500",
  absent: "bg-red-500",
  late: "bg-amber-500",
  excused: "bg-gray-400",
}

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present:
    "border-emerald-200 bg-emerald-500/10 text-emerald-600 dark:border-emerald-800",
  absent: "border-red-200 bg-red-500/10 text-red-600 dark:border-red-800",
  late: "border-amber-200 bg-amber-500/10 text-amber-600 dark:border-amber-800",
  excused: "border-gray-200 bg-gray-500/10 text-gray-600 dark:border-gray-700",
}

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface AttendanceSheetProps {
  student: AttendanceRow | null
  history: AttendanceRecord[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (studentId: string, status: AttendanceStatus, note?: string) => void
  onNoteChange: (studentId: string, note: string) => void
  saving: string | null
}

export function AttendanceSheet({
  student,
  history,
  open,
  onOpenChange,
  onStatusChange,
  onNoteChange,
  saving,
}: AttendanceSheetProps) {
  const [note, setNote] = React.useState("")
  const noteRef = React.useRef(note)
  noteRef.current = note

  React.useEffect(() => {
    if (open && student) {
      setNote(student.note ?? "")
    }
    if (!open) {
      setNote("")
    }
  }, [open, student])

  const isSaving = saving === student?.studentId

  const sortedHistory = React.useMemo(
    () =>
      [...history].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [history]
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        {student && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar className="size-10 shrink-0 rounded-full">
                  <AvatarFallback className="text-sm font-medium">
                    {initials(student.name) || "??"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle>{student.name}</SheetTitle>
                  <SheetDescription>{student.email}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-6 p-4 pt-2">
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Current Status
                </h3>
                <Select
                  value={student.status ?? ""}
                  onValueChange={(v) =>
                    onStatusChange(
                      student.studentId,
                      v as AttendanceStatus,
                      noteRef.current || undefined
                    )
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger
                    className={`w-full h-9 ${
                      student.status ? STATUS_COLORS[student.status] : ""
                    }`}
                  >
                    <SelectValue placeholder="Mark attendance…" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${STATUS_DOTS[s]}`}
                          />
                          {STATUS_LABELS[s]}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Note
                </h3>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note..."
                  className="h-9 w-full"
                  onBlur={(e) => {
                    const val = e.target.value.trim()
                    if (val !== (student.note ?? "")) {
                      onNoteChange(student.studentId, val)
                    }
                  }}
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Attendance History
                </h3>
                {sortedHistory.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                    <CalendarCheck className="size-6" />
                    <p className="text-xs">No records yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-72">
                    <div className="space-y-1">
                      {sortedHistory.map((record) => (
                        <div
                          key={record._id}
                          className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              {new Date(record.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            {record.note && (
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {record.note}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={STATUS_COLORS[record.status]}
                          >
                            {STATUS_LABELS[record.status]}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
