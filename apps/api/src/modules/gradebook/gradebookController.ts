import { NextFunction, Request, Response } from "express"
import { gradebookService } from "./gradebookService.js"
import { verifyCourseOwnership } from "../../shared/utils/ownership.js"
import { getUserId } from "../../shared/utils/request.js"

export const gradebookController = {
  async getCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, page, limit } = req.query as {
        courseId?: string
        page?: string
        limit?: string
      }
      if (!courseId) return res.status(400).json({ message: "courseId is required" })
      const owned = await verifyCourseOwnership(courseId, getUserId(req))
      if (!owned) return res.status(403).json({ message: "Forbidden" })
      const data = await gradebookService.getCourseGradebook(
        courseId,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 20
      )
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async getMy(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query
      if (!courseId) return res.status(400).json({ message: "courseId is required" })
      const studentId = String((req.authUser as any)?.id)
      const data = await gradebookService.getStudentGradebook(courseId as string, studentId)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query as { courseId?: string }
      if (!courseId) return res.status(400).json({ message: "courseId is required" })
      const owned = await verifyCourseOwnership(courseId, getUserId(req))
      if (!owned) return res.status(403).json({ message: "Forbidden" })

      const data = await gradebookService.getCourseGradebook(courseId, 1, 10000)

      const assessmentHeaders = data.assessments.map((a) => `"${a.title.replace(/"/g, '""')}"`)
      const groupHeaders = data.groups.map((g) => `"${g.name.replace(/"/g, '""')} Subtotal"`)
      const header = ["Student", "Email", ...assessmentHeaders, ...groupHeaders, "Final %", "Grade"].join(",")

      const rows = data.students.map((s) => {
        const scores = data.assessments.map((a) => {
          const entry = s.assessmentScores.find((sc) => sc.assessmentId === String(a._id))
          return entry?.isGraded ? `${entry.earned}/${a.totalPoints}` : ""
        })
        const subtotals = data.groups.map((g) => {
          const summary = s.groupSummaries.find((gs) => gs.groupId === String(g._id))
          return summary?.currentPct !== null && summary?.currentPct !== undefined
            ? `${Math.round(summary.currentPct)}%`
            : ""
        })
        const final = s.finalScore !== null ? `${Math.round(s.finalScore)}%` : ""
        const grade = s.gradeEntry ? `${s.gradeEntry.grade} ${s.gradeEntry.remark}` : ""
        return [
          `"${s.student.name.replace(/"/g, '""')}"`,
          `"${s.student.email.replace(/"/g, '""')}"`,
          ...scores,
          ...subtotals,
          final,
          grade,
        ].join(",")
      })

      const csv = [header, ...rows].join("\n")
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename="gradebook.csv"`)
      res.send(csv)
    } catch (err) {
      next(err)
    }
  },
}
