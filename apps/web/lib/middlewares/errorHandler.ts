import axios, { AxiosError } from "axios"

export interface ApiError {
  code: string
  message: string
  statusCode: number
  details?: any
  type: "network" | "validation" | "auth" | "server" | "unknown"
}

export const normalizeError = (error: any): ApiError => {
  if (!error.response) {
    return {
      code: "NETWORK ERROR",
      message: error.message || "Network request failed",
      statusCode: 0,
      type: "network",
    }
  }

  const { status, data } = error.response
  const message = data?.message || data?.error || "An error occurred"
  const details = data?.details || null

  if (status === 400) {
    return {
      code: "VALIDATION_ERROR",
      message,
      statusCode: 400,
      details,
      type: "validation",
    }
  }

  // Auth error
  if (status === 401) {
    return {
      code: "UNAUTHORIZED",
      message: "Authentication required",
      statusCode: 401,
      type: "auth",
    }
  }

  // Forbidden error
  if (status === 403) {
    return {
      code: "FORBIDDEN",
      message: "You don't have permission to access this resource",
      statusCode: 403,
      type: "auth",
    }
  }

  // Server error
  if (status >= 500) {
    return {
      code: "SERVER_ERROR",
      message: message || "Server error occurred",
      statusCode: status,
      type: "server",
    }
  }

  //   Unknown error
  return {
    code: "UNKNOWN_ERROR",
    message,
    statusCode: status,
    details,
    type: "unknown",
  }
}

export const logError = (error: ApiError, context?: string) => {
  console.error(`[${context || "API"}] ${error.code}: ${error.message}`, {
    statusCode: error.statusCode,
    details: error.details,
  })
}
