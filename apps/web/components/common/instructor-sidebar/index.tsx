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
  FileText,
  Home,
  Pencil,
  Settings,
  Users,
} from "lucide-react"

import { usePathname } from "next/navigation"
import { NavMain } from "@/components/common/instructor-sidebar/nav-main"
import { NavFavoritesProjects } from "@/components/common/instructor-sidebar/nav-projects"
import { useSession } from "@/lib/config/auth-client"
import { cn } from "@workspace/ui/lib/utils"
import { getSections, type Section } from "@/lib/services/sections"
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
  useSidebar,
} from "@workspace/ui/components/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/hooks/useAuth"
import { Badge } from "@workspace/ui/components/badge"
import { getTodos, type InstructorTodos } from "@/lib/services/todos"

const instructorNav = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Students", url: "/students", icon: Users },
  { title: "Grades", url: "/grades", icon: ClipboardList },
]

const studentNav = [
  { title: "Dashboard", url: "/my-dashboard", icon: Home },
  { title: "My Courses", url: "/my-courses", icon: BookOpen },
  { title: "Quizzes & Assignments", url: "/my-assessments", icon: ClipboardList },
  { title: "Attendance", url: "/my-attendance", icon: CalendarCheck },
]

const BG_CLASSES = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-teal-500",
]

function IconRailBtn({
  icon: Icon,
  label,
  active,
  href,
  comingSoon,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
  href?: string
  comingSoon?: boolean
}) {
  const Comp = href ? Link : "button"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Comp
          href={href as string}
          className={cn(
            "flex size-10 cursor-pointer items-center justify-center rounded-lg transition-colors",
            comingSoon && "cursor-default opacity-40",
            active
              ? "bg-primary dark:bg-primary/50 text-white dark:text-accent-foreground"
              : !comingSoon && "hover:bg-primary/90 hover:text-white dark:hover:text-foreground"
          )}
        >
          <Icon className="size-5" />
          <span className="sr-only">{label}</span>
        </Comp>
      </TooltipTrigger>
      <TooltipContent side="right">
        {comingSoon ? `${label} — Coming soon` : label}
      </TooltipContent>
    </Tooltip>
  )
}

function PendingSection() {
  const [todos, setTodos] = React.useState<InstructorTodos | null>(null)

  React.useEffect(() => {
    getTodos().then(setTodos).catch(() => {})
  }, [])

  if (!todos) return null
  const { ungradedSubmissions, draftItems, upcomingDueDates, attendanceToTake } = todos
  if (!ungradedSubmissions && !draftItems && !upcomingDueDates && !attendanceToTake) return null

  const items = [
    { icon: Pencil,       label: "Grade submissions", count: ungradedSubmissions, href: "/grades",    show: ungradedSubmissions > 0 },
    { icon: FileText,     label: "Drafts",            count: draftItems,          href: "/courses",   show: draftItems > 0 },
    { icon: Clock,        label: "Due this week",     count: upcomingDueDates,    href: "/courses",   show: upcomingDueDates > 0 },
    { icon: CalendarCheck,label: "Attendance today",  count: attendanceToTake,    href: "/schedules", show: attendanceToTake > 0 },
  ].filter((i) => i.show)

  return (
    <div className="mx-2 border-t border-border px-2 py-3">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Pending
      </p>
      {items.map(({ icon: Icon, label, count, href }) => (
        <Link
          key={label}
          href={href}
          className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
        >
          <span className="flex items-center gap-2 text-muted-foreground">
            <Icon className="size-3.5" />
            {label}
          </span>
          <Badge variant="secondary" className="text-[10px]">{count}</Badge>
        </Link>
      ))}
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { logout } = useAuth()
  const { state } = useSidebar()
  const pathname = usePathname()

  const { data: session } = useSession()
  const user = session?.user

  const [sections, setSections] = React.useState<Section[]>([])

  React.useEffect(() => {
    getSections()
      .then(setSections)
      .catch(() => {})
  }, [])

  const favorites = React.useMemo(
    () =>
      sections.map((section, i) => ({
        name: section.courseId
          ? `${section.courseId.code} - ${section.name}`
          : section.name,
        url: `/sections/${section._id}`,
        bgClass: BG_CLASSES[i % BG_CLASSES.length] ?? "bg-gray-500",
        label: section.name.charAt(0).toUpperCase(),
      })),
    [sections]
  )

  const role = (user as { role?: "student" | "instructor" | "admin" })?.role
  const navMain =
    role === "instructor" || role === "admin" ? instructorNav : studentNav
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??"

  const variant = state === "collapsed" ? "sidebar" : "inset"

  return (
    <Sidebar className="p-0" collapsible="icon" variant={variant} {...props}>
      <div className="flex h-full">
        {/* ── LEFT ICON RAIL ── */}
        <aside className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border py-3">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="mb-3 flex size-9 items-center justify-center rounded-xl bg-primary text-white"
          >
            <Image
              src={"/klasee-icon.png"}
              alt="Klasee Icon"
              width={200}
              height={200}
              unoptimized
            />
          </Link>

          <IconRailBtn icon={Home} label="Dashboard" href="/dashboard" active={pathname === "/dashboard"} />
          <IconRailBtn icon={ChartNoAxesCombined} label="Analytics" comingSoon />
          <IconRailBtn icon={CalendarCheck} label="Attendance" href="/schedules" active={pathname.startsWith("/schedules")} />

          <div className="my-1.5 w-6 border-t border-border" />

          <IconRailBtn icon={Clock} label="Recents" comingSoon />
          <IconRailBtn icon={Archive} label="Archived" comingSoon />

          <div className="flex-1" />

          {/* Bottom action buttons */}
          <div className="flex flex-col items-center gap-2 pb-1">
            <IconRailBtn icon={BarChart2} label="Reports" comingSoon />
            <IconRailBtn icon={Settings} label="Settings" href="/settings" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex size-9 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
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
              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={8}
                className="w-56"
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-start gap-2 px-1 py-1.5">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage
                        src={user?.image ?? ""}
                        alt={user?.name ?? ""}
                      />
                      <AvatarFallback className="rounded-lg text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user?.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                      <Badge className="mt-2 rounded-sm text-xs capitalize">
                        {user?.role}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
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
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <div className="grid flex-1 text-left text-lg leading-tight">
                      <span className="truncate font-bold text-accent-foreground">
                        Klasee LMS
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <NavMain items={navMain} />
            <NavFavoritesProjects favorites={favorites} />
            {(role === "instructor" || role === "admin") && <PendingSection />}
          </SidebarContent>
        </div>
      </div>
    </Sidebar>
  )
}
