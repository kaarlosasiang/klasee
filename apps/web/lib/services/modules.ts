import client from "../config/axios"

export interface Module {
  _id: string
  courseId: string
  title: string
  description?: string
  order: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateModuleInput {
  courseId: string
  title: string
  description?: string
  order?: number
}

export interface UpdateModuleInput {
  title?: string
  description?: string
  order?: number
  isPublished?: boolean
}

export const getModules = async (courseId: string): Promise<Module[]> => {
  const response = await client.get("/modules", {
    params: { courseId },
  })
  return response.data
}

export const createModule = async (
  data: CreateModuleInput
): Promise<Module> => {
  const response = await client.post("/modules", data)
  return response.data
}

export const updateModule = async (
  _courseId: string,
  moduleId: string,
  data: UpdateModuleInput
): Promise<Module> => {
  const response = await client.put(`/modules/${moduleId}`, data)
  return response.data
}

export const deleteModule = async (
  _courseId: string,
  moduleId: string
): Promise<void> => {
  await client.delete(`/modules/${moduleId}`)
}

export const reorderModules = async (
  courseId: string,
  moduleIds: string[]
): Promise<void> => {
  await client.patch("/modules/reorder", { moduleIds }, { params: { courseId } })
}
