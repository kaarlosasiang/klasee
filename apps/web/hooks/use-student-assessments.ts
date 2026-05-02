import * as React from "react"
import { apiClient } from "@/lib/config/api-client"
import type { Enrollment } from "@/hooks/use-student-dashboard"

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AssessmentWithCourse {
  _id: string
  courseId: string
  courseName: string
  title: string
  type: "quiz" | "exam" | "assignment"
  totalPoints: number
  dueDate?: string
  score?: number
  feedback?: string
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useStudentAssessments(studentId: string | undefined) {
  const [assessments, setAssessments] = React.useState<AssessmentWithCourse[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  async function fetchAll() {
    if (!studentId) return
    setLoading(true)
    setError(null)
    try {
      const enrollmentsRes = await apiClient.get<Enrollment[]>(
        `/enrollments?studentId=${studentId}`
      )
      const activeEnrollments = enrollmentsRes.data.filter((e) => e.status === "active")
      const courseIds = [...new Set(activeEnrollments.map((e) => e.courseId._id))]
      const courseMap = Object.fromEntries(
        activeEnrollments.map((e) => [e.courseId._id, e.courseId.name])
      )

      const [assessmentResults, scoresRes] = await Promise.all([
        Promise.all(
          courseIds.map((cId) => apiClient.get<AssessmentRaw[]>(`/assessments?courseId=${cId}`))
        ),
        apiClient.get<ScoreRaw[]>(`/assessments/scores?studentId=${studentId}`),
      ])

      const scoreMap = Object.fromEntries(
        scoresRes.data.map((s) => [s.assessmentId, { score: s.score, feedback: s.feedback }])
      )

      const all: AssessmentWithCourse[] = assessmentResults
        .flatMap((res) => res.data)
        .map((a) => ({
          _id: a._id,
          courseId: a.courseId,
          courseName: courseMap[a.courseId] ?? "",
          title: a.title,
          type: a.type,
          totalPoints: a.totalPoints,
          dueDate: a.dueDate,
          score: scoreMap[a._id]?.score,
          feedback: scoreMap[a._id]?.feedback,
        }))
        .sort((a, b) => {
          // Upcoming (no score yet) first, sorted by due date; past last
          const aHasScore = a.score !== undefined
          const bHasScore = b.score !== undefined
          if (aHasScore !== bHasScore) return aHasScore ? 1 : -1
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.localeCompare(b.dueDate)
        })

      setAssessments(all)
    } catch {
      setError("Failed to load assessments.")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAll()
  }, [studentId])

  return { assessments, loading, error, refetch: fetchAll }
}

// ─── Internal raw types ────────────────────────────────────────────────────────

interface AssessmentRaw {
  _id: string
  courseId: string
  title: string
  type: "quiz" | "exam" | "assignment"
  totalPoints: number
  dueDate?: string
}

interface ScoreRaw {
  assessmentId: string
  score: number
  feedback?: string
}
