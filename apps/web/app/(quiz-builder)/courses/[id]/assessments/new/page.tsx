"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Plus, Search, Timer, Shuffle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Switch } from "@workspace/ui/components/switch"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "sonner"
import { createAssessment, type LatePolicy } from "@/lib/services/assessments"
import { createQuestion, type UpdateQuestionInput } from "@/lib/services/questions"
import { QuestionSidebar } from "@/components/quiz-builder/question-sidebar"
import { QuestionCard } from "@/components/quiz-builder/question-card"
import type { QuestionLike } from "@/components/quiz-builder/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"

const FILE_TYPE_OPTIONS = [
  { label: "PDF", value: "pdf" },
  { label: "Word", value: "doc" },
  { label: "Excel", value: "spreadsheet" },
  { label: "Presentation", value: "presentation" },
  { label: "Images", value: "image" },
  { label: "Videos", value: "video" },
]

let localCounter = 0
function localId() {
  return `draft_${++localCounter}`
}

function blankQuestion(): QuestionLike {
  return {
    _id: localId(),
    type: "multiple_choice",
    question: "Untitled question",
    points: 1,
    required: true,
    multipleAnswers: false,
    randomizeOrder: false,
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ],
  }
}

export default function NewAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [title, setTitle] = React.useState("")
  const [assessmentType, setAssessmentType] = React.useState<"quiz" | "exam" | "assignment">("quiz")
  const [dueDate, setDueDate] = React.useState("")

  // Exam-specific
  const [timeLimit, setTimeLimit] = React.useState("")
  const [randomizeQuestions, setRandomizeQuestions] = React.useState(false)

  // Assignment-specific
  const [instructions, setInstructions] = React.useState("")
  const [allowedFileTypes, setAllowedFileTypes] = React.useState<string[]>([])
  const [maxFiles, setMaxFiles] = React.useState("")

  // Late policy (shared across types)
  const [latePolicyEnabled, setLatePolicyEnabled] = React.useState(false)
  const [deductionType, setDeductionType] = React.useState<"percent" | "flat">("percent")
  const [deductionPerDay, setDeductionPerDay] = React.useState("")
  const [maxDeduction, setMaxDeduction] = React.useState("")

  function buildLatePolicy(): LatePolicy | undefined {
    if (!latePolicyEnabled || !dueDate) return undefined
    return {
      enabled: true,
      deductionType,
      deductionPerDay: Number(deductionPerDay) || 0,
      maxDeduction: Number(maxDeduction) || 100,
    }
  }

  // Quiz/exam question state
  const [questions, setQuestions] = React.useState<QuestionLike[]>([])
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [creating, setCreating] = React.useState(false)

  const cardRefs = React.useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({})

  const isQuizOrExam = assessmentType === "quiz" || assessmentType === "exam"

  const computedTotal = React.useMemo(
    () => questions.reduce((sum, q) => sum + (q.points || 0), 0),
    [questions]
  )

  const filtered = React.useMemo(() => {
    if (!search.trim()) return questions
    const q = search.toLowerCase()
    return questions.filter((item) => item.question.toLowerCase().includes(q))
  }, [questions, search])

  function toggleFileType(value: string) {
    setAllowedFileTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    )
  }

  function scrollTo(id: string) {
    setTimeout(() => {
      cardRefs.current[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  function handleAdd() {
    const q = blankQuestion()
    setQuestions((prev) => [...prev, q])
    setActiveId(q._id)
    scrollTo(q._id)
  }

  async function handleSave(id: string, data: UpdateQuestionInput) {
    setQuestions((prev) => prev.map((q) => (q._id === id ? { ...q, ...data } : q)))
  }

  function handleDelete(id: string) {
    setQuestions((prev) => prev.filter((q) => q._id !== id))
    if (activeId === id) setActiveId(null)
    setDeleteTarget(null)
  }

  function handleMoveUp(index: number) {
    if (index === 0) return
    setQuestions((prev) => {
      const next = [...prev]
      ;[next[index - 1]!, next[index]!] = [next[index]!, next[index - 1]!]
      return next
    })
  }

  function handleMoveDown(index: number) {
    if (index === questions.length - 1) return
    setQuestions((prev) => {
      const next = [...prev]
      ;[next[index]!, next[index + 1]!] = [next[index + 1]!, next[index]!]
      return next
    })
  }

  function handleSelect(id: string) {
    setActiveId(id)
    scrollTo(id)
  }

  async function handleCreate() {
    if (!title.trim()) {
      toast.error("Assessment title is required")
      return
    }
    const pts = isQuizOrExam ? computedTotal : 0
    setCreating(true)
    try {
      const assessment = await createAssessment({
        courseId,
        title: title.trim(),
        type: assessmentType,
        totalPoints: pts,
        dueDate: dueDate || undefined,
        latePolicy: buildLatePolicy(),
        ...(assessmentType === "exam" && {
          timeLimit: Number(timeLimit) || undefined,
          randomizeQuestions,
        }),
        ...(assessmentType === "assignment" && {
          instructions: instructions.trim() || undefined,
          allowedFileTypes: allowedFileTypes.length > 0 ? allowedFileTypes : undefined,
          maxFiles: Number(maxFiles) || undefined,
        }),
      })

      if (questions.length > 0) {
        await Promise.all(
          questions.map((q, i) =>
            createQuestion({
              assessmentId: assessment._id,
              type: q.type,
              question: q.question || "Untitled question",
              points: q.points,
              options: q.options
                ?.filter((o) => o.text.trim())
                .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
              correctAnswer: q.correctAnswer,
              required: q.required,
              multipleAnswers: q.multipleAnswers,
              randomizeOrder: q.randomizeOrder,
              estimationTime: q.estimationTime,
              order: i,
            })
          )
        )
      }

      toast.success("Assessment created")
      router.push(`/courses/${courseId}?tab=assessments`)
    } catch {
      toast.error("Failed to create assessment")
      setCreating(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Link
          href={`/courses/${courseId}?tab=assessments`}
          className="flex shrink-0 items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="h-5 w-px shrink-0 bg-border" />

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Assessment title..."
          className="h-8 min-w-0 max-w-52 border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-visible:ring-0"
        />

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() => router.push(`/courses/${courseId}?tab=assessments`)}
        >
          Cancel
        </Button>
        <Button size="sm" className="shrink-0" onClick={handleCreate} disabled={creating}>
          {creating && <Loader2 className="mr-2 size-3 animate-spin" />}
          Create Assessment
        </Button>
      </div>

      {/* Body */}
      {isQuizOrExam ? (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <QuestionSidebar
            questions={questions}
            activeId={activeId}
            onSelect={handleSelect}
            onAdd={handleAdd}
            onDelete={(id) => setDeleteTarget(id)}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />

          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Main toolbar */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions..."
                  className="h-8 pl-8 text-sm"
                />
              </div>

              <Select
                value={assessmentType}
                onValueChange={(v) => setAssessmentType(v as "quiz" | "exam" | "assignment")}
              >
                <SelectTrigger className="h-8 w-28 shrink-0 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>

              <span className="shrink-0 text-xs text-muted-foreground">{computedTotal} pts</span>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-8 shrink-0 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Exam settings row */}
            {assessmentType === "exam" && (
              <div className="flex shrink-0 items-center gap-6 border-b border-border bg-muted/30 px-4 py-2">
                <div className="flex items-center gap-2">
                  <Timer className="size-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Time limit</span>
                  <Input
                    type="number"
                    min="1"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    placeholder="—"
                    className="h-7 w-16 text-center text-xs"
                  />
                  <span className="text-xs text-muted-foreground">mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shuffle className="size-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Randomize questions</span>
                  <Switch
                    checked={randomizeQuestions}
                    onCheckedChange={setRandomizeQuestions}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            )}

            {/* Late policy row (quiz/exam) */}
            {dueDate && (
              <div className="flex shrink-0 items-center gap-4 border-b border-border bg-muted/20 px-4 py-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={latePolicyEnabled}
                    onCheckedChange={(v) => setLatePolicyEnabled(!!v)}
                  />
                  <span className="text-xs text-muted-foreground">Late penalty</span>
                </label>
                {latePolicyEnabled && (
                  <>
                    <Select
                      value={deductionType}
                      onValueChange={(v) => setDeductionType(v as "percent" | "flat")}
                    >
                      <SelectTrigger className="h-7 w-28 shrink-0 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">% / day</SelectItem>
                        <SelectItem value="flat">pts / day</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="0"
                      value={deductionPerDay}
                      onChange={(e) => setDeductionPerDay(e.target.value)}
                      placeholder="0"
                      className="h-7 w-16 text-xs"
                    />
                    <span className="shrink-0 text-xs text-muted-foreground">
                      max
                    </span>
                    <Input
                      type="number"
                      min="0"
                      value={maxDeduction}
                      onChange={(e) => setMaxDeduction(e.target.value)}
                      placeholder={deductionType === "percent" ? "100%" : "pts"}
                      className="h-7 w-16 text-xs"
                    />
                  </>
                )}
              </div>
            )}

            {/* Question list */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-20 text-center">
                  <p className="text-sm text-muted-foreground">
                    {search
                      ? "No questions match your search"
                      : "No questions yet — click + in the sidebar to add one"}
                  </p>
                  {!search && (
                    <Button variant="outline" size="sm" onClick={handleAdd}>
                      <Plus className="mr-2 size-3.5" />
                      Add first question
                    </Button>
                  )}
                </div>
              ) : (
                filtered.map((q) => {
                  if (!cardRefs.current[q._id]) {
                    cardRefs.current[q._id] = React.createRef<HTMLDivElement | null>()
                  }
                  return (
                    <QuestionCard
                      key={q._id}
                      question={q}
                      index={questions.findIndex((x) => x._id === q._id)}
                      onSave={handleSave}
                      onDelete={(id) => setDeleteTarget(id)}
                      cardRef={cardRefs.current[q._id]}
                    />
                  )
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Assignment body */
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-2xl space-y-8">
            {/* Type + date row */}
            <div className="flex items-center gap-3">
              <Select
                value={assessmentType}
                onValueChange={(v) => setAssessmentType(v as "quiz" | "exam" | "assignment")}
              >
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-8 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter instructions for students..."
                rows={8}
                className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Late policy */}
            {dueDate && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Late Policy</h3>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={latePolicyEnabled}
                    onCheckedChange={(v) => setLatePolicyEnabled(!!v)}
                  />
                  <span className="text-sm text-muted-foreground">
                    Deduct points for late submissions
                  </span>
                </label>
                {latePolicyEnabled && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Type</Label>
                      <Select
                        value={deductionType}
                        onValueChange={(v) => setDeductionType(v as "percent" | "flat")}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">% per day</SelectItem>
                          <SelectItem value="flat">pts per day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Per day</Label>
                      <Input
                        type="number"
                        min="0"
                        value={deductionPerDay}
                        onChange={(e) => setDeductionPerDay(e.target.value)}
                        placeholder="0"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Max {deductionType === "percent" ? "%" : "pts"}
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={maxDeduction}
                        onChange={(e) => setMaxDeduction(e.target.value)}
                        placeholder={deductionType === "percent" ? "100" : "—"}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submission settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Submission Settings</h3>

              <div className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-muted-foreground">Max files</span>
                <Input
                  type="number"
                  min="1"
                  value={maxFiles}
                  onChange={(e) => setMaxFiles(e.target.value)}
                  placeholder="Unlimited"
                  className="h-8 w-28 text-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Allowed file types</span>
                  {allowedFileTypes.length === 0 && (
                    <span className="text-xs text-muted-foreground/60">— any type</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {FILE_TYPE_OPTIONS.map((ft) => {
                    const selected = allowedFileTypes.includes(ft.value)
                    return (
                      <button
                        key={ft.value}
                        type="button"
                        onClick={() => toggleFileType(ft.value)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {ft.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove question?</AlertDialogTitle>
            <AlertDialogDescription>
              This question hasn&apos;t been saved yet and will simply be removed from the draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
