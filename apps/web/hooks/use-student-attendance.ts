import * as React from "react"
import { apiClient } from "@/lib/config/api-client"
import type { Enrollment } from "@/hooks/use-student-dashboard"

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  _id: string
  courseId: string
  sectionId: string
  studentId: string
  date: string
  status: "present" | "absent" | "late"
}

export interface CourseSummary {
  courseId: string
  courseName: string
  sectionName: string
  records: AttendanceRecord[]
  present: number
  absent: number
  late: number
  total: number
  rate: number
}

export interface AttendanceData {
  records: AttendanceRecord[]
  byCourse: CourseSummary[]
  overall: { present: number; absent: number; late: number; total: number; rate: number }
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useStudentAttendance(studentId: string | undefined) {
  const [data, setData] = React.useState<AttendanceData>({
    records: [],
    byCourse: [],
    overall: { present: 0, absent: 0, late: 0, total: 0, rate: 0 },
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  async function fetchAll() {
    if (!studentId) return
    setLoading(true)
    setError(null)
    try {
      const [enrollmentsRes, attendanceRes] = await Promise.all([
        apiClient.get<Enrollment[]>(`/enrollments?studentId=${studentId}`),
        apiClient.get<AttendanceRecord[]>(`/attendance?studentId=${studentId}`),
      ])

      const activeEnrollments = enrollmentsRes.data.filter((e) => e.status === "active")
      const records = attendanceRes.data

      // Build per-course summaries
      const courseMap = Object.fromEntries(
        activeEnrollments.map((e) => [e.courseId._id, e.courseId.name])
      )
      const sectionMap = Object.fromEntries(
        activeEnrollments.map((e) => [e.courseId._id, e.sectionId.name])
      )

      const grouped: Record<string, AttendanceRecord[]> = {}
      for (const r of records) {
        if (!grouped[r.courseId]) grouped[r.courseId] = []
        grouped[r.courseId].push(r)
      }

      const byCourse: CourseSummary[] = Object.entries(grouped).map(([courseId, recs]) => {
        const present = recs.filter((r) => r.status === "present").length
        const absent = recs.filter((r) => r.status === "absent").length
        const late = recs.filter((r) => r.status === "late").length
        const total = recs.length
        const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0
        return {
          courseId,
          courseName: courseMap[courseId] ?? courseId,
          sectionName: sectionMap[courseId] ?? "",
          records: [...recs].sort((a, b) => b.date.localeCompare(a.date)),
          present,
          absent,
          late,
          total,
          rate,
        }
      })

      // Sort by course name
      byCourse.sort((a, b) => a.courseName.localeCompare(b.courseName))

      const overall = records.reduce(
        (acc, r) => {
          acc[r.status] += 1
          acc.total += 1
          return acc
        },
        { present: 0, absent: 0, late: 0, total: 0, rate: 0 }
      )
      overall.rate =
        overall.total > 0
          ? Math.round(((overall.present + overall.late) / overall.total) * 100)
          : 0

      setData({ records, byCourse, overall })
    } catch {
      setError("Failed to load attendance records.")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAll()
  }, [studentId])

  return { ...data, loading, error, refetch: fetchAll }
}
