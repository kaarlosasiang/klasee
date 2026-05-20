import client from "../config/axios"

export interface DriveStatus {
  connected: boolean
  folderId?: string | null
  setupComplete?: boolean
}

export interface CourseFile {
  _id: string
  courseId: string
  name: string
  mimeType: string
  size: number
  source: "drive" | "cloudinary"
  isFolder?: boolean
  parentFileId?: string | null
  driveFileId?: string | null
  driveParentFolderId?: string | null
  cloudinaryUrl?: string | null
  isPublished?: boolean
  uploadedBy: { _id: string; name: string; email: string }
  folder: "materials" | "activities" | "submissions"
  createdAt: string
  updatedAt: string
}

export const getDriveStatus = async (): Promise<DriveStatus> => {
  const response = await client.get("/drive/status")
  return response.data
}

export const setupDrive = async (): Promise<{ folderId: string }> => {
  const response = await client.post("/drive/setup")
  return response.data
}

export const setupCourseFolders = async (
  courseId: string,
  courseName: string
): Promise<Record<string, string>> => {
  const response = await client.post("/drive/course-folders", {
    courseId,
    courseName,
  })
  return response.data
}

export const getCourseFiles = async (
  courseId: string,
  folder?: string,
  parentId?: string,
  published?: boolean,
  uploadedBy?: string
): Promise<CourseFile[]> => {
  const response = await client.get("/drive/files", {
    params: { courseId, folder, parentId, ...(published !== undefined ? { published: String(published) } : {}), uploadedBy },
  })
  return response.data
}

export const createFolder = async (
  courseId: string,
  name: string,
  parentFolderId: string,
  folder: "materials" | "activities" | "submissions",
  parentFileId?: string
): Promise<CourseFile> => {
  const response = await client.post("/drive/folders", {
    courseId,
    name,
    parentFolderId,
    folder,
    parentFileId,
  })
  return response.data
}

export const uploadFile = async (
  courseId: string,
  file: File,
  parentFolderId: string,
  folder: "materials" | "activities" | "submissions",
  parentFileId?: string
): Promise<CourseFile> => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("courseId", courseId)
  formData.append("parentFolderId", parentFolderId)
  formData.append("folder", folder)
  if (parentFileId) formData.append("parentFileId", parentFileId)

  const response = await client.post("/drive/upload", formData)
  return response.data
}

export const getDownloadLink = async (
  fileId: string
): Promise<{
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  webContentLink?: string
}> => {
  const response = await client.get(`/drive/files/${fileId}/download`)
  return response.data
}

export const getStreamUrl = (fileId: string): string => {
  return `${process.env.NEXT_PUBLIC_API_URL}/drive/files/${fileId}/stream`
}

export const deleteCourseFile = async (fileId: string): Promise<void> => {
  await client.delete(`/drive/files/${fileId}`)
}

export const renameCourseFile = async (
  fileId: string,
  name: string
): Promise<CourseFile> => {
  const response = await client.patch(`/drive/files/${fileId}`, { name })
  return response.data
}

export const moveCourseFile = async (
  fileId: string,
  targetFolderDbId: string
): Promise<CourseFile> => {
  const response = await client.patch(`/drive/files/${fileId}/move`, {
    targetFolderDbId,
  })
  return response.data
}

export const moveCourseFileToRoot = async (
  fileId: string,
  courseId: string,
  folder: "materials" | "activities" | "submissions"
): Promise<CourseFile> => {
  const response = await client.patch(`/drive/files/${fileId}/move-to-root`, {
    courseId,
    folder,
  })
  return response.data
}

export const studentUploadFile = async (
  courseId: string,
  file: File
): Promise<CourseFile> => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("courseId", courseId)
  const response = await client.post("/drive/upload/student", formData)
  return response.data
}

export const disconnectDrive = async (): Promise<void> => {
  await client.post("/drive/disconnect")
}

export const togglePublishFile = async (
  fileId: string
): Promise<CourseFile> => {
  const response = await client.patch(`/drive/files/${fileId}/publish`)
  return response.data
}
