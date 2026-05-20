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
})

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).optional(),
  content: z.string().min(1, "Content is required").optional(),
  isPinned: z.boolean().optional(),
})

export const studentUploadFileSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
})

export const ensureCourseFoldersSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  courseName: z.string().min(1, "courseName is required"),
})
