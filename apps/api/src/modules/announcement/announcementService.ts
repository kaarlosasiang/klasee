import { Announcement } from "../../models/announcementModel.js"
import { Enrollment } from "../../models/enrollmentModel.js"

export const announcementService = {
  async findByCourse(courseId: string, studentId?: string) {
    const filter: Record<string, unknown> = { courseId }

    if (studentId) {
      const enrollments = await Enrollment.find({
        studentId,
        courseId,
        status: "active",
      }).lean()
      const studentSectionIds = enrollments.map((e) => e.sectionId)
      filter.$or = [
        { sectionIds: { $size: 0 } },
        { sectionIds: { $exists: false } },
        { sectionIds: { $in: studentSectionIds } },
      ]
    }

    return Announcement.find(filter)
      .populate("authorId", "name email")
      .sort({ isPinned: -1, createdAt: -1 })
      .lean()
  },

  async findById(id: string) {
    return Announcement.findById(id)
      .populate("authorId", "name email")
      .lean()
  },

  async create(data: {
    courseId: string
    authorId: string
    title: string
    content: string
    isPinned?: boolean
    sectionIds?: string[]
  }) {
    return Announcement.create(data)
  },

  async update(
    id: string,
    data: Partial<{ title: string; content: string; isPinned: boolean; sectionIds: string[] }>
  ) {
    return Announcement.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async delete(id: string) {
    return Announcement.findByIdAndDelete(id)
  },
}
