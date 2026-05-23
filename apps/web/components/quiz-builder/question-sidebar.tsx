"use client"

import * as React from "react"
import { Plus, MoreHorizontal, ArrowUp, ArrowDown, Trash2, MonitorCheck } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import type { QuestionLike } from "./types"

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Multiple choice",
  true_false: "True / False",
  essay: "Essay",
  fill_in: "Fill in the blank",
}

interface QuestionSidebarProps {
  questions: QuestionLike[]
  activeId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
  onDelete: (id: string) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
}

export function QuestionSidebar({
  questions,
  activeId,
  onSelect,
  onAdd,
  onDelete,
  onMoveUp,
  onMoveDown,
}: QuestionSidebarProps) {
  return (
    <TooltipProvider>
      <div className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-muted/20">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Questions
            </span>
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
              {questions.length}
            </Badge>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={onAdd}
              >
                <Plus className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Add question</TooltipContent>
          </Tooltip>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-0.5 p-2">
            {questions.map((q, index) => (
              <div
                key={q._id}
                onClick={() => onSelect(q._id)}
                className={`group flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-accent ${
                  activeId === q._id ? "bg-accent" : ""
                }`}
              >
                <span className="mt-0.5 w-4 shrink-0 text-right text-[11px] font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium leading-tight">
                    {q.question || "Untitled question"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {TYPE_LABELS[q.type] ?? q.type}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="mt-0.5 shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100">
                      <MoreHorizontal className="size-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      disabled={index === 0}
                      onClick={(e) => { e.stopPropagation(); onMoveUp(index) }}
                    >
                      <ArrowUp className="mr-2 size-3.5" />
                      Move up
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={index === questions.length - 1}
                      onClick={(e) => { e.stopPropagation(); onMoveDown(index) }}
                    >
                      <ArrowDown className="mr-2 size-3.5" />
                      Move down
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => { e.stopPropagation(); onDelete(q._id) }}
                    >
                      <Trash2 className="mr-2 size-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {questions.length === 0 && (
              <p className="px-2 py-4 text-center text-[11px] text-muted-foreground">
                No questions yet
              </p>
            )}
          </div>
        </ScrollArea>

        <Separator />
        <div className="p-3">
          <div className="flex cursor-default items-center gap-2 rounded-lg px-2 py-2 text-muted-foreground hover:bg-accent">
            <MonitorCheck className="size-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">Result Screen</p>
              <p className="truncate text-[10px] text-muted-foreground">
                Set your Passed / Failed message
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
