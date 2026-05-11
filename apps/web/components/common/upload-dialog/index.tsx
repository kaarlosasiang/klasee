"use client"

import * as React from "react"
import {
  FileAudio,
  FileImage,
  FilePieChart,
  FileVideo,
  FolderUp,
  Link2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"

type UploadTypeItem = {
  id: string
  title: string
  description: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  accept?: string
}

const uploadTypes: UploadTypeItem[] = [
  {
    id: "video",
    title: "Video",
    description: "Upload MP4, MOV, or AVI video files for your course.",
    icon: FileVideo,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    accept: "video/*",
  },
  {
    id: "document",
    title: "Document",
    description: "Upload PDFs, Word docs, or presentations.",
    icon: FilePieChart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    accept: ".pdf,.doc,.docx,.ppt,.pptx",
  },
  {
    id: "image",
    title: "Image",
    description: "Upload PNG, JPG, or SVG images and graphics.",
    icon: FileImage,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    accept: "image/*",
  },
  {
    id: "audio",
    title: "Audio",
    description: "Upload MP3, WAV, or podcast audio files.",
    icon: FileAudio,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    accept: "audio/*",
  },
  {
    id: "bulk",
    title: "Bulk Upload",
    description: "Upload a ZIP archive containing multiple files at once.",
    icon: FolderUp,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    accept: ".zip",
  },
  {
    id: "link",
    title: "External Link",
    description: "Embed content from YouTube, Vimeo, or any external URL.",
    icon: Link2,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
]

const fileInputRef = React.createRef<HTMLInputElement>()

function UploadTypeCard({
  type,
  onSelect,
}: {
  type: UploadTypeItem
  onSelect: (type: UploadTypeItem) => void
}) {
  const Icon = type.icon

  return (
    <button
      onClick={() => onSelect(type)}
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
        <span className="text-sm font-semibold text-foreground">
          {type.title}
        </span>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {type.description}
        </p>
      </div>
    </button>
  )
}

export function UploadDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  function handleSelect(type: UploadTypeItem) {
    if (type.id === "link") {
      // TODO: open external link input flow
      setOpen(false)
      return
    }
    if (inputRef.current) {
      inputRef.current.accept = type.accept ?? "*"
      inputRef.current.click()
    }
    setOpen(false)
  }

  return (
    <>
      <input ref={inputRef} type="file" className="hidden" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Upload content
            </DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="grid auto-rows-fr grid-cols-2 gap-2.5">
            {uploadTypes.map((type) => (
              <UploadTypeCard
                key={type.id}
                type={type}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
