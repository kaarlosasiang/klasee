"use client"

import * as React from "react"
import { CalendarCheck, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { useSession } from "@/lib/config/auth-client"
import {
  getEnrollmentsByStudent,
  type Enrollment,
} from "@/lib/services/enrollments"
import {
  getMyAttendance,
  type MyAttendanceRecord,
  type AttendanceStatus,
} from "@/lib/services/attendance"

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
}

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800",
  absent: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800",
  late: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800",
  excused: "bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-700",
}

export default function MyAttendancePage() {
  const { data: session } = useSession()
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
  const [records, setRecords] = React.useState<MyAttendanceRecord[]>([])
  const [sectionId, setSectionId] = React.useState("")
  const [loadingEnrollments, setLoadingEnrollments] = React.useState(true)
  const [loadingRecords, setLoadingRecords] = React.useState(false)

  const userId = session?.user?.id

  React.useEffect(() => {
    if (!userId) return
    getEnrollmentsByStudent(userId)
      .then((data) => setEnrollments(data.filter((e) => e.status === "active")))
      .catch(() => {})
      .finally(() => setLoadingEnrollments(false))
  }, [userId])

  React.useEffect(() => {
    if (!sectionId) return
    setLoadingRecords(true)
    getMyAttendance({ sectionId })
      .then(setRecords)
      .catch(() => {})
      .finally(() => setLoadingRecords(false))
  }, [sectionId])

  const sections = React.useMemo(
    () =>
      enrollments.map((e) => ({
        _id: e.sectionId._id,
        name: `${e.courseId.name} - ${e.sectionId.name}`,
      })),
    [enrollments]
  )

  const summary = React.useMemo(() => {
    const total = records.length
    const counts: Record<AttendanceStatus, number> = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    }
    for (const r of records) counts[r.status]++
    const presentSessions = counts.present + counts.late
    const percentage = total > 0 ? Math.round((presentSessions / total) * 100) : 0
    return { total, ...counts, presentSessions, percentage }
  }, [records])

  if (loadingEnrollments) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Attendance</h1>

      {sections.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16">
          <CalendarCheck className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You are not enrolled in any courses yet
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Course / Section
            </label>
            <Select value={sectionId} onValueChange={setSectionId}>
              <SelectTrigger className="w-72">
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

          {sectionId && loadingRecords && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          )}

          {sectionId && !loadingRecords && records.length === 0 && (
            <Card className="flex flex-col items-center gap-3 py-16">
              <CalendarCheck className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No attendance records for this section yet
              </p>
            </Card>
          )}

          {sectionId && !loadingRecords && records.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      Total Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{summary.total}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      Present
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-emerald-600">
                      {summary.present}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      Absent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-600">
                      {summary.absent}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      Attendance Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className={`text-2xl font-bold ${
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

              <div className="space-y-2">
                {records.map((record) => (
                  <div
                    key={record._id}
                    className="flex items-center justify-between rounded-xl border border-border p-4"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.date}
                      </p>
                      {record.note && (
                        <p className="mt-1 text-xs italic text-muted-foreground">
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
            </>
          )}
        </>
      )}
    </div>
  )
}
