"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Circle,
  Clock,
  GripVertical,
  Image,
  Mic,
  MoreHorizontal,
  Plus,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"
import { useSidebar } from "@workspace/ui/components/sidebar"
import { getAssessmentById, updateAssessment } from "@/lib/services/assessments"
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type Question,
  type QuestionOption,
} from "@/lib/services/questions"

// Local draft type mirrors Question but with a tempId for unsaved questions
interface DraftQuestion {
  _id: string | null // null = not yet persisted
  tempId: string
  type: "multiple_choice" | "true_false" | "essay" | "fill_in"
  question: string
  points: number
  order: number
  options: QuestionOption[]
  // UI-only fields
  required: boolean
  randomizeOrder: boolean
  estimationTime: number
}

function makeDraft(order: number): DraftQuestion {
  return {
    _id: null,
    tempId: Math.random().toString(36).slice(2),
    type: "multiple_choice",
    question: "",
    points: 1,
    order,
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    required: true,
    randomizeOrder: false,
    estimationTime: 2,
  }
}

function fromServerQuestion(q: Question): DraftQuestion {
  return {
    _id: q._id,
    tempId: q._id,
    type: q.type === "multiple_choice" || q.type === "true_false" || q.type === "essay" || q.type === "fill_in"
      ? q.type
      : "multiple_choice",
    question: q.question,
    points: q.points,
    order: q.order,
    options: q.options ?? [{ text: "", isCorrect: false }, { text: "", isCorrect: false }],
    required: true,
    randomizeOrder: false,
    estimationTime: 2,
  }
}

