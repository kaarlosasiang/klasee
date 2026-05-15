"use client"

import * as React from "react"
import { ClipboardList, FileText } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "sonner"
import { getCourses, type Course } from "@/lib/services/courses"
import {
  getAssessments,
  getScores,
  type Assessment,
  type AssessmentScore,
} from "@/lib/services/assessments"

export default function GradesPage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [assessments, setAssessments] = React.useState<Assessment[]>([])
  const [scores, setScores] = React.useState<AssessmentScore[]>([])
  const [courseId, setCourseId] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [loadingAssessments, setLoadingAssessments] = React.useState(false)

  React.useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    if (!courseId) {
      setAssessments([])
      setScores([])
      return
    }
    setLoadingAssessments(true)
    Promise.all([
      getAssessments(courseId),
      getScores({}),
    ])
      .then(([assessmentData, scoreData]) => {
        setAssessments(assessmentData)
        setScores(scoreData)
      })
      .catch(() => toast.error("Failed to load grades"))
      .finally(() => setLoadingAssessments(false))
  }, [courseId])

  const studentScores = React.useMemo(() => {
    const map = new Map<
      string,
      { name: string; email: string; scores: Record<string, number>; total: number }
    >()

    for (const score of scores) {
      const studentId =
        typeof score.studentId === "string"
          ? score.studentId
          : score.studentId._id
      const studentName =
        typeof score.studentId === "string" ? "Unknown" : score.studentId.name
      const studentEmail =
        typeof score.studentId === "string" ? "" : score.studentId.email

      if (!map.has(studentId)) {
        map.set(studentId, { name: studentName, email: studentEmail, scores: {}, total: 0 })
      }

      const entry = map.get(studentId)!
      entry.scores[score.assessmentId] = score.score
      entry.total += score.score
    }

    return Array.from(map.entries()).map(([id, data]) => ({
      _id: id,
      ...data,
    }))
  }, [scores])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Grades</h1>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Course
        </label>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!courseId ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <ClipboardList className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Select a course to view grades
          </p>
        </div>
      ) : loadingAssessments ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <ClipboardList className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No assessments created yet
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {courses.find((c) => c._id === courseId)?.name} — Gradebook
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">
                    Student
                  </th>
                  {assessments.map((a) => (
                    <th
                      key={a._id}
                      className="whitespace-nowrap px-3 py-2 text-center font-medium text-muted-foreground"
                    >
                      <div className="text-xs">{a.title}</div>
                      <div className="text-[10px] text-muted-foreground/60">
                        /{a.totalPoints}
                      </div>
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-3 py-2 text-center font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentScores.length === 0 ? (
                  <tr>
                    <td
                      colSpan={assessments.length + 2}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No scores recorded yet
                    </td>
                  </tr>
                ) : (
                  studentScores.map((student) => (
                    <tr key={student._id} className="border-b border-border">
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {student.email}
                        </div>
                      </td>
                      {assessments.map((a) => (
                        <td
                          key={a._id}
                          className="whitespace-nowrap px-3 py-2.5 text-center"
                        >
                          {student.scores[a._id] !== undefined ? (
                            <Badge variant="secondary" className="font-mono text-xs">
                              {student.scores[a._id]}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground/40">&mdash;</span>
                          )}
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-3 py-2.5 text-center font-semibold">
                        {student.total}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
