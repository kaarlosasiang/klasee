"use client"

import * as React from "react"
import { AppSidebar } from "@/components/common/app-sidebar/app-sidebar"
import { Button } from "@workspace/ui/components/button"
import { BreadcrumbProvider } from "@/lib/contexts/breadcrumb-context"
import { DynamicBreadcrumb } from "@/components/common/dynamic-breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"

import { Plus, Upload } from "lucide-react"
import { NewContentDialog } from "@/components/common/new-content-dialog"
import { NewCourseDialog } from "@/components/common/new-course-dialog"
import { UploadDialog } from "@/components/common/upload-dialog"

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [courseDialogOpen, setCourseDialogOpen] = React.useState(false)

  return (
    <BreadcrumbProvider>
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
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumb />
          </div>
          <div className="flex items-center gap-4">
            <UploadDialog>
              <Button
                className="border border-b-4 border-gray-300 bg-gray-100 font-bold"
                size={"lg"}
                variant={"ghost"}
              >
                <Upload />
                Upload
              </Button>
            </UploadDialog>

            <NewContentDialog onCreateCourse={() => setCourseDialogOpen(true)}>
              <Button
                className="border-0 border-b-4 border-l-3 border-blue-800 font-bold"
                size={"lg"}
              >
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

      <NewCourseDialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen} />
    </SidebarProvider>
    </BreadcrumbProvider>
  )
}
