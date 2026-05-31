"use client"

import * as React from "react"
import { Users } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Button } from "@workspace/ui/components/button"
import { toast } from "sonner"
import { getAllEnrollments, type Enrollment } from "@/lib/services/enrollments"
import { StudentsDataTable } from "@/components/data-table/students-data-table"
import { StudentDetailSheet } from "@/components/student-detail-sheet"

export default function StudentsPage() {
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = React.useState<Enrollment | null>(null)

  const fetchEnrollments = React.useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getAllEnrollments()
      setEnrollments(data)
    } catch {
      toast.error("Failed to load students")
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <Users className="size-5 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-bold">Students</h1>
          {!loading && (
            <Badge variant="secondary" className="rounded-full text-xs font-normal">
              {enrollments.length}
            </Badge>
          )}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <p className="text-sm text-muted-foreground">Failed to load students</p>
          <Button variant="outline" size="sm" onClick={fetchEnrollments}>
            Retry
          </Button>
        </div>
      ) : (
        <StudentsDataTable
          data={enrollments}
          onRowClick={setSelectedEnrollment}
        />
      )}

      <StudentDetailSheet
        open={!!selectedEnrollment}
        onOpenChange={(open) => { if (!open) setSelectedEnrollment(null) }}
        enrollment={selectedEnrollment}
        enrollments={enrollments}
        onNavigate={setSelectedEnrollment}
        onDrop={() => fetchEnrollments()}
      />
    </div>
  )
}
