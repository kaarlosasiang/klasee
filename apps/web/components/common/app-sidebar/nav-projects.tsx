"use client"

import { useState } from "react"
import { ChevronDown, Plus } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

type FavoriteItem = {
  name: string
  url: string
  bgClass: string
  label: string
}

type ProjectItem = {
  name: string
  url: string
  dotClass: string
  isActive?: boolean
}

export function NavFavoritesProjects({
  favorites,
  projects,
}: {
  favorites: FavoriteItem[]
  projects: ProjectItem[]
}) {
  const [favOpen, setFavOpen] = useState(true)

  return (
    <>
      {/* Favorites */}
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between px-2 py-1">
          <SidebarGroupLabel className="p-0 text-xs font-semibold text-foreground/70">
            Favorites
          </SidebarGroupLabel>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{favorites.length}</span>
            <button
              onClick={() => setFavOpen(!favOpen)}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDown
                className={`size-3.5 transition-transform duration-200 ${favOpen ? "" : "-rotate-90"}`}
              />
            </button>
          </div>
        </div>
        {favOpen && (
          <SidebarMenu>
            {favorites.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold text-white ${item.bgClass}`}
                    >
                      {item.label}
                    </span>
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarGroup>

      {/* Projects */}
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between px-2 py-1">
          <SidebarGroupLabel className="p-0 text-xs font-semibold text-foreground/70">
            Projects
          </SidebarGroupLabel>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{projects.length}</span>
            <button className="text-muted-foreground transition-colors hover:text-foreground">
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
        <SidebarMenu>
          {projects.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={item.isActive}>
                <a href={item.url}>
                  <span className={`size-2 shrink-0 rounded-full ${item.dotClass}`} />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}
