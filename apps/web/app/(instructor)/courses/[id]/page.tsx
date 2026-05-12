"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import {
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  ArrowLeft,
  Calendar,
  Megaphone,
  Folder,
  Layers,
  Book,
  Cog,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import {
  getCourseById,
  archiveCourse,
  type Course,
} from "@/lib/services/courses"
import { timeAgo } from "@/lib/utils/time"
import { useSidebar } from "@workspace/ui/components/sidebar"
import { getEnrollmentsByCourse, type Enrollment } from "@/lib/services/enrollments"
import { StudentsDataTable } from "@/components/data-table/students-data-table"

export default function CourseDetailPage() {
  const params = useParams()
  const [course, setCourse] = React.useState<Course | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState("announcements")
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
  const [enrollmentsLoading, setEnrollmentsLoading] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getCourseById(params.id as string)
        setCourse(data)
      } catch {
        toast.error("Course not found")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  async function handleArchive() {
    if (!course) return
    try {
      await archiveCourse(course._id)
      toast.success("Course archived")
    } catch {
      toast.error("Failed to archive")
    }
  }

  const { setOpen } = useSidebar()
  React.useEffect(() => {
    setOpen(false)
    return () => setOpen(true)
  }, [setOpen])

  React.useEffect(() => {
    if (activeTab !== "students" || !course) return
    setEnrollmentsLoading(true)
    getEnrollmentsByCourse(course._id)
      .then(setEnrollments)
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setEnrollmentsLoading(false))
  }, [activeTab, course])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Course not found
      </div>
    )
  }

  return (
    <div className="flex h-full gap-6">
      {/* Sidebar */}
      <nav className="-ml-3 flex w-48 shrink-0 flex-col self-stretch border-r border-border py-2">
        {[
          { id: "announcements", label: "Announcements", icon: Megaphone },
          { id: "sections", label: "Sections", icon: BookOpen },
          { id: "students", label: "Students", icon: Users },
          { id: "files", label: "Files", icon: Folder },
          { id: "modules", label: "Modules", icon: Layers },
          { id: "wiki", label: "Wiki", icon: Book },
          { id: "settings", label: "Settings", icon: Cog },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
              activeTab === item.id
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right: Back button + Hero + Content */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to courses
          </Link>
          <Button variant="outline" size="sm" onClick={handleArchive}>
            Archive
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="relative h-36 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
            {course.cover && (
              <img
                src={course.cover}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute -bottom-6 left-6 flex size-14 items-center justify-center overflow-hidden rounded-xl border-4 border-background bg-blue-500 text-white shadow-md">
              {course.icon ? (
                <img
                  src={course.icon}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <GraduationCap className="size-6" />
              )}
            </div>
          </div>
          <div className="space-y-5 px-6 pt-9 pb-5">
            <div>
              <h1 className="text-2xl font-bold">{course.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-sm text-muted-foreground">
                  {course.code}
                </span>
                <Badge
                  variant="secondary"
                  className="rounded-full text-[10px] font-normal"
                >
                  {course.semester === "1st"
                    ? "1st Sem"
                    : course.semester === "2nd"
                      ? "2nd Sem"
                      : "Summer"}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BookOpen className="size-3.5" />
                  {course.sectionCount}{" "}
                  {course.sectionCount === 1 ? "Section" : "Sections"}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  {course.enrolledCount}{" "}
                  {course.enrolledCount === 1 ? "Student" : "Students"}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="size-3.5" />
                  {course.assessmentCount}{" "}
                  {course.assessmentCount === 1 ? "Assessment" : "Assessments"}
                </span>
              </div>
              {course.description && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {course.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Created {timeAgo(course.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="size-3.5" />
                {course.semester === "1st"
                  ? "First Semester"
                  : course.semester === "2nd"
                    ? "Second Semester"
                    : "Summer"}
              </span>
              {course.lastActivity && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Last activity {timeAgo(course.lastActivity)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "announcements" && (
            <p className="text-sm text-muted-foreground">
              Announcements coming soon.
            </p>
          )}
          {activeTab === "sections" && (
            <p className="text-sm text-muted-foreground">
              Sections list coming soon.
            </p>
          )}
          {activeTab === "students" && (
            enrollmentsLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : (
              <StudentsDataTable data={enrollments} />
            )
          )}
          {activeTab === "files" && (
            <p className="text-sm text-muted-foreground">Files coming soon.</p>
          )}
          {activeTab === "modules" && (
            <p className="text-sm text-muted-foreground">
              Modules coming soon.
            </p>
          )}
          {activeTab === "wiki" && (
            <p className="text-sm text-muted-foreground">Wiki coming soon.</p>
          )}
        </div>
      </div>
    </div>
  )
}
