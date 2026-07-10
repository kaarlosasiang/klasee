import { ArrowLeft, FileText, Video, Link2, ExternalLink, File, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getLessonById, getLessons } from "@/lib/services/lessons"
import { getModules } from "@/lib/services/modules"
import { getVideoEmbed } from "@/lib/utils/video"
import { LessonFileActions } from "@/components/common/lesson-file-actions"

const TYPE_LABELS: Record<string, string> = {
  page: "Page",
  video: "Video",
  file: "File",
  embed: "Embed",
  link: "Link",
}

const TYPE_BADGE: Record<string, string> = {
  page: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  video: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  file: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  embed: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
  link: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  page: FileText,
  video: Video,
  file: File,
  embed: Link2,
  link: ExternalLink,
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>
}) {
  const { id, lessonId } = await params

  const [lesson, modules] = await Promise.all([
    getLessonById(lessonId),
    getModules(id, true),
  ])

  const allLessons = (
    await Promise.all(
      [...modules].sort((a, b) => a.order - b.order).map((mod) =>
        getLessons(mod._id, true).then((ls) => [...ls].sort((a, b) => a.order - b.order))
      )
    )
  ).flat()

  const currentIndex = allLessons.findIndex((l) => l._id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  if (lesson.type === "link" && lesson.content) {
    redirect(lesson.content)
  }

  const TypeIcon = TYPE_ICONS[lesson.type] ?? FileText

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      <Link
        href={`/my-courses/${id}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to course
      </Link>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${TYPE_BADGE[lesson.type] ?? "bg-muted"}`}>
            <TypeIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{lesson.title}</h1>
            <Badge
              variant="outline"
              className={`mt-1 rounded-full text-[10px] font-normal ${TYPE_BADGE[lesson.type] ?? ""}`}
            >
              {TYPE_LABELS[lesson.type] ?? lesson.type}
            </Badge>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {lesson.type === "page" && (
          lesson.content ? (
            lesson.content.trim().startsWith("<") ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {lesson.content}
              </p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">No content available.</p>
          )
        )}

        {lesson.type === "video" && lesson.content && (
          (() => {
            const embedUrl = getVideoEmbed(lesson.content)
            return embedUrl ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <iframe
                  src={embedUrl}
                  className="aspect-video w-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : (
              <a
                href={lesson.content}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Video className="size-4" />
                Open video ↗
              </a>
            )
          })()
        )}

        {lesson.type === "embed" && lesson.content && (
          <div className="overflow-hidden rounded-xl border border-border">
            <iframe
              src={lesson.content}
              className="aspect-video w-full"
              allowFullScreen
            />
          </div>
        )}

        {lesson.type === "link" && (
          lesson.content ? (
            <a
              href={lesson.content}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-5 py-3 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-950/60"
            >
              <ExternalLink className="size-4" />
              Open Link ↗
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No link provided.</p>
          )
        )}

        {lesson.type === "file" && (
          lesson.fileId ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <File className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{lesson.fileId.name}</p>
                <p className="text-xs text-muted-foreground">{lesson.fileId.mimeType}</p>
              </div>
              <LessonFileActions lesson={lesson} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No file attached to this lesson.</p>
          )
        )}

        {!lesson.content && lesson.type !== "file" && lesson.type !== "link" && (
          <p className="text-sm text-muted-foreground">No content available.</p>
        )}
      </div>

      {(prevLesson || nextLesson) && (
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          {prevLesson ? (
            <Link
              href={`/my-courses/${id}/lessons/${prevLesson._id}`}
              className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-muted/50"
            >
              <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Previous</p>
                <p className="truncate font-medium group-hover:text-primary">{prevLesson.title}</p>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextLesson && (
            <Link
              href={`/my-courses/${id}/lessons/${nextLesson._id}`}
              className="group flex min-w-0 flex-1 items-center justify-end gap-2 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 text-right">
                <p className="text-[10px] text-muted-foreground">Next</p>
                <p className="truncate font-medium group-hover:text-primary">{nextLesson.title}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
