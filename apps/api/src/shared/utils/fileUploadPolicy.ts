import path from "path"

import type { Request } from "express"
import type multer from "multer"

import { ValidationError } from "../error-types/validation.error.js"

export const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "audio/mpeg",
  "audio/wav",
  "video/mp4",
  "video/webm",
  "video/quicktime",
])

export const SAFE_INLINE_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "audio/mpeg",
  "audio/wav",
  "video/mp4",
  "video/webm",
  "video/quicktime",
])

// Blocked outright even if the client lies about mimetype — these can carry
// executable script content and must never be accepted, regardless of allowlist.
const DANGEROUS_EXTENSIONS = new Set([
  ".html",
  ".htm",
  ".xhtml",
  ".svg",
  ".js",
  ".mjs",
  ".exe",
  ".sh",
  ".bat",
  ".cmd",
  ".com",
  ".scr",
  ".jar",
  ".php",
  ".phtml",
])

export function createUploadFileFilter(allowedMimeTypes: Set<string>) {
  return (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ): void => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (DANGEROUS_EXTENSIONS.has(ext) || !allowedMimeTypes.has(file.mimetype)) {
      cb(new ValidationError(`File type "${file.mimetype || ext}" is not allowed`))
      return
    }
    cb(null, true)
  }
}

export const multerFileFilter = createUploadFileFilter(ALLOWED_UPLOAD_MIME_TYPES)
export const pdfOnlyFileFilter = createUploadFileFilter(new Set(["application/pdf"]))
