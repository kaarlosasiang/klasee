import { Course } from "../../models/courseModel.js"
import { Assessment } from "../../models/assessmentModel.js"
import { AssignmentSubmission } from "../../models/assignmentSubmissionModel.js"
import { Section } from "../../models/sectionModel.js"
import { Attendance } from "../../models/attendanceModel.js"

const DAY_ABBRS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export async function getInstructorTodos(instructorId: string) {
  const courses = await Course.find(
    { instructorId, isArchived: { $ne: true } },
    "_id isPublished"
  )
  const courseIds = courses.map((c) => c._id)

  const [assessments, sections] = await Promise.all([
    Assessment.find({ courseId: { $in: courseIds } }, "_id isPublished dueDate"),
    Section.find({ instructorId }, "_id schedule"),
  ])

  const assessmentIds = assessments.map((a) => a._id)

  const ungradedSubmissions = await AssignmentSubmission.countDocuments({
    assessmentId: { $in: assessmentIds },
    gradedAt: null,
  })

  const draftCourses = courses.filter((c) => c.isPublished === false).length
  const draftAssessments = assessments.filter((a) => !a.isPublished).length
  const draftItems = draftCourses + draftAssessments

  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingDueDates = assessments.filter(
    (a) => a.isPublished && a.dueDate && a.dueDate >= now && a.dueDate <= in7Days
  ).length

  const todayAbbr = DAY_ABBRS[now.getDay()]!
  const todayStr = now.toISOString().split("T")[0]!

  const sectionsToday = sections.filter((s) => s.schedule?.includes(todayAbbr))
  const attendanceCounts = await Promise.all(
    sectionsToday.map((s) =>
      Attendance.countDocuments({ sectionId: s._id, date: todayStr })
    )
  )
  const attendanceToTake = attendanceCounts.filter((c) => c === 0).length

  return { ungradedSubmissions, draftItems, upcomingDueDates, attendanceToTake }
}
