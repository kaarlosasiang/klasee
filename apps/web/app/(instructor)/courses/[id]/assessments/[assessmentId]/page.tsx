"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Button } from "@workspace/ui/components/button"
import { toast } from "sonner"
import {
  getAssessmentById,
  getAssessments,
  getScores,
  type Assessment,
  type AssessmentScore,
} from "@/lib/services/assessments"
import {
  getEnrollmentsByCourse,
  type Enrollment,
} from "@/lib/services/enrollments"
import { getAssignmentSubmissions, type AssignmentSubmission } from "@/lib/services/assignment-submissions"
import { getQuizAttempts, type QuizAttempt } from "@/lib/services/quiz-attempts"
import { getQuestions, type Question } from "@/lib/services/questions"
import { GradingPanel } from "@/components/assessments-manager/grading-panel"

interface EnrolledStudent {
  _id: string
  name: string
  email: string
}

export default function GradeAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const assessmentId = params.assessmentId as string

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [assessment, setAssessment] = React.useState<Assessment | null>(null)
  const [students, setStudents] = React.useState<EnrolledStudent[]>([])
  const [existingScores, setExistingScores] = React.useState<Map<string, { _id: string; score: number; feedback?: string }>>(new Map())
  const [submissions, setSubmissions] = React.useState<AssignmentSubmission[]>([])
  const [courseAssessments, setCourseAssessments] = React.useState<Assessment[]>([])
  const [allCourseScores, setAllCourseScores] = React.useState<AssessmentScore[]>([])
  const [quizAttempts, setQuizAttempts] = React.useState<QuizAttempt[]>([])
  const [questions, setQuestions] = React.useState<Question[]>([])

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [assessmentData, enrollmentsData, scoresData, submissionsData, assessmentsData, allCourseScoresData, attemptsData, questionsData] = await Promise.all([
        getAssessmentById(assessmentId),
        getEnrollmentsByCourse(courseId),
        getScores({ assessmentId }),
        getAssignmentSubmissions(assessmentId).catch(() => [] as AssignmentSubmission[]),
        getAssessments(courseId),
        getScores({ courseId }).catch(() => [] as AssessmentScore[]),
        getQuizAttempts(assessmentId).catch(() => [] as QuizAttempt[]),
        getQuestions(assessmentId).catch(() => [] as Question[]),
      ])

      setAssessment(assessmentData)
      setQuizAttempts(attemptsData)
      setQuestions(questionsData.sort((a, b) => a.order - b.order))

      const activeStudents: EnrolledStudent[] = enrollmentsData
        .filter((e: Enrollment) => e.status === "active")
        .map((e: Enrollment) => ({
          _id: typeof e.studentId === "string" ? e.studentId : e.studentId._id,
          name: typeof e.studentId === "string" ? "Unknown" : e.studentId.name,
          email: typeof e.studentId === "string" ? "" : e.studentId.email,
        }))
      setStudents(activeStudents)

      const scoreMap = new Map<string, { _id: string; score: number; feedback?: string }>()
      for (const score of scoresData) {
        scoreMap.set(
          typeof score.studentId === "string" ? score.studentId : score.studentId._id,
          { _id: score._id, score: score.score, feedback: score.feedback }
        )
      }
      setExistingScores(scoreMap)
      setSubmissions(submissionsData)
      setCourseAssessments(assessmentsData)
      setAllCourseScores(allCourseScoresData)
    } catch {
      setError(true)
      toast.error("Failed to load grading data")
    } finally {
      setLoading(false)
    }
  }, [courseId, assessmentId])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleBack() {
    router.push(`/courses/${courseId}?tab=assessments`)
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="flex flex-1 gap-4">
          <Skeleton className="w-3/4 rounded-xl" />
          <Skeleton className="flex-1 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <p className="text-sm text-muted-foreground">Assessment not found</p>
        <Button variant="outline" size="sm" onClick={handleBack}>
          Back to assessments
        </Button>
      </div>
    )
  }

  return (
    <GradingPanel
      assessment={assessment}
      enrolledStudents={students}
      existingScores={existingScores}
      submissions={submissions}
      allCourseAssessments={courseAssessments}
      allCourseScores={allCourseScores}
      quizAttempts={quizAttempts}
      questions={questions}
      onBack={handleBack}
    />
  )
}
