# Klasee — Implementation Status

_Updated after each completed feature. Format: [YYYY-MM-DD] description._

---

## ✅ Completed

### Backend API (all 14 modules)
- Announcement: CRUD with section-level filtering for students
- Assessment: CRUD, scoring, cascading deletes, publish gating
- Assignment Group: CRUD with course ownership
- Assignment Submission: submit, resubmit, grade with late penalty
- Attendance: CRUD + bulk upsert + offline sync support
- Gradebook: read-only aggregation with weighted groups, drop-lowest, late penalties
- Invitation: token-based enrollment with capacity checks
- Lesson: CRUD + reorder, file attachment
- Module: CRUD + reorder
- Question: CRUD + reorder, RBAC for students
- Quiz Attempt: start/resume/submit with auto-grading
- Enrollment: join by code, capacity check, drop
- Drive: Google Drive OAuth, folder structure, upload/download/stream
- Due Date Override: upsert/delete per section or student

### Instructor Frontend
- Layout: sidebar nav, header, upload dialog, new course dialog, course selector
- Dashboard: real-time greeting, recent courses grid, loading states
- Courses: full CRUD, archive, unarchive, duplicate, bulk actions
- Course detail — Announcements tab: create/edit/delete/pin, section targeting
- Course detail — Sections tab: create/edit/delete, join code generation
- Course detail — Students tab: enrollment list, student detail sheet, drop
- Course detail — Files tab: Google Drive file manager (folders, upload, rename, move)
- Course detail — Modules tab: drag-and-drop modules + lessons, publish toggle
- Course detail — Assessments tab: list with publish toggle, edit, delete, late policy, due date overrides
- Course detail — Settings tab: edit metadata, cover/icon/syllabus upload, join codes, invite links, archive/delete
- Quiz/exam builder: full question editor (MCQ, T/F, essay, fill-in), reorder, points auto-total
- Assignment configuration: instructions, file types, max files, late policy
- Grading panel: per-student score entry, feedback, quiz attempt review
- Attendance: offline-first with sync queue, history per student, note field
- Sections list: join code display, enrollment counts
- Section detail: join code copy/regenerate, student list
- Students list: all enrollments across courses, student detail sheet

### Student Frontend
- Layout + navbar: responsive, join course, search, logout
- Dashboard: active enrolled courses
- My Courses: course list + course detail (modules, files, announcements, quizzes, assignments)
- Quiz taking: all question types, countdown timer, auto-submit, result review
- Assignment submission: text + multi-file upload, resubmission, grading display
- All Assessments: aggregated view, overdue alerts, due date sorting
- Attendance: per-section summary + record history
- Grades: weighted groups, drop-lowest, late penalty display
- Lessons: page/video/embed/file with previous/next navigation
- Join Course: 6-char code dialog

---

## 🔄 In Progress

_(fill in as work starts)_

---

## 🔲 To Do

### Phase 1 — Critical Fixes
- [x] 1.1 [2026-06-01] Redirect to questions editor after quiz/exam creation; partial question failure handled gracefully
- [x] 1.2 [2026-06-01] Loading + not-found + error boundary for (quiz-builder) routes
- [x] 1.3 [2026-06-01] Specific 409 error from API + specific toast for duplicate course code
- [x] 1.4 [2026-06-01] Module deletion cascades to lessons + CourseFile cleanup (backend)
- [x] 1.5 [2026-06-01] Invitation revoke/list — course ownership check added (backend)
- [x] 1.6 [2026-06-01] Student profile page (read-only) + settings placeholder page; navbar links fixed

### Phase 2 — Feature Completion
- [x] 2.1 [2026-06-01] Assignment submission viewer for instructors in grading panel
- [x] 2.2 [2026-06-01] Inline grade entry in gradebook data table (upsert backend endpoint + EditableScoreCell + grades page refresh)
- [x] 2.3 [2026-06-01] Schedules page — rebuilt as section-level view per course with SchedulePicker inline editing
- [x] 2.4 [2026-06-01] Dashboard — edit action opens NewCourseDialog, 3 stat chips (students/sections/assessments), "View All" link when >9 courses
- [x] 2.5 [2026-06-01] Students page — email added to search filter, 25-per-page pagination, onDrop re-fetches list

### Phase 3 — Production Hardening
- [x] 3.1 [2026-06-01] N+1 score queries fixed — single GET /assessments/scores?courseId=:id replaces per-assessment loop
- [x] 3.2 [2026-06-01] Bell/mail icons in instructor header wrapped with "Coming soon" tooltips
- [x] 3.3 [2026-06-01] Drive upload + uploadLessonFile endpoints — course ownership check via verifyCourseOwnership
- [x] 3.4 [2026-06-01] Deleted stale apps/web/app/(instructor)/courses/course-plan.md

### Backlog (future sprints)
- [ ] Wiki tab (per-course Markdown editor)
- [ ] Notifications system (real-time, in-app inbox)
- [ ] In-app messaging (mail icon)
- [ ] CSV enrollment import
- [ ] CSV gradebook export
- [ ] Letter grades (configurable per course)
- [ ] Course analytics (enrollment trends, completion rates)
- [ ] Attendance reports/export
- [ ] Bulk actions on students (message, export, drop)
- [ ] Server-side pagination for courses list
- [ ] Student profile editing (avatar, password change)
- [ ] Notification preferences
