"use client"

import * as React from "react"
import { AppSidebar } from "@/components/common/instructor-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { SearchDialog } from "@/components/common/search-dialog"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <div className="flex items-start gap-2.5">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-8" />
            <SearchDialog />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 py-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
