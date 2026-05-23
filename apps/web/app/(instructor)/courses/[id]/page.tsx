"use client"

import * as React from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
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
  ClipboardList,
  Book,
  Cog,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import { getCourseById, type Course } from "@/lib/services/courses"
import { timeAgo } from "@/lib/utils/time"
import { useSidebar } from "@workspace/ui/components/sidebar"
import {
  getEnrollmentsByCourse,
  type Enrollment,
} from "@/lib/services/enrollments"
import { StudentsDataTable } from "@/components/data-table/students-data-table"
import { StudentDetailSheet } from "@/components/student-detail-sheet"
import { FileManager } from "@/components/common/file-manager"
import { SectionsManager } from "@/components/sections-manager"
import { InviteStudentDialog } from "@/components/invite-student-dialog"
import { Announcements } from "@/components/common/announcements"
import { ModulesManager } from "@/components/modules-manager"
import { AssessmentsManager } from "@/components/assessments-manager"
import { CourseSettings } from "@/components/common/course-settings"

export default function CourseDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [course, setCourse] = React.useState<Course | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState("announcements")
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
  const [enrollmentsLoading, setEnrollmentsLoading] = React.useState(false)
  const [enrollmentsError, setEnrollmentsError] = React.useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false)
  const [selectedEnrollment, setSelectedEnrollment] =
    React.useState<Enrollment | null>(null)

  React.useEffect(() => {
    const tab = searchParams?.get("tab")
    if (tab) setActiveTab(tab)
  }, [searchParams])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    router.replace(`/courses/${params.id}?tab=${tab}`, { scroll: false })
  }

  const refreshCourse = React.useCallback(async () => {
    try {
      const data = await getCourseById(params.id as string)
      setCourse(data)
    } catch {
      toast.error("Course not found")
    }
  }, [params.id])

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      await refreshCourse()
      setLoading(false)
    }
    load()
  }, [refreshCourse])

  const { setOpen } = useSidebar()
  React.useEffect(() => {
    setOpen(false)
    return () => setOpen(true)
  }, [setOpen])

  const fetchEnrollments = React.useCallback(async (courseId: string) => {
    setEnrollmentsLoading(true)
    setEnrollmentsError(false)
    try {
      const data = await getEnrollmentsByCourse(courseId)
      setEnrollments(data)
    } catch {
      toast.error("Failed to load students")
      setEnrollmentsError(true)
    } finally {
      setEnrollmentsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (activeTab !== "students" || !course) return
    fetchEnrollments(course._id)
  }, [activeTab, course, fetchEnrollments])

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
    <div className="relative -ml-4 flex gap-4">
      {/* Sidebar */}
      <nav className="sticky top-16 flex h-[calc(100svh-4rem)] w-48 shrink-0 flex-col space-y-1 self-start border-r border-border">
        {[
          { id: "announcements", label: "Announcements", icon: Megaphone },
          { id: "sections", label: "Sections", icon: BookOpen },
          { id: "students", label: "Students", icon: Users },
          { id: "files", label: "Files", icon: Folder },
          { id: "modules", label: "Modules", icon: Layers },
          {
            id: "assessments",
            label: "Quizzes & Assignments",
            icon: ClipboardList,
          },
          { id: "wiki", label: "Wiki", icon: Book },
          { id: "settings", label: "Settings", icon: Cog },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleTabChange(item.id)}
            className={`flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
              activeTab === item.id
                ? "border-l-3 border-primary/90 bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right: Back button + Hero + Content */}
      <div className="flex-1 space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to courses
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-5 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
          {/* {course.cover && (
            <img
              src={course.cover}
              alt=""
              className="absolute inset-0 h-full w-full object-cover blur-out-xs brightness-90"
            />
          )} */}
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-500 text-white shadow-md">
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
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="text-xl font-bold">{course.name}</h1>
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
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
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
                  {course.assessmentCount} Quiz & Assign.
                </span>
              </div>
              {course.description && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {course.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Created {timeAgo(course.createdAt)}
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
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "announcements" && (
            <Announcements courseId={course._id} />
          )}
          {activeTab === "sections" && (
            <SectionsManager
              courseId={course._id}
              onInvite={() => setInviteDialogOpen(true)}
            />
          )}
          {activeTab === "students" &&
            (enrollmentsLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : enrollmentsError ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <p className="text-sm text-muted-foreground">
                  Failed to load students
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchEnrollments(course._id)}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <StudentsDataTable
                data={enrollments}
                onDrop={() => fetchEnrollments(course._id)}
                onRowClick={setSelectedEnrollment}
              />
            ))}
          {activeTab === "files" && (
            <FileManager courseId={course._id} courseName={course.name} />
          )}
          {activeTab === "modules" && <ModulesManager courseId={course._id} />}
          {activeTab === "assessments" && (
            <AssessmentsManager courseId={course._id} />
          )}
          {activeTab === "wiki" && (
            <p className="text-sm text-muted-foreground">Wiki coming soon.</p>
          )}
          {activeTab === "settings" && (
            <CourseSettings course={course} onUpdated={refreshCourse} />
          )}
        </div>
      </div>

      <InviteStudentDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        courseId={course._id}
        onCreated={() => {}}
      />

      <StudentDetailSheet
        open={!!selectedEnrollment}
        onOpenChange={(open) => {
          if (!open) setSelectedEnrollment(null)
        }}
        enrollment={selectedEnrollment}
        enrollments={enrollments}
        onNavigate={setSelectedEnrollment}
      />
    </div>
  )
}
