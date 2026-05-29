# Upload Stability & Error Handling Fixes

## Backend

### 1. Fix disconnect scope bug
**File:** `apps/api/src/modules/drive/driveService.ts:266`
- Change: `deleteMany({})` → `deleteMany({ userId })`
- Prevents wiping all instructors' course folder IDs when one user disconnects

### 2. Add multer file size limit
**File:** `apps/api/src/modules/drive/driveRoutes.ts:7`
- Change: `multer({ storage: multer.memoryStorage() })` → `multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } })`
- Prevents OOM on large uploads (50MB max)

### 3. Add warning log for silent Drive validation failure
**File:** `apps/api/src/modules/drive/driveService.ts:332`
- Add `logger.warn(...)` inside the silent catch block so operators can detect recurring Drive auth issues

## Frontend

### 4. Graceful token refresh failure (the "redirect to dashboard" bug)
**File:** `apps/web/lib/middlewares/tokenManager.ts:27-28`
- Before `logout()` and `window.location.href`, show a toast: `"Session expired. Please log in again."`
- Add a `setTimeout` (500ms) so the toast shows before the redirect

### 5. Use real error messages in ModulesManager upload
**File:** `apps/web/components/modules-manager/index.tsx:403-404`
- Change: `catch { toast.error("Upload failed — open the Files tab to initialize course folders first") }`
- To: `catch (err: any) { toast.error(err?.message || "Upload failed") }`
- This shows the backend's actual error messages (e.g., "Course materials folder not set up...")
- Also add `import { ApiError } from "@/lib/middlewares/errorHandler"` to extract `.message` from Axios errors

### 6. Drive disconnected indicator in FileManager
**File:** `apps/web/components/common/file-manager/index.tsx`
- After fetching Drive status, if `connected` but token/account issues cause listing failures, show a yellow banner: "Drive connection is unstable — files shown may be outdated"
- Store `driveStatus.unstable` flag in state and check it in the render

## Summary of fixes

| # | Problem | Root Cause | Fix |
|---|---------|------------|-----|
| 1 | Disconnect wipes all courses' folder IDs | `deleteMany({})` no filter | Add `{ userId }` filter |
| 2 | Large files crash server | No multer file size limit | Add 50MB limit |
| 3 | Silent Drive auth failures | Empty catch block | Add logger.warn |
| 4 | Silent redirect to login on expiry | Hard `window.location.href` | Show toast first, then redirect |
| 5 | Hardcoded upload error messages | Ignoring `err.message` | Pass through actual error |
| 6 | Stale file listings without warning | Masked Drive connection errors | Show unstable indicator banner |
