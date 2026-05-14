import client from "../config/axios"

// Set to false when the backend /enrollments/:id/detail endpoint is ready
const USE_MOCK_STUDENT_DETAIL = true

export interface TrendingContent {
  id: string
  title: string
  type: "video" | "quiz" | "assignment" | "page"
  progressPercent: number
  timeSpentMinutes: number
}

export interface ActivityLogEntry {
  id: string
  type: "course_started" | "quiz_completed" | "feedback_given" | "attachment_uploaded" | "page_visited"
  description: string
  contentTitle?: string
  contentType?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface AssignedItem {
  id: string
  title: string
  type: "assignment" | "quiz"
  dueAt?: string
  submittedAt?: string
  score?: number
  maxScore?: number
  status: "pending" | "submitted" | "graded" | "overdue"
}

export interface StudentDetail {
  studentId: string
  name: string
  email: string
  avatarUrl?: string
  role?: string
  division?: string
  trendingContents: TrendingContent[]
  activityLog: ActivityLogEntry[]
  assigned: AssignedItem[]
  needsReview: AssignedItem[]
  overallProgressPercent: number
}

function mockStudentDetail(enrollmentId: string): StudentDetail {
  return {
    studentId: enrollmentId,
    name: "",
    email: "",
    trendingContents: [
      {
        id: "1",
        title: "Mobile & Desktop Screen Pattern",
        type: "assignment",
        progressPercent: 60,
        timeSpentMinutes: 300,
      },
      {
        id: "2",
        title: "Creating Engaging Learning Journeys: UI/UX Best Practices",
        type: "quiz",
        progressPercent: 30,
        timeSpentMinutes: 120,
      },
      {
        id: "3",
        title: "Style Direction Fundamentals",
        type: "page",
        progressPercent: 10,
        timeSpentMinutes: 30,
      },
    ],
    activityLog: [
      {
        id: "a1",
        type: "course_started",
        description: "Started a Course",
        contentTitle: "A Designer's Toolkit for Crafting Exceptional Learning Management",
        contentType: "course",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        id: "a2",
        type: "quiz_completed",
        description: "Completed the Quiz",
        contentTitle: "Creating Engaging Learning Journeys: UI/UX Best Practices",
        contentType: "quiz",
        metadata: { score: 95 },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      },
      {
        id: "a3",
        type: "feedback_given",
        description: "Give Feedback in a Page",
        contentTitle: "A Designer's Toolkit for Crafting Exceptional Learning Management",
        contentType: "page",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      {
        id: "a4",
        type: "attachment_uploaded",
        description: "Uploaded Attachment in Assignment",
        contentTitle: "Style Direction",
        contentType: "assignment",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      },
    ],
    assigned: [
      {
        id: "as1",
        title: "Mobile & Desktop Screen Pattern",
        type: "assignment",
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        status: "submitted",
        score: 88,
        maxScore: 100,
      },
      {
        id: "as2",
        title: "Creating Engaging Learning Journeys Quiz",
        type: "quiz",
        dueAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
        status: "graded",
        score: 95,
        maxScore: 100,
      },
    ],
    needsReview: [
      {
        id: "nr1",
        title: "Style Direction — Final Submission",
        type: "assignment",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        status: "submitted",
        maxScore: 100,
      },
    ],
    overallProgressPercent: 60,
  }
}

export async function getStudentDetail(enrollmentId: string): Promise<StudentDetail> {
  if (USE_MOCK_STUDENT_DETAIL) {
    await new Promise((r) => setTimeout(r, 400))
    return mockStudentDetail(enrollmentId)
  }
  const response = await client.get(`/enrollments/${enrollmentId}/detail`)
  return response.data
}
