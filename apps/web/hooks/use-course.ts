import * as React from "react"
import { apiClient } from "@/lib/config/api-client"
import type { Course } from "@/hooks/use-courses"

export interface Section {
  _id: string
  courseId: string
  name: string
  schedule?: string
  room?: string
  maxStudents: number
  createdAt: string
}

export interface Assessment {
  _id: string
  courseId: string
  title: string
  type: "quiz" | "exam" | "assignment"
  totalPoints: number
  dueDate?: string
  createdAt: string
}

export function useCourse(id: string) {
  const [course, setCourse] = React.useState<Course | null>(null)
  const [sections, setSections] = React.useState<Section[]>([])
  const [assessments, setAssessments] = React.useState<Assessment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const [courseRes, sectionsRes, assessmentsRes] = await Promise.all([
        apiClient.get<Course>(`/courses/${id}`),
        apiClient.get<Section[]>(`/sections?courseId=${id}`),
        apiClient.get<Assessment[]>(`/assessments?courseId=${id}`),
      ])
      setCourse(courseRes.data)
      setSections(sectionsRes.data)
      setAssessments(assessmentsRes.data)
    } catch {
      setError("Failed to load course.")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (id) fetchAll()
  }, [id])

  return { course, sections, assessments, loading, error, refetch: fetchAll }
}
