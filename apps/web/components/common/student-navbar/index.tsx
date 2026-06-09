"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  GraduationCap,
  Home,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  BarChart2,
  Menu,
  LogOut,
  User,
  Settings,
  Bell,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"
import { useSession, signOut } from "@/lib/config/auth-client"
import { SearchDialog } from "@/components/common/search-dialog"
import { JoinCourseDialog } from "@/components/join-course-dialog"

// ---------------------------------------------------------------------------
// Mock notifications — replace with real API call in Phase 2
// ---------------------------------------------------------------------------

const MOCK_NOTIFICATIONS = [
  { id: "1", title: "Midterm schedule has been updated", course: "Introduction to Programming", time: "2h ago", group: "Today" as const },
  { id: "2", title: "Lab session moved to Room 204", course: "Web Development", time: "5h ago", group: "Today" as const },
  { id: "3", title: "Assignment 3 deadline extended", course: "Data Structures & Algorithms", time: "Yesterday", group: "Yesterday" as const },
  { id: "4", title: "Guest lecture this Friday", course: "Introduction to Programming", time: "2 days ago", group: "Earlier" as const },
  { id: "5", title: "Grades posted for Quiz 2", course: "Web Development", time: "3 days ago", group: "Earlier" as const },
]

type NotifGroup = "Today" | "Yesterday" | "Earlier"

// ---------------------------------------------------------------------------

const NAV_LINKS = [
  { label: "Dashboard", href: "/my-dashboard", icon: Home },
  { label: "Courses", href: "/my-courses", icon: BookOpen },
  { label: "Quizzes & Assignments", href: "/my-assessments", icon: ClipboardList },
  { label: "Attendance", href: "/my-attendance", icon: CalendarCheck },
  { label: "Grades", href: "/my-grades", icon: BarChart2 },
]

function NotificationBell() {
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set())

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !readIds.has(n.id)).length

  function markAllRead() {
    setReadIds(new Set(MOCK_NOTIFICATIONS.map((n) => n.id)))
  }

  function markRead(id: string) {
    setReadIds((prev) => new Set([...prev, id]))
  }

  const groups: NotifGroup[] = ["Today", "Yesterday", "Earlier"]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-8">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all as read ✓
            </button>
          )}
        </div>

        {/* Grouped list */}
        <div className="max-h-96 overflow-y-auto">
          {groups.map((group) => {
            const items = MOCK_NOTIFICATIONS.filter((n) => n.group === group)
            if (!items.length) return null
            return (
              <div key={group}>
                <p className="sticky top-0 bg-muted/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
                  {group}
                </p>
                {items.map((n) => {
                  const isRead = readIds.has(n.id)
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                        !isRead && "bg-primary/5"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-1.5 size-2 shrink-0 rounded-full",
                          !isRead ? "bg-primary" : "bg-transparent"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-medium leading-snug">
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {n.course} · {n.time}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function StudentNavbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [joinDialogOpen, setJoinDialogOpen] = React.useState(false)

  const rawUser = session?.user as Record<string, unknown> | undefined
  const firstName = (rawUser?.firstName as string) || ""
  const lastName = (rawUser?.lastName as string) || ""
  const email = (rawUser?.email as string) || ""
  const name = (rawUser?.name as string) || ""

  const initials =
    [firstName, lastName]
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase())
      .join("") || "S"
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || name || "Student"

  function isActive(href: string) {
    if (href === "/my-dashboard") return pathname === href
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between gap-2 px-4 md:px-6">
          <Link
            href="/my-dashboard"
            className="flex shrink-0 items-center gap-2 font-semibold"
          >
            <GraduationCap className="size-5 text-primary" />
            <span className="hidden sm:inline">Klasee</span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <SearchDialog compact />

            <NotificationBell />

            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => setJoinDialogOpen(true)}
            >
              <GraduationCap className="mr-1.5 size-4" />
              Join Course
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{displayName}</span>
                    {email && (
                      <span className="truncate text-xs text-muted-foreground">
                        {email}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/my-profile")}>
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/my-settings")}>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="size-5 text-primary" />
                    Klasee
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-0.5 p-2">
                  {NAV_LINKS.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive(link.href)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <link.icon className="size-4" />
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                  <hr className="my-2" />
                  <SheetClose asChild>
                    <button
                      onClick={() => setJoinDialogOpen(true)}
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <GraduationCap className="size-4" />
                      Join Course
                    </button>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <JoinCourseDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
        onJoined={() => router.refresh()}
      />
    </>
  )
}
