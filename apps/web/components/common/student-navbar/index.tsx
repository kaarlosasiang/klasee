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
  Menu,
  LogOut,
  User,
  Settings,
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

const NAV_LINKS = [
  { label: "Dashboard", href: "/my-dashboard", icon: Home },
  { label: "Courses", href: "/my-courses", icon: BookOpen },
  { label: "Quizzes & Assignments", href: "/my-assessments", icon: ClipboardList },
  { label: "Attendance", href: "/my-attendance", icon: CalendarCheck },
]

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

  const initials = [firstName, lastName].filter(Boolean).map((s) => s.charAt(0).toUpperCase()).join("") || "S"
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || name || "Student"

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
        <div className="flex h-14 items-center justify-between gap-2 px-4 md:px-6 container mx-auto">
          <Link
            href="/my-dashboard"
            className="flex shrink-0 items-center gap-2 font-semibold"
          >
            <GraduationCap className="size-5 text-primary" />
            <span className="hidden sm:inline">Klasee</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
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
                      onClick={() => {
                        setJoinDialogOpen(true)
                      }}
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
