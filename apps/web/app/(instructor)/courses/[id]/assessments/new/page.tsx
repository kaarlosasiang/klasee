"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Loader2,
  FileText,
  GraduationCap,
  PenLine,
  Plus,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trash2,
  Pencil,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
import { toast } from "sonner"
import {
  createAssessment,
  type Assessment,
} from "@/lib/services/assessments"
import {
  createQuestion,
  deleteQuestion,
  type Question,
} from "@/lib/services/questions"

interface PendingQuestion {
  id: string
  type: "multiple_choice" | "true_false" | "essay" | "fill_in"
  question: string
  points: number
  options?: { text: string; isCorrect: boolean }[]
  correctAnswer?: string | boolean
}

let pendingIdCounter = 0
function nextPendingId() {
  return `pending_${++pendingIdCounter}`
}

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True/False",
  essay: "Essay",
  fill_in: "Fill in the Blank",
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  multiple_choice: CheckCircle2,
  true_false: HelpCircle,
  essay: FileText,
  fill_in: PenLine,
}

export default function NewAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState<"quiz" | "exam" | "assignment">("quiz")
  const [totalPoints, setTotalPoints] = React.useState("")
  const [dueDate, setDueDate] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const [createdAssessment, setCreatedAssessment] = React.useState<Assessment | null>(null)

  // Question form
  const [questions, setQuestions] = React.useState<PendingQuestion[]>([])
  const [savingQuestions, setSavingQuestions] = React.useState(false)

  // Inline add question form
  const [adding, setAdding] = React.useState(false)
  const [qType, setQType] = React.useState<"multiple_choice" | "true_false" | "essay" | "fill_in">("multiple_choice")
  const [qText, setQText] = React.useState("")
  const [qPoints, setQPoints] = React.useState("")
  const [qOptions, setQOptions] = React.useState<string[]>(["", ""])
  const [qCorrectOption, setQCorrectOption] = React.useState(0)
  const [qCorrectBool, setQCorrectBool] = React.useState(true)
  const [qCorrectAnswer, setQCorrectAnswer] = React.useState("")

  const isQuizOrExam = type === "quiz" || type === "exam"

  function resetQuestionForm() {
    setQType("multiple_choice")
    setQText("")
    setQPoints("")
    setQOptions(["", ""])
    setQCorrectOption(0)
    setQCorrectBool(true)
    setQCorrectAnswer("")
  }

  function addPendingQuestion() {
    if (!qText.trim()) {
      toast.error("Question text is required")
      return
    }
    const points = Number(qPoints) || 1
    const pending: PendingQuestion = {
      id: nextPendingId(),
      type: qType,
      question: qText.trim(),
      points,
    }
    if (qType === "multiple_choice") {
      pending.options = qOptions
        .filter((o) => o.trim())
        .map((text, i) => ({ text: text.trim(), isCorrect: i === qCorrectOption }))
    } else if (qType === "true_false") {
      pending.correctAnswer = qCorrectBool
    } else if (qType === "fill_in") {
      pending.correctAnswer = qCorrectAnswer.trim()
    }
    setQuestions((prev) => [...prev, pending])
    resetQuestionForm()
    setAdding(false)
    toast.success("Question added")
  }

  function removePendingQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  async function handleCreate() {
    if (!title.trim()) {
      toast.error("Assessment title is required")
      return
    }
    const points = Number(totalPoints)
    if (!totalPoints || points <= 0) {
      toast.error("Total points must be a positive number")
      return
    }
    setCreating(true)
    try {
      const assessment = await createAssessment({
        courseId,
        title: title.trim(),
        type,
        totalPoints: points,
        dueDate: dueDate || undefined,
      })
      setCreatedAssessment(assessment)

      if (questions.length > 0) {
        setSavingQuestions(true)
        await Promise.all(
          questions.map((q) =>
            createQuestion({
              assessmentId: assessment._id,
              type: q.type,
              question: q.question,
              points: q.points,
              options: q.options,
              correctAnswer: q.correctAnswer,
            })
          )
        )
        setSavingQuestions(false)
      }

      toast.success("Assessment created")
      router.push(`/courses/${courseId}?tab=assessments`)
    } catch {
      toast.error("Failed to create assessment")
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/courses/${courseId}?tab=assessments`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Quizzes & Assignments
      </Link>

      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-lg font-bold">New Assessment</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details and add questions below.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Quiz 1"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={(v) => setType(v as "quiz" | "exam" | "assignment")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Total Points</label>
              <Input
                type="number"
                min="1"
                value={totalPoints}
                onChange={(e) => setTotalPoints(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>

      {isQuizOrExam && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold">Questions</h2>

          {questions.length > 0 && (
            <div className="mb-4 space-y-2">
              {questions.map((q, i) => {
                const Icon = TYPE_ICONS[q.type] ?? HelpCircle
                return (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3"
                  >
                    <span className="mt-0.5 text-xs font-medium text-muted-foreground">
                      {i + 1}.
                    </span>
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Icon className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{q.question}</p>
                      <p className="text-xs text-muted-foreground">
                        {TYPE_LABELS[q.type]} &middot; {q.points} pt{q.points !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePendingQuestion(q.id)}
                      className="flex size-6 items-center justify-center rounded text-muted-foreground/40 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {adding ? (
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="mb-3">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label>
                <Select
                  value={qType}
                  onValueChange={(v) => setQType(v as "multiple_choice" | "true_false" | "essay" | "fill_in")}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="fill_in">Fill in the Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-3 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Question</label>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter your question..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="mb-3">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Points</label>
                <Input
                  type="number"
                  min="1"
                  value={qPoints}
                  onChange={(e) => setQPoints(e.target.value)}
                  placeholder="1"
                  className="w-24"
                />
              </div>

              {qType === "multiple_choice" && (
                <div className="mb-3 space-y-2">
                  <label className="block text-xs font-medium text-muted-foreground">Options</label>
                  {qOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQCorrectOption(i)}
                        className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs transition-colors hover:bg-muted"
                      >
                        {qCorrectOption === i ? (
                          <CheckCircle2 className="size-4 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground/50">{String.fromCharCode(65 + i)}</span>
                        )}
                      </button>
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const next = [...qOptions]
                          next[i] = e.target.value
                          setQOptions(next)
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1"
                      />
                      {qOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setQOptions(qOptions.filter((_, j) => j !== i))
                            if (qCorrectOption === i) setQCorrectOption(0)
                            else if (qCorrectOption > i) setQCorrectOption(qCorrectOption - 1)
                          }}
                          className="text-muted-foreground/40 hover:text-destructive"
                        >
                          <XCircle className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQOptions([...qOptions, ""])}
                    className="text-xs text-muted-foreground"
                  >
                    <Plus className="mr-1 size-3" />
                    Add option
                  </Button>
                </div>
              )}

              {qType === "true_false" && (
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Correct Answer</label>
                  <Select value={String(qCorrectBool)} onValueChange={(v) => setQCorrectBool(v === "true")}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {qType === "fill_in" && (
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Correct Answer
                    <span className="font-normal text-muted-foreground/60"> (comma-separated alternatives)</span>
                  </label>
                  <Input
                    value={qCorrectAnswer}
                    onChange={(e) => setQCorrectAnswer(e.target.value)}
                    placeholder="e.g. Paris, paris"
                    className="max-w-xs"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setAdding(false); resetQuestionForm() }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={addPendingQuestion}>
                  Add Question
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdding(true)}
            >
              <Plus className="mr-2 size-4" />
              Add Question
            </Button>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          variant="ghost"
          onClick={() => router.push(`/courses/${courseId}?tab=assessments`)}
        >
          Cancel
        </Button>
        <Button
          size="lg"
          onClick={handleCreate}
          disabled={creating || savingQuestions}
        >
          {creating || savingQuestions ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : null}
          Create Assessment
        </Button>
      </div>
    </div>
  )
}
