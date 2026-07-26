# Module 5 — Examinations (COE)

**Base URL prefix:** `/api/v1`
**Auth:** All endpoints require `Authorization: Bearer <token>`

---

## Resource 1: Exam Types

**URL:** `/api/v1/exam-types`
**Roles:** Create/Update/Delete → `coe`, `admin` | Read → all

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/exam-types` | Create exam type |
| GET | `/exam-types` | List exam types |
| GET | `/exam-types/:id` | Get exam type |
| PATCH | `/exam-types/:id` | Update |
| DELETE | `/exam-types/:id` | Delete |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | e.g. `CIA 1`, `Lab Exam`, `University End Semester` |
| `code` | string | Yes | Short code e.g. `CIA1` |
| `max_marks` | number | Yes | Maximum marks |
| `is_university` | boolean | No | University exam flag |

**Success 201:** `{ "id": 1, "name": "CIA 1", "code": "CIA1", "max_marks": 20 }`

---

## Resource 2: Exams

**URL:** `/api/v1/exams`
**Roles:** Create/Update/Delete → `coe` | Read → `coe`, `faculty`, `student`, `hod`, `admin`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/exams` | Create exam (auto-maps courses) |
| GET | `/exams` | List exams |
| GET | `/exams/:id` | Get exam |
| PATCH | `/exams/:id` | Update exam |
| DELETE | `/exams/:id` | Delete exam |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `exam_type_id` | integer | Yes | FK → `exam_types.id` |
| `batch_id` | integer | Yes | Target batch |
| `semester` | integer | Yes | 1–8 |
| `academic_year` | string | Yes | e.g. `2024-25` |
| `title` | string | Yes | Exam label |
| `start_date` | string | Yes | ISO date |
| `end_date` | string | Yes | ISO date |
| `timetable` | array | No | `[{ subject_id, date, start_time, end_time, venue }]` |
| `is_published` | boolean | No | Visible to students |

**Note:** When `batch_id` is set, subjects for the semester are auto-mapped.

---

## Resource 3: Hall Plans

**URL:** `/api/v1/hall-plans`
**Roles:** Create/Update → `coe` | Read → `coe`, `student`, `faculty`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/hall-plans` | Create hall plan with seating |
| GET | `/hall-plans` | List hall plans |
| GET | `/hall-plans/:id` | Get with seating details |
| PATCH | `/hall-plans/:id` | Update |
| DELETE | `/hall-plans/:id` | Delete |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `exam_id` | integer | Yes | FK → `exams.id` |
| `venue_id` | integer | Yes | FK → `venues.id` |
| `date` | string | Yes | ISO date |
| `session` | string | Yes | `FN` / `AN` |
| `seating` | array | No | `[{ student_id, seat_number }]` |

---

## Resource 4: Invigilation Duty

**URL:** `/api/v1/invigilation`
**Roles:** Create/Update → `coe` | Read → `coe`, `faculty`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/invigilation` | Assign invigilator |
| GET | `/invigilation` | List duties |
| GET | `/invigilation/:id` | Get duty |
| PATCH | `/invigilation/:id` | Update assignment |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hall_plan_id` | integer | Yes | FK → `hall_plans.id` |
| `faculty_id` | integer | Yes | Assigned faculty |
| `role` | string | No | `chief_invigilator` / `invigilator` |

---

## Resource 5: Marks

**URL:** `/api/v1/marks`
**Roles:** Create/Update → `faculty` | Read → `faculty`, `hod`, `student`, `coe`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/marks` | Enter marks |
| GET | `/marks` | List marks |
| GET | `/marks/:id` | Get record |
| PATCH | `/marks/:id` | Update marks |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `exam_id` | integer | Yes | FK → `exams.id` |
| `subject_id` | integer | Yes | FK → `subjects.id` |
| `class_id` | integer | Yes | FK → `classes.id` |
| `entries` | array | Yes | `[{ student_id, marks_obtained, is_absent }]` |

---

## Resource 6: Results

**URL:** `/api/v1/results`
**Roles:** Publish → `coe` | Read → `coe`, `student`, `parent`, `faculty`, `hod`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/results` | Publish exam results |
| GET | `/results` | List results |
| GET | `/results/:id` | Get result details |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `exam_id` | integer | Yes | FK → `exams.id` |
| `batch_id` | integer | Yes | Target batch |
| `published_at` | string | No | ISO datetime |

---

## Resource 7: Revaluation

**URL:** `/api/v1/revaluation`
**Roles:** Create → `student` | Process → `coe`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/revaluation` | Student applies |
| GET | `/revaluation` | List requests |
| GET | `/revaluation/:id` | Get request |
| PATCH | `/revaluation/:id` | COE updates marks |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | integer | Yes | |
| `exam_id` | integer | Yes | University exam only |
| `subject_id` | integer | Yes | |
| `reason` | string | No | |

### PATCH Body (COE)

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `pending`/`under_review`/`completed` |
| `revised_marks` | number | Updated marks |
| `remarks` | string | Notes |
