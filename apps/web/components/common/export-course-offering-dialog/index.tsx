"use client"

import * as React from "react"
import { Printer, Loader2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { type Course } from "@/lib/services/courses"

interface ExportCourseOfferingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: Course[]
}

const SEMESTERS = ["1st", "2nd", "summer"]

export function ExportCourseOfferingDialog({
  open,
  onOpenChange,
  courses,
}: ExportCourseOfferingDialogProps) {
  const [academicYear, setAcademicYear] = React.useState("2025-2026")
  const [semester, setSemester] = React.useState(SEMESTERS[0]!)
  const [college, setCollege] = React.useState("")
  const [program, setProgram] = React.useState("")
  const [programHead, setProgramHead] = React.useState("")
  const [deanDirector, setDeanDirector] = React.useState("")
  const [vpaa, setVpaa] = React.useState("")
  const [generating, setGenerating] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setGenerating(false)
    }
  }, [open])

  function handlePrint() {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      onOpenChange(false)
      setTimeout(() => window.print(), 300)
    }, 300)
  }

  const allFilled = programHead.trim() && deanDirector.trim() && vpaa.trim()

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Export Course Offering</DialogTitle>
            <DialogDescription>
              FM-DOrSU-ODI-01 &mdash; Generate the official Course Offering document.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Academic Year
                </label>
                <Input
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2025-2026"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Semester
                </label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((sem) => (
                      <SelectItem key={sem} value={sem}>
                        {sem === "1st" ? "1st Semester" : sem === "2nd" ? "2nd Semester" : "Summer"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  College / Institute
                </label>
                <Input
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. College of Engineering"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Program
                </label>
                <Input
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="e.g. BS Information Technology"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Assignatory / Signatories
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Program Head
                  </label>
                  <Input
                    value={programHead}
                    onChange={(e) => setProgramHead(e.target.value)}
                    placeholder="e.g. Dr. Juan Dela Cruz"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Dean / Director
                  </label>
                  <Input
                    value={deanDirector}
                    onChange={(e) => setDeanDirector(e.target.value)}
                    placeholder="e.g. Dr. Maria Santos"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    VPAA
                  </label>
                  <Input
                    value={vpaa}
                    onChange={(e) => setVpaa(e.target.value)}
                    placeholder="e.g. Dr. Pedro Reyes"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrint} disabled={!allFilled || generating}>
              {generating ? (
                <><Loader2 className="mr-2 size-4 animate-spin" />Preparing...</>
              ) : (
                <><Printer className="mr-2 size-4" />Generate PDF</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Printable document */}
      <div className="hidden print:block">
        <div className="mx-auto max-w-4xl p-6 text-xs">
          {/* Header */}
          <div className="mb-6 text-center">
            <p className="text-lg font-bold uppercase tracking-wide">
              Davao del Sur State College
            </p>
            <p className="text-sm font-semibold">
              {college || "College/Institute"}
            </p>
            <p className="text-xs text-muted-foreground">
              {program || "Program"} &middot; {semester === "1st" ? "1st" : semester === "2nd" ? "2nd" : ""} Semester
              {semester !== "summer" ? `, AY ${academicYear}` : `, Summer, AY ${academicYear}`}
            </p>
            <div className="mx-auto mt-2 h-0.5 w-24 bg-primary" />
            <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Course Offering &mdash; FM-DOrSU-ODI-01
            </p>
          </div>

          {/* Course table */}
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-2 py-1.5 text-left font-medium">#</th>
                <th className="border border-border px-2 py-1.5 text-left font-medium">Course Code</th>
                <th className="border border-border px-2 py-1.5 text-left font-medium">Course Title</th>
                <th className="border border-border px-2 py-1.5 text-center font-medium">Semester</th>
                <th className="border border-border px-2 py-1.5 text-center font-medium">Sections</th>
                <th className="border border-border px-2 py-1.5 text-center font-medium">Students</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-border px-2 py-4 text-center text-muted-foreground">
                    No courses to display
                  </td>
                </tr>
              ) : (
                courses.map((course, i) => (
                  <tr key={course._id}>
                    <td className="border border-border px-2 py-1 text-center">{i + 1}</td>
                    <td className="border border-border px-2 py-1 font-medium">{course.code}</td>
                    <td className="border border-border px-2 py-1">{course.name}</td>
                    <td className="border border-border px-2 py-1 text-center capitalize">
                      {course.semester === "1st" ? "1st" : course.semester === "2nd" ? "2nd" : "Sum"}
                    </td>
                    <td className="border border-border px-2 py-1 text-center">{course.sectionCount}</td>
                    <td className="border border-border px-2 py-1 text-center">{course.enrolledCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Footer info */}
          <div className="mt-4 text-[10px] text-muted-foreground">
            <p>Total number of courses offered: <strong>{courses.length}</strong></p>
          </div>

          {/* Assignatory Section */}
          <div className="mt-16 grid grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mb-1 border-b border-black pb-1 text-sm font-semibold">
                {programHead}
              </div>
              <p className="text-[10px] text-muted-foreground">Program Head</p>
            </div>
            <div className="text-center">
              <div className="mb-1 border-b border-black pb-1 text-sm font-semibold">
                {deanDirector}
              </div>
              <p className="text-[10px] text-muted-foreground">Dean / Director</p>
            </div>
            <div className="text-center">
              <div className="mb-1 border-b border-black pb-1 text-sm font-semibold">
                {vpaa}
              </div>
              <p className="text-[10px] text-muted-foreground">VPAA</p>
            </div>
          </div>

          <div className="mt-12 text-center text-[9px] text-muted-foreground/60">
            <p>FM-DOrSU-ODI-01 &middot; Document is system-generated. No signature required when viewed electronically.</p>
          </div>
        </div>
      </div>
    </>
  )
}
