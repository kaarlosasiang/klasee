"use client"

import * as React from "react"
import { getStudentDetail, type StudentDetail } from "@/lib/services/student-activity"

export interface UseStudentDetailResult {
  data: StudentDetail | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useStudentDetail(enrollmentId: string | null): UseStudentDetailResult {
  const [data, setData] = React.useState<StudentDetail | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetch = React.useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getStudentDetail(id)
      setData(result)
    } catch {
      setError("Failed to load student details")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (!enrollmentId) {
      setData(null)
      return
    }
    fetch(enrollmentId)
  }, [enrollmentId, fetch])

  const refetch = React.useCallback(() => {
    if (enrollmentId) fetch(enrollmentId)
  }, [enrollmentId, fetch])

  return { data, loading, error, refetch }
}
