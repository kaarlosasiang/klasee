"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, ChevronRight, HelpCircle } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import { getCourses, type Course } from "@/lib/services/courses"
import { getMyGradebook, type StudentGradebook } from "@/lib/services/gradebook"

interface CourseGrade {
  course: Course
  gradebook: StudentGradebook | null
}

function gradeColor(grade: string) {
  const n = parseFloat(grade)
  if (n <= 1.25) return "text-emerald-700 dark:text-emerald-400"
  if (n <= 1.75) return "text-green-700 dark:text-green-400"
  if (n <= 2.25) return "text-sky-700 dark:text-sky-400"
  if (n <= 2.75) return "text-blue-700 dark:text-blue-400"
  if (n <= 3.0) return "text-amber-700 dark:text-amber-400"
  if (n <= 4.0) return "text-orange-700 dark:text-orange-400"
  return "text-red-700 dark:text-red-400"
}

function scoreBg(score: number | null) {
  if (score === null) return "bg-muted"
  if (score >= 75) return "bg-emerald-500/10"
  if (score >= 50) return "bg-amber-500/10"
  return "bg-red-500/10"
}

export default function MyGradesPage() {
  const [courseGrades, setCourseGrades] = React.useState<CourseGrade[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const result = await getCourses()
        const active = result.courses.filter((c) => !c.isArchived)
        const results = await Promise.allSettled(
          active.map((course) => getMyGradebook(course._id))
        )
        setCourseGrades(
          active.map((course, i) => ({
            course,
            gradebook: results[i]?.status === "fulfilled" ? results[i].value : null,
          }))
        )
      } catch {
        toast.error("Failed to load grades")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Grades</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Grade summary across all your enrolled courses
        </p>
      </div>

      {courseGrades.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
            <BookOpen className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No courses enrolled</p>
            <p className="text-xs text-muted-foreground">Join a course to see your grades here</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {courseGrades.map(({ course, gradebook }) => {
            const hasGrades = gradebook && (gradebook.currentScore !== null || gradebook.finalScore !== null)
            return (
              <Link
                key={course._id}
                href={`/my-courses/${course._id}/grades`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                {/* Score circle */}
                <div
                  className={`flex size-14 shrink-0 flex-col items-center justify-center rounded-xl ${scoreBg(gradebook?.currentScore ?? null)}`}
                >
                  {hasGrades ? (
                    <>
                      <span className="text-lg font-bold tabular-nums leading-none">
                        {Math.round(gradebook!.currentScore ?? gradebook!.finalScore ?? 0)}%
                      </span>
                      {gradebook?.currentGradeEntry && (
                        <span className={`text-xs font-bold ${gradeColor(gradebook.currentGradeEntry.grade)}`}>
                          {gradebook.currentGradeEntry.grade}
                        </span>
                      )}
                    </>
                  ) : (
                    <HelpCircle className="size-5 text-muted-foreground/50" />
                  )}
                </div>

                {/* Course info */}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{course.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.code} · {course.semester} semester
                  </p>
                  {hasGrades && gradebook?.currentGradeEntry && (
                    <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                      {gradebook.currentGradeEntry.remark.toLowerCase()}
                    </p>
                  )}
                  {!hasGrades && (
                    <p className="mt-0.5 text-xs text-muted-foreground/60">No grades yet</p>
                  )}
                </div>

                {/* Final grade if different */}
                {gradebook?.gradeEntry && gradebook.gradeEntry.grade !== gradebook.currentGradeEntry?.grade && (
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-muted-foreground">Final</p>
                    <p className={`text-sm font-bold ${gradeColor(gradebook.gradeEntry.grade)}`}>
                      {gradebook.gradeEntry.grade}
                    </p>
                  </div>
                )}

                <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
