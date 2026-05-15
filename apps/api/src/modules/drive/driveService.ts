import { Readable } from "stream"
import { google } from "googleapis"
import mongoose from "mongoose"
import { CourseFile } from "../../models/courseFileModel.js"
import { constants } from "../../config/index.js"

const SCOPES = ["https://www.googleapis.com/auth/drive.file"]

function getDb() {
  if (!mongoose.connection.db) {
    throw Object.assign(new Error("Database not connected"), { status: 500 })
  }
  return mongoose.connection.db
}

function getAccountCollection() {
  return getDb().collection("account")
}

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id)
}

export const driveService = {
  async getDriveClient(userId: string) {
    const account = await getAccountCollection().findOne({
      userId: toObjectId(userId),
      providerId: "google",
    })

    if (!account?.accessToken) {
      throw Object.assign(new Error("Google Drive is not connected"), {
        status: 400,
      })
    }

    const auth = new google.auth.OAuth2(
      constants.googleClientId,
      constants.googleClientSecret
    )

    auth.setCredentials({
      access_token: account.accessToken as string,
      refresh_token: (account.refreshToken as string) ?? undefined,
      scope: SCOPES.join(" "),
    })

    return google.drive({ version: "v3", auth })
  },

  async getStatus(userId: string) {
    const account = await getAccountCollection().findOne(
      { userId: toObjectId(userId), providerId: "google" },
      { projection: { scope: 1, accessToken: 1, refreshToken: 1 } }
    )

    if (!account?.accessToken) {
      return { connected: false }
    }

    const scopeStr =
      typeof account?.scope === "string"
        ? account.scope
        : Array.isArray(account?.scope)
          ? account.scope.join(" ")
          : ""

    const hasDriveScope = scopeStr.includes(
      "https://www.googleapis.com/auth/drive.file"
    )

    if (!hasDriveScope) {
      try {
        const auth = new google.auth.OAuth2(
          constants.googleClientId,
          constants.googleClientSecret
        )
        auth.setCredentials({
          access_token: account.accessToken as string,
          refresh_token: (account.refreshToken as string) ?? undefined,
          scope: SCOPES.join(" "),
        })
        const drive = google.drive({ version: "v3", auth })
        await drive.about.get({ fields: "user" })

        await getAccountCollection().updateOne(
          { _id: account._id },
          { $set: { scope: SCOPES.join(" ") } }
        )
      } catch {
        return { connected: false }
      }
    }

    const doc = await getDb().collection("drive_setup").findOne({ userId })

    if (doc?.folderId) {
      try {
        const drive = await this.getDriveClient(userId)
        await drive.files.get({
          fileId: doc.folderId as string,
          fields: "id",
        })
      } catch (err: any) {
        if (err?.response?.status === 404) {
          await getDb().collection("drive_setup").deleteOne({ userId })
          return {
            connected: true,
            folderId: null,
            setupComplete: false,
          }
        }
      }
    }

    return {
      connected: true,
      folderId: doc?.folderId ?? null,
      setupComplete: !!doc,
    }
  },

  async setupFolders(userId: string) {
    const drive = await this.getDriveClient(userId)

    const klaseeFolder = await drive.files.create({
      requestBody: {
        name: "Klasee LMS",
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    })

    const klaseeFolderId = klaseeFolder.data.id!

    await getDb()
      .collection("drive_setup")
      .updateOne(
        { userId },
        { $set: { userId, folderId: klaseeFolderId, createdAt: new Date() } },
        { upsert: true }
      )

    return { folderId: klaseeFolderId }
  },

  async ensureCourseFolders(
    userId: string,
    courseId: string,
    courseName: string
  ): Promise<Record<string, string>> {
    const existing = await getDb()
      .collection("course_folder_ids")
      .findOne({ courseId })

    if (
      existing?.materials &&
      existing?.activities &&
      existing?.submissions
    ) {
      return {
        materials: existing.materials,
        activities: existing.activities,
        submissions: existing.submissions,
      }
    }

    const drive = await this.getDriveClient(userId)

    const doc = await getDb()
      .collection("drive_setup")
      .findOne({ userId })
    if (!doc?.folderId) {
      throw Object.assign(new Error("Drive not set up. Call setup first."), {
        status: 400,
      })
    }

    const klaseeFolderId = doc.folderId as string

    const courseFolder = await drive.files.create({
      requestBody: {
        name: courseName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [klaseeFolderId],
      },
      fields: "id",
    })

    const courseFolderId = courseFolder.data.id!

    const subfolders = ["Materials", "Activities", "Submissions"]
    const folderIds: Record<string, string> = {}
    const upsertDoc: Record<string, string> = { courseFolderId }

    for (const name of subfolders) {
      const folder = await drive.files.create({
        requestBody: {
          name,
          mimeType: "application/vnd.google-apps.folder",
          parents: [courseFolderId],
        },
        fields: "id",
      })
      const folderKey = name.toLowerCase()
      folderIds[folderKey] = folder.data.id!
      upsertDoc[folderKey] = folder.data.id!
    }

    await getDb()
      .collection("course_folder_ids")
      .updateOne({ courseId }, { $set: upsertDoc }, { upsert: true })

    return folderIds
  },

  async uploadFile(
    userId: string,
    courseId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    parentFolderId: string,
    folder: "materials" | "activities" | "submissions",
    uploadedBy: string,
    parentFileId?: string
  ) {
    const drive = await this.getDriveClient(userId)

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [parentFolderId],
      },
      media: {
        mimeType,
        body: Readable.from(fileBuffer),
      },
      fields: "id,name,size,mimeType",
    })

    const file = response.data

    const courseFile = await CourseFile.create({
      courseId,
      name: fileName,
      mimeType,
      size: Number(file.size ?? 0),
      source: "drive",
      driveFileId: file.id!,
      driveParentFolderId: parentFolderId,
      uploadedBy,
      folder,
      ...(parentFileId ? { parentFileId } : {}),
    })

    return courseFile.toObject()
  },

  async disconnect(userId: string) {
    await getDb().collection("account").deleteOne({
      userId: toObjectId(userId),
      providerId: "google",
    })
    await getDb().collection("drive_setup").deleteOne({ userId })
    await getDb().collection("course_folder_ids").deleteMany({})

    return { disconnected: true }
  },

  async listFiles(
    userId: string | undefined,
    courseId: string,
    folder?: string,
    parentId?: string,
    publishedOnly?: boolean
  ) {
    const filter: Record<string, unknown> = { courseId }
    if (folder) filter.folder = folder
    if (publishedOnly) filter.isPublished = true

    if (parentId === "root") {
      filter.parentFileId = null
    } else if (parentId) {
      filter.parentFileId = new mongoose.Types.ObjectId(parentId)
    } else {
      filter.parentFileId = null
    }

    let files = await CourseFile.find(filter)
      .populate("uploadedBy", "name email")
      .sort({ isFolder: -1, createdAt: -1 })
      .lean()

    if (!userId) return files

    const driveFiles = files.filter(
      (f) => f.source === "drive" && f.driveFileId
    )
    if (driveFiles.length === 0) return files

    try {
      const drive = await this.getDriveClient(userId)

      const results = await Promise.allSettled(
        driveFiles.map((f) =>
          drive.files.get({ fileId: f.driveFileId!, fields: "id" })
        )
      )

      const deletedIds: string[] = []

      driveFiles.forEach((f, i) => {
        const result = results[i]
        if (
          result &&
          result.status === "rejected" &&
          (result.reason as any)?.response?.status === 404
        ) {
          deletedIds.push(f._id.toString())
        }
      })

      if (deletedIds.length > 0) {
        await CourseFile.deleteMany({ _id: { $in: deletedIds } })
        files = files.filter(
          (f) => !deletedIds.includes(f._id.toString())
        )
      }
    } catch {
      // Drive not connected or token expired — return cached files as-is
    }

    return files
  },

  async getDownloadLink(userId: string, fileId: string) {
    const drive = await this.getDriveClient(userId)

    const response = await drive.files.get({
      fileId,
      fields: "id,name,mimeType,webViewLink,webContentLink",
    })

    return response.data
  },

  async streamFile(userId: string, fileId: string): Promise<any> {
    const drive = await this.getDriveClient(userId)
    return drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    )
  },

  async createFolder(
    userId: string,
    courseId: string,
    folderName: string,
    parentFolderId: string,
    folder: "materials" | "activities" | "submissions",
    parentFileId?: string
  ) {
    const drive = await this.getDriveClient(userId)

    const response = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentFolderId],
      },
      fields: "id,name",
    })

    const driveFolder = response.data

    const courseFolder = await CourseFile.create({
      courseId,
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      size: 0,
      source: "drive",
      isFolder: true,
      driveFileId: driveFolder.id!,
      driveParentFolderId: parentFolderId,
      uploadedBy: userId,
      folder,
      ...(parentFileId ? { parentFileId } : {}),
    })

    return courseFolder.toObject()
  },

  async deleteFile(userId: string, dbFileId: string) {
    const courseFile = await CourseFile.findById(dbFileId)
    if (!courseFile) {
      throw Object.assign(new Error("File not found"), { status: 404 })
    }

    if (courseFile.source === "drive" && courseFile.driveFileId) {
      const drive = await this.getDriveClient(userId)
      await drive.files.delete({ fileId: courseFile.driveFileId })
    }

    await CourseFile.findByIdAndDelete(dbFileId)
    return { deleted: true }
  },

  async moveFile(
    userId: string,
    dbFileId: string,
    targetFolderDbId: string
  ) {
    const courseFile = await CourseFile.findById(dbFileId)
    if (!courseFile) {
      throw Object.assign(new Error("File not found"), { status: 404 })
    }

    const targetFolder = await CourseFile.findById(targetFolderDbId)
    if (!targetFolder) {
      throw Object.assign(new Error("Target folder not found"), { status: 404 })
    }

    if (courseFile.source === "drive" && courseFile.driveFileId) {
      const drive = await this.getDriveClient(userId)
      await drive.files.update({
        fileId: courseFile.driveFileId,
        addParents: targetFolder.driveFileId!,
        removeParents: courseFile.driveParentFolderId!,
        fields: "id,parents",
      })
    }

    courseFile.parentFileId = targetFolderDbId as any
    courseFile.driveParentFolderId = targetFolder.driveFileId
    await courseFile.save()
    return courseFile.toObject()
  },

  async moveFileToRoot(
    userId: string,
    dbFileId: string,
    courseId: string,
    folder: "materials" | "activities" | "submissions"
  ) {
    const courseFile = await CourseFile.findById(dbFileId)
    if (!courseFile) {
      throw Object.assign(new Error("File not found"), { status: 404 })
    }

    const tabFolderIds = await getDb()
      .collection("course_folder_ids")
      .findOne({ courseId })
    const tabDriveId = tabFolderIds?.[folder]
    if (!tabDriveId) {
      throw Object.assign(new Error("Course folders not set up"), {
        status: 400,
      })
    }

    if (courseFile.source === "drive" && courseFile.driveFileId) {
      const drive = await this.getDriveClient(userId)
      await drive.files.update({
        fileId: courseFile.driveFileId,
        addParents: tabDriveId,
        removeParents: courseFile.driveParentFolderId!,
        fields: "id,parents",
      })
    }

    courseFile.parentFileId = null as any
    courseFile.driveParentFolderId = tabDriveId
    await courseFile.save()
    return courseFile.toObject()
  },

  async renameFile(userId: string, dbFileId: string, newName: string) {
    const courseFile = await CourseFile.findById(dbFileId)
    if (!courseFile) {
      throw Object.assign(new Error("File not found"), { status: 404 })
    }

    if (courseFile.source === "drive" && courseFile.driveFileId) {
      const drive = await this.getDriveClient(userId)
      await drive.files.update({
        fileId: courseFile.driveFileId,
        requestBody: { name: newName },
      })
    }

    courseFile.name = newName
    await courseFile.save()
    return courseFile.toObject()
  },

  async togglePublish(userId: string, dbFileId: string) {
    const courseFile = await CourseFile.findById(dbFileId)
    if (!courseFile) {
      throw Object.assign(new Error("File not found"), { status: 404 })
    }
    courseFile.isPublished = !courseFile.isPublished
    await courseFile.save()
    return courseFile.toObject()
  },
}
