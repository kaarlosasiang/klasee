import "dotenv/config"
import mongoose from "mongoose"
import { dbConnection } from "./config/index.js"
import { User } from "./models/userModel.js"
import { Student } from "./models/studentModel.js"
import { Section } from "./models/sectionModel.js"
import { Course } from "./models/courseModel.js"
import { Enrollment } from "./models/enrollmentModel.js"
import { Assessment } from "./models/assessmentModel.js"
import { AssessmentScore } from "./models/assessmentScore.js"
import { Tip } from "./models/tipModel.js"

const STUDENT_EMAIL = "test.student@klasee.com"
const STUDENT_NAME = "Test Student"

async function seed() {
  await dbConnection.connect()

  // 1. Upsert User (create if not exists)
  let user = await User.findOne({ email: STUDENT_EMAIL }).lean()
  if (!user) {
    user = await User.create({
      name: STUDENT_NAME,
      email: STUDENT_EMAIL,
      emailVerified: true,
      role: "student",
      isActive: true,
      onboardingCompleted: true,
    })
    console.log(`Created user: ${user.email} (${user._id})`)
  } else {
    console.log(`User already exists: ${user.email} (${user._id})`)
  }

  // 2. Upsert Student profile
  let student = await Student.findOne({ userId: user._id }).lean()
  if (!student) {
    student = await Student.create({
      userId: user._id,
      yearLevel: 2,
      program: "BSCS",
    })
    console.log(`Created student profile for ${user.name}`)
  } else {
    console.log(`Student profile already exists`)
  }

  // 3. Find an existing section
  const section = await Section.findOne().lean()
  if (!section) {
    console.error("No sections found. Create a course with a section first.")
    await dbConnection.disconnect()
    process.exit(1)
  }

  const courseId =
    typeof section.courseId === "object"
      ? String((section.courseId as any)._id ?? section.courseId)
      : String(section.courseId)

  const course = await Course.findById(courseId).lean()
  if (!course) {
    console.error(`Course ${courseId} not found`)
    await dbConnection.disconnect()
    process.exit(1)
  }

  console.log(`Found section: "${section.name}" in course "${course.name}"`)

  // 4. Create enrollment
  const existingEnrollment = await Enrollment.findOne({
    studentId: user._id,
    sectionId: section._id,
    status: "active",
  }).lean()

  if (!existingEnrollment) {
    await Enrollment.create({
      studentId: user._id,
      sectionId: section._id,
      courseId: course._id,
      status: "active",
    })
    console.log(`Enrolled ${user.name} in "${section.name}"`)
  } else {
    console.log(`${user.name} is already enrolled in "${section.name}"`)
  }

  // 5. Seed assessments
  const pastDate = (daysAgo: number) =>
    new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!
  const futureDate = (daysFromNow: number) =>
    new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!

  const assessmentData = [
    { title: "Midterm Quiz", type: "quiz" as const, totalPoints: 50, dueDate: pastDate(14) },
    { title: "Prelim Exam", type: "exam" as const, totalPoints: 100, dueDate: pastDate(7) },
    { title: "Final Project", type: "assignment" as const, totalPoints: 200, dueDate: futureDate(14) },
  ]

  const createdAssessments: mongoose.FlattenMaps<unknown>[] = []

  for (const data of assessmentData) {
    let assessment = await Assessment.findOne({
      courseId: course._id,
      title: data.title,
    }).lean()

    if (!assessment) {
      assessment = await Assessment.create({
        courseId: course._id,
        ...data,
      })
      console.log(`Created assessment: "${data.title}" (${data.totalPoints} pts)`)
    } else {
      console.log(`Assessment already exists: "${data.title}"`)
    }
    createdAssessments.push(assessment)
  }

  // 6. Seed scores (for past-due assessments)
  const scoreData = [
    { title: "Midterm Quiz", score: 42, feedback: "Good effort, review module 3 on data structures." },
    { title: "Prelim Exam", score: 85, feedback: "Solid performance. Watch time management in the essay section." },
  ]

  for (const data of scoreData) {
    const assessment = createdAssessments.find(
      (a: any) => a.title === data.title
    )
    if (!assessment) continue

    const existingScore = await AssessmentScore.findOne({
      assessmentId: assessment._id,
      studentId: user._id,
    }).lean()

    if (!existingScore) {
      await AssessmentScore.create({
        assessmentId: assessment._id,
        studentId: user._id,
        score: data.score,
        feedback: data.feedback,
      })
      console.log(`Scored ${user.name}: ${data.title} = ${data.score}/${(assessment as any).totalPoints}`)
    } else {
      console.log(`${user.name} already scored on "${data.title}"`)
    }
  }

  // 7. Seed tips
  const tips = [
    { context: "attendanceToTake", title: "Classes need attendance today", description: "You have sections scheduled today without attendance records. Mark attendance now while students are still fresh in your mind — it takes under two minutes per section." },
    { context: "attendanceToTake", title: "Don't let attendance slip", description: "Missing attendance data makes it hard to track participation patterns. Head to the Schedules page and mark today's sessions before you move on." },
    { context: "attendanceToTake", title: "Attendance affects student records", description: "Consistent tracking gives students a fair and transparent record. Log today's sessions so nothing falls through the cracks." },
    { context: "ungradedSubmissions", title: "Students are waiting for feedback", description: "You have ungraded submissions. Even a brief comment alongside a score helps students understand where they stand and how to improve." },
    { context: "ungradedSubmissions", title: "Grade while the work is fresh", description: "Grading soon after submission makes your feedback more accurate. Open the Grades page to work through your queue." },
    { context: "ungradedSubmissions", title: "Timely grading builds trust", description: "Students check their grades frequently. Returning scored work quickly shows you're engaged and gives them time to act on your feedback." },
    { context: "draftItems", title: "Drafts are invisible to students", description: "You have courses or assessments still in draft mode. Students can't see or attempt them until they're published — review and publish when ready." },
    { context: "draftItems", title: "Ready to publish?", description: "Keeping assessments in draft too long can push due dates uncomfortably close. Review your draft items and publish them with enough lead time for students to prepare." },
    { context: "draftItems", title: "Check your unpublished content", description: "Draft items are safe to hold until you're confident everything is correct. Publishing a course or assessment takes just one click from the course settings." },
    { context: "upcomingDueDates", title: "Due dates are coming up this week", description: "You have assessments due within the next seven days. Make sure students have had enough time — consider posting a reminder announcement." },
    { context: "upcomingDueDates", title: "Send a reminder announcement", description: "A quick announcement reminding students of upcoming due dates significantly reduces late submissions. It only takes a minute to post from any course page." },
    { context: "upcomingDueDates", title: "Review assessment instructions", description: "With due dates approaching, re-read your assessment instructions from a student's perspective. Unclear wording is easier to fix before the deadline." },
    { context: "general", title: "Use announcements proactively", description: "Instructors who post regular announcements report higher student engagement. Even a short weekly update keeps your class informed and connected." },
    { context: "general", title: "Set up your course modules", description: "Organizing content into modules helps students follow a clear learning path. Group related lessons and assessments so the flow feels intentional." },
    { context: "general", title: "Review your grading rubric", description: "Clear assessment instructions and point breakdowns reduce student confusion. Take a moment to revisit instructions before publishing your next assessment." },
  ]

  for (const tip of tips) {
    const result = await Tip.updateOne(
      { title: tip.title },
      { $setOnInsert: { ...tip, isActive: true } },
      { upsert: true }
    )
    if (result.upsertedCount) {
      console.log(`Created tip: "${tip.title}"`)
    } else {
      console.log(`Tip already exists: "${tip.title}"`)
    }
  }

  console.log("\nSeed complete!")
  await dbConnection.disconnect()
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
