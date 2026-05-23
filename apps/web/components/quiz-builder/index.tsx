"use client"

import * as React from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { toast } from "sonner"
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  type Question,
  type UpdateQuestionInput,
} from "@/lib/services/questions"
import { QuestionSidebar } from "./question-sidebar"
import { QuestionCard } from "./question-card"
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

interface QuizBuilderProps {
  assessmentId: string
  onTotalChange?: (total: number) => void
  className?: string
}

export function QuizBuilder({ assessmentId, onTotalChange, className }: QuizBuilderProps) {
  const [questions, setQuestions] = React.useState<Question[]>([])
  const [loading, setLoading] = React.useState(true)
  const [adding, setAdding] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")

  const questionsRef = React.useRef(questions)
  questionsRef.current = questions

  const cardRefs = React.useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({})

  const sorted = React.useMemo(
    () => [...questions].sort((a, b) => a.order - b.order),
    [questions]
  )

  const filtered = React.useMemo(() => {
    if (!search.trim()) return sorted
    const q = search.toLowerCase()
    return sorted.filter((item) => item.question.toLowerCase().includes(q))
  }, [sorted, search])

  function notifyTotal() {
    const total = questionsRef.current.reduce((sum, q) => sum + q.points, 0)
    onTotalChange?.(total)
  }

  async function fetchQuestions() {
    setLoading(true)
    try {
      const data = await getQuestions(assessmentId)
      const oldSum = questionsRef.current.reduce((sum, q) => sum + q.points, 0)
      const newSum = data.reduce((sum, q) => sum + q.points, 0)
      computeTotal(newSum - oldSum)
      setQuestions(data)
    } catch {
      toast.error("Failed to load questions")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchQuestions()
  }, [assessmentId])

  function computeTotal(delta?: number) {
    const base = questionsRef.current.reduce((sum, q) => sum + q.points, 0)
    onTotalChange?.(delta !== undefined ? base + delta : base)
  }

  async function handleAdd() {
    setAdding(true)
    try {
      const newQ = await createQuestion({
        assessmentId,
        type: "multiple_choice",
        question: "Untitled question",
        points: 1,
        required: true,
        multipleAnswers: false,
        randomizeOrder: false,
      })
      computeTotal(newQ.points)
      setQuestions((prev) => [...prev, newQ])
      setActiveId(newQ._id)
      setTimeout(() => {
        cardRefs.current[newQ._id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    } catch {
      toast.error("Failed to add question")
    } finally {
      setAdding(false)
    }
  }

  async function handleSave(id: string, data: UpdateQuestionInput) {
    try {
      const updated = await updateQuestion(id, data)
      const oldQ = questionsRef.current.find((q) => q._id === id)
      const delta = oldQ ? updated.points - oldQ.points : 0
      computeTotal(delta)
      setQuestions((prev) => prev.map((q) => (q._id === id ? updated : q)))
      toast.success("Question saved")
    } catch {
      toast.error("Failed to save question")
      throw new Error("save failed")
    }
  }

  async function handleDelete(id: string) {
    try {
      const oldQ = questionsRef.current.find((q) => q._id === id)
      await deleteQuestion(id)
      if (oldQ) computeTotal(-oldQ.points)
      setQuestions((prev) => prev.filter((q) => q._id !== id))
      if (activeId === id) setActiveId(null)
      toast.success("Question deleted")
    } catch {
      toast.error("Failed to delete question")
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return
    const ids = sorted.map((q) => q._id)
    const a = ids[index]!
    const b = ids[index - 1]!
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
    if (index === sorted.length - 1) return
    const ids = sorted.map((q) => q._id)
    const a = ids[index]!
    const b = ids[index + 1]!
    ids[index] = b
    ids[index + 1] = a
    try {
      await reorderQuestions(assessmentId, ids)
      fetchQuestions()
    } catch {
      toast.error("Failed to reorder questions")
    }
  }

  function handleSelect(id: string) {
    setActiveId(id)
    cardRefs.current[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className={className ?? "flex h-full overflow-hidden rounded-xl border border-border"}>
        <QuestionSidebar
          questions={sorted}
          activeId={activeId}
          onSelect={handleSelect}
          onAdd={handleAdd}
          onDelete={(id) => setDeleteTarget(id)}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-border px-4 py-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="h-8 pl-8 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  {search ? "No questions match your search" : "No questions yet — click + to add one"}
                </p>
              </div>
            ) : (
              filtered.map((q, index) => {
                if (!cardRefs.current[q._id]) {
                  cardRefs.current[q._id] = React.createRef<HTMLDivElement | null>()
                }
                return (
                  <QuestionCard
                    key={q._id}
                    question={q}
                    index={sorted.findIndex((s) => s._id === q._id)}
                    onSave={handleSave}
                    onDelete={(id) => setDeleteTarget(id)}
                    cardRef={cardRefs.current[q._id]}
                  />
                )
              })
            )}

            {adding && (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-8">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
