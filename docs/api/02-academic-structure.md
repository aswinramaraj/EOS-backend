# Module 2 — Academic Structure

**Base URL prefix:** `/api/v1`
**Auth:** All endpoints require `Authorization: Bearer <token>`

---

## Resource 1: Departments

**URL:** `/api/v1/departments`
**Allowed Roles:**

| Operation | Roles |
|-----------|-------|
| Create / Update / Delete | `admin` |
| Read | `admin`, `hod`, `faculty`, `academic_coordinator` |

### Endpoints

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/departments` | Create a new department |
| GET | `/departments` | List all departments |
| GET | `/departments/:id` | Get a single department |
| PATCH | `/departments/:id` | Update department |
| DELETE | `/departments/:id` | Delete department |

### POST / PATCH Request Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | Max 100 | Department full name (e.g. `AI & Data Science`) |
| `code` | string | Yes | Max 20, unique | Short code (e.g. `AIDS`) |
| `description` | string | No | Max 500 | Optional description |

### Success Responses

**POST 201:**
```json
{ "id": 1, "name": "AI & Data Science", "code": "AIDS", "description": null, "created_at": "..." }
```

**GET list 200:**
```json
{ "data": [{ "id": 1, "name": "...", "code": "..." }], "total": 5, "page": 1, "limit": 20 }
```

**GET /:id 200:** Single department object.
**PATCH 200:** Updated department object.
**DELETE 200:** `{ "message": "Department deleted successfully" }`

### Errors
`400 VALIDATION_ERROR` | `401 UNAUTHORIZED` | `403 FORBIDDEN` | `404 NOT_FOUND` | `409 CONFLICT (duplicate code)` | `500 INTERNAL_ERROR`

---

## Resource 2: Courses

**URL:** `/api/v1/courses`
**Roles:** Create/Update/Delete → `admin` | Read → `admin`, `hod`, `faculty`, `academic_coordinator`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/courses` | Create course |
| GET | `/courses` | List courses |
| GET | `/courses/:id` | Get course |
| PATCH | `/courses/:id` | Update course |
| DELETE | `/courses/:id` | Delete course |

### POST / PATCH Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | Max 150 | Course name (e.g. `B.E Computer Science`) |
| `code` | string | Yes | Max 20, unique | Course code |
| `department_id` | integer | Yes | Must exist | FK → `departments.id` |
| `duration_years` | integer | No | 1–6 | Duration in years |
| `description` | string | No | Max 500 | Optional |

**Success:** `{ "id": 1, "name": "B.E Computer Science", "code": "CSE", "department_id": 1 }`

**Errors:** `400` | `401` | `403` | `404` | `409` | `500`

---

## Resource 3: Batches

**URL:** `/api/v1/batches`
**Roles:** Create/Update/Delete → `admin` | Read → `admin`, `hod`, `faculty`, `academic_coordinator`, `coe`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/batches` | Create batch |
| GET | `/batches` | List batches |
| GET | `/batches/:id` | Get batch |
| PATCH | `/batches/:id` | Update batch |
| DELETE | `/batches/:id` | Delete batch |

### POST / PATCH Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | Max 50 | e.g. `2022-2026` |
| `start_year` | integer | Yes | 4 digits | Batch start year |
| `end_year` | integer | Yes | > start_year | Batch end year |
| `course_id` | integer | Yes | Must exist | FK → `courses.id` |
| `is_active` | boolean | No | default true | Active status |

**Success:** `{ "id": 1, "name": "2022-2026", "start_year": 2022, "end_year": 2026, "course_id": 1 }`

**Errors:** `400` | `401` | `403` | `404` | `409` | `500`

---

## Resource 4: Classes

**URL:** `/api/v1/classes`
**Roles:** Create/Update/Delete → `admin` | Read → all staff roles

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/classes` | Create class section |
| GET | `/classes` | List all classes |
| GET | `/classes/:id` | Get class |
| PATCH | `/classes/:id` | Update class |
| DELETE | `/classes/:id` | Delete class |

### POST / PATCH Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | Max 10 | Section label e.g. `A`, `B` |
| `batch_id` | integer | Yes | Must exist | FK → `batches.id` |
| `department_id` | integer | Yes | Must exist | FK → `departments.id` |
| `current_semester` | integer | No | 1–8 | Current semester |
| `current_year` | integer | No | 1–4 | Current academic year |

**Success:** `{ "id": 1, "name": "A", "batch_id": 1, "department_id": 1, "current_semester": 3 }`

---

## Resource 5: Subjects

**URL:** `/api/v1/subjects`
**Roles:** Create/Update/Delete → `admin` | Read → all staff + student

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/subjects` | Create subject |
| GET | `/subjects` | List subjects |
| GET | `/subjects/:id` | Get subject |
| PATCH | `/subjects/:id` | Update subject |
| DELETE | `/subjects/:id` | Delete subject |

### POST / PATCH Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | Max 150 | Subject name |
| `course_code` | string | Yes | Max 20, unique | Subject course code |
| `department_id` | integer | Yes | Must exist | FK → `departments.id` |
| `semester` | integer | Yes | 1–8 | Applicable semester |
| `credits` | integer | No | 1–6 | Credit hours |
| `type` | string | No | `theory`/`lab`/`elective` | Subject type |

**Success:** `{ "id": 1, "name": "Data Structures", "course_code": "CS201", "semester": 3 }`

---

## Resource 6: Academic Calendar

**URL:** `/api/v1/academic-calendar`
**Roles:** Create/Update/Delete → `academic_coordinator` | Read → all roles

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/academic-calendar` | Create calendar entry |
| GET | `/academic-calendar` | List calendar entries |
| GET | `/academic-calendar/:id` | Get entry |
| PATCH | `/academic-calendar/:id` | Update entry |
| DELETE | `/academic-calendar/:id` | Delete entry |

### POST / PATCH Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `batch_id` | integer | Yes | Must exist | FK → `batches.id` |
| `semester` | integer | Yes | 1–8 | Semester number |
| `academic_year` | string | Yes | e.g. `2024-25` | Academic year label |
| `start_date` | string | Yes | ISO date | Semester start date |
| `end_date` | string | Yes | ISO date, after start | Semester end date |
| `events` | array | No | Array of `{ date, label, type }` | Holidays, exams, etc. |

**Success:**
```json
{
  "id": 1, "batch_id": 1, "semester": 3,
  "academic_year": "2024-25",
  "start_date": "2024-07-01", "end_date": "2024-11-30",
  "events": [{ "date": "2024-08-15", "label": "Independence Day", "type": "holiday" }]
}
```

**Errors:** `400` | `401` | `403` | `404` | `500`
