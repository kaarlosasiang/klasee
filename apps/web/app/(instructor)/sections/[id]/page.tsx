"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import {
  BookOpen,
  Hash,
  Users,
  ArrowLeft,
  Copy,
  Check,
  UserPlus,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "sonner"
import {
  getSectionById,
  generateJoinCode,
  type Section,
} from "@/lib/services/sections"
import {
  getEnrollmentsByCourse,
  dropEnrollment,
  type Enrollment,
} from "@/lib/services/enrollments"
import { StudentsDataTable } from "@/components/data-table/students-data-table"
import { StudentDetailSheet } from "@/components/student-detail-sheet"
import Link from "next/link"

export default function SectionViewPage() {
  const params = useParams()
  const [section, setSection] = React.useState<Section | null>(null)
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [copied, setCopied] = React.useState(false)
  const [selectedEnrollment, setSelectedEnrollment] =
    React.useState<Enrollment | null>(null)

  const sectionId = params.id as string

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getSectionById(sectionId)
        setSection(data)

        const courseId =
          typeof data.courseId === "string" ? data.courseId : data.courseId._id
        const enrollData = await getEnrollmentsByCourse(courseId)
        setEnrollments(
          enrollData.filter((e) => {
            const sectionIdMatch =
              typeof e.sectionId === "string"
                ? e.sectionId === sectionId
                : e.sectionId._id === sectionId
            return sectionIdMatch && e.status === "active"
          })
        )
      } catch {
        toast.error("Failed to load section")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sectionId])

  async function handleGenerateCode() {
    try {
      const updated = await generateJoinCode(sectionId)
      setSection(updated)
      toast.success("Join code generated")
    } catch {
      toast.error("Failed to generate code")
    }
  }

  async function handleCopyCode() {
    if (!section?.joinCode) return
    try {
      await navigator.clipboard.writeText(section.joinCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Code copied")
    } catch {
      toast.error("Failed to copy")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!section) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Section not found
      </div>
    )
  }

  const courseId =
    typeof section.courseId === "string" ? section.courseId : section.courseId._id
  const courseName =
    typeof section.courseId === "string" ? "" : section.courseId.name

  return (
    <div className="space-y-6">
      <Link
        href="/sections"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to sections
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{section.name}</CardTitle>
              {courseName && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {courseName}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {section.enrolledCount} enrolled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {section.schedule && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4" />
                {section.schedule}
              </span>
            )}
            {section.room && (
              <span className="flex items-center gap-1.5">
                <Hash className="size-4" />
                {section.room}
              </span>
            )}
            {section.joinCode && (
              <span className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 font-mono text-xs transition-colors hover:bg-muted/80"
                >
                  Code: {section.joinCode}
                  {copied ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </button>
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateCode}
            >
              <UserPlus className="mr-1.5 size-3.5" />
              Generate Code
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Enrolled Students</h2>
        {enrollments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Users className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No students enrolled in this section
            </p>
          </div>
        ) : (
          <StudentsDataTable
            data={enrollments}
            onDrop={() => {
              getEnrollmentsByCourse(courseId).then((data) =>
                setEnrollments(
                  data.filter((e) => {
                    const sectionIdMatch =
                      typeof e.sectionId === "string"
                        ? e.sectionId === sectionId
                        : e.sectionId._id === sectionId
                    return sectionIdMatch && e.status === "active"
                  })
                )
              )
            }}
            onRowClick={setSelectedEnrollment}
          />
        )}
      </div>

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
