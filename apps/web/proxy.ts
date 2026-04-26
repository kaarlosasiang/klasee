import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login", "/signup"]
const AUTH_PATHS = ["/login", "/signup"]

const INSTRUCTOR_PATHS = ["/dashboard"]
const STUDENT_PATHS = ["/my-dashboard"]

const ROLE_REDIRECTS: Record<string, string> = {
  instructor: "/dashboard",
  student: "/my-dashboard",
  admin: "/dashboard",
}
const DEFAULT_AUTHENTICATED_PATH = "/dashboard"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  let isAuthenticated = false
  let userRole: string | null = null

  try {
    const sessionRes = await fetch(`${API_URL}/auth/get-session`, {
      headers: { cookie: req.headers.get("cookie") ?? "" },
    })
    const session = sessionRes.ok ? await sessionRes.json() : null
    isAuthenticated = !!session?.user
    userRole = session?.user?.role ?? null
  } catch {
    isAuthenticated = false
  }

  const redirectPath = userRole
    ? (ROLE_REDIRECTS[userRole] ?? DEFAULT_AUTHENTICATED_PATH)
    : DEFAULT_AUTHENTICATED_PATH

  // Root path → redirect based on auth + role
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthenticated ? redirectPath : "/login", req.url)
    )
  }

  // Already logged in → redirect away from auth pages
  if (isAuthenticated && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }

  // Role-based route guards — authenticated but wrong role
  if (isAuthenticated && userRole) {
    const isInstructorPath = INSTRUCTOR_PATHS.some((p) =>
      pathname.startsWith(p)
    )
    const isStudentPath = STUDENT_PATHS.some((p) => pathname.startsWith(p))

    if (isInstructorPath && userRole !== "instructor" && userRole !== "admin") {
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }

    if (isStudentPath && userRole !== "student") {
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
  }

  // Not logged in → redirect to login
  if (!isAuthenticated && !PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|sw\\.js|workbox-.*|icons|manifest\\.json).*)",
  ],
}
