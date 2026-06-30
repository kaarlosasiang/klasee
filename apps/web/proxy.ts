import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
]
const AUTH_PATHS = ["/login", "/signup"]

const INSTRUCTOR_PATHS = ["/dashboard", "/courses"]
const STUDENT_PATHS = ["/my-dashboard", "/my-courses", "/my-assessments", "/my-attendance"]

const ROLE_REDIRECTS: Record<string, string> = {
  instructor: "/dashboard",
  student: "/my-dashboard",
  admin: "/admin-dashboard",
}

const DEFAULT_AUTHENTICATED = "/my-dashboard"

const STATIC_ASSET_PATTERN = /\.(?:png|jpe?g|gif|svg|webp|ico|css|js|json|txt|woff2?|ttf|eot|map)$/i

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : "http://localhost:4000"
  
const AUTH_API_URL = `${API_ORIGIN}/api/auth`

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico" || STATIC_ASSET_PATTERN.test(pathname)) {
    return NextResponse.next()
  }

  let isAuthenticated = false
  let role: string | null = null

  try {
    const sessionRes = await fetch(`${AUTH_API_URL}/get-session`, {
      headers: { cookie: req.headers.get("cookie") ?? "" },
    })
    if (sessionRes.ok) {
      const session = await sessionRes.json()
      isAuthenticated = !!session?.user
      role = session?.user?.role ?? null
    }
  } catch {}

  const redirectPath = role
    ? (ROLE_REDIRECTS[role] ?? DEFAULT_AUTHENTICATED)
    : DEFAULT_AUTHENTICATED
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthenticated ? redirectPath : "/login", req.url)
    )
  }
  if (isAuthenticated && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }
  if (isAuthenticated && role) {
    const onInstructorPath = INSTRUCTOR_PATHS.some((p) =>
      pathname.startsWith(p)
    )
    const onStudentPath = STUDENT_PATHS.some((p) => pathname.startsWith(p))
    if (onInstructorPath && role !== "instructor" && role !== "admin") {
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
    if (onStudentPath && role !== "student") {
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
  }
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
