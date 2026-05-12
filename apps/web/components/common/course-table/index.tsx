"use client"

import Link from "next/link"
import { EllipsisVertical, Archive } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import type { Course } from "@/lib/services/courses"
import { timeAgo } from "@/lib/utils/time"

interface CourseTableProps {
  courses: Course[]
  onArchive: (course: Course) => void
  onEdit: (course: Course) => void
}

export function CourseTable({ courses, onArchive, onEdit }: CourseTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Semester</TableHead>
          <TableHead className="text-center">Sections</TableHead>
          <TableHead className="text-center">Students</TableHead>
          <TableHead className="text-center">Assessments</TableHead>
          <TableHead>Last Activity</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course._id} className="group cursor-pointer">
            <TableCell>
              <Link href={`/courses/${course._id}`} className="flex items-center gap-3">
                <Avatar className="size-8 rounded-lg">
                  {course.icon ? (
                    <AvatarImage src={course.icon} />
                  ) : (
                    <AvatarFallback className="rounded-lg text-xs">
                      {course.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium">{course.name}</span>
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{course.code}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="rounded-full text-[10px] font-normal">
                {course.semester === "1st" ? "1st Sem" : course.semester === "2nd" ? "2nd Sem" : "Summer"}
              </Badge>
            </TableCell>
            <TableCell className="text-center">{course.sectionCount}</TableCell>
            <TableCell className="text-center">{course.enrolledCount}</TableCell>
            <TableCell className="text-center">{course.assessmentCount}</TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {course.lastActivity ? timeAgo(course.lastActivity) : "\u2014"}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
                    <EllipsisVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => onEdit(course)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onArchive(course)}>
                    <Archive className="mr-2 size-4" />
                    Archive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
