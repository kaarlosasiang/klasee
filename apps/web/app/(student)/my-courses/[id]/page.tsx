"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { GraduationCap, BookOpen, Users, ArrowLeft, Megaphone } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "sonner"
import { getCourseById, type Course } from "@/lib/services/courses"
import { Announcements } from "@/components/common/announcements"
import Link from "next/link"

export default function StudentCourseDetailPage() {
  const params = useParams()
  const [course, setCourse] = React.useState<Course | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getCourseById(params.id as string)
        setCourse(data)
      } catch {
        toast.error("Course not found")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Course not found
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href="/my-courses"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to my courses
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-5 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
        <div className="relative z-10 flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-500 text-white shadow-md">
            {course.icon ? (
              <img
                src={course.icon}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <GraduationCap className="size-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-xl font-bold">{course.name}</h1>
              <span className="text-sm text-muted-foreground">
                {course.code}
              </span>
              <Badge
                variant="secondary"
                className="rounded-full text-[10px] font-normal"
              >
                {course.semester === "1st"
                  ? "1st Sem"
                  : course.semester === "2nd"
                    ? "2nd Sem"
                    : "Summer"}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <BookOpen className="size-3.5" />
                {course.sectionCount}{" "}
                {course.sectionCount === 1 ? "Section" : "Sections"}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {course.enrolledCount}{" "}
                {course.enrolledCount === 1 ? "Student" : "Students"}
              </span>
            </div>
            {course.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {course.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Megaphone className="size-5" />
          Announcements
        </h2>
        <Announcements courseId={course._id} />
      </div>
    </div>
  )
}
