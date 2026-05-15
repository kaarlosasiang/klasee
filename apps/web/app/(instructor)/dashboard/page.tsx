"use client"

import * as React from "react"
import { BookOpen, Users, FileText, GraduationCap } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { getCourses, type Course } from "@/lib/services/courses"
import { CourseCard } from "@/components/common/course-card"
import Link from "next/link"

export default function InstructorDashboardPage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getCourses()
        setCourses(data)
      } catch {
        // handled by error boundary
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalStudents = courses.reduce((sum, c) => sum + c.enrolledCount, 0)
  const totalAssessments = courses.reduce((sum, c) => sum + c.assessmentCount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Courses
            </CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{courses.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enrolled Students
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assessments
            </CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalAssessments}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent Courses</h2>
        {courses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <GraduationCap className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No courses yet</p>
            <Link
              href="/courses"
              className="text-sm font-medium text-primary hover:underline"
            >
              Create your first course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 9).map((course) => (
              <CourseCard key={course._id} course={course} onEdit={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
