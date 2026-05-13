import { NextRequest, NextResponse } from "next/server"

const BACKEND = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : "http://localhost:4000"

const ALLOWED_PATH_PREFIXES = ["/api/"]

const isAllowedPath = (pathname: string) => {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`
  const lower = normalized.toLowerCase()

  if (lower.includes("..") || lower.includes("%2e")) return false

  return ALLOWED_PATH_PREFIXES.some(
    (prefix) => normalized === prefix.slice(0, -1) || normalized.startsWith(prefix),
  )
}

const handler = async (req: NextRequest) => {
  const pathname = req.nextUrl.pathname

  if (!isAllowedPath(pathname)) {
    return NextResponse.json({ error: "Invalid target path" }, { status: 400 })
  }

  const url = new URL(pathname, BACKEND)
  url.search = req.nextUrl.search

  const backendRes = await fetch(url.toString(), {
    method: req.method,
    headers: {
      "content-type": req.headers.get("Content-Type") || "",
      cookie: req.headers.get("cookie") || "",
      origin: req.headers.get("origin") || "http://localhost:3000",
    },
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? await req.blob()
        : undefined,
    redirect: "manual",
  })

  const res = new NextResponse(backendRes.body, {
    status: backendRes.status,
    statusText: backendRes.statusText,
  })

  const setCookie = backendRes.headers.get("set-cookie")
  if (setCookie) res.headers.set("set-cookie", setCookie)

  const location = backendRes.headers.get("location")
  if (location) res.headers.set("location", location)

  return res
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
