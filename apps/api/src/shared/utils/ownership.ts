import { Assessment } from "../../models/assessmentModel.js"
import { Course } from "../../models/courseModel.js"

export async function verifyCourseOwnership(
  courseId: string,
  requesterId: string
): Promise<boolean> {
  const course = await Course.findById(courseId).lean()
  return !!course && String(course.instructorId) === requesterId
}

export async function verifyAssessmentOwnership(
  assessmentId: string,
  requesterId: string
): Promise<boolean> {
  const assessment = await Assessment.findById(assessmentId).lean()
  if (!assessment) return false
  const course = await Course.findById(assessment.courseId).lean()
  return !!course && String(course.instructorId) === requesterId
}
