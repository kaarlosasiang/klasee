import { Attendance } from "../../models/attendanceModel.js"

export const attendanceService = {
  async findAll(filter: Record<string, unknown> = {}) {
    return Attendance.find(filter)
      .populate("studentId", "name email")
      .lean()
  },

  async findById(id: string) {
    return Attendance.findById(id).lean()
  },

  async findByStudent(studentId: string, filter: Record<string, unknown> = {}) {
    return Attendance.find({ ...filter, studentId })
      .populate("studentId", "name email")
      .populate("sectionId", "name courseId")
      .sort({ date: -1 })
      .lean()
  },

  async create(data: {
    courseId: string
    sectionId: string
    studentId: string
    date: string
    status: "present" | "absent" | "late" | "excused"
    note?: string
  }) {
    return Attendance.create(data)
  },

  async upsert(
    studentId: string,
    sectionId: string,
    courseId: string,
    date: string,
    status: "present" | "absent" | "late" | "excused",
    note?: string
  ) {
    return Attendance.findOneAndUpdate(
      { studentId, sectionId, date },
      { studentId, sectionId, courseId, date, status, ...(note !== undefined ? { note } : {}) },
      { upsert: true, new: true, runValidators: true }
    ).lean()
  },

  async update(
    id: string,
    data: Partial<{ status: "present" | "absent" | "late" | "excused"; note?: string }>
  ) {
    return Attendance.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean()
  },

  async delete(id: string) {
    return Attendance.findByIdAndDelete(id)
  },
}
