import mongoose from "mongoose"
import { Course } from "../../models/courseModel.js"
import { CourseAudit } from "../../models/courseAuditModel.js"
import "../../models/userModel.js" // ensure User schema is registered for populate

interface CourseQueryParams {
  search?: string
  sort?: "name-asc" | "name-desc" | "newest" | "oldest" | "semester"
  page?: number
  limit?: number
  semester?: string
}

export const courseService = {
  async findAll(
    filter: Record<string, unknown> = {},
    query: CourseQueryParams = {}
  ) {
    const { search, sort, page = 1, limit = 20, semester } = query

    const matchFilter: Record<string, unknown> = {
      ...Object.fromEntries(
        Object.entries(filter).map(([key, value]) => [
          key,
          typeof value === "string" && /^[a-f\d]{24}$/i.test(value)
            ? new mongoose.Types.ObjectId(value)
            : value,
        ])
      ),
      isArchived: { $ne: true },
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      matchFilter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { code: { $regex: escaped, $options: "i" } },
      ]
    }

    if (semester) {
      matchFilter.semester = semester
    }

    const sortStage: Record<string, 1 | -1> = (
      sort === "name-asc" ? { name: 1 }
      : sort === "name-desc" ? { name: -1 }
      : sort === "oldest" ? { createdAt: 1 }
      : sort === "semester" ? { semester: 1 }
      : { createdAt: -1 }
    ) as Record<string, 1 | -1>

    const skip = (page - 1) * limit

    const [result] = await Course.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: "sections",
          localField: "_id",
          foreignField: "courseId",
          as: "sections",
        },
      },
      {
        $lookup: {
          from: "enrollments",
          localField: "sections._id",
          foreignField: "sectionId",
          as: "enrollments",
        },
      },
      {
        $lookup: {
          from: "assessments",
          localField: "_id",
          foreignField: "courseId",
          as: "assessments",
        },
      },
      {
        $addFields: {
          sectionCount: { $size: "$sections" },
          enrolledCount: { $size: "$enrollments" },
          assessmentCount: { $size: "$assessments" },
          lastActivity: {
            $max: {
              $map: { input: "$enrollments", as: "e", in: "$$e.updatedAt" },
            },
          },
        },
      },
      { $project: { sections: 0, enrollments: 0, assessments: 0 } },
      { $sort: sortStage },
      {
        $facet: {
          courses: [{ $skip: skip }, { $limit: limit }],
          metadata: [{ $count: "total" }],
        },
      },
    ])

    const total = result.metadata[0]?.total ?? 0

    return {
      courses: result.courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async findById(id: string) {
    const result = await Course.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "sections",
          localField: "_id",
          foreignField: "courseId",
          as: "sections",
        },
      },
      {
        $lookup: {
          from: "enrollments",
          localField: "sections._id",
          foreignField: "sectionId",
          as: "enrollments",
        },
      },
      {
        $lookup: {
          from: "assessments",
          localField: "_id",
          foreignField: "courseId",
          as: "assessments",
        },
      },
      {
        $addFields: {
          sectionCount: { $size: "$sections" },
          enrolledCount: { $size: "$enrollments" },
          assessmentCount: { $size: "$assessments" },
          lastActivity: {
            $max: {
              $map: { input: "$enrollments", as: "e", in: "$$e.updatedAt" },
            },
          },
        },
      },
      { $project: { sections: 0, enrollments: 0, assessments: 0 } },
    ])
    return result[0] ?? null
  },

  async create(data: {
    instructorId: string
    name: string
    code: string
    description?: string
    semester: string
    syllabus?: string
  }) {
    const course = await Course.create(data)
    logAudit({
      courseId: String(course._id),
      userId: data.instructorId,
      action: "created",
    })
    return course
  },

  async update(
    id: string,
    data: Partial<{
      name: string
      code: string
      description: string
      semester: string
      cover: string
      icon: string
      syllabus: string
      gradeBase: "50" | "75"
    }>,
    userId: string
  ) {
    const old = await Course.findById(id).lean()
    const updated = await Course.findByIdAndUpdate(id, data, { new: true }).lean()

    if (old && updated) {
      const changes: Record<string, { old: unknown; new: unknown }> = {}
      for (const key of Object.keys(data) as (keyof typeof data)[]) {
        if (data[key] !== undefined && old[key] !== updated[key]) {
          changes[key] = { old: old[key], new: updated[key] }
        }
      }
      if (Object.keys(changes).length > 0) {
        logAudit({ courseId: id, userId, action: "updated", changes })
      }
    }

    return updated
  },

  async delete(id: string, userId: string) {
    logAudit({ courseId: id, userId, action: "deleted" })

    const { Section } = await import("../../models/sectionModel.js")
    const { Module } = await import("../../models/moduleModel.js")
    const { Lesson } = await import("../../models/lessonModel.js")
    const { Assessment } = await import("../../models/assessmentModel.js")
    const { Question } = await import("../../models/questionModel.js")
    const { AssessmentScore } = await import("../../models/assessmentScore.js")
    const { QuizAttempt } = await import("../../models/quizAttemptModel.js")
    const { Enrollment } = await import("../../models/enrollmentModel.js")
    const { Announcement } = await import("../../models/announcementModel.js")
    const { CourseFile } = await import("../../models/courseFileModel.js")

    const [modules, assessments, sections] = await Promise.all([
      Module.find({ courseId: id }).lean(),
      Assessment.find({ courseId: id }).lean(),
      Section.find({ courseId: id }).lean(),
    ])

    const moduleIds = modules.map((m) => m._id)
    const assessmentIds = assessments.map((a) => a._id)
    const sectionIds = sections.map((s) => s._id)

    await Promise.all([
      Lesson.deleteMany({ moduleId: { $in: moduleIds } }),
      Module.deleteMany({ courseId: id }),
      Question.deleteMany({ assessmentId: { $in: assessmentIds } }),
      QuizAttempt.deleteMany({ assessmentId: { $in: assessmentIds } }),
      AssessmentScore.deleteMany({ assessmentId: { $in: assessmentIds } }),
      Assessment.deleteMany({ courseId: id }),
      Enrollment.deleteMany({ sectionId: { $in: sectionIds } }),
      Section.deleteMany({ courseId: id }),
      Announcement.deleteMany({ courseId: id }),
      CourseFile.deleteMany({ courseId: id }),
    ])

    return Course.findByIdAndDelete(id)
  },

  async findArchived(instructorId: string) {
    return Course.find({ instructorId, isArchived: true })
      .sort({ updatedAt: -1 })
      .lean()
  },
  async archive(id: string, userId: string) {
    const course = await Course.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true }
    ).lean()
    if (course) {
      logAudit({ courseId: id, userId, action: "archived" })
    }
    return course
  },
  async unarchive(id: string, userId: string) {
    const course = await Course.findByIdAndUpdate(
      id,
      { isArchived: false },
      { new: true }
    ).lean()
    if (course) {
      logAudit({ courseId: id, userId, action: "unarchived" })
    }
    return course
  },

  async getAuditLogs(courseId: string, limit = 20) {
    return CourseAudit.find({ courseId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  },

  async bulkArchive(courseIds: string[], instructorId: string) {
    const result = await Course.updateMany(
      { _id: { $in: courseIds }, instructorId },
      { isArchived: true }
    )
    for (const id of courseIds) {
      logAudit({ courseId: id, userId: instructorId, action: "archived" })
    }
    return result.modifiedCount
  },

  async bulkDelete(courseIds: string[], instructorId: string) {
    const owned = await Course.find(
      { _id: { $in: courseIds }, instructorId },
      "_id"
    ).lean()
    const ownedIds = owned.map((c) => String(c._id))

    let deleted = 0
    for (const id of ownedIds) {
      try {
        await this.delete(id, instructorId)
        deleted++
      } catch {
        // continue with next
      }
    }

    return deleted
  },

}

function logAudit(entry: {
  courseId: string
  userId: string
  action: string
  changes?: Record<string, unknown>
}) {
  CourseAudit.create(entry).catch(() => {
    // audit failure should never break the main flow
  })
}
