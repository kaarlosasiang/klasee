"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { useBreadcrumbLabel } from "@/lib/contexts/breadcrumb-context"

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  courses: "Courses",
  sections: "Sections",
  students: "Students",
  assessments: "Assessments",
  attendance: "Attendance",
  "my-dashboard": "Dashboard",
  "my-courses": "My Courses",
  "my-assessments": "Assessments",
  "my-attendance": "Attendance",
}

function isMongoId(s: string) {
  return /^[a-f0-9]{24}$/i.test(s)
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const { leafLabel, labelPath } = useBreadcrumbLabel()

  // Only use the stored label if it was set for the exact current path
  const effectiveLeafLabel = labelPath === pathname ? leafLabel : null

  const segments = pathname.split("/").filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, idx) => {
          const isLast = idx === segments.length - 1
          const href = "/" + segments.slice(0, idx + 1).join("/")

          let label: string
          if (isLast && isMongoId(segment) && effectiveLeafLabel) {
            label = effectiveLeafLabel
          } else {
            label = SEGMENT_LABELS[segment] ?? segment
          }

          return (
            <React.Fragment key={href}>
              {idx > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className={idx < segments.length - 1 ? "hidden md:block" : undefined}>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
