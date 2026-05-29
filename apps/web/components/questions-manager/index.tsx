"use client"

import * as React from "react"
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Loader2,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Type,
  ToggleLeft,
} from "lucide-react"
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
import { Skeleton } from "@workspace/ui/components/skeleton"
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
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  type Question,
} from "@/lib/services/questions"

interface QuestionsManagerProps {
  assessmentId: string
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  multiple_choice: CheckCircle2,
  true_false: ToggleLeft,
  essay: FileText,
  fill_in: Type,
}

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True/False",
  essay: "Essay",
  fill_in: "Fill in the Blank",
}

export function QuestionsManager({ assessmentId }: QuestionsManagerProps) {
  const [questions, setQuestions] = React.useState<Question[]>([])
  const [loading, setLoading] = React.useState(true)
  const [creating, setCreating] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  // Form state
  const [qType, setQType] = React.useState<"multiple_choice" | "true_false" | "essay" | "fill_in">("multiple_choice")
  const [qText, setQText] = React.useState("")
  const [qPoints, setQPoints] = React.useState("")
  const [qOptions, setQOptions] = React.useState<string[]>(["", ""])
  const [qCorrectOption, setQCorrectOption] = React.useState<number>(0)
  const [qCorrectBool, setQCorrectBool] = React.useState<boolean>(true)
  const [qCorrectAnswer, setQCorrectAnswer] = React.useState("")

  const fetchQuestions = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await getQuestions(assessmentId)
      setQuestions(data)
    } catch {
      toast.error("Failed to load questions")
    } finally {
      setLoading(false)
    }
  }, [assessmentId])

  React.useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  function resetForm() {
    setQType("multiple_choice")
    setQText("")
    setQPoints("")
    setQOptions(["", ""])
    setQCorrectOption(0)
    setQCorrectBool(true)
    setQCorrectAnswer("")
  }

  function buildCreatePayload() {
    const points = qPoints ? Number(qPoints) : 1
    const payload: Record<string, unknown> = {
      assessmentId,
      type: qType,
      question: qText.trim(),
      points,
    }

    if (qType === "multiple_choice") {
      payload.options = qOptions
        .filter((o: string) => o.trim())
        .map((text: string, i: number) => ({ text: text.trim(), isCorrect: i === qCorrectOption }))
    } else if (qType === "true_false") {
      payload.correctAnswer = qCorrectBool
    } else if (qType === "fill_in") {
      payload.correctAnswer = qCorrectAnswer.trim()
    }

    return payload as unknown as Parameters<typeof createQuestion>[0]
  }

  async function handleCreate() {
    if (!qText.trim()) {
      toast.error("Question text is required")
      return
    }
    setSubmitting(true)
    try {
      await createQuestion(buildCreatePayload())
      resetForm()
      setCreating(false)
      toast.success("Question added")
      fetchQuestions()
    } catch {
      toast.error("Failed to create question")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(question: Question) {
    if (!qText.trim()) {
      toast.error("Question text is required")
      return
    }
    setSubmitting(true)
    try {
      const points = qPoints ? Number(qPoints) : 1
      const payload: Record<string, unknown> = {
        question: qText.trim(),
        type: qType,
        points,
      }

      if (qType === "multiple_choice") {
        payload.options = qOptions
          .filter((o: string) => o.trim())
          .map((text: string, i: number) => ({ text: text.trim(), isCorrect: i === qCorrectOption }))
      } else if (qType === "true_false") {
        payload.correctAnswer = qCorrectBool
      } else if (qType === "fill_in") {
        payload.correctAnswer = qCorrectAnswer.trim()
      }

      await updateQuestion(question._id, payload)
      setEditingId(null)
      resetForm()
      toast.success("Question updated")
      fetchQuestions()
    } catch {
      toast.error("Failed to update question")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(question: Question) {
    try {
      await deleteQuestion(question._id)
      toast.success("Question deleted")
      fetchQuestions()
    } catch {
      toast.error("Failed to delete question")
    }
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return
    const ids = questions.map((q) => q._id)
    const a = ids[index]
    const b = ids[index - 1]
    if (!a || !b) return
    ids[index - 1] = a
    ids[index] = b
    try {
      await reorderQuestions(assessmentId, ids)
      fetchQuestions()
    } catch {
      toast.error("Failed to reorder questions")
    }
  }

  async function handleMoveDown(index: number) {
    if (index === questions.length - 1) return
    const ids = questions.map((q) => q._id)
    const a = ids[index]
    const b = ids[index + 1]
    if (!a || !b) return
    ids[index] = b
    ids[index + 1] = a
    try {
      await reorderQuestions(assessmentId, ids)
      fetchQuestions()
    } catch {
      toast.error("Failed to reorder questions")
    }
  }

  function startEdit(question: Question) {
    setEditingId(question._id)
    setQText(question.question)
    setQPoints(String(question.points))
    setQType(question.type)

    if (question.type === "multiple_choice") {
      const opts = question.options?.map((o: { text: string }) => o.text) ?? ["", ""]
      setQOptions(opts)
      const correctIdx = question.options?.findIndex((o: { isCorrect: boolean }) => o.isCorrect) ?? 0
      setQCorrectOption(correctIdx >= 0 ? correctIdx : 0)
    } else if (question.type === "true_false") {
      setQCorrectBool(question.correctAnswer === true)
    } else if (question.type === "fill_in") {
      setQCorrectAnswer(String(question.correctAnswer ?? ""))
    }
  }

  function cancelEdit() {
    setEditingId(null)
    resetForm()
  }

  const sorted = React.useMemo(
    () => [...questions].sort((a, b) => a.order - b.order),
    [questions]
  )

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          {questions.length} {questions.length === 1 ? "Question" : "Questions"}
        </h2>
        {!creating && (
          <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
            <Plus className="mr-2 size-4" />
            Add Question
          </Button>
        )}
      </div>

      {creating && (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
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
                    title="Mark as correct"
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
                      className="text-xs text-muted-foreground/40 hover:text-destructive"
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
              <Select
                value={String(qCorrectBool)}
                onValueChange={(v) => setQCorrectBool(v === "true")}
              >
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
                <span className="font-normal text-muted-foreground/60"> (separate alternatives with commas)</span>
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
            <Button variant="ghost" size="sm" onClick={() => { setCreating(false); resetForm() }} disabled={submitting}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting}>
              {submitting ? <Loader2 className="size-3 animate-spin" /> : "Add Question"}
            </Button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !creating ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <HelpCircle className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No questions yet</p>
          <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
            <Plus className="mr-2 size-4" />
            Add your first question
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((question, index) => (
            <div
              key={question._id}
              className="rounded-xl border border-border bg-card transition-colors hover:bg-muted/20"
            >
              {editingId === question._id ? (
                <div className="p-4">
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
                      className="w-24"
                    />
                  </div>
                  {qType === "multiple_choice" && (
                    <div className="mb-3 space-y-2">
                      <label className="block text-xs font-medium text-muted-foreground">Options</label>
              {qOptions.map((opt: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQCorrectOption(i)}
                            className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs"
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
                            className="flex-1"
                          />
                          {qOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                        setQOptions(qOptions.filter((_: string, j: number) => j !== i))
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
                      <Button variant="ghost" size="sm" onClick={() => setQOptions([...qOptions, ""])} className="text-xs">
                        <Plus className="mr-1 size-3" />
                        Add option
                      </Button>
                    </div>
                  )}
                  {qType === "true_false" && (
                    <div className="mb-3">
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
                      <Input
                        value={qCorrectAnswer}
                        onChange={(e) => setQCorrectAnswer(e.target.value)}
                        placeholder="Correct answer (comma-separated alternatives)"
                        className="max-w-xs"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={submitting}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleUpdate(question)} disabled={submitting}>
                      {submitting ? <Loader2 className="size-3 animate-spin" /> : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4">
                  <div className="flex shrink-0 flex-col gap-0.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="flex size-5 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-muted-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <span className="text-xs">&uarr;</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === sorted.length - 1}
                      className="flex size-5 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-muted-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <span className="text-xs">&darr;</span>
                    </button>
                  </div>

                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {React.createElement(TYPE_ICONS[question.type] ?? HelpCircle, { className: "size-4 text-muted-foreground" })}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{index + 1}.</span>
                      <span className="text-sm font-medium">{question.question}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="rounded-full text-[10px] font-normal">
                        {TYPE_LABELS[question.type] ?? question.type}
                      </Badge>
                      <span>{question.points} pt{question.points !== 1 ? "s" : ""}</span>
                      {question.type === "multiple_choice" && question.options && (
                        <span>{question.options.length} options</span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(question)}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Edit"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogMedia>
                            <AlertTriangle className="size-5 text-destructive" />
                          </AlertDialogMedia>
                          <AlertDialogTitle>Delete question?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this question and all its data. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction variant="destructive" onClick={() => handleDelete(question)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
