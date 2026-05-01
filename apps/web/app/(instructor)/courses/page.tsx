"use client"

import * as React from "react"
import {
  BookOpen,
  GraduationCap,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import Link from "next/link"
import { useCourses, type Course } from "@/hooks/use-courses"
import { NewCourseDialog } from "@/components/common/new-course-dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"

const SEMESTER_LABELS: Record<string, string> = {
  "1st": "First Semester",
  "2nd": "Second Semester",
  summer: "Summer",
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course._id}`} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md">
      {/* Cover */}
      <div className="relative h-32 shrink-0 overflow-hidden">
        {course.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.cover} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-blue-400 via-indigo-500 to-violet-600">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -right-6 -top-6 size-32 rounded-full border-16 border-white" />
              <div className="absolute -bottom-8 -left-4 size-24 rounded-full border-12 border-white" />
            </div>
          </div>
        )}
        {/* Icon badge */}
        <div className="absolute bottom-0 left-4 translate-y-1/2 flex size-11 items-center justify-center overflow-hidden rounded-xl border-2 border-background bg-blue-500 text-white shadow-sm">
          {course.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.icon} alt="" className="h-full w-full object-cover" />
          ) : (
            <GraduationCap className="size-5" />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-8">
        <p className="line-clamp-1 font-semibold text-foreground">{course.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">{course.code}</span>
          <span>·</span>
          <span>{SEMESTER_LABELS[course.semester] ?? course.semester}</span>
        </div>
        {course.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {course.description}
          </p>
        )}
        <div className="mt-auto pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            <BookOpen className="size-3" />
            {new Date(course.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
        </div>
      </div>
    </Link>
  )
}

function CourseTable({ courses }: { courses: Course[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Course</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Code</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Semester</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {courses.map((course) => (
            <tr key={course._id} className="cursor-pointer transition-colors hover:bg-muted/30" onClick={() => window.location.assign(`/courses/${course._id}`)}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-500 text-white">
                    {course.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.icon} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <GraduationCap className="size-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{course.name}</p>
                    {course.description && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">{course.description}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{course.code}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {SEMESTER_LABELS[course.semester] ?? course.semester}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(course.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function CoursesPage() {
  const { courses, loading, refetch } = useCourses()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [semester, setSemester] = React.useState("all")
  const [view, setView] = React.useState<"card" | "table">("card")

  function handleDialogChange(open: boolean) {
    setDialogOpen(open)
    if (!open) refetch()
  }

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    const matchesSemester = semester === "all" || c.semester === semester
    return matchesSearch && matchesSemester
  })

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">My Courses</h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : `${filtered.length} of ${courses.length} course${courses.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          New Course
        </Button>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or code…"
              className="w-64 pl-9"
            />
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <SlidersHorizontal className="size-4" />
          </div>

          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              <SelectItem value="1st">First Semester</SelectItem>
              <SelectItem value="2nd">Second Semester</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center rounded-lg border border-border p-0.5">
          <button
            onClick={() => setView("card")}
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors",
              view === "card"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setView("table")}
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors",
              view === "table"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <GraduationCap className="size-7 text-muted-foreground" />
          </div>
          {courses.length === 0 ? (
            <>
              <p className="mt-4 font-semibold">No courses yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create your first course to get started.</p>
              <Button className="mt-5" onClick={() => setDialogOpen(true)}>
                <Plus className="size-4" />
                New Course
              </Button>
            </>
          ) : (
            <>
              <p className="mt-4 font-semibold">No results</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter.</p>
            </>
          )}
        </div>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <CourseTable courses={filtered} />
      )}

      <NewCourseDialog open={dialogOpen} onOpenChange={handleDialogChange} />
    </div>
  )
}
