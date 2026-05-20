"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, BookOpen, Users, Home, CalendarCheck, ClipboardList, GraduationCap } from "lucide-react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import { cn } from "@workspace/ui/lib/utils"
import { useSession } from "@/lib/config/auth-client"

const INSTRUCTOR_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Students", href: "/students", icon: Users },
  { label: "Attendance", href: "/attendance", icon: CalendarCheck },
  { label: "Grades", href: "/grades", icon: ClipboardList },
]

const STUDENT_ITEMS = [
  { label: "Dashboard", href: "/my-dashboard", icon: Home },
  { label: "My Courses", href: "/my-courses", icon: BookOpen },
  { label: "Quizzes & Assignments", href: "/my-assessments", icon: ClipboardList },
  { label: "Attendance", href: "/my-attendance", icon: CalendarCheck },
]

interface SearchDialogProps {
  compact?: boolean
}

export function SearchDialog({ compact }: SearchDialogProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [open, setOpen] = React.useState(false)

  const role = (session?.user as { role?: string })?.role
  const isInstructor = role === "instructor" || role === "admin"
  const navItems = isInstructor ? INSTRUCTOR_ITEMS : STUDENT_ITEMS

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  function handleSelect(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          compact
            ? "flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            : "flex h-8 w-64 items-center gap-2 rounded-lg border border-border/60 bg-muted/50 px-3 text-left text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        )}
      >
        <Search className="size-4 shrink-0" />
        {!compact && (
          <>
            <span className="flex-1">Search pages...</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground md:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </>
        )}
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search pages..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigate">
              {navItems.map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.label}
                  onSelect={() => handleSelect(item.href)}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
