"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import {
  GraduationCap,
  BookOpen,
  Users,
  ArrowLeft,
  Megaphone,
  FileText,
  FolderOpen,
  PanelRightClose,
  Download,
  Eye,
  File,
  Loader2,
} from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { toast } from "sonner"
import { getCourseById, type Course } from "@/lib/services/courses"
import { getModules, type Module } from "@/lib/services/modules"
import {
  getCourseFiles,
  getDownloadLink,
  getStreamUrl,
  type CourseFile,
} from "@/lib/services/drive"
import { Announcements } from "@/components/common/announcements"
import Link from "next/link"

const FILE_ICONS: Record<string, React.ElementType> = {
  "application/pdf": FileText,
  "video/mp4": File,
  "video/x-msvideo": File,
  "video/quicktime": File,
  "video/x-ms-wmv": File,
}

function FileIcon({ mimeType }: { mimeType: string }) {
  const Icon = FILE_ICONS[mimeType] ?? (mimeType.startsWith("video/") ? File : FileText)
  return <Icon className="size-4 shrink-0 text-muted-foreground" />
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileRow({ file }: { file: CourseFile }) {
  const [downloading, setDownloading] = React.useState(false)

  const handleDownload = async () => {
    if (file.source === "drive" && file.driveFileId) {
      setDownloading(true)
      try {
        const link = await getDownloadLink(file.driveFileId)
        if (link.webContentLink) {
          window.open(link.webContentLink, "_blank")
        } else {
          window.open(getStreamUrl(file.driveFileId), "_blank")
        }
      } catch {
        toast.error("Failed to open file")
      } finally {
        setDownloading(false)
      }
    } else if (file.source === "cloudinary" && file.cloudinaryUrl) {
      window.open(file.cloudinaryUrl, "_blank")
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-2.5">
      <FileIcon mimeType={file.mimeType} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>
      <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={handleDownload} disabled={downloading}>
        {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      </Button>
    </div>
  )
}

export default function StudentCourseDetailPage() {
  const params = useParams()
  const [course, setCourse] = React.useState<Course | null>(null)
  const [modules, setModules] = React.useState<Module[]>([])
  const [materials, setMaterials] = React.useState<CourseFile[]>([])
  const [activities, setActivities] = React.useState<CourseFile[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const [courseData, modulesData, materialsData, activitiesData] = await Promise.all([
          getCourseById(params.id as string),
          getModules(params.id as string, true),
          getCourseFiles(params.id as string, "materials", undefined, true),
          getCourseFiles(params.id as string, "activities", undefined, true),
        ])
        setCourse(courseData)
        setModules(modulesData)
        setMaterials(materialsData)
        setActivities(activitiesData)
      } catch {
        toast.error("Failed to load course data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
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
    <div className="space-y-6">
      <Link
        href="/my-courses"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to my courses
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-5 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
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
            </div>
            {course.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {course.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {modules.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <PanelRightClose className="size-5" />
            Modules
          </h2>
          <div className="space-y-2">
            {modules.map((mod) => (
              <Card key={mod._id} className="p-4">
                <h3 className="font-medium">{mod.title}</h3>
                {mod.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {mod.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {materials.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <FolderOpen className="size-5" />
            Materials
          </h2>
          <div className="space-y-1.5">
            {materials.map((file) => (
              <FileRow key={file._id} file={file} />
            ))}
          </div>
        </div>
      )}

      {activities.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <FileText className="size-5" />
            Activities
          </h2>
          <div className="space-y-1.5">
            {activities.map((file) => (
              <FileRow key={file._id} file={file} />
            ))}
          </div>
        </div>
      )}

      {(modules.length === 0 && materials.length === 0 && activities.length === 0) && (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <Eye className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No published content yet. Check back later.
          </p>
        </Card>
      )}

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Megaphone className="size-5" />
          Announcements
        </h2>
        <Announcements courseId={course._id} />
      </div>
    </div>
  )
}
