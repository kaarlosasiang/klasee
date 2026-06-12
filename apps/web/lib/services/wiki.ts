import client from "../config/axios"

export interface WikiDoc {
  courseId: string
  content: string
  updatedAt?: string
}

export const getWiki = async (courseId: string): Promise<WikiDoc> => {
  const response = await client.get(`/wiki/${courseId}`)
  return response.data
}

export const saveWiki = async (courseId: string, content: string): Promise<WikiDoc> => {
  const response = await client.put(`/wiki/${courseId}`, { content })
  return response.data
}
