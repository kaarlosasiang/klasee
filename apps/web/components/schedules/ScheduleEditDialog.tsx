"use client"

import * as React from "react"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { SchedulePicker } from "@/components/common/schedule-picker"
import { updateSection, type Section } from "@/lib/services/sections"
import type { Course } from "@/lib/services/courses"

interface ScheduleEditDialogProps {
  section: Section | null
  course: Course | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function ScheduleEditDialog({
  section,
  course,
  open,
  onOpenChange,
  onSaved,
}: ScheduleEditDialogProps) {
  const [schedule, setSchedule] = React.useState("")
  const [labSchedule, setLabSchedule] = React.useState("")
  const [room, setRoom] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (section) {
      setSchedule(section.schedule ?? "")
      setLabSchedule(section.labSchedule ?? "")
      setRoom(section.room ?? "")
    }
  }, [section])

  async function handleSave() {
    if (!section) return
    setSaving(true)
    try {
      await updateSection(section._id, {
        schedule: schedule || undefined,
        labSchedule: labSchedule || undefined,
        room: room || undefined,
      })
      toast.success(`${section.name} schedule saved`)
      onSaved()
      onOpenChange(false)
    } catch {
      toast.error("Failed to save schedule")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {course?.code} — {section?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Lecture schedule
            </label>
            <SchedulePicker value={schedule} onChange={setSchedule} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Lab schedule
            </label>
            <SchedulePicker value={labSchedule} onChange={setLabSchedule} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Room</label>
            <Input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Room 301"
              className="h-8 text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-1.5 size-3.5" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
