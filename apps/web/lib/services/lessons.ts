import client from "../config/axios"

export interface Lesson {
  _id: string
  moduleId: string
  title: string
  content?: string
  type: "page" | "video" | "file" | "embed"
  order: number
  fileId?: {
    _id: string
    name: string
    mimeType: string
    driveFileId?: string
  } | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateLessonInput {
  moduleId: string
  title: string
  content?: string
  type?: "page" | "video" | "file" | "embed"
  order?: number
  fileId?: string | null
}

export interface UpdateLessonInput {
  title?: string
  content?: string
  type?: string
  order?: number
  fileId?: string | null
  isPublished?: boolean
}

export const getLessons = async (moduleId: string, published?: boolean): Promise<Lesson[]> => {
  const response = await client.get("/lessons", {
    params: { moduleId, ...(published !== undefined ? { published: String(published) } : {}) },
  })
  return response.data
}

export const createLesson = async (data: CreateLessonInput): Promise<Lesson> => {
  const response = await client.post("/lessons", data)
  return response.data
}

export const updateLesson = async (lessonId: string, data: UpdateLessonInput): Promise<Lesson> => {
  const response = await client.put(`/lessons/${lessonId}`, data)
  return response.data
}

export const deleteLesson = async (lessonId: string): Promise<void> => {
  await client.delete(`/lessons/${lessonId}`)
}

export const reorderLessons = async (moduleId: string, lessonIds: string[]): Promise<void> => {
  await client.patch("/lessons/reorder", { lessonIds }, { params: { moduleId } })
}

export const getLessonById = async (lessonId: string): Promise<Lesson> => {
  const response = await client.get(`/lessons/${lessonId}`)
  return response.data
}
