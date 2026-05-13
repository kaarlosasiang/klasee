import { NextFunction, Request, Response } from "express"
import { driveService } from "./driveService.js"
import {
  createFolderSchema,
  uploadFileSchema,
  renameFileSchema,
  moveFileSchema,
  moveToRootSchema,
  ensureCourseFoldersSchema,
} from "@workspace/validators"

function getUserId(req: Request): string {
  return String((req.authUser as any)?._id ?? (req.authUser as any)?.id)
}

export const driveController = {
  async status(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req)
      const status = await driveService.getStatus(userId)
      res.json(status)
    } catch (err) {
      next(err)
    }
  },

  async setup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req)
      const result = await driveService.setupFolders(userId)
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  async ensureCourseFolders(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = ensureCourseFoldersSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const userId = getUserId(req)
      const { courseId, courseName } = parsed.data
      const result = await driveService.ensureCourseFolders(userId, courseId, courseName)
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  async createFolder(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createFolderSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const userId = getUserId(req)
      const { courseId, name, parentFolderId, folder, parentFileId } = parsed.data
      const result = await driveService.createFolder(
        userId,
        courseId,
        name,
        parentFolderId,
        folder,
        parentFileId
      )
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  },

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req)
      const file = req.file
      if (!file) {
        return res.status(400).json({ message: "No file provided" })
      }

      const parsed = uploadFileSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }

      const { courseId, parentFolderId, folder, parentFileId } = parsed.data
      const result = await driveService.uploadFile(
        userId,
        courseId,
        file.buffer,
        file.originalname,
        file.mimetype,
        parentFolderId,
        folder,
        userId,
        parentFileId
      )
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, folder, parentId } = req.query as {
        courseId: string
        folder?: string
        parentId?: string
      }
      if (!courseId) {
        return res.status(400).json({ message: "courseId is required" })
      }
      const files = await driveService.listFiles(
        getUserId(req),
        courseId,
        folder,
        parentId
      )
      res.json(files)
    } catch (err) {
      next(err)
    }
  },

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req)
      const { id } = req.params as { id: string }
      const link = await driveService.getDownloadLink(userId, id)
      res.json(link)
    } catch (err) {
      next(err)
    }
  },

  async stream(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req)
      const { id } = req.params as { id: string }
      const response = await driveService.streamFile(userId, id)

      const contentType = response.headers["content-type"]
      if (contentType) {
        res.setHeader("Content-Type", contentType)
      }

      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin")

      response.data.pipe(res)
    } catch (err) {
      next(err)
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req)
      const { id } = req.params as { id: string }
      const result = await driveService.deleteFile(userId, id)
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  async moveFile(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = moveFileSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const userId = getUserId(req)
      const { id } = req.params as { id: string }
      const result = await driveService.moveFile(userId, id, parsed.data.targetFolderDbId)
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  async moveFileToRoot(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = moveToRootSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const userId = getUserId(req)
      const { id } = req.params as { id: string }
      const { courseId, folder } = parsed.data
      const result = await driveService.moveFileToRoot(userId, id, courseId, folder)
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req)
      const result = await driveService.disconnect(userId)
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  async rename(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = renameFileSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const userId = getUserId(req)
      const { id } = req.params as { id: string }
      const result = await driveService.renameFile(userId, id, parsed.data.name)
      res.json(result)
    } catch (err) {
      next(err)
    }
  },
}
