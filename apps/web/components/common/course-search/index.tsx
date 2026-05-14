"use client"

import { Search, ArrowUpDown } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import { Label } from "@workspace/ui/components/label"

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "newest"
  | "oldest"
  | "semester"

interface CourseSearchProps {
  search: string
  onSearchChange: (value: string) => void
  sort: SortOption
  onSortChange: (value: SortOption) => void
  showArchived: boolean
  onToggleArchived: (value: boolean) => void
}

export function CourseSearch({
  search,
  onSearchChange,
  sort,
  onSortChange,
  showArchived,
  onToggleArchived,
}: CourseSearchProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
        <SelectTrigger>
          <ArrowUpDown className="mr-2 size-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name-asc">Name A-Z</SelectItem>
          <SelectItem value="name-desc">Name Z-A</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="semester">Semester</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Switch id="show-archived" checked={showArchived} onCheckedChange={onToggleArchived} />
        <Label htmlFor="show-archived" className="cursor-pointer text-sm text-muted-foreground">
          Show archived
        </Label>
      </div>
    </div>
  )
}
