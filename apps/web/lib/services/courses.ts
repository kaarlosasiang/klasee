import client from "../config/axios"
import type { ApiError } from "../middlewares/errorHandler"

export interface Course {
  _id: string
  name: string
  code: string
  description?: string
  semester: string
  instructorId: string
  cover?: string
  icon?: string
  syllabus?: string
  gradeBase?: "50" | "75"
  isPublished?: boolean
  sectionCount: number
  enrolledCount: number
  assessmentCount: number
  lastActivity?: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCourseInput {
  name: string
  code: string
  semester: string
  description?: string
  cover?: string
  icon?: string
  syllabus?: string
  gradeBase?: "50" | "75"
  isPublished?: boolean
}

export interface ParsedSection {
  name: string
  schedule?: string
  labSchedule?: string
  room?: string
  maxStudents: number
}

export interface ParsedCourse {
  subject: string
  sections: ParsedSection[]
}

export interface UpdateCourseInput {
  name?: string
  code?: string
  semester?: string
  description?: string
  cover?: string
  icon?: string
  syllabus?: string
  gradeBase?: "50" | "75"
}

export interface CourseQueryParams {
  search?: string
  sort?: "name-asc" | "name-desc" | "newest" | "oldest" | "semester"
  page?: number
  limit?: number
  semester?: string
}

export interface PaginatedCourses {
  courses: Course[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const getCourses = async (
  params?: CourseQueryParams
): Promise<PaginatedCourses> => {
  const response = await client.get("/courses", { params })
  return response.data
}

export const getCourseById = async (id: string): Promise<Course> => {
  const response = await client.get(`/courses/${id}`)

  return response.data
}

export const createCourse = async (
  data: CreateCourseInput
): Promise<Course> => {
  const response = await client.post("/courses", data)
  return response.data
}

export const updateCourse = async (
  id: string,
  data: UpdateCourseInput
): Promise<Course> => {
  const response = await client.put(`/courses/${id}`, data)
  return response.data
}

export const deleteCourse = async (id: string): Promise<void> => {
  await client.delete(`/courses/${id}`)
}

export interface ArchivedCourseParams {
  search?: string
  sort?: "name-asc" | "name-desc" | "newest" | "oldest"
}

export const getArchivedCourses = async (params?: ArchivedCourseParams): Promise<Course[]> => {
  const response = await client.get("/courses/archived", { params })
  return response.data
}

export const archiveCourse = async (id: string): Promise<Course> => {
  const response = await client.patch(`/courses/${id}/archive`)
  return response.data
}

export const unarchiveCourse = async (id: string): Promise<Course> => {
  const response = await client.patch(`/courses/${id}/unarchive`)
  return response.data
}

export const bulkArchiveCourses = async (courseIds: string[]): Promise<{ archived: number }> => {
  const response = await client.post("/courses/bulk-archive", { courseIds })
  return response.data
}

export const bulkDeleteCourses = async (courseIds: string[]): Promise<{ deleted: number }> => {
  const response = await client.post("/courses/bulk-delete", { courseIds })
  return response.data
}

export const parseFacultyLoad = async (file: File): Promise<ParsedCourse[]> => {
  const form = new FormData()
  form.append("file", file)
  const response = await client.post("/courses/parse-faculty-load", form)
  return response.data.rows
}

export interface AuditLogEntry {
  _id: string
  courseId: string
  userId: { _id: string; name: string; email: string }
  action: "created" | "updated" | "deleted" | "archived" | "unarchived"
  changes?: Record<string, { old: unknown; new: unknown }>
  createdAt: string
}

export const getCourseAuditLogs = async (courseId: string, limit?: number): Promise<AuditLogEntry[]> => {
  const response = await client.get(`/courses/${courseId}/audit`, { params: limit ? { limit } : {} })
  return response.data
}
