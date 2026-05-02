"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { GraduationCap, Bell, Search, MessageSquare, ChevronDown } from "lucide-react"
import { useSession, signOut } from "@/lib/config/auth-client"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

const NAV_LINKS = [
  { href: "/my-dashboard", label: "Home" },
  { href: "/my-courses", label: "My Courses" },
  { href: "/my-assessments", label: "Assessments" },
  { href: "/my-attendance", label: "Attendance" },
]

function StudentNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??"

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      {/* Top bar */}
      <div className="flex mx-auto h-14 w-full max-w-7xl items-center gap-4 px-6">
        {/* Logo */}
        <Link href="/my-dashboard" className="flex shrink-0 items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">Klasee</span>
        </Link>

        {/* Search */}
        <div className="mx-4 hidden max-w-xs flex-1 sm:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search courses, assessments…"
              className="h-9 w-full rounded-full border border-border bg-muted pl-8 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <MessageSquare className="size-4" />
          </button>
          <button className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Bell className="size-4" />
          </button>

          <div className="mx-1 h-6 w-px bg-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-muted focus-visible:outline-none">
                <Avatar className="size-8">
                  <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                  <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium leading-tight">{user?.name}</p>
                  <p className="text-xs leading-tight text-muted-foreground capitalize">
                    {(user as { role?: string })?.role ?? "Student"}
                  </p>
                </div>
                <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex mx-auto w-full max-w-7xl items-center gap-1 px-6">
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href || (href !== "/my-dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </header>
  )
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-background">
      <StudentNav />
      <main className="mx-auto max-w-7xl px-6 py-6">
        {children}
      </main>
    </div>
  )
}

