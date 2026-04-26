import { Attendance } from "../../models/attendanceModel.js"

export const attendanceService = {
  async findAll(filter: Record<string, unknown> = {}) {
    return Attendance.find(filter)
      .populate("studentId", "name email")
      .lean()
  },

  async create(data: {
    courseId: string
    sectionId: string
    studentId: string
    date: string
    status: "present" | "absent" | "late"
  }) {
    return Attendance.create(data)
  },

  async update(id: string, data: Partial<{ status: string }>) {
    return Attendance.findByIdAndUpdate(id, data, { new: true }).lean()
  },
}
