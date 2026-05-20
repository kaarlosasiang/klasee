"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/common/instructor-sidebar"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Skeleton } from "@workspace/ui/components/skeleton"

import { Bell, Mail, Plus, Upload, HelpCircle, ClipboardCheck } from "lucide-react"
import { NewContentDialog } from "@/components/common/new-content-dialog"
import { NewCourseDialog } from "@/components/common/new-course-dialog"
import { UploadDialog } from "@/components/common/upload-dialog"
import { SearchDialog } from "@/components/common/search-dialog"
import { toast } from "sonner"
import { getCourses, type Course } from "@/lib/services/courses"

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [courseDialogOpen, setCourseDialogOpen] = React.useState(false)
  const [selectingCourse, setSelectingCourse] = React.useState<{
    open: boolean
    target: "quiz" | "assignment" | null
  }>({ open: false, target: null })
  const [courses, setCourses] = React.useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = React.useState(false)

  function openCourseSelection(target: "quiz" | "assignment") {
    setCoursesLoading(true)
    getCourses()
      .then((data) => {
        setCourses(data)
        setSelectingCourse({ open: true, target })
      })
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setCoursesLoading(false))
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "20rem",
          "--sidebar-width-icon": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4">
          <div className="flex items-start gap-2.5">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-8" />
            <SearchDialog />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-0">
              <Button variant={"ghost"}>
                <Bell />
              </Button>
              <Button variant={"ghost"}>
                <Mail />
              </Button>
            </div>
            <UploadDialog>
              <Button className="border-0 border-b-4 border-l-3 border-gray-300 bg-gray-100 font-semibold text-black dark:border-gray-800 dark:bg-gray-700 dark:text-white">
                <Upload />
                Upload
              </Button>
            </UploadDialog>

            <NewContentDialog
              onCreateCourse={() => setCourseDialogOpen(true)}
              onCreateQuiz={() => openCourseSelection("quiz")}
              onCreateAssignment={() => openCourseSelection("assignment")}
            >
              <Button className="border-0 border-b-4 border-l-3 border-[#0B4193] font-semibold">
                <Plus />
                New Content
              </Button>
            </NewContentDialog>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 py-4 pt-0">
          {children}
        </div>
      </SidebarInset>

      <NewCourseDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
      />

      <Dialog
        open={selectingCourse.open}
        onOpenChange={(o) => setSelectingCourse((prev) => ({ ...prev, open: o }))}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Select a course
            </DialogTitle>
          </DialogHeader>
          <Separator />
          {coursesLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No courses found.
            </p>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto py-2">
              {courses.map((course) => (
                <button
                  key={course._id}
                  type="button"
                  onClick={() => {
                    const target = selectingCourse.target
                    setSelectingCourse({ open: false, target: null })
                    if (target) {
                      router.push(`/courses/${course._id}/assessments/new`)
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {selectingCourse.target === "quiz" ? (
                      <HelpCircle className="size-4" />
                    ) : (
                      <ClipboardCheck className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{course.name}</p>
                    <p className="text-xs text-muted-foreground">{course.code}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
