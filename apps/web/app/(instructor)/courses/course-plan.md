# Instructor Courses Module — Implementation Plan

## P0 — Finish Gaps

### 1. Settings Tab
- **File:** `apps/web/app/(instructor)/courses/[id]/page.tsx`
- Add `activeTab === "settings"` render
- **Sub-tasks:**
  - Edit course name, code, description, semester
  - Reuse `createCourseSchema` / `updateCourseSchema` for validation
  - Change cover image, icon, syllabus (reuse upload utils)
  - Archive course button with confirmation dialog
  - Delete course button with confirmation dialog (calls `deleteCourse`)

### 2. Announcements Tab
- **File:** `apps/web/app/(instructor)/courses/[id]/page.tsx`
- Replace the "coming soon" placeholder with an actual component
- **Sub-tasks:**
  - Create `components/common/announcements/index.tsx`
  - Add service file `lib/services/announcements.ts` (CRUD)
  - API routes for announcements (proxy handles via `/api/[...all]`)
  - Display list with create/edit/delete inline
  - Pin important announcements

### 3. Unarchive Flow
- **File:** `apps/web/components/common/course-card/index.tsx` and `data-table/courses-data-table.tsx`
- When viewing archived courses (toggle on), show "Unarchive" action instead of "Edit"
- **Sub-tasks:**
  - Pass `showArchived` prop down to card/table
  - Conditionally render "Unarchive" option
  - Call `unarchiveCourse` service
  - Refresh list after unarchive

## P1 — Core Functionality

### 4. Modules Tab
- **File:** `apps/web/app/(instructor)/courses/[id]/page.tsx`
- Replace "Modules coming soon" placeholder
- **Sub-tasks:**
  - Create `components/modules-manager/index.tsx`
  - Add service file `lib/services/modules.ts`
  - Drag-and-drop reordering
  - Nested lessons within modules
  - Publish/draft toggle per module

### 5. Delete Course
- **File:** `apps/web/components/common/delete-course-dialog/index.tsx` (new)
- Confirm deletion with warning about irreversible data loss
- Call existing `deleteCourse` service
- Only show on archived courses (safety check)

## P2 — Quality of Life

### 6. Bulk Actions
- Add checkbox column to `CoursesDataTable`
- "Select All" in header
- Batch archive / batch delete (via confirmation dialog)
- Floating action bar when items selected

### 7. Course Duplication
- **Action in card/table dropdown:** "Duplicate"
- **Sub-tasks:**
  - Add `duplicateCourse` to courses service
  - API route on backend (clone course + sections)
  - Show progress toast during duplication

## P3 — Stretch

### 8. Wiki Tab
- Markdown editor per course
- Version history
- Search within wiki

### 9. Course Analytics
- Enrollment trends chart (students over time)
- Activity heatmap
- Assessment completion rates

### 10. Pagination
- Server-side pagination for course list
- Page size selector (10/20/50)
- Total count from API

### 11. Import/Export
- CSV import: courses + sections
- CSV export: enrollment report
- Bulk student enrollment via CSV

## Remaining Dead Code
- `apps/web/app/(instructor)/courses/[id]/page.tsx` — remove unused `archiveCourse` import and `handleArchive` function
