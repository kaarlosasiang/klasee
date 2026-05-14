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
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
      else next.add(id)
      return next
    })
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
