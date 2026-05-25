import { DueDateOverride } from "../../models/dueDateOverrideModel.js"
import { Enrollment } from "../../models/enrollmentModel.js"

export async function getEffectiveDueDate(
  assessmentId: string,
  studentId: string,
  courseId: string,
  baseDueDate: Date | undefined
): Promise<Date | undefined> {
  const [studentOverride, enrollment] = await Promise.all([
    DueDateOverride.findOne({ assessmentId, type: "student", targetId: studentId }).lean(),
    Enrollment.findOne({ studentId, courseId, status: "active" }).lean(),
  ])

  if (studentOverride) return studentOverride.dueDate

  if (enrollment) {
    const sectionOverride = await DueDateOverride.findOne({
      assessmentId,
      type: "section",
      targetId: enrollment.sectionId,
    }).lean()
    if (sectionOverride) return sectionOverride.dueDate
  }

  return baseDueDate
}
