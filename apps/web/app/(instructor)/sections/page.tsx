"use client"

import * as React from "react"
import { BookOpen, Users, Hash, Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "sonner"
import { getSections, type Section } from "@/lib/services/sections"
import Link from "next/link"

export default function SectionsPage() {
  const [sections, setSections] = React.useState<Section[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    getSections()
      .then(setSections)
      .catch(() => toast.error("Failed to load sections"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sections</h1>
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <BookOpen className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No sections found</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/courses">Go to Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section._id}
              href={`/sections/${section._id}`}
              className="group rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                    {section.courseId.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {section.courseId.code} &mdash; {section.name}
                  </p>
                </div>
                {section.joinCode && (
                  <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                    {section.joinCode}
                  </Badge>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {section.schedule && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="size-3" />
                    {section.schedule}
                  </span>
                )}
                {section.room && (
                  <span className="flex items-center gap-1">
                    <Hash className="size-3" />
                    {section.room}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {section.enrolledCount} enrolled
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
