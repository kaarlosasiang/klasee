"use client"

import * as React from "react"
import { BookOpen, GraduationCap } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { useSession } from "@/lib/config/auth-client"
import {
  getEnrollmentsByStudent,
  type Enrollment,
} from "@/lib/services/enrollments"
import Link from "next/link"

export default function MyCoursesPage() {
  const { data: session } = useSession()
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
  const [loading, setLoading] = React.useState(true)

  const userId = session?.user?.id

  React.useEffect(() => {
    if (!userId) return
    getEnrollmentsByStudent(userId)
      .then((data) => setEnrollments(data.filter((e) => e.status === "active")))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Courses</h1>

      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <GraduationCap className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You are not enrolled in any courses yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment._id}
              href={`/my-courses/${enrollment.courseId._id}`}
              className="group rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                    {enrollment.courseId.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {enrollment.courseId.code}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {enrollment.sectionId.name}
                </Badge>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {enrollment.sectionId.schedule && (
                  <span>{enrollment.sectionId.schedule}</span>
                )}
                {enrollment.sectionId.room && (
                  <span className="ml-3">{enrollment.sectionId.room}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
