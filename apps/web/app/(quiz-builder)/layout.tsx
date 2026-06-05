"use client"

import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function QuizBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  // Extract courseId from /courses/[id]/...
  const match = pathname.match(/^\/courses\/([^/]+)/)
  const courseId = match?.[1]

  function handleBack() {
    if (courseId) {
      router.push(`/courses/${courseId}?tab=assessments`)
    } else {
      router.back()
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-12 shrink-0 items-center border-b border-border px-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to course
        </button>
      </header>
      <div className="flex-1 overflow-auto px-4 py-4">
        {children}
      </div>
    </div>
  )
}
