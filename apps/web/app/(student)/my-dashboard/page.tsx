"use client"

import * as React from "react"
import { BookOpen, GraduationCap } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { useSession } from "@/lib/config/auth-client"
import {
  getEnrollmentsByStudent,
  type Enrollment,
} from "@/lib/services/enrollments"
import Link from "next/link"

export default function MyDashboard() {
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
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Welcome, {session?.user?.name?.split(" ")[0] ?? "Student"}
      </h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Enrolled Courses
          </CardTitle>
          <BookOpen className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{enrollments.length}</p>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">My Courses</h2>
        {enrollments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
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
                <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                  {enrollment.courseId.name}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {enrollment.courseId.code}
                </p>
                <div className="mt-3 text-xs text-muted-foreground">
                  Section: {enrollment.sectionId.name}
                  {enrollment.sectionId.schedule &&
                    ` — ${enrollment.sectionId.schedule}`}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
