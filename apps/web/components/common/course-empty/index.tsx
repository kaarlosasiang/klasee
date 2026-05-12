"use client"

import { BookOpen, Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface CourseEmptyProps {
  onCreateCourse: () => void
}

export function CourseEmpty({ onCreateCourse }: CourseEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <BookOpen className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Create your first course to get started.
      </p>
      <Button onClick={onCreateCourse} className="mt-6 gap-2">
        <Plus className="size-4" />
        Create Course
      </Button>
    </div>
  )
}
