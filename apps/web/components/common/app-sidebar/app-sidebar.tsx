"use client"

import * as React from "react"
import {
  Archive,
  BarChart2,
  BookOpen,
  CalendarCheck,
  ChartNoAxesCombined,
  ClipboardList,
  Clock,
  GraduationCap,
  Home,
  Layers,
  Search,
  Settings,
  Users,
} from "lucide-react"

import { useRouter } from "next/navigation"
import { NavMain } from "@/components/common/app-sidebar/nav-main"
import { NavFavoritesProjects } from "@/components/common/app-sidebar/nav-projects"
import { useSession, signOut } from "@/lib/config/auth-client"
import { cn } from "@workspace/ui/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import Link from "next/link"

const instructorNav = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Sections", url: "/sections", icon: Layers },
  { title: "Students", url: "/students", icon: Users },
  { title: "Assessments", url: "/assessments", icon: ClipboardList },
  { title: "Attendance", url: "/attendance", icon: CalendarCheck },
]

const studentNav = [
  { title: "Dashboard", url: "/my-dashboard", icon: Home },
  { title: "My Courses", url: "/my-courses", icon: BookOpen },
  { title: "Assessments", url: "/my-assessments", icon: ClipboardList },
  { title: "Attendance", url: "/my-attendance", icon: CalendarCheck },
]

const data = {
  favorites: [] as { name: string; url: string; bgClass: string; label: string }[],
  projects: [] as { name: string; url: string; dotClass: string; isActive: boolean }[],
}

function IconRailBtn({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            "flex size-10 items-center justify-center rounded-lg transition-colors",
            active
              ? "bg-accent text-accent-foreground"
              : "text-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Icon className="size-5" />
          <span className="sr-only">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user
  const role = (user as { role?: "student" | "instructor" | "admin" })?.role
  const navMain = role === "instructor" || role === "admin" ? instructorNav : studentNav
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??"

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="flex h-full">
        {/* ── LEFT ICON RAIL ── */}
        <aside className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border py-3">
          {/* Logo */}
          <Link
            href="#"
            className="mb-3 flex size-9 items-center justify-center rounded-xl bg-primary text-white"
          >
            <GraduationCap className="size-5" />
          </Link>

          <IconRailBtn icon={Home} label="Dashboard" active />
          <IconRailBtn icon={Search} label="Search" />
          <IconRailBtn icon={ChartNoAxesCombined} label="Analytics" />
          <IconRailBtn icon={Users} label="Students" />

          <div className="my-1.5 w-6 border-t border-border" />

          <IconRailBtn icon={Clock} label="Recents" />
          <IconRailBtn icon={Archive} label="Archived" />

          <div className="flex-1" />

          {/* Bottom action buttons */}
          <div className="flex flex-col items-center gap-2 pb-1">
            <IconRailBtn icon={BarChart2} label="Reports" />
            <IconRailBtn icon={Settings} label="Settings" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex size-9 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="size-9">
                    <AvatarImage
                      src={user?.image ?? ""}
                      alt={user?.name ?? "Profile"}
                    />
                    <AvatarFallback className="rounded-full text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Profile</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" sideOffset={8} className="w-56">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                      <AvatarFallback className="rounded-lg text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user?.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>Account</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* ── RIGHT CONTENT PANEL ── */}
        <div className="flex flex-1 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <a href="#">
                    <div className="grid flex-1 text-left text-lg leading-tight">
                      <span className="truncate font-bold">
                        Learning Content
                      </span>
                    </div>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <NavMain items={navMain} />
            <NavFavoritesProjects
              favorites={data.favorites}
              projects={data.projects}
            />
          </SidebarContent>
        </div>
      </div>
    </Sidebar>
  )
}
