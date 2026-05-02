import { Enrollment } from "../../models/enrollmentModel.js"
import { Section } from "../../models/sectionModel.js"
import { sectionService } from "../section/sectionService.js"

export const enrollmentService = {
  async findAll(filter: Record<string, unknown> = {}) {
    return Enrollment.find(filter)
      .populate("studentId", "name email")
      .populate("sectionId", "name schedule room")
      .populate("courseId", "name code cover semester")
      .lean()
  },

  async countBySection(sectionId: string) {
    return Enrollment.countDocuments({ sectionId, status: "active" })
  },

  async create(data: {
    studentId: string
    sectionId: string
    courseId: string
  }) {
    // Check section capacity
    const section = await Section.findById(data.sectionId).lean()
    if (!section) throw Object.assign(new Error("Section not found"), { status: 404 })

    const enrolled = await Enrollment.countDocuments({ sectionId: data.sectionId, status: "active" })
    if (enrolled >= section.maxStudents) {
      throw Object.assign(new Error("Section is full"), { status: 409 })
    }

    return Enrollment.create(data)
  },

  async joinByCode(code: string, studentId: string) {
    const section = await sectionService.findByJoinCode(code)
    if (!section) throw Object.assign(new Error("Invalid join code"), { status: 404 })

    const courseId = typeof section.courseId === "object"
      ? String((section.courseId as any)._id)
      : String(section.courseId)

    // Check capacity
    const enrolled = await Enrollment.countDocuments({ sectionId: section._id, status: "active" })
    if (enrolled >= section.maxStudents) {
      throw Object.assign(new Error("This section is full"), { status: 409 })
    }

    // Create (duplicate will throw 11000 which the controller catches)
    const enrollment = await Enrollment.create({
      studentId,
      sectionId: section._id,
      courseId,
    })

    // Return with populated data for immediate UI use
    return Enrollment.findById(enrollment._id)
      .populate("sectionId", "name schedule room")
      .populate("courseId", "name code cover semester")
      .lean()
  },

  async update(id: string, data: Partial<{ status: string }>) {
    return Enrollment.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async drop(id: string, studentId: string) {
    const enrollment = await Enrollment.findById(id).lean()
    if (!enrollment) throw Object.assign(new Error("Enrollment not found"), { status: 404 })
    if (String(enrollment.studentId) !== studentId) {
      throw Object.assign(new Error("Forbidden"), { status: 403 })
    }
    return Enrollment.findByIdAndUpdate(id, { status: "dropped" }, { new: true }).lean()
  },
}
