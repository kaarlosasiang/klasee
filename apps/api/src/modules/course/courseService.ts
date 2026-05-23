import mongoose from "mongoose"
import { Course } from "../../models/courseModel.js"
import "../../models/userModel.js" // ensure User schema is registered for populate

export const courseService = {
  async findAll(filter: Record<string, unknown> = {}) {
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
    return Course.aggregate([
      { $match: matchFilter },
      // Match archived courses too if filter explicitly asks
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
      { $sort: { createdAt: -1 } },
    ])
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
    return Course.create(data)
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
    }>
  ) {
    return Course.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async delete(id: string) {
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
  async archive(id: string) {
    return Course.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true }
    ).lean()
  },
  async unarchive(id: string) {
    return Course.findByIdAndUpdate(
      id,
      { isArchived: false },
      { new: true }
    ).lean()
  },

  async duplicate(id: string) {
    const source = await Course.findById(id).lean()
    if (!source) return null

    const { Section } = await import("../../models/sectionModel.js")
    const { Module } = await import("../../models/moduleModel.js")
    const { Lesson } = await import("../../models/lessonModel.js")
    const { Assessment } = await import("../../models/assessmentModel.js")
    const { Question } = await import("../../models/questionModel.js")

    const newCourse = await Course.create({
      instructorId: source.instructorId,
      name: `${source.name} (Copy)`,
      code: `${source.code}-copy`,
      description: source.description,
      semester: source.semester,
      cover: source.cover,
      icon: source.icon,
      syllabus: source.syllabus,
    })

    const newCourseId = newCourse._id

    const [sourceSections, sourceModules, sourceAssessments] = await Promise.all([
      Section.find({ courseId: id }).lean(),
      Module.find({ courseId: id }).lean(),
      Assessment.find({ courseId: id }).lean(),
    ])

    // Clone sections (without join codes or enrollments)
    if (sourceSections.length > 0) {
      await Section.insertMany(
        sourceSections.map((s) => ({
          courseId: newCourseId,
          instructorId: s.instructorId,
          name: s.name,
          schedule: s.schedule,
          room: s.room,
          maxStudents: s.maxStudents,
        }))
      )
    }

    // Clone modules + their lessons
    if (sourceModules.length > 0) {
      for (const mod of sourceModules) {
        const newMod = await Module.create({
          courseId: newCourseId,
          title: mod.title,
          description: mod.description,
          order: mod.order,
          isPublished: false,
        })
        const lessons = await Lesson.find({ moduleId: mod._id }).lean()
        if (lessons.length > 0) {
          await Lesson.insertMany(
            lessons.map((l) => ({
              moduleId: newMod._id,
              title: l.title,
              content: l.content,
              type: l.type,
              order: l.order,
              fileId: l.fileId,
              isPublished: false,
            }))
          )
        }
      }
    }

    // Clone assessments + their questions
    if (sourceAssessments.length > 0) {
      for (const assessment of sourceAssessments) {
        const newAssessment = await Assessment.create({
          courseId: newCourseId,
          title: assessment.title,
          type: assessment.type,
          totalPoints: assessment.totalPoints,
          dueDate: assessment.dueDate,
          isPublished: false,
          timeLimit: assessment.timeLimit,
          randomizeQuestions: assessment.randomizeQuestions,
          instructions: assessment.instructions,
          allowedFileTypes: assessment.allowedFileTypes,
          maxFiles: assessment.maxFiles,
        })
        const questions = await Question.find({ assessmentId: assessment._id }).lean()
        if (questions.length > 0) {
          await Question.insertMany(
            questions.map((q) => ({
              assessmentId: newAssessment._id,
              type: q.type,
              question: q.question,
              points: q.points,
              order: q.order,
              options: q.options,
              correctAnswer: q.correctAnswer,
            }))
          )
        }
      }
    }

    return newCourse
  },
}
