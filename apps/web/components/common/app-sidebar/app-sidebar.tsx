"use client"

import * as React from "react"
import {
  Archive,
  BarChart2,
  ChartNoAxesCombined,
  Clock,
  GraduationCap,
  Home,
  LayoutTemplate,
  Plus,
  Search,
  Settings,
  Share2,
  Users,
  Zap,
} from "lucide-react"

import { NavMain } from "@/components/common/app-sidebar/nav-main"
import { NavFavoritesProjects } from "@/components/common/app-sidebar/nav-projects"
import { NavUser } from "@/components/common/app-sidebar/nav-user"
import { cn } from "@workspace/ui/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Recents", url: "#", icon: Clock },
    { title: "Shared Content", url: "#", icon: Share2 },
    { title: "Archived", url: "#", icon: Archive },
    { title: "Templates", url: "#", icon: LayoutTemplate },
  ],
  favorites: [
    {
      name: "Figma Basic",
      url: "#",
      bgClass: "bg-linear-to-br from-blue-500 to-purple-600",
      label: "Fb",
    },
    {
      name: "Folder NEW 2024",
      url: "#",
      bgClass: "bg-emerald-500",
      label: "F",
    },
    {
      name: "Assignment 101",
      url: "#",
      bgClass: "bg-blue-500",
      label: "A",
    },
    {
      name: "Quiz Figma",
      url: "#",
      bgClass: "bg-orange-400",
      label: "Q",
    },
  ],
  projects: [
    {
      name: "Figma basic",
      url: "#",
      dotClass: "bg-violet-500",
      isActive: false,
    },
    {
      name: "Fikri studio",
      url: "#",
      dotClass: "bg-pink-400",
      isActive: true,
    },
  ],
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
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="flex h-full">
        {/* ── LEFT ICON RAIL ── */}
        <aside className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border py-3">
          {/* Logo */}
          <a
            href="#"
            className="mb-3 flex size-9 items-center justify-center rounded-xl bg-primary text-white"
          >
            <GraduationCap className="size-5" />
          </a>

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

            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex size-9 items-center justify-center rounded-xl bg-rose-400 text-xs font-bold text-white transition-colors hover:bg-rose-500">
                  RF
                  <span className="sr-only">Profile</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>
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
            <NavMain items={data.navMain} />
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
