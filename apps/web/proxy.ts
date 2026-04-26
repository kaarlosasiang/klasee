import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login", "/signup"]
const AUTH_PATHS = ["/login", "/signup"] // redirect to dashboard if already logged in
const DEFAULT_AUTHENTICATED_PATH = "/dashboard"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  let isAuthenticated = false
  try {
    const sessionRes = await fetch(`${API_URL}/auth/get-session`, {
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    })
    const session = sessionRes.ok ? await sessionRes.json() : null
    isAuthenticated = !!session?.user
  } catch {
    // If the API is unreachable, fail open for public paths only
    isAuthenticated = false
  }

  // Root path → redirect based on auth status
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthenticated ? DEFAULT_AUTHENTICATED_PATH : "/login", req.url)
    )
  }

  // Already logged in → redirect away from auth pages
  if (isAuthenticated && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL(DEFAULT_AUTHENTICATED_PATH, req.url))
  }

  // Not logged in → redirect to login from protected pages
  if (!isAuthenticated && !PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api|sw\\.js|workbox-.*|icons|manifest\\.json).*)",
  ],
}
