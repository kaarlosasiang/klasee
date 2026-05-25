"use client"

import * as React from "react"
import {
  Megaphone,
  Pin,
  PinOff,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  AlertTriangle,
  Users,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Checkbox } from "@workspace/ui/components/checkbox"
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
import { getSectionsByCourse, type Section } from "@/lib/services/sections"
import { timeAgo } from "@/lib/utils/time"
import { useSession } from "@/lib/config/auth-client"

interface AnnouncementsProps {
  courseId: string
}

export function Announcements({ courseId }: AnnouncementsProps) {
  const { data: session } = useSession()
  const role = (session?.user as { role?: string })?.role
  const canManage = role === "instructor" || role === "admin"

  const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
  const [sections, setSections] = React.useState<Section[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [selectedSectionIds, setSelectedSectionIds] = React.useState<string[]>([])
  const [submitting, setSubmitting] = React.useState(false)

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
    if (canManage) {
      getSectionsByCourse(courseId)
        .then(setSections)
        .catch(() => {})
    }
  }, [fetchAnnouncements, courseId, canManage])

  const sorted = React.useMemo(() => {
    return [...announcements].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [announcements])

  function toggleSection(id: string) {
    setSelectedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  async function handleCreate() {
    if (!title.trim()) return toast.error("Title is required")
    setSubmitting(true)
    try {
      await createAnnouncement({
        courseId,
        title: title.trim(),
        content: content.trim(),
        sectionIds: selectedSectionIds,
      })
      resetForm()
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
    if (!title.trim()) return toast.error("Title is required")
    setSubmitting(true)
    try {
      await updateAnnouncement(courseId, announcement._id, {
        title: title.trim(),
        content: content.trim(),
        sectionIds: selectedSectionIds,
      })
      setEditingId(null)
      resetForm()
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

  async function handleDelete(announcement: Announcement) {
    try {
      await deleteAnnouncement(courseId, announcement._id)
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
    setSelectedSectionIds(announcement.sectionIds ?? [])
  }

  function resetForm() {
    setTitle("")
    setContent("")
    setSelectedSectionIds([])
  }

  function startCreate() {
    setCreating(true)
    resetForm()
  }

  function cancelEdit() {
    setEditingId(null)
    resetForm()
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

  function SectionSelector() {
    if (!canManage || sections.length === 0) return null
    return (
      <div className="mt-3 border-t border-border pt-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Visible to
        </p>
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <label
              key={section._id}
              className="flex cursor-pointer items-center gap-1.5"
            >
              <Checkbox
                checked={selectedSectionIds.includes(section._id)}
                onCheckedChange={() => toggleSection(section._id)}
              />
              <span className="text-xs">{section.name}</span>
            </label>
          ))}
        </div>
        {selectedSectionIds.length === 0 && (
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            No sections selected — visible to all students
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {canManage && !creating && (
        <Button variant="outline" size="sm" onClick={startCreate}>
          <Plus className="mr-2 size-4" />
          New Announcement
        </Button>
      )}

      {/* Create form */}
      {canManage && creating && (
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
          <SectionSelector />
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setCreating(false); resetForm() }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting}>
              {submitting ? (
                <><Loader2 className="mr-2 size-3 animate-spin" />Posting...</>
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
          {canManage && (
            <Button variant="outline" size="sm" onClick={startCreate}>
              <Plus className="mr-2 size-4" />
              Create your first announcement
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((announcement) => (
            <div
              key={announcement._id}
              className={`rounded-xl border border-border ${announcement.isPinned ? "bg-muted/20" : ""}`}
            >
              {editingId === announcement._id ? (
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
                  <SectionSelector />
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={submitting}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleUpdate(announcement)} disabled={submitting}>
                      {submitting ? (
                        <><Loader2 className="mr-2 size-3 animate-spin" />Saving...</>
                      ) : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {announcement.isPinned && (
                          <Pin className="size-3.5 shrink-0 text-amber-500" />
                        )}
                        <h3 className="text-sm font-semibold">{announcement.title}</h3>
                        {announcement.sectionIds && announcement.sectionIds.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {announcement.sectionIds.map((sid) => {
                              const sec = sections.find((s) => s._id === sid)
                              return sec ? (
                                <Badge
                                  key={sid}
                                  variant="secondary"
                                  className="flex items-center gap-1 rounded-full px-1.5 py-0 text-[10px]"
                                >
                                  <Users className="size-2.5" />
                                  {sec.name}
                                </Badge>
                              ) : null
                            })}
                          </div>
                        )}
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

                    {canManage && (
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
                                This will permanently delete "{announcement.title}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => handleDelete(announcement)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
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
