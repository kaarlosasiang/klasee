"use client"

import * as React from "react"
import { AppSidebar } from "@/components/common/instructor-sidebar"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"

import { Bell, Mail, Plus, Upload } from "lucide-react"
import { NewContentDialog } from "@/components/common/new-content-dialog"
import { NewCourseDialog } from "@/components/common/new-course-dialog"
import { UploadDialog } from "@/components/common/upload-dialog"
import { SearchDialog } from "@/components/common/search-dialog"

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [courseDialogOpen, setCourseDialogOpen] = React.useState(false)

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
    </SidebarProvider>
  )
}
