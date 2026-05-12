"use client"

import { Archive } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import type { Course } from "@/lib/services/courses"

interface ArchiveCourseDialogProps {
  course: Course | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (course: Course) => void
}

export function ArchiveCourseDialog({
  course,
  open,
  onOpenChange,
  onConfirm,
}: ArchiveCourseDialogProps) {
  if (!course) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <Archive className="size-5" />
            </div>
            <div>
              <DialogTitle>Archive course?</DialogTitle>
              <DialogDescription className="mt-1.5">
                Are you sure you want to archive{" "}
                <span className="font-medium text-foreground">{course.name}</span>?
                Students will still have access. You can unarchive anytime.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="default" onClick={() => onConfirm(course)}>
            Archive
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
