import { z } from "zod"

export const attendanceStatus = z.enum(["present", "absent", "late", "excused"])

export const createAttendanceSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  sectionId: z.string().min(1, "sectionId is required"),
  studentId: z.string().min(1, "studentId is required"),
  date: z.string().min(1, "date is required"),
  status: attendanceStatus,
  note: z.string().max(500).optional(),
})

export const updateAttendanceSchema = z.object({
  status: attendanceStatus,
  note: z.string().max(500).optional(),
})

export const bulkAttendanceSchema = z.object({
  records: z.array(createAttendanceSchema).min(1, "At least one record is required"),
})
