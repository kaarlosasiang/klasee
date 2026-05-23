"use client"

import * as React from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Users,
  Clock,
  MapPin,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { SchedulePicker } from "@/components/common/schedule-picker"
import { toast } from "sonner"
import {
  getSectionsByCourse,
  createSection,
  updateSection,
  deleteSection,
  generateJoinCode,
  type Section,
} from "@/lib/services/sections"

interface SectionsManagerProps {
  courseId: string
  onInvite?: () => void
}

export function SectionsManager({ courseId, onInvite }: SectionsManagerProps) {
  const [sections, setSections] = React.useState<Section[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Section | null>(null)
  const [deleteConfirm, setDeleteConfirm] = React.useState<Section | null>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState<string | null>(null)
  const [generatingCode, setGeneratingCode] = React.useState<string | null>(null)

  const fetchSections = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSectionsByCourse(courseId)
      setSections(data)
    } catch {
      toast.error("Failed to load sections")
    } finally {
      setLoading(false)
    }
  }, [courseId])

  React.useEffect(() => {
    fetchSections()
  }, [fetchSections])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(code)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success("Join code copied")
  }

  const handleDelete = async (section: Section) => {
    setDeleting(section._id)
    try {
      await deleteSection(section._id)
      toast.success("Section deleted")
      setDeleteConfirm(null)
      fetchSections()
    } catch (err: any) {
      const status = err?.response?.status ?? err?.statusCode ?? err?.status
      if (status === 409) {
        toast.error("Drop all students from this section first")
      } else {
        toast.error("Failed to delete section")
      }
    } finally {
      setDeleting(null)
    }
  }

  const handleGenerateCode = async (section: Section) => {
    setGeneratingCode(section._id)
    try {
      await generateJoinCode(section._id)
      toast.success(section.joinCode ? "New join code generated" : "Join code generated")
      fetchSections()
    } catch {
      toast.error("Failed to generate code")
    } finally {
      setGeneratingCode(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {sections.length} {sections.length === 1 ? "Section" : "Sections"}
        </h3>
        <div className="flex items-center gap-2">
          {onInvite && (
            <Button variant="outline" size="sm" onClick={onInvite}>
              <Plus className="mr-2 size-4" />
              Invite Student
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="mr-2 size-4" />
            New Section
          </Button>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
          <Users className="size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No sections yet
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-2 size-4" />
              Create your first section
            </Button>
            {onInvite && (
              <Button variant="outline" size="sm" onClick={onInvite}>
                <Plus className="mr-2 size-4" />
                Invite Student
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {sections.map((section) => (
            <div
              key={section._id}
              className="flex items-center gap-4 rounded-lg border border-border px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{section.name}</span>
                  <Badge
                    variant="secondary"
                    className="rounded-full text-[10px] font-normal"
                  >
                    <Users className="mr-1 size-3" />
                    {section.enrolledCount}/{section.maxStudents}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {section.schedule && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      Lecture: {section.schedule}
                    </span>
                  )}
                  {section.labSchedule && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      Lab: {section.labSchedule}
                    </span>
                  )}
                  {section.room && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {section.room}
                    </span>
                  )}
                  {section.joinCode && (
                    <button
                      type="button"
                      onClick={() => handleCopyCode(section.joinCode!)}
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      Code: {section.joinCode}
                      {copiedId === section.joinCode ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={generatingCode === section._id}
                  onClick={() => handleGenerateCode(section)}
                >
                  {section.joinCode ? (
                    <RefreshCw className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setEditing(section)
                    setDialogOpen(true)
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteConfirm(section)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        courseId={courseId}
        onSaved={fetchSections}
      />

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteConfirm?.name}&rdquo;?
              {deleteConfirm && deleteConfirm.enrolledCount > 0 && (
                <span className="mt-2 block font-medium text-destructive">
                  This section has {deleteConfirm.enrolledCount} active{" "}
                  {deleteConfirm.enrolledCount === 1 ? "student" : "students"}.
                  Drop them first before deleting.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={
                (!!deleteConfirm && deleteConfirm.enrolledCount > 0) ||
                deleting === deleteConfirm?._id
              }
            >
              {deleting === deleteConfirm?._id ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SectionDialog({
  open,
  onOpenChange,
  editing,
  courseId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Section | null
  courseId: string
  onSaved: () => void
}) {
  const [name, setName] = React.useState("")
  const [schedule, setSchedule] = React.useState("")
  const [labSchedule, setLabSchedule] = React.useState("")
  const [room, setRoom] = React.useState("")
  const [maxStudents, setMaxStudents] = React.useState("40")
  const [saving, setSaving] = React.useState(false)
  const [nameError, setNameError] = React.useState("")
  const [maxStudentsError, setMaxStudentsError] = React.useState("")

  React.useEffect(() => {
    if (editing) {
      setName(editing.name)
      setSchedule(editing.schedule ?? "")
      setLabSchedule(editing.labSchedule ?? "")
      setRoom(editing.room ?? "")
      setMaxStudents(String(editing.maxStudents))
    } else {
      setName("")
      setSchedule("")
      setLabSchedule("")
      setRoom("")
      setMaxStudents("40")
    }
    setNameError("")
    setMaxStudentsError("")
  }, [editing, open])

  const handleSave = async () => {
    let valid = true
    if (!name.trim()) {
      setNameError("Section name is required")
      valid = false
    } else {
      setNameError("")
    }
    const parsed = parseInt(maxStudents)
    if (isNaN(parsed) || parsed < 1) {
      setMaxStudentsError("Must be at least 1")
      valid = false
    } else {
      setMaxStudentsError("")
    }
    if (!valid) return

    setSaving(true)
    try {
      if (editing) {
        await updateSection(editing._id, {
          name: name.trim(),
          schedule: schedule.trim() || undefined,
          labSchedule: labSchedule.trim() || undefined,
          room: room.trim() || undefined,
          maxStudents: parsed,
        })
        toast.success("Section updated")
      } else {
        await createSection({
          courseId,
          name: name.trim(),
          schedule: schedule.trim() || undefined,
          labSchedule: labSchedule.trim() || undefined,
          room: room.trim() || undefined,
          maxStudents: parsed,
        })
        toast.success("Section created")
      }
      onOpenChange(false)
      onSaved()
    } catch {
      toast.error("Failed to save section")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Section" : "New Section"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Section Name</Label>
            <Input
              id="name"
              placeholder='e.g. "Section A"'
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (e.target.value.trim()) setNameError("")
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave()
              }}
              className={nameError ? "border-destructive" : ""}
            />
            {nameError && (
              <p className="text-xs text-destructive">{nameError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule">Lecture Schedule</Label>
            <SchedulePicker
              id="schedule"
              value={schedule}
              onChange={setSchedule}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="labSchedule">Lab Schedule</Label>
            <SchedulePicker
              id="labSchedule"
              value={labSchedule}
              onChange={setLabSchedule}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room">Room</Label>
            <Input
              id="room"
              placeholder='e.g. "Room 301"'
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxStudents">Max Students</Label>
            <Input
              id="maxStudents"
              type="number"
              min="1"
              value={maxStudents}
              onChange={(e) => {
                setMaxStudents(e.target.value)
                const v = parseInt(e.target.value)
                if (!isNaN(v) && v >= 1) setMaxStudentsError("")
              }}
              className={maxStudentsError ? "border-destructive" : ""}
            />
            {maxStudentsError && (
              <p className="text-xs text-destructive">{maxStudentsError}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
