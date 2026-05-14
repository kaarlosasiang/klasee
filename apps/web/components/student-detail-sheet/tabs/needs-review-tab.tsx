"use client"

import * as React from "react"
import { FileText, HelpCircle, CheckSquare } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
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
import type { StudentDetail } from "@/lib/services/student-activity"
import { timeAgo } from "@/lib/utils/time"

interface NeedsReviewTabProps {
  data: StudentDetail | null
  loading: boolean
}

export function NeedsReviewTab({ data, loading }: NeedsReviewTabProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    )
  }

  const items = data?.needsReview ?? []

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border m-4 py-12 text-center">
        <CheckSquare className="size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Nothing to review</p>
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
                {item.submittedAt
                  ? `Submitted ${timeAgo(item.submittedAt)}`
                  : "Awaiting submission"}
              </ItemDescription>
            </ItemContent>
            <ItemActions className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() =>
                  console.warn("Review action not yet implemented for item", item.id)
                }
              >
                Review
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
