import * as React from "react"
import { apiClient } from "@/lib/config/api-client"

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PopulatedCourse {
  _id: string
  name: string
  code: string
  cover?: string
  icon?: string
  semester: string
}

interface PopulatedSection {
  _id: string
  name: string
  schedule?: string
}

export interface Enrollment {
  _id: string
  courseId: PopulatedCourse
  sectionId: PopulatedSection
  status: "active" | "dropped" | "completed"
}

export interface Assessment {
  _id: string
  courseId: string
  title: string
  type: "quiz" | "exam" | "assignment"
  totalPoints: number
  dueDate?: string
}

export interface AttendanceRecord {
  _id: string
  courseId: string
  sectionId: string
  studentId: string
  date: string
  status: "present" | "absent" | "late"
}

export interface StudentDashboardData {
  enrollments: Enrollment[]
  upcomingAssessments: (Assessment & { courseName: string })[]
  attendance: AttendanceRecord[]
  attendanceSummary: { present: number; absent: number; late: number; total: number }
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useStudentDashboard(studentId: string | undefined) {
  const [data, setData] = React.useState<StudentDashboardData>({
    enrollments: [],
    upcomingAssessments: [],
    attendance: [],
    attendanceSummary: { present: 0, absent: 0, late: 0, total: 0 },
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

      const enrollments = enrollmentsRes.data.filter((e) => e.status === "active")
      const attendance = attendanceRes.data

      // Fetch assessments for each enrolled course in parallel
      const courseIds = [...new Set(enrollments.map((e) => e.courseId._id))]
      const assessmentResults = await Promise.all(
        courseIds.map((cId) => apiClient.get<Assessment[]>(`/assessments?courseId=${cId}`))
      )

      const today = new Date().toISOString().slice(0, 10)
      const courseMap = Object.fromEntries(
        enrollments.map((e) => [e.courseId._id, e.courseId.name])
      )

      const upcomingAssessments = assessmentResults
        .flatMap((res) => res.data)
        .filter((a) => !a.dueDate || a.dueDate >= today)
        .sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.localeCompare(b.dueDate)
        })
        .slice(0, 6)
        .map((a) => ({ ...a, courseName: courseMap[a.courseId] ?? "" }))

      const summary = attendance.reduce(
        (acc, r) => {
          acc[r.status] = (acc[r.status] ?? 0) + 1
          acc.total += 1
          return acc
        },
        { present: 0, absent: 0, late: 0, total: 0 }
      )

      setData({ enrollments, upcomingAssessments, attendance, attendanceSummary: summary })
    } catch {
      setError("Failed to load dashboard data.")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAll()
  }, [studentId])

  return { ...data, loading, error, refetch: fetchAll }
}
