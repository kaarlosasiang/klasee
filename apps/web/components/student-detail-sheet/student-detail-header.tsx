"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
  SheetClose,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import type { Enrollment } from "@/lib/services/enrollments"

interface StudentDetailHeaderProps {
  enrollment: Enrollment
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
}

export function StudentDetailHeader({
  enrollment,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: StudentDetailHeaderProps) {
  const student = enrollment.studentId
  const initials = student.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??"

  return (
    <SheetHeader className="flex-row items-start gap-3 border-b p-4">
      <Avatar className="size-12 rounded-full shrink-0">
        <AvatarFallback className="text-sm">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <SheetTitle className="truncate">{student.name}</SheetTitle>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {enrollment.courseId?.name && <span>{enrollment.courseId.name}</span>}
          {enrollment.sectionId?.name && <span>{enrollment.sectionId.name}</span>}
        </div>
        <SheetDescription className="truncate text-xs">{student.email}</SheetDescription>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!hasPrev}
          onClick={onPrev}
          aria-label="Previous student"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!hasNext}
          onClick={onNext}
          aria-label="Next student"
        >
          <ChevronRight className="size-4" />
        </Button>
        <SheetClose asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Close">
            <X className="size-4" />
          </Button>
        </SheetClose>
      </div>
    </SheetHeader>
  )
}
