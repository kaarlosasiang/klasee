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
  room?: string
  maxStudents: number
  joinCode?: string
  createdAt: string
  updatedAt: string
}

export const getSections = async (): Promise<Section[]> => {
  const response = await client.get("/sections")
  return response.data
}