export default function QuizBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const quizId = params.quizId as string

  const [title, setTitle] = React.useState("Untitled Quiz")
  const [drafts, setDrafts] = React.useState<DraftQuestion[]>([makeDraft(0)])
  const [activeIdx, setActiveIdx] = React.useState(0)
  const [saving, setSaving] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  const { setOpen } = useSidebar()
  React.useEffect(() => {
    setOpen(false)
    return () => setOpen(true)
  }, [setOpen])

  React.useEffect(() => {
    async function load() {
      try {
        const [assessment, questions] = await Promise.all([
          getAssessmentById(quizId),
          getQuestions(quizId),
        ])
        setTitle(assessment.title)
        if (questions.length > 0) {
          const sorted = [...questions].sort((a, b) => a.order - b.order)
          setDrafts(sorted.map(fromServerQuestion))
        }
      } catch {
        toast.error("Failed to load quiz")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [quizId])

  // Debounced auto-save for title
  const titleSaveRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  function setTitleAndSave(v: string) {
    setTitle(v)
    if (titleSaveRef.current) clearTimeout(titleSaveRef.current)
    titleSaveRef.current = setTimeout(() => {
      updateAssessment(quizId, { title: v }).catch(() => {})
    }, 800)
  }

  // Debounced auto-save for a single question
  const questionSaveRefs = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  function scheduleQuestionSave(draft: DraftQuestion) {
    const key = draft.tempId
    if (questionSaveRefs.current[key]) clearTimeout(questionSaveRefs.current[key])
    questionSaveRefs.current[key] = setTimeout(async () => {
      try {
        if (draft._id) {
          await updateQuestion(draft._id, {
            question: draft.question,
            type: draft.type,
            points: draft.points,
            order: draft.order,
            options: draft.type === "multiple_choice" ? draft.options : undefined,
          })
        } else {
          const saved = await createQuestion({
            assessmentId: quizId,
            type: draft.type,
            question: draft.question,
            points: draft.points,
            order: draft.order,
            options: draft.type === "multiple_choice" ? draft.options : undefined,
          })
          // Update tempId → real _id
          setDrafts((prev) =>
            prev.map((d) => (d.tempId === key ? { ...d, _id: saved._id, tempId: saved._id } : d))
          )
        }
      } catch {
        // silent — publish will surface errors
      }
    }, 800)
  }

  function updateDraft(idx: number, patch: Partial<DraftQuestion>) {
    setDrafts((prev) => {
      const next = prev.map((d, i) => (i === idx ? { ...d, ...patch } : d))
      scheduleQuestionSave(next[idx]!)
      return next
    })
  }

  function updateOption(qIdx: number, oIdx: number, patch: Partial<QuestionOption>) {
    setDrafts((prev) => {
      const next = prev.map((d, i) => {
        if (i !== qIdx) return d
        const options = d.options.map((o, j) => (j === oIdx ? { ...o, ...patch } : o))
        return { ...d, options }
      })
      scheduleQuestionSave(next[qIdx]!)
      return next
    })
  }

  function addOption(qIdx: number) {
    setDrafts((prev) => {
      const next = prev.map((d, i) =>
        i === qIdx ? { ...d, options: [...d.options, { text: "", isCorrect: false }] } : d
      )
      scheduleQuestionSave(next[qIdx]!)
      return next
    })
  }

  function removeOption(qIdx: number, oIdx: number) {
    setDrafts((prev) => {
      const next = prev.map((d, i) => {
        if (i !== qIdx) return d
        return { ...d, options: d.options.filter((_, j) => j !== oIdx) }
      })
      scheduleQuestionSave(next[qIdx]!)
      return next
    })
  }

  function moveOption(qIdx: number, from: number, to: number) {
    setDrafts((prev) => {
      const next = prev.map((d, i) => {
        if (i !== qIdx) return d
        const opts = [...d.options]
        const moved = opts.splice(from, 1)[0]
        if (!moved) return d
        opts.splice(to, 0, moved)
        return { ...d, options: opts }
      })
      scheduleQuestionSave(next[qIdx]!)
      return next
    })
  }

  function toggleCorrect(qIdx: number, oIdx: number) {
    setDrafts((prev) => {
      const d = prev[qIdx]
      if (!d) return prev
      let options: QuestionOption[]
      if (d.type === "multiple_choice" && !d.randomizeOrder) {
        // single-correct by default; multipleAnswer not in server model — treat as radio
        options = d.options.map((o, j) => ({ ...o, isCorrect: j === oIdx }))
      } else {
        options = d.options.map((o, j) =>
          j === oIdx ? { ...o, isCorrect: !o.isCorrect } : o
        )
      }
      const next = prev.map((q, i) => (i === qIdx ? { ...q, options } : q))
      scheduleQuestionSave(next[qIdx]!)
      return next
    })
  }

  async function addQuestion() {
    const next = [...drafts, makeDraft(drafts.length)]
    setDrafts(next)
    setActiveIdx(next.length - 1)
  }

  async function removeQuestion(idx: number) {
    if (drafts.length === 1) return
    const draft = drafts[idx]
    if (draft?._id) {
      try {
        await deleteQuestion(draft._id)
      } catch {
        toast.error("Failed to delete question")
        return
      }
    }
    const next = drafts.filter((_, i) => i !== idx).map((d, i) => ({ ...d, order: i }))
    setDrafts(next)
    setActiveIdx(Math.min(idx, next.length - 1))
  }

  async function handlePublish() {
    setSaving(true)
    try {
      const total = drafts.reduce((s, d) => s + d.points, 0)
      await updateAssessment(quizId, { title, totalPoints: total })
      // Save any unsaved drafts
      await Promise.all(
        drafts
          .filter((d) => !d._id)
          .map((d) =>
            createQuestion({
              assessmentId: quizId,
              type: d.type,
              question: d.question,
              points: d.points,
              order: d.order,
              options: d.type === "multiple_choice" ? d.options : undefined,
            })
          )
      )
      toast.success("Quiz published")
    } catch {
      toast.error("Failed to publish")
    } finally {
      setSaving(false)
    }
  }

  const activeDraft = drafts[activeIdx]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading quiz…</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
        <button
          onClick={() => router.push(`/courses/${courseId}?tab=assessments`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </button>
        <Separator orientation="vertical" className="h-5" />
        <input
          value={title}
          onChange={(e) => setTitleAndSave(e.target.value)}
          className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Untitled Quiz"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/courses/${courseId}/assessments/${quizId}`)}>
            Grade
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={saving}>
            {saving ? "Saving…" : "Publish"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Question sidebar */}
        <aside className="flex w-52 shrink-0 flex-col overflow-y-auto border-r border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Questions ({drafts.length})
            </span>
            <button
              onClick={addQuestion}
              className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <div className="flex-1 py-1">
            {drafts.map((draft, idx) => (
              <button
                key={draft.tempId}
                onClick={() => setActiveIdx(idx)}
                className={cn(
                  "flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors",
                  activeIdx === idx
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-foreground">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {draft.question || "Untitled question"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {draft.type === "multiple_choice" ? "Multiple choice" :
                     draft.type === "true_false" ? "True / False" :
                     draft.type === "essay" ? "Essay" : "Fill in blank"}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-border">
            <button className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
              <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted">
                <Circle className="size-3" />
              </div>
              <span className="text-xs">Result Screen</span>
            </button>
          </div>
        </aside>

        {/* Main editor */}
        <main className="flex flex-1 flex-col overflow-y-auto bg-muted/30">
          <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
            {activeDraft && (
              <QuestionCard
                draft={activeDraft}
                index={activeIdx}
                canDelete={drafts.length > 1}
                onUpdate={(patch) => updateDraft(activeIdx, patch)}
                onUpdateOption={(oIdx, patch) => updateOption(activeIdx, oIdx, patch)}
                onAddOption={() => addOption(activeIdx)}
                onRemoveOption={(oIdx) => removeOption(activeIdx, oIdx)}
                onMoveOption={(from, to) => moveOption(activeIdx, from, to)}
                onToggleCorrect={(oIdx) => toggleCorrect(activeIdx, oIdx)}
                onDelete={() => removeQuestion(activeIdx)}
              />
            )}

            <div className="relative flex items-center gap-3 py-2">
              <Separator className="flex-1" />
              <span className="shrink-0 text-xs text-muted-foreground">Create new Question</span>
              <Separator className="flex-1" />
            </div>

            <div className="flex items-center gap-2 pb-8">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={addQuestion}>
                <Plus className="size-3.5" />
                Create from Scratch
              </Button>
              <Button
                size="sm"
                className="gap-1.5 border-0 bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:from-violet-600 hover:to-blue-600"
                onClick={() => toast.info("AI question generation coming soon")}
              >
                <Sparkles className="size-3.5" />
                Create with AI
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

interface QuestionCardProps {
  draft: DraftQuestion
  index: number
  canDelete: boolean
  onUpdate: (patch: Partial<DraftQuestion>) => void
  onUpdateOption: (oIdx: number, patch: Partial<QuestionOption>) => void
  onAddOption: () => void
  onRemoveOption: (oIdx: number) => void
  onMoveOption: (from: number, to: number) => void
  onToggleCorrect: (oIdx: number) => void
  onDelete: () => void
}

function QuestionCard({
  draft,
  index,
  canDelete,
  onUpdate,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onMoveOption,
  onToggleCorrect,
  onDelete,
}: QuestionCardProps) {
  function handleDragStart(e: React.DragEvent, idx: number) {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("optIdx", String(idx))
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDrop(e: React.DragEvent, toIdx: number) {
    e.preventDefault()
    const from = parseInt(e.dataTransfer.getData("optIdx"), 10)
    if (!isNaN(from) && from !== toIdx) onMoveOption(from, toIdx)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      {/* Type bar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <Select
          value={draft.type}
          onValueChange={(v) =>
            onUpdate({ type: v as DraftQuestion["type"] })
          }
        >
          <SelectTrigger className="h-8 w-48 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple_choice">Multiple choice</SelectItem>
            <SelectItem value="true_false">True / False</SelectItem>
            <SelectItem value="essay">Essay</SelectItem>
            <SelectItem value="fill_in">Fill in the blank</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Required
            <Switch
              checked={draft.required}
              onCheckedChange={(v) => onUpdate({ required: v })}
            />
          </label>
          {canDelete && (
            <button
              onClick={onDelete}
              className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <MoreHorizontal className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Question text */}
      <div className="px-4 pb-2 pt-4">
        <div className="mb-1 text-[11px] font-medium text-muted-foreground">
          Question {index + 1}
          {draft.required && <span className="text-destructive">*</span>}
        </div>
        <div className="relative">
          <textarea
            value={draft.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Type your question here…"
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 pr-24 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="absolute right-2 top-2 flex items-center gap-1">
            <button className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted">
              <Image className="size-3.5" />
            </button>
            <button className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted">
              <Video className="size-3.5" />
            </button>
            <button className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted">
              <Mic className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Options (multiple choice) */}
      {draft.type === "multiple_choice" && (
        <div className="px-4 pb-3">
          <div className="mb-2 text-[11px] font-medium text-muted-foreground">
            Choices<span className="text-destructive">*</span>
          </div>

          <div className="space-y-1.5">
            {draft.options.map((opt, oIdx) => (
              <div
                key={oIdx}
                draggable
                onDragStart={(e) => handleDragStart(e, oIdx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, oIdx)}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => onToggleCorrect(oIdx)}
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    opt.isCorrect
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40"
                  )}
                >
                  {opt.isCorrect && <div className="size-1.5 rounded-full bg-white" />}
                </button>
                <input
                  value={opt.text}
                  onChange={(e) => onUpdateOption(oIdx, { text: e.target.value })}
                  placeholder={`Choice ${oIdx + 1}`}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <div className="flex items-center gap-1">
                  <button className="flex size-6 cursor-grab items-center justify-center rounded text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing">
                    <GripVertical className="size-3.5" />
                  </button>
                  {draft.options.length > 1 && (
                    <button
                      onClick={() => onRemoveOption(oIdx)}
                      className="flex size-6 items-center justify-center rounded text-muted-foreground/50 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onAddOption}
            className="mt-2 flex w-full items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Plus className="size-3.5" />
            Add answers
          </button>
        </div>
      )}

      {/* True/False */}
      {draft.type === "true_false" && (
        <div className="px-4 pb-3">
          <div className="mb-2 text-[11px] font-medium text-muted-foreground">Correct Answer</div>
          <div className="flex gap-2">
            {["True", "False"].map((label) => {
              const isTrue = label === "True"
              const selected = draft.options[0]?.isCorrect === isTrue
              return (
                <button
                  key={label}
                  onClick={() =>
                    onUpdate({
                      options: [
                        { text: "True", isCorrect: isTrue },
                        { text: "False", isCorrect: !isTrue },
                      ],
                    })
                  }
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Essay */}
      {draft.type === "essay" && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground">
            Students will submit a written response. No automated grading.
          </p>
        </div>
      )}

      {/* Fill in the blank */}
      {draft.type === "fill_in" && (
        <div className="px-4 pb-3">
          <div className="mb-1.5 text-[11px] font-medium text-muted-foreground">
            Correct Answer <span className="font-normal">(comma-separated alternatives)</span>
          </div>
          <input
            value={draft.options[0]?.text ?? ""}
            onChange={(e) =>
              onUpdate({ options: [{ text: e.target.value, isCorrect: true }] })
            }
            placeholder="e.g. Paris, paris"
            className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {/* Settings bar */}
      <div className="flex flex-wrap items-center gap-6 border-t border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Randomize Order</span>
          <Select
            value={draft.randomizeOrder ? "random" : "keep"}
            onValueChange={(v) => onUpdate({ randomizeOrder: v === "random" })}
          >
            <SelectTrigger className="h-7 w-44 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keep">Keep current order</SelectItem>
              <SelectItem value="random">Randomize</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">Estimation time</span>
          <input
            type="number"
            min={1}
            value={draft.estimationTime}
            onChange={(e) =>
              onUpdate({ estimationTime: Math.max(1, parseInt(e.target.value) || 1) })
            }
            className="w-12 rounded border border-border bg-transparent px-1.5 py-0.5 text-center text-xs text-foreground outline-none focus:border-primary"
          />
          <span className="text-[11px] text-muted-foreground">Mins</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Mark as point</span>
          <input
            type="number"
            min={0}
            value={draft.points}
            onChange={(e) =>
              onUpdate({ points: Math.max(0, parseInt(e.target.value) || 0) })
            }
            className="w-12 rounded border border-border bg-transparent px-1.5 py-0.5 text-center text-xs text-foreground outline-none focus:border-primary"
          />
          <span className="text-[11px] text-muted-foreground">Points</span>
          <Circle className="size-3 fill-yellow-400 text-yellow-400" />
        </div>
      </div>
    </div>
  )
}
