"use client"

import * as React from "react"
import { CalendarCheck, ClipboardCheck, Loader2, ScrollText } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import type { Enrollment } from "@/lib/services/enrollments"
import {
  getAttendance,
  type AttendanceStatus,
} from "@/lib/services/attendance"
import {
  getAssessments,
  getScores,
  type Assessment,
} from "@/lib/services/assessments"

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
}

interface LogEntry {
  id: string
  date: string
  type: "attendance" | "grade"
  description: string
}

interface OverviewTabProps {
  enrollment: Enrollment
}

export function OverviewTab({ enrollment }: OverviewTabProps) {
  const [records, setRecords] = React.useState<Awaited<ReturnType<typeof getAttendance>>>([])
  const [entries, setEntries] = React.useState<LogEntry[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    Promise.all([
      getAttendance({
        studentId: enrollment.studentId._id,
        sectionId: enrollment.sectionId._id,
      }),
      getScores({ studentId: enrollment.studentId._id }),
      getAssessments(enrollment.courseId._id),
    ])
      .then(([attendance, scores, assessments]) => {
        setRecords(attendance)

        const assessmentMap = assessments.reduce(
          (map, a) => {
            map[a._id] = a
            return map
          },
          {} as Record<string, Assessment>
        )

        const log: LogEntry[] = [
          ...attendance.map((r) => ({
            id: `att-${r._id}`,
            date: r.date,
            type: "attendance" as const,
            description: `Marked as ${STATUS_LABELS[r.status]}${r.note ? ` — ${r.note}` : ""}`,
          })),
          ...scores.map((s) => {
            const assessment = assessmentMap[s.assessmentId]
            return {
              id: `score-${s._id}`,
              date: s.updatedAt ?? s.createdAt,
              type: "grade" as const,
              description: `Scored ${s.score} / ${assessment?.totalPoints ?? "?"} on ${assessment?.title ?? "Unknown"}`,
            }
          }),
        ]

        log.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        setEntries(log.slice(0, 5))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [enrollment.studentId._id, enrollment.sectionId._id, enrollment.courseId._id])

  const summary = React.useMemo(() => {
    const counts: Record<AttendanceStatus, number> = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    }
    for (const r of records) counts[r.status]++
    const presentSessions = counts.present + counts.late
    const total = records.length
    const percentage = total > 0 ? Math.round((presentSessions / total) * 100) : 0
    return { total, ...counts, presentSessions, percentage }
  }, [records])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="mb-3 text-xs font-medium text-muted-foreground">
          Attendance Summary
        </h3>
        {records.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <CalendarCheck className="size-6" />
            <p className="text-xs">No attendance records yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-[10px] font-medium text-muted-foreground">
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{summary.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-[10px] font-medium text-muted-foreground">
                  Present
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-emerald-600">
                  {summary.present}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-[10px] font-medium text-muted-foreground">
                  Absent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-red-600">{summary.absent}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-[10px] font-medium text-muted-foreground">
                  Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-lg font-bold ${
                    summary.percentage >= 80
                      ? "text-emerald-600"
                      : summary.percentage >= 70
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {summary.percentage}%
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-xs font-medium text-muted-foreground">
          Recent Activity
        </h3>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <ScrollText className="size-6" />
            <p className="text-xs">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-lg border border-border px-3 py-2"
              >
                <div className="mt-0.5 shrink-0">
                  {entry.type === "attendance" ? (
                    <CalendarCheck className="size-3.5 text-muted-foreground" />
                  ) : (
                    <ClipboardCheck className="size-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs">{entry.description}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] font-normal ${
                    entry.type === "attendance"
                      ? "border-blue-200 bg-blue-500/10 text-blue-600 dark:border-blue-800"
                      : "border-emerald-200 bg-emerald-500/10 text-emerald-600 dark:border-emerald-800"
                  }`}
                >
                  {entry.type === "attendance" ? "Attendance" : "Grade"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
