import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <FileQuestion className="size-12 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  )
}
