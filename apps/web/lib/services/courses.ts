import client from "../config/axios"
import { ApiError } from "../middlewares/errorHandler"

export interface Course {
  id: string
  name: string
  code: string
  description?: string
  instructorId: string
  createdAt: Date
  updatedAt: Date
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
