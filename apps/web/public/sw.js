const CACHE_NAME = "klasee-v1"
const APP_SHELL = ["/", "/login", "/signup"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  // Only cache GET requests, skip API calls and Next.js internals
  if (event.request.method !== "GET") return
  if (event.request.url.includes("/api/")) return
  if (event.request.url.includes("/_next/")) return

  // Network-first for all requests — always prefer fresh content, fall back to cache when offline
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
