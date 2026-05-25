import client from "../config/axios"
import { ApiError } from "../middlewares/errorHandler"

export interface Announcement {
  _id: string
  courseId: string
  title: string
  content: string
  isPinned: boolean
  sectionIds?: string[]
  authorId: string
  authorName?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAnnouncementInput {
  courseId: string
  title: string
  content: string
  isPinned?: boolean
  sectionIds?: string[]
}

export interface UpdateAnnouncementInput {
  title?: string
  content?: string
  isPinned?: boolean
  sectionIds?: string[]
}

export const getAnnouncements = async (
  courseId: string
): Promise<Announcement[]> => {
  const response = await client.get("/announcements", {
    params: { courseId },
  })
  return response.data
}

export const createAnnouncement = async (
  data: CreateAnnouncementInput
): Promise<Announcement> => {
  const response = await client.post("/announcements", data)
  return response.data
}

export const updateAnnouncement = async (
  _courseId: string,
  announcementId: string,
  data: UpdateAnnouncementInput
): Promise<Announcement> => {
  const response = await client.put(`/announcements/${announcementId}`, data)
  return response.data
}

export const deleteAnnouncement = async (
  _courseId: string,
  announcementId: string
): Promise<void> => {
  await client.delete(`/announcements/${announcementId}`)
}
