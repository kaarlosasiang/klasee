"use client"

import * as React from "react"
import {
  BookOpen,
  FileText,
  HelpCircle,
  MessageSquare,
  Paperclip,
  PlayCircle,
  SlidersHorizontal,
  CalendarDays,
  Plus,
  Search,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Progress } from "@workspace/ui/components/progress"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import type { StudentDetail, TrendingContent, ActivityLogEntry } from "@/lib/services/student-activity"
import { timeAgo } from "@/lib/utils/time"

const contentTypeIcon: Record<TrendingContent["type"], React.ReactNode> = {
  video: <PlayCircle className="size-4" />,
  quiz: <HelpCircle className="size-4" />,
  assignment: <FileText className="size-4" />,
  page: <BookOpen className="size-4" />,
}

const activityIcon: Record<ActivityLogEntry["type"], React.ReactNode> = {
  course_started: <BookOpen className="size-4 text-blue-500" />,
  quiz_completed: <HelpCircle className="size-4 text-emerald-500" />,
  feedback_given: <MessageSquare className="size-4 text-orange-500" />,
  attachment_uploaded: <Paperclip className="size-4 text-purple-500" />,
  page_visited: <BookOpen className="size-4 text-muted-foreground" />,
}

interface ActivityTabProps {
  data: StudentDetail | null
  loading: boolean
  enrollment?: { studentId: { name: string } }
}

export function ActivityTab({ data, loading }: ActivityTabProps) {
  const [logSearch, setLogSearch] = React.useState("")

  const filteredLog = React.useMemo(() => {
    if (!data?.activityLog) return []
    if (!logSearch) return data.activityLog
    const q = logSearch.toLowerCase()
    return data.activityLog.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.contentTitle?.toLowerCase().includes(q)
    )
  }, [data?.activityLog, logSearch])

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Trending contents */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Trending contents</p>
          <Badge variant="secondary" className="text-xs font-normal">
            Last 24 hours
          </Badge>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <ItemGroup>
            {(data?.trendingContents ?? []).map((content) => (
              <Item key={content.id} variant="muted" className="rounded-md px-3 py-2">
                <ItemMedia variant="icon" className="shrink-0">
                  {contentTypeIcon[content.type]}
                </ItemMedia>
                <ItemContent className="min-w-0 gap-1">
                  <ItemTitle className="truncate text-xs">{content.title}</ItemTitle>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={content.progressPercent}
                      className="h-1 flex-1"
                    />
                  </div>
                </ItemContent>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium text-foreground">{content.progressPercent}%</p>
                  <p className="text-[10px] text-muted-foreground">
                    {content.timeSpentMinutes >= 60
                      ? `${Math.round(content.timeSpentMinutes / 60)} hrs`
                      : `${content.timeSpentMinutes} min`}
                  </p>
                </div>
              </Item>
            ))}
          </ItemGroup>
        )}
      </div>

      {/* Activity log */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Log</p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <Plus className="size-3" />
              Add Filter
            </Button>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <CalendarDays className="size-3" />
              Last 7 Days
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLog.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No activity yet</p>
        ) : (
          <ul className="flex flex-col gap-0">
            {filteredLog.map((entry, idx) => (
              <li key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    {activityIcon[entry.type]}
                  </div>
                  {idx < filteredLog.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 pb-4 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-1">
                    <span className="text-sm font-medium">{entry.description}</span>
                    {entry.contentTitle && (
                      <span className="truncate text-xs text-muted-foreground">
                        "{entry.contentTitle}"
                      </span>
                    )}
                    {entry.metadata?.score !== undefined && (
                      <span className="text-xs text-emerald-600 font-medium">
                        with a 🎯 {String(entry.metadata.score)} points
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {timeAgo(entry.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
