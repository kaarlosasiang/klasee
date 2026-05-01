import * as React from "react"
import { apiClient } from "@/lib/config/api-client"

interface Course {
  _id: string
  name: string
  code: string
  description?: string
  semester: string
  cover?: string
  icon?: string
  createdAt: string
}

export function useCourses() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(true)

  async function fetchCourses() {
    try {
      const res = await apiClient.get<Course[]>("/courses")
      setCourses(res.data)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchCourses()
  }, [])

  return { courses, loading, refetch: fetchCourses }
}

export type { Course }
