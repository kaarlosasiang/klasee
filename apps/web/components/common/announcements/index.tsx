"use client"

import * as React from "react"
import {
  Megaphone,
  Pin,
  PinOff,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
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
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type Announcement,
} from "@/lib/services/announcements"
import { timeAgo } from "@/lib/utils/time"

interface AnnouncementsProps {
  courseId: string
}

export function Announcements({ courseId }: AnnouncementsProps) {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<Announcement | null>(null)

  const fetchAnnouncements = React.useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getAnnouncements(courseId)
      setAnnouncements(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  React.useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const sorted = React.useMemo(() => {
    return [...announcements].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    })
  }, [announcements])

  async function handleCreate() {
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }
    setSubmitting(true)
    try {
      await createAnnouncement({
        courseId,
        title: title.trim(),
        content: content.trim(),
      })
      setTitle("")
      setContent("")
      setCreating(false)
      toast.success("Announcement created")
      fetchAnnouncements()
    } catch {
      toast.error("Failed to create announcement")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(announcement: Announcement) {
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }
    setSubmitting(true)
    try {
      await updateAnnouncement(courseId, announcement._id, {
        title: title.trim(),
        content: content.trim(),
      })
      setEditingId(null)
      setTitle("")
      setContent("")
      toast.success("Announcement updated")
      fetchAnnouncements()
    } catch {
      toast.error("Failed to update announcement")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTogglePin(announcement: Announcement) {
    try {
      await updateAnnouncement(courseId, announcement._id, {
        isPinned: !announcement.isPinned,
      })
      fetchAnnouncements()
    } catch {
      toast.error("Failed to update announcement")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteAnnouncement(courseId, deleteTarget._id)
      setDeleteTarget(null)
      toast.success("Announcement deleted")
      fetchAnnouncements()
    } catch {
      toast.error("Failed to delete announcement")
    }
  }

  function startEdit(announcement: Announcement) {
    setEditingId(announcement._id)
    setTitle(announcement.title)
    setContent(announcement.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setTitle("")
    setContent("")
  }

  function startCreate() {
    setCreating(true)
    setTitle("")
    setContent("")
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-border p-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <p className="text-sm text-muted-foreground">Failed to load announcements</p>
        <Button variant="outline" size="sm" onClick={fetchAnnouncements}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Create button */}
      {!creating && (
        <Button variant="outline" size="sm" onClick={startCreate}>
          <Plus className="mr-2 size-4" />
          New Announcement
        </Button>
      )}

      {/* Create form */}
      {creating && (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            className="mb-3 border-0 bg-transparent px-0 text-base font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-0"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your announcement..."
            rows={4}
            className="w-full resize-none border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreating(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-3 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Announcement"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {sorted.length === 0 && !creating ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Megaphone className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No announcements yet</p>
          <Button variant="outline" size="sm" onClick={startCreate}>
            <Plus className="mr-2 size-4" />
            Create your first announcement
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((announcement) => (
            <div
              key={announcement._id}
              className={`rounded-xl border border-border ${
                announcement.isPinned ? "bg-muted/20" : ""
              }`}
            >
              {editingId === announcement._id ? (
                /* Edit form */
                <div className="p-4">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title"
                    className="mb-3 border-0 bg-transparent px-0 text-base font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-0"
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your announcement..."
                    rows={4}
                    className="w-full resize-none border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(announcement)}
                      disabled={submitting}
                    >
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
                /* Display */
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {announcement.isPinned && (
                          <Pin className="size-3.5 shrink-0 text-amber-500" />
                        )}
                        <h3 className="text-sm font-semibold">
                          {announcement.title}
                        </h3>
                      </div>
                      <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {announcement.content}
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {timeAgo(announcement.createdAt)}
                        </span>
                        {announcement.authorName && (
                          <span>by {announcement.authorName}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(announcement)}
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title={announcement.isPinned ? "Unpin" : "Pin"}
                      >
                        {announcement.isPinned ? (
                          <PinOff className="size-3.5" />
                        ) : (
                          <Pin className="size-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(announcement)}
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
                            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{announcement.title}".
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => {
                                setDeleteTarget(announcement)
                                handleDelete()
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
