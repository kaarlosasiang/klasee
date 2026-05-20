"use client"

import Link from "next/link"
import { BookOpen, EllipsisVertical, GraduationCap, Users, FileText, Archive, RotateCcw, Copy, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import type { Course } from "@/lib/services/courses"
import { timeAgo } from "@/lib/utils/time"

interface CourseCardProps {
  course: Course
  onEdit: (course: Course) => void
  showArchived?: boolean
  onUnarchive?: (course: Course) => void
  onDelete?: (course: Course) => void
  onDuplicate?: (course: Course) => void
}

export function CourseCard({ course, onEdit, showArchived, onUnarchive, onDelete, onDuplicate }: CourseCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-md">
      <Link href={`/courses/${course._id}`} className="block">
        <div
          className={cn(
            "relative h-36 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50",
            !course.cover && "dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30"
          )}
        >
          {course.cover && (
            <img src={course.cover} alt="" className="h-full w-full object-cover" />
          )}
          <div className="absolute -bottom-5 left-4 flex size-11 items-center justify-center overflow-hidden rounded-xl border-2 border-background bg-blue-500 text-white shadow-md">
            {course.icon ? (
              <img src={course.icon} alt="" className="h-full w-full object-cover" />
            ) : (
              <GraduationCap className="size-5" />
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-col gap-2 px-4 pt-7 pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/courses/${course._id}`} className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground hover:text-primary">
              {course.name}
            </h3>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
              {showArchived ? (
                <DropdownMenuItem onClick={() => onUnarchive?.(course)}>
                  <RotateCcw className="mr-2 size-4" />
                  Unarchive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onEdit(course)}>
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicate?.(course)}>
                <Copy className="mr-2 size-4" />
                Duplicate
              </DropdownMenuItem>
              {showArchived && (
                <DropdownMenuItem
                  onClick={() => onDelete?.(course)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{course.code}</span>
          <Badge variant="secondary" className="rounded-full text-[10px] font-normal">
            {course.semester === "1st" ? "1st Sem" : course.semester === "2nd" ? "2nd Sem" : "Summer"}
          </Badge>
        </div>

        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="size-3.5" />
            {course.sectionCount} {course.sectionCount === 1 ? "Section" : "Sections"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {course.enrolledCount} {course.enrolledCount === 1 ? "Student" : "Students"}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="size-3.5" />
            {course.assessmentCount} Quiz & Assign.
          </span>
        </div>

        {course.lastActivity && (
          <p className="text-[11px] text-muted-foreground/60">Updated {timeAgo(course.lastActivity)}</p>
        )}
      </div>
    </div>
  )
}
