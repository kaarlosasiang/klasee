"use client"

import * as React from "react"
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  FileText,
  Video,
  Link2,
  File,
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
  getModules,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  type Module,
} from "@/lib/services/modules"
import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  type Lesson,
} from "@/lib/services/lessons"

interface ModulesManagerProps {
  courseId: string
}

export function ModulesManager({ courseId }: ModulesManagerProps) {
  const [modules, setModules] = React.useState<Module[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())

  // Lesson state
  const [lessonsCache, setLessonsCache] = React.useState<Record<string, Lesson[]>>({})
  const [lessonsLoading, setLessonsLoading] = React.useState<Record<string, boolean>>({})
  const [creatingLesson, setCreatingLesson] = React.useState<string | null>(null)
  const [editingLessonId, setEditingLessonId] = React.useState<string | null>(null)
  const [lessonTitle, setLessonTitle] = React.useState("")
  const [lessonContent, setLessonContent] = React.useState("")
  const [lessonType, setLessonType] = React.useState<"page" | "video" | "file" | "embed">("page")
  const [lessonSubmitting, setLessonSubmitting] = React.useState(false)

  const fetchModules = React.useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getModules(courseId)
      setModules(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  const fetchLessons = React.useCallback(async (moduleId: string) => {
    setLessonsLoading((prev) => ({ ...prev, [moduleId]: true }))
    try {
      const data = await getLessons(moduleId)
      setLessonsCache((prev) => ({ ...prev, [moduleId]: data }))
    } catch {
      toast.error("Failed to load lessons")
    } finally {
      setLessonsLoading((prev) => ({ ...prev, [moduleId]: false }))
    }
  }, [])

  React.useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const sorted = React.useMemo(
    () => [...modules].sort((a, b) => a.order - b.order),
    [modules]
  )

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else {
        next.add(id)
        if (!lessonsCache[id]) fetchLessons(id)
      }
      return next
    })
  }

  async function handleCreateLesson(moduleId: string) {
    if (!lessonTitle.trim()) {
      toast.error("Lesson title is required")
      return
    }
    setLessonSubmitting(true)
    try {
      await createLesson({
        moduleId,
        title: lessonTitle.trim(),
        content: lessonContent.trim() || undefined,
        type: lessonType,
      })
      setLessonTitle("")
      setLessonContent("")
      setLessonType("page")
      setCreatingLesson(null)
      toast.success("Lesson created")
      fetchLessons(moduleId)
    } catch {
      toast.error("Failed to create lesson")
    } finally {
      setLessonSubmitting(false)
    }
  }

  async function handleUpdateLesson(lesson: Lesson) {
    if (!lessonTitle.trim()) {
      toast.error("Lesson title is required")
      return
    }
    setLessonSubmitting(true)
    try {
      await updateLesson(lesson._id, {
        title: lessonTitle.trim(),
        content: lessonContent.trim() || undefined,
        type: lessonType,
      })
      setEditingLessonId(null)
      setLessonTitle("")
      setLessonContent("")
      setLessonType("page")
      toast.success("Lesson updated")
      fetchLessons(lesson.moduleId)
    } catch {
      toast.error("Failed to update lesson")
    } finally {
      setLessonSubmitting(false)
    }
  }

  async function handleDeleteLesson(lesson: Lesson) {
    try {
      await deleteLesson(lesson._id)
      toast.success("Lesson deleted")
      fetchLessons(lesson.moduleId)
    } catch {
      toast.error("Failed to delete lesson")
    }
  }

  function startLessonEdit(lesson: Lesson) {
    setEditingLessonId(lesson._id)
    setLessonTitle(lesson.title)
    setLessonContent(lesson.content ?? "")
    setLessonType(lesson.type)
  }

  function cancelLessonEdit() {
    setEditingLessonId(null)
    setLessonTitle("")
    setLessonContent("")
    setLessonType("page")
  }

  const typeIcon: Record<string, React.ReactNode> = {
    page: <FileText className="size-3.5" />,
    video: <Video className="size-3.5" />,
    file: <File className="size-3.5" />,
    embed: <Link2 className="size-3.5" />,
  }

  async function handleCreate() {
    if (!title.trim()) {
      toast.error("Module title is required")
      return
    }
    setSubmitting(true)
    try {
      await createModule({
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        order: modules.length,
      })
      setTitle("")
      setDescription("")
      setCreating(false)
      toast.success("Module created")
      fetchModules()
    } catch {
      toast.error("Failed to create module")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(mod: Module) {
    if (!title.trim()) {
      toast.error("Module title is required")
      return
    }
    setSubmitting(true)
    try {
      await updateModule(courseId, mod._id, {
        title: title.trim(),
        description: description.trim() || undefined,
      })
      setEditingId(null)
      setTitle("")
      setDescription("")
      toast.success("Module updated")
      fetchModules()
    } catch {
      toast.error("Failed to update module")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTogglePublish(mod: Module) {
    try {
      await updateModule(courseId, mod._id, { isPublished: !mod.isPublished })
      fetchModules()
    } catch {
      toast.error("Failed to update module")
    }
  }

  async function handleDelete(mod: Module) {
    try {
      await deleteModule(courseId, mod._id)
      toast.success("Module deleted")
      fetchModules()
    } catch {
      toast.error("Failed to delete module")
    }
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return
    const ids = sorted.map((m) => m._id)
    const a = ids[index]
    const b = ids[index - 1]
    if (a === undefined || b === undefined) return
    ids[index - 1] = a
    ids[index] = b
    try {
      await reorderModules(courseId, ids)
      fetchModules()
    } catch {
      toast.error("Failed to reorder modules")
    }
  }

  async function handleMoveDown(index: number) {
    if (index === sorted.length - 1) return
    const ids = sorted.map((m) => m._id)
    const a = ids[index]
    const b = ids[index + 1]
    if (a === undefined || b === undefined) return
    ids[index] = b
    ids[index + 1] = a
    try {
      await reorderModules(courseId, ids)
      fetchModules()
    } catch {
      toast.error("Failed to reorder modules")
    }
  }

  function startEdit(mod: Module) {
    setEditingId(mod._id)
    setTitle(mod.title)
    setDescription(mod.description ?? "")
  }

  function cancelEdit() {
    setEditingId(null)
    setTitle("")
    setDescription("")
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <p className="text-sm text-muted-foreground">Failed to load modules</p>
        <Button variant="outline" size="sm" onClick={fetchModules}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!creating && (
        <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
          <Plus className="mr-2 size-4" />
          New Module
        </Button>
      )}

      {creating && (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Module title"
            className="mb-3 border-0 bg-transparent px-0 text-base font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-0"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Module description (optional)"
            rows={2}
            className="w-full resize-none border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCreating(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-3 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Module"
              )}
            </Button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !creating ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Layers className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No modules yet</p>
          <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
            <Plus className="mr-2 size-4" />
            Create your first module
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((mod, index) => (
            <div
              key={mod._id}
              className="rounded-xl border border-border bg-card transition-colors hover:bg-muted/20"
            >
              {editingId === mod._id ? (
                <div className="p-4">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Module title"
                    className="mb-3 border-0 bg-transparent px-0 text-base font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-0"
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Module description (optional)"
                    rows={2}
                    className="w-full resize-none border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={submitting}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleUpdate(mod)} disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 size-3 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <button
                    type="button"
                    className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground"
                    title="Drag to reorder"
                  >
                    <GripVertical className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleExpanded(mod._id)}
                    className="flex items-center gap-2 text-left"
                  >
                    {expandedIds.has(mod._id) ? (
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className="text-sm font-medium">{mod.title}</span>
                      {!mod.isPublished && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Draft
                        </span>
                      )}
                    </div>
                    {expandedIds.has(mod._id) && mod.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {mod.description}
                      </p>
                    )}
                    {expandedIds.has(mod._id) && (
                      <div className="mt-3 space-y-2">
                        {lessonsLoading[mod._id] ? (
                          <div className="space-y-2 py-2">
                            {Array.from({ length: 2 }).map((_, i) => (
                              <Skeleton key={i} className="h-10 w-full rounded-lg" />
                            ))}
                          </div>
                        ) : (
                          <>
                            {(lessonsCache[mod._id] ?? [])
                              .sort((a, b) => a.order - b.order)
                              .map((lesson) => (
                                <div key={lesson._id}>
                                  {editingLessonId === lesson._id ? (
                                    <div className="rounded-lg border border-border bg-muted/20 p-3">
                                      <Input
                                        value={lessonTitle}
                                        onChange={(e) => setLessonTitle(e.target.value)}
                                        placeholder="Lesson title"
                                        className="mb-2 border-0 bg-transparent px-0 text-sm font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
                                      />
                                      <textarea
                                        value={lessonContent}
                                        onChange={(e) => setLessonContent(e.target.value)}
                                        placeholder="Lesson content (optional)"
                                        rows={2}
                                        className="mb-2 w-full resize-none border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                                      />
                                      <Select
                                        value={lessonType}
                                        onValueChange={(v) => setLessonType(v as "page" | "video" | "file" | "embed")}
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="page">Page</SelectItem>
                                          <SelectItem value="video">Video</SelectItem>
                                          <SelectItem value="file">File</SelectItem>
                                          <SelectItem value="embed">Embed</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <div className="mt-2 flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={cancelLessonEdit} disabled={lessonSubmitting}>
                                          Cancel
                                        </Button>
                                        <Button size="sm" onClick={() => handleUpdateLesson(lesson)} disabled={lessonSubmitting}>
                                          {lessonSubmitting ? (
                                            <Loader2 className="size-3 animate-spin" />
                                          ) : (
                                            "Save"
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/30">
                                      <span className="text-muted-foreground">
                                        {typeIcon[lesson.type]}
                                      </span>
                                      <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                                      {!lesson.isPublished && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                          Draft
                                        </Badge>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => startLessonEdit(lesson)}
                                        className="flex size-6 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-muted-foreground"
                                      >
                                        <Pencil className="size-3" />
                                      </button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <button
                                            type="button"
                                            className="flex size-6 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-destructive"
                                          >
                                            <Trash2 className="size-3" />
                                          </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogMedia>
                                              <AlertTriangle className="size-5 text-destructive" />
                                            </AlertDialogMedia>
                                            <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This will permanently delete "{lesson.title}". This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              variant="destructive"
                                              onClick={() => handleDeleteLesson(lesson)}
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </>
                        )}
                        {creatingLesson === mod._id && (
                          <div className="rounded-lg border border-border bg-muted/20 p-3">
                            <Input
                              value={lessonTitle}
                              onChange={(e) => setLessonTitle(e.target.value)}
                              placeholder="Lesson title"
                              className="mb-2 border-0 bg-transparent px-0 text-sm font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
                            />
                            <textarea
                              value={lessonContent}
                              onChange={(e) => setLessonContent(e.target.value)}
                              placeholder="Lesson content (optional)"
                              rows={2}
                              className="mb-2 w-full resize-none border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                            />
                            <Select
                              value={lessonType}
                              onValueChange={(v) => setLessonType(v as "page" | "video" | "file" | "embed")}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="page">Page</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="file">File</SelectItem>
                                <SelectItem value="embed">Embed</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="mt-2 flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => { setCreatingLesson(null); setLessonTitle(""); setLessonContent(""); setLessonType("page") }} disabled={lessonSubmitting}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => handleCreateLesson(mod._id)} disabled={lessonSubmitting}>
                                {lessonSubmitting ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  "Create Lesson"
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                        {expandedIds.has(mod._id) && creatingLesson !== mod._id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCreatingLesson(mod._id)}
                            className="text-xs text-muted-foreground"
                          >
                            <Plus className="mr-1 size-3" />
                            Add Lesson
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(mod)}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title={mod.isPublished ? "Unpublish" : "Publish"}
                    >
                      {mod.isPublished ? (
                        <Eye className="size-3.5" />
                      ) : (
                        <EyeOff className="size-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(mod)}
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
                          <AlertDialogTitle>Delete module?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{mod.title}" and all its
                            lessons. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => handleDelete(mod)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="flex size-5 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-muted-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="size-3 -rotate-90" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === sorted.length - 1}
                      className="flex size-5 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-muted-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="size-3 rotate-90" />
                    </button>
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
