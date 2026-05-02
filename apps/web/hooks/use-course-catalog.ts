import * as React from "react"
import { apiClient } from "@/lib/config/api-client"

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CatalogCourse {
  _id: string
  name: string
  code: string
  description?: string
  semester: string
  cover?: string
  icon?: string
  createdAt: string
}

export interface CatalogSection {
  _id: string
  courseId: string
  name: string
  schedule?: string
  room?: string
  maxStudents: number
  enrolledCount: number
  myEnrollmentId?: string // set if the student is already enrolled
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useCourseCatalog(studentId: string | undefined) {
  const [courses, setCourses] = React.useState<CatalogCourse[]>([])
  const [sections, setSections] = React.useState<CatalogSection[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [enrolling, setEnrolling] = React.useState<string | null>(null) // sectionId being acted on

  async function fetchAll() {
    if (!studentId) return
    setLoading(true)
    setError(null)
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        apiClient.get<CatalogCourse[]>("/courses"),
        apiClient.get<{ _id: string; sectionId: { _id: string } | string; status: string }[]>(
          `/enrollments?studentId=${studentId}`
        ),
      ])

      const allCourses = coursesRes.data

      // Fetch all sections for all courses in parallel.
      // The API populates courseId as an object, so we inject the known courseId
      // from the request rather than relying on the response field.
      const sectionResults = await Promise.all(
        allCourses.map((c) =>
          apiClient
            .get<{ _id: string; name: string; schedule?: string; room?: string; maxStudents: number }[]>(`/sections?courseId=${c._id}`)
            .then((r) => ({ courseId: c._id, data: r.data }))
        )
      )

      // Build a map of sectionId → enrollment record for this student
      const myEnrollments = enrollmentsRes.data.filter((e) => e.status === "active")
      const enrolledSectionMap: Record<string, string> = {}
      for (const e of myEnrollments) {
        const sid = typeof e.sectionId === "string" ? e.sectionId : (e.sectionId as { _id: string })._id
        enrolledSectionMap[sid] = e._id
      }

      // Flatten sections, injecting the known courseId as a plain string
      const allSections = sectionResults.flatMap(({ courseId, data }) =>
        data.map((s) => ({ ...s, courseId }))
      )
      const countResults = await Promise.all(
        allSections.map((s) =>
          apiClient.get<{ _id: string; sectionId: string; status: string }[]>(`/enrollments?sectionId=${s._id}`)
        )
      )

      const catalogSections: CatalogSection[] = allSections.map((s, i) => ({
        _id: s._id,
        courseId: s.courseId,
        name: s.name,
        schedule: s.schedule,
        room: s.room,
        maxStudents: s.maxStudents,
        enrolledCount: countResults[i]!.data.filter((e) => e.status === "active").length,
        myEnrollmentId: enrolledSectionMap[s._id],
      }))

      setCourses(allCourses)
      setSections(catalogSections)
    } catch {
      setError("Failed to load course catalog.")
    } finally {
      setLoading(false)
    }
  }

  async function enroll(sectionId: string, courseId: string) {
    if (!studentId) return
    setEnrolling(sectionId)
    try {
      await apiClient.post("/enrollments", { sectionId, courseId })
      await fetchAll()
    } finally {
      setEnrolling(null)
    }
  }

  async function drop(enrollmentId: string) {
    setEnrolling(enrollmentId)
    try {
      await apiClient.delete(`/enrollments/${enrollmentId}`)
      await fetchAll()
    } finally {
      setEnrolling(null)
    }
  }

  React.useEffect(() => {
    fetchAll()
  }, [studentId])

  return { courses, sections, loading, error, enrolling, enroll, drop, refetch: fetchAll }
}
