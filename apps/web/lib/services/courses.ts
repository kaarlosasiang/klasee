import client from "../config/axios"
import { ApiError } from "../middlewares/errorHandler"

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
  description?: string
}

export interface UpdateCourseInput {
  name?: string
  code?: string
  description?: string
}

export const getCourses = async (): Promise<Course[]> => {
  const response = await client.get("/courses")
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

export const getArchivedCourses = async (): Promise<Course[]> => {
  const response = await client.get("/courses/archived")
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
