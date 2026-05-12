"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { GraduationCap, BookOpen, Users, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { toast } from "sonner"
import { getCourseById, archiveCourse, type Course } from "@/lib/services/courses"

export default function CourseDetailPage() {
  const params = useParams()
  const [course, setCourse] = React.useState<Course | null>(null)
  const [loading, setLoading] = React.useState(true)

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
    return <div className="py-20 text-center text-muted-foreground">Course not found</div>
  }

  return (
    <div className="space-y-6">
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
        <div className="relative h-48 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
          {course.cover && (
            <img src={course.cover} alt="" className="h-full w-full object-cover" />
          )}
          <div className="absolute -bottom-6 left-6 flex size-14 items-center justify-center overflow-hidden rounded-xl border-4 border-background bg-blue-500 text-white shadow-md">
            {course.icon ? (
              <img src={course.icon} alt="" className="h-full w-full object-cover" />
            ) : (
              <GraduationCap className="size-6" />
            )}
          </div>
        </div>
        <div className="px-6 pt-9 pb-5">
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{course.code}</span>
            <Badge variant="secondary" className="rounded-full text-[10px] font-normal">
              {course.semester === "1st" ? "1st Sem" : course.semester === "2nd" ? "2nd Sem" : "Summer"}
            </Badge>
          </div>
          {course.description && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {course.description}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="size-4" />
            Sections
          </div>
          <p className="mt-1 text-2xl font-bold">{course.sectionCount}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            Students
          </div>
          <p className="mt-1 text-2xl font-bold">{course.enrolledCount}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="size-4" />
            Assessments
          </div>
          <p className="mt-1 text-2xl font-bold">{course.assessmentCount}</p>
        </div>
      </div>

      <Tabs defaultValue="sections">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        <TabsContent value="sections" className="pt-4">
          <p className="text-sm text-muted-foreground">Sections list coming soon.</p>
        </TabsContent>
        <TabsContent value="students" className="pt-4">
          <p className="text-sm text-muted-foreground">Students list coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
