import client from "../config/axios"

export interface Section {
  _id: string
  courseId: {
    _id: string
    name: string
    code: string
  }
  instructorId: string
  name: string
  schedule?: string
  labSchedule?: string
  room?: string
  maxStudents: number
  joinCode?: string
  enrolledCount: number
  createdAt: string
  updatedAt: string
}

export const getSectionById = async (id: string): Promise<Section> => {
  const response = await client.get(`/sections/${id}`)
  return response.data
}

export const getSections = async (): Promise<Section[]> => {
  const response = await client.get("/sections")
  return response.data
}

export const getSectionsByCourse = async (
  courseId: string
): Promise<Section[]> => {
  const response = await client.get("/sections", {
    params: { courseId },
  })
  return response.data
}

export const createSection = async (data: {
  courseId: string
  name: string
  schedule?: string
  labSchedule?: string
  room?: string
  maxStudents?: number
}): Promise<Section> => {
  const response = await client.post("/sections", data)
  return response.data
}

export const updateSection = async (
  id: string,
  data: Partial<{
    name: string
    schedule: string
    labSchedule: string
    room: string
    maxStudents: number
  }>
): Promise<Section> => {
  const response = await client.put(`/sections/${id}`, data)
  return response.data
}

export const deleteSection = async (id: string): Promise<void> => {
  await client.delete(`/sections/${id}`)
}

export const generateJoinCode = async (
  id: string
): Promise<Section> => {
  const response = await client.post(`/sections/${id}/generate-code`)
  return response.data
}
