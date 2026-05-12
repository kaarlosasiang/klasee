"use client"

import { LayoutGrid, List } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface ViewToggleProps {
  value: "grid" | "table"
  onChange: (view: "grid" | "table") => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
      <Button
        variant={value === "grid" ? "default" : "ghost"}
        size="icon"
        className="size-8"
        onClick={() => onChange("grid")}
      >
        <LayoutGrid className="size-4" />
      </Button>
      <Button
        variant={value === "table" ? "default" : "ghost"}
        size="icon"
        className="size-8"
        onClick={() => onChange("table")}
      >
        <List className="size-4" />
      </Button>
    </div>
  )
}
