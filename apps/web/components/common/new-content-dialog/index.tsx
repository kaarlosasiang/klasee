"use client"

import * as React from "react"
import {
  BookMarked,
  BookOpen,
  ClipboardCheck,
  FileText,
  HelpCircle,
  Route,
  Sparkles,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import { Separator } from "@workspace/ui/components/separator"

type ContentTypeItem = {
  id: string
  title: string
  description: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  badge?: {
    label: string
    className: string
    showSparkle?: boolean
  }
}

const contentTypes: ContentTypeItem[] = [
  {
    id: "course",
    title: "Course",
    description: "Create and publish educational content for learners.",
    icon: BookOpen,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "page",
    title: "Page",
    description: "Create a standalone page containing educational content.",
    icon: FileText,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    badge: {
      label: "AI Powered",
      className: "bg-violet-100 text-violet-600 border-violet-200",
      showSparkle: true,
    },
  },
  {
    id: "quiz",
    title: "Quiz",
    description:
      "Create an assessment that evaluates learners' understanding of the material.",
    icon: HelpCircle,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    badge: {
      label: "AI Powered",
      className: "bg-violet-100 text-violet-600 border-violet-200",
      showSparkle: true,
    },
  },
  {
    id: "assignment",
    title: "Assignment",
    description:
      "Create assignments for learners to do within a certain deadline.",
    icon: ClipboardCheck,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
  {
    id: "learning-path",
    title: "Learning Path",
    description:
      "Create a structured and sequenced journey for learners to follow.",
    icon: Route,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    id: "wiki",
    title: "Wiki",
    description:
      "Create a knowledge base where information related to the course.",
    icon: BookMarked,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badge: {
      label: "New",
      className: "bg-emerald-100 text-emerald-600 border-emerald-200",
    },
  },
]

function ContentTypeCard({
  type,
  onClick,
}: {
  type: ContentTypeItem
  onClick: () => void
}) {
  const Icon = type.icon

  return (
    <button
      onClick={onClick}
      className="group flex h-full items-start gap-3 rounded-xl border border-border p-3.5 text-left transition-all hover:border-primary/40 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          type.iconBg
        )}
      >
        <Icon className={cn("size-[18px]", type.iconColor)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground">
            {type.title}
          </span>
          {type.badge && (
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 gap-0.5 text-[10px]",
                type.badge.className
              )}
            >
              {type.badge.showSparkle && <Sparkles className="size-2.5!" />}
              {type.badge.label}
            </Badge>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {type.description}
        </p>
      </div>
    </button>
  )
}

export function NewContentDialog({
  children,
  onCreateCourse,
  onCreateQuiz,
  onCreateAssignment,
}: {
  children: React.ReactNode
  onCreateCourse?: () => void
  onCreateQuiz?: () => void
  onCreateAssignment?: () => void
}) {
  const [open, setOpen] = React.useState(false)

  function handleClick(id: string) {
    setOpen(false)
    if (id === "course" && onCreateCourse) {
      onCreateCourse()
    } else if (id === "quiz" && onCreateQuiz) {
      onCreateQuiz()
    } else if (id === "assignment" && onCreateAssignment) {
      onCreateAssignment()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create new content
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="grid auto-rows-fr grid-cols-2 gap-2.5">
          {contentTypes.map((type) => (
            <ContentTypeCard
              key={type.id}
              type={type}
              onClick={() => handleClick(type.id)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
