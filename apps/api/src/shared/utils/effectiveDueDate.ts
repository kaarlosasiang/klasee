import { DueDateOverride } from "../../models/dueDateOverrideModel.js"
import { Enrollment } from "../../models/enrollmentModel.js"

export async function getEffectiveDueDate(
  assessmentId: string,
  studentId: string,
  courseId: string,
  baseDueDate: Date | undefined
): Promise<Date | undefined> {
  const [overrides, enrollment] = await Promise.all([
    DueDateOverride.find({ assessmentId }).lean(),
    Enrollment.findOne({ studentId, courseId, status: "active" }).lean(),
  ])

  const studentOverride = overrides.find(
    (o) => o.type === "student" && String(o.targetId) === studentId
  )
  if (studentOverride) return studentOverride.dueDate

  if (enrollment) {
    const sectionOverride = overrides.find(
      (o) => o.type === "section" && String(o.targetId) === String(enrollment.sectionId)
    )
    if (sectionOverride) return sectionOverride.dueDate
  }

  return baseDueDate
}
