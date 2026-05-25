"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { getAssessmentById, type Assessment } from "@/lib/services/assessments"
import { getQuestions, getQuestionsByIds, type Question } from "@/lib/services/questions"
import {
  startQuizAttempt,
  getMyQuizAttempts,
  type QuizAttempt,
} from "@/lib/services/quiz-attempts"

export default function StudentQuizPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const assessmentId = params.assessmentId as string

  const [assessment, setAssessment] = React.useState<Assessment | null>(null)
  const [questions, setQuestions] = React.useState<Question[]>([])
  const [attempt, setAttempt] = React.useState<QuizAttempt | null>(null)
  const [answers, setAnswers] = React.useState<Record<string, unknown>>({})
  const [loading, setLoading] = React.useState(true)
  const [starting, setStarting] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      try {
        const [assessmentData, existingAttempts] = await Promise.all([
          getAssessmentById(assessmentId),
          getMyQuizAttempts(assessmentId).catch(() => []),
        ])
        setAssessment(assessmentData)

        const completed = existingAttempts.find((a: { status: string }) => a.status === "completed")
        if (completed) {
          setAttempt(completed)
        }

        // Load questions: use selectedQuestionIds if this is a bank-drawn quiz
        const inProgress = existingAttempts.find((a: { status: string }) => a.status === "in_progress")
        const activeAttempt = completed ?? inProgress
        const selectedIds = (activeAttempt as any)?.selectedQuestionIds

        let questionsData: Question[]
        if (selectedIds && selectedIds.length > 0) {
          questionsData = await getQuestionsByIds(selectedIds)
        } else {
          questionsData = await getQuestions(assessmentId)
        }
        setQuestions(questionsData.sort((a: { order: number }, b: { order: number }) => a.order - b.order))
      } catch {
        toast.error("Failed to load quiz")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [assessmentId])

  async function handleStart() {
    setStarting(true)
    try {
      const newAttempt = await startQuizAttempt(assessmentId)
      setAttempt(newAttempt)
      // If bank-drawn, load the server-selected questions
      if (newAttempt.selectedQuestionIds && newAttempt.selectedQuestionIds.length > 0) {
        const bankQuestions = await getQuestionsByIds(newAttempt.selectedQuestionIds)
        setQuestions(bankQuestions.sort((a, b) => a.order - b.order))
      }
      toast.success("Quiz started!")
    } catch {
      toast.error("Failed to start quiz")
    } finally {
      setStarting(false)
    }
  }

  async function handleSubmit() {
    if (!attempt) return

    const unanswered = questions.filter((q) => {
      const val = answers[q._id]
      return val === undefined || val === "" || val === null
    })
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions (${unanswered.length} remaining)`)
      return
    }

    setSubmitting(true)
    try {
      const answerList = questions.map((q) => ({
        questionId: q._id,
        answer: answers[q._id],
      }))
      const result = await (await import("@/lib/services/quiz-attempts")).submitQuizAttempt(
        attempt._id,
        answerList
      )
      setAttempt(result)
      toast.success("Quiz submitted!")
    } catch {
      toast.error("Failed to submit quiz")
    } finally {
      setSubmitting(false)
    }
  }

  function setAnswer(questionId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Quiz not found
      </div>
    )
  }

  const isCompleted = attempt?.status === "completed"
  const isInProgress = attempt?.status === "in_progress"

  return (
    <div className="space-y-6">
      <Link
        href={`/my-courses/${courseId}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to course
      </Link>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{assessment.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {assessment.totalPoints} pts total &middot; {questions.length} questions
              {assessment.dueDate && (
                <> &middot; Due {new Date(assessment.dueDate).toLocaleDateString()}</>
              )}
            </p>
          </div>
          {isCompleted && attempt && (
            <div className="text-right">
              <div className="text-2xl font-bold">
                {attempt.totalPointsEarned}/{attempt.totalPointsPossible}
              </div>
              <Badge
                variant="outline"
                className="mt-1 rounded-full text-xs"
              >
                Completed
              </Badge>
            </div>
          )}
        </div>
      </div>

      {!isInProgress && !isCompleted && (
        <Card className="flex flex-col items-center gap-4 py-16">
          <HelpCircle className="size-10 text-muted-foreground" />
          {assessment.instructions && (
            <div className="w-full max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left dark:border-amber-900/40 dark:bg-amber-900/20">
              <p className="mb-1 text-xs font-semibold text-amber-800 dark:text-amber-300">Instructions</p>
              <p className="text-sm leading-relaxed text-amber-700 dark:text-amber-400">{assessment.instructions}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            You have {questions.length} questions to answer.
          </p>
          <Button onClick={handleStart} disabled={starting}>
            {starting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Start Quiz
          </Button>
        </Card>
      )}

      {isInProgress && (
        <div className="space-y-4">
          {assessment.instructions && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-900/20">
              <p className="mb-1 text-xs font-semibold text-amber-800 dark:text-amber-300">Instructions</p>
              <p className="text-sm leading-relaxed text-amber-700 dark:text-amber-400">{assessment.instructions}</p>
            </div>
          )}
          {questions.map((question, index) => (
            <div
              key={question._id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Question {index + 1}</span>
                <span>of {questions.length}</span>
                <span className="text-muted-foreground/30">&middot;</span>
                <span>{question.points} pt{question.points !== 1 ? "s" : ""}</span>
                <Badge variant="outline" className="rounded-full text-[10px] font-normal">
                  {question.type === "multiple_choice"
                    ? "Multiple Choice"
                    : question.type === "true_false"
                      ? "True/False"
                      : question.type === "essay"
                        ? "Essay"
                        : "Fill in the Blank"}
                </Badge>
              </div>
              <p className="mb-4 text-sm font-medium">{question.question}</p>

              {question.type === "multiple_choice" && question.options && (
                <div className="space-y-2">
                  {question.options.map((option: { text: string }, i: number) => (
                    <label
                      key={i}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors hover:bg-muted/50 ${
                        answers[question._id] === i
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${question._id}`}
                        checked={answers[question._id] === i}
                        onChange={() => setAnswer(question._id, i)}
                        className="size-4 accent-primary"
                      />
                      <span>{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "true_false" && (
                <div className="flex gap-3">
                  {[true, false].map((value) => (
                    <label
                      key={String(value)}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors hover:bg-muted/50 ${
                        answers[question._id] === value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${question._id}`}
                        checked={answers[question._id] === value}
                        onChange={() => setAnswer(question._id, value)}
                        className="size-4 accent-primary"
                      />
                      <span>{value ? "True" : "False"}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "essay" && (
                <textarea
                  value={(answers[question._id] as string) ?? ""}
                  onChange={(e) => setAnswer(question._id, e.target.value)}
                  placeholder="Write your answer..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                />
              )}

              {question.type === "fill_in" && (
                <input
                  type="text"
                  value={(answers[question._id] as string) ?? ""}
                  onChange={(e) => setAnswer(question._id, e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="lg" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : null}
                  Submit Quiz
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <AlertTriangle className="size-5 text-amber-500" />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Submit quiz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to submit? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>
                    Submit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {isCompleted && attempt && (
        <div className="space-y-4">
          {attempt.answers.map((answer: { questionId: string; isCorrect: boolean | null; pointsEarned: number }, index: number) => {
            const question = questions.find(
              (q) => q._id === answer.questionId
            )
            if (!question) return null

            return (
              <div
                key={answer.questionId}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">Question {index + 1}</span>
                  <span className="text-muted-foreground/30">&middot;</span>
                  <span>{question.points} pt{question.points !== 1 ? "s" : ""}</span>
                </div>
                <p className="mb-3 text-sm font-medium">{question.question}</p>

                {answer.isCorrect !== null ? (
                  <div className="flex items-center gap-2 text-sm">
                    {answer.isCorrect ? (
                      <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                    ) : (
                      <XCircle className="size-4 shrink-0 text-red-600" />
                    )}
                    <span>{answer.isCorrect ? "Correct" : "Incorrect"}</span>
                    <span className="text-muted-foreground/30">&middot;</span>
                    <span className="text-muted-foreground">
                      {answer.pointsEarned}/{question.points} pts
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Awaiting grading
                  </p>
                )}
              </div>
            )
          })}

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Score</span>
              <span className="text-xl font-bold">
                {attempt.totalPointsEarned}/{attempt.totalPointsPossible}
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
