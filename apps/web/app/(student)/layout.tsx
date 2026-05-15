"use client"

import * as React from "react"
import { StudentNavbar } from "@/components/common/student-navbar"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <StudentNavbar />
      <main className="flex-1 p-4 md:p-6 container mx-auto">{children}</main>
    </div>
  )
}
