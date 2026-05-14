"use client"

import * as React from "react"
import { FileText, HelpCircle, ClipboardList } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  ItemActions,
} from "@workspace/ui/components/item"
import type { AssignedItem, StudentDetail } from "@/lib/services/student-activity"
import { timeAgo } from "@/lib/utils/time"

const statusVariant: Record<AssignedItem["status"], "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  submitted: "secondary",
  graded: "secondary",
  overdue: "destructive",
}

const statusLabel: Record<AssignedItem["status"], string> = {
  pending: "Pending",
  submitted: "Submitted",
  graded: "Graded",
  overdue: "Overdue",
}

interface AssignedTabProps {
  data: StudentDetail | null
  loading: boolean
}

export function AssignedTab({ data, loading }: AssignedTabProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    )
  }

  const items = data?.assigned ?? []

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border m-4 py-12 text-center">
        <ClipboardList className="size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No assignments yet</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <ItemGroup>
        {items.map((item) => (
          <Item key={item.id} variant="muted" className="rounded-md px-3 py-2.5">
            <ItemMedia variant="icon" className="shrink-0">
              {item.type === "assignment" ? (
                <FileText className="size-4 text-orange-500" />
              ) : (
                <HelpCircle className="size-4 text-blue-500" />
              )}
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle className="truncate text-sm">{item.title}</ItemTitle>
              <ItemDescription className="text-xs">
                {item.dueAt && `Due ${timeAgo(item.dueAt)}`}
                {item.submittedAt && ` · Submitted ${timeAgo(item.submittedAt)}`}
              </ItemDescription>
            </ItemContent>
            <ItemActions className="shrink-0 flex-col items-end gap-1">
              {item.status === "graded" && item.score !== undefined ? (
                <Badge variant="secondary" className="text-xs">
                  {item.score}/{item.maxScore ?? "–"}
                </Badge>
              ) : (
                <Badge variant={statusVariant[item.status]} className="text-xs">
                  {statusLabel[item.status]}
                </Badge>
              )}
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
