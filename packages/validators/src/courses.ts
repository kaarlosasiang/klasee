import { z } from "zod"

export const createCourseSchema = z.object({
  name: z.string().min(1, "Course name is required").max(200),
  code: z.string().min(1, "Course code is required").max(20),
  description: z.string().max(400).optional(),
  semester: z.enum(["1st", "2nd", "summer"], { required_error: "Semester is required" }),
  cover: z.string().optional(),
  icon: z.string().optional(),
  syllabus: z.string().optional(),
})

export const updateCourseSchema = createCourseSchema.partial()

export const createSectionSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  name: z.string().min(1, "Section name is required").max(100),
  schedule: z.string().max(200).optional(),
  labSchedule: z.string().max(200).optional(),
  room: z.string().max(100).optional(),
  maxStudents: z.number().int().min(1, "Must be at least 1").max(500).default(40),
})

export const updateSectionSchema = createSectionSchema.omit({ courseId: true }).partial()

export const createFolderSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  name: z.string().min(1, "Folder name is required").max(255),
  parentFolderId: z.string().min(1, "parentFolderId is required"),
  folder: z.enum(["materials", "activities", "submissions"]),
  parentFileId: z.string().optional(),
})

export const uploadFileSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  parentFolderId: z.string().min(1, "parentFolderId is required"),
  folder: z.enum(["materials", "activities", "submissions"]),
  parentFileId: z.string().optional(),
})

export const renameFileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(255),
})

export const moveFileSchema = z.object({
  targetFolderDbId: z.string().min(1, "targetFolderDbId is required"),
})

export const moveToRootSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  folder: z.enum(["materials", "activities", "submissions"]),
})

export const createAnnouncementSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
  isPinned: z.boolean().optional(),
  sectionIds: z.array(z.string()).optional(),
})

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).optional(),
  content: z.string().min(1, "Content is required").optional(),
  isPinned: z.boolean().optional(),
  sectionIds: z.array(z.string()).optional(),
})

export const studentUploadFileSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
})

export const ensureCourseFoldersSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  courseName: z.string().min(1, "courseName is required"),
})

const latePolicySchema = z.object({
  enabled: z.boolean().default(false),
  deductionType: z.enum(["percent", "flat"]).default("percent"),
  deductionPerDay: z.number().min(0).default(0),
  maxDeduction: z.number().min(0).default(100),
})

export const createAssessmentSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  title: z.string().min(1, "Assessment title is required").max(200),
  type: z.enum(["quiz", "exam", "assignment"], {
    required_error: "Assessment type is required",
  }),
  totalPoints: z.number().int().min(0, "Total points must be 0 or more"),
  dueDate: z.string().optional(),
  isPublished: z.boolean().optional(),
  timeLimit: z.number().int().min(1).optional(),
  randomizeQuestions: z.boolean().optional(),
  instructions: z.string().optional(),
  allowedFileTypes: z.array(z.string()).optional(),
  maxFiles: z.number().int().min(1).optional(),
  groupId: z.string().optional(),
  latePolicy: latePolicySchema.optional(),
})

export const updateAssessmentSchema = createAssessmentSchema.omit({ courseId: true }).partial()

export const createDueDateOverrideSchema = z.object({
  assessmentId: z.string().min(1, "assessmentId is required"),
  type: z.enum(["section", "student"]),
  targetId: z.string().min(1, "targetId is required"),
  dueDate: z.string().min(1, "dueDate is required"),
})

export const createAssignmentGroupSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  name: z.string().min(1, "Group name is required").max(100),
  weight: z.number().min(0).max(100),
  dropLowest: z.number().int().min(0).default(0),
  order: z.number().int().min(0).optional(),
})

export const updateAssignmentGroupSchema = createAssignmentGroupSchema
  .omit({ courseId: true })
  .partial()

export const createQuestionSchema = z.object({
  assessmentId: z.string().min(1, "assessmentId is required"),
  type: z.enum(["multiple_choice", "true_false", "essay", "fill_in"], {
    required_error: "Question type is required",
  }),
  question: z.string().min(1, "Question text is required"),
  points: z.number().int().min(0).default(1),
  order: z.number().int().min(0).optional(),
  options: z.array(z.object({
    text: z.string().min(1),
    isCorrect: z.boolean().optional(),
  })).optional(),
  correctAnswer: z.union([z.string(), z.boolean()]).optional(),
  required: z.boolean().optional(),
  multipleAnswers: z.boolean().optional(),
  randomizeOrder: z.boolean().optional(),
  estimationTime: z.number().int().min(0).optional(),
})

export const updateQuestionSchema = createQuestionSchema
  .omit({ assessmentId: true })
  .partial()

export const submitQuizAttemptSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().min(1, "questionId is required"),
    answer: z.any(),
  })).min(1, "At least one answer is required"),
})
