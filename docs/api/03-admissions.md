# Module 3 — Admissions

**Base URL prefix:** `/api/v1`
**Auth:** All endpoints require `Authorization: Bearer <token>`

---

## Resource 1: SOA Applications (Sale of Application)

**URL:** `/api/v1/soa-applications`
**Roles:** Create → `admin` | Read → `admin`, `billing` | Update → `admin`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/soa-applications` | Create new SOA entry |
| GET | `/soa-applications` | List all SOA applications |
| GET | `/soa-applications/:id` | Get one SOA application |
| PATCH | `/soa-applications/:id` | Update SOA application |
| DELETE | `/soa-applications/:id` | Delete SOA entry |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | Yes | Student first name |
| `last_name` | string | Yes | Student last name |
| `email` | string | Yes | Student email |
| `phone` | string | Yes | Student phone |
| `whatsapp_number` | string | No | WhatsApp contact |
| `parent_name` | string | Yes | Parent/Guardian name |
| `parent_phone` | string | Yes | Parent contact |
| `parent_email` | string | No | Parent email |
| `community` | string | No | e.g. `OC`, `BC`, `MBC`, `SC`, `ST` |
| `cutoff_physics` | number | No | Physics marks (0–100) |
| `cutoff_chemistry` | number | No | Chemistry marks (0–100) |
| `cutoff_maths` | number | No | Maths marks (0–100) |
| `cutoff_total` | number | No | Total cutoff score |
| `course_id` | integer | Yes | Applied course FK |
| `status` | string | No | `pending`/`confirmed`/`rejected` |

**Success 201:**
```json
{ "id": 1, "first_name": "Ravi", "last_name": "Kumar", "email": "ravi@gmail.com", "status": "pending" }
```

**Query Params (GET list):**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status |
| `course_id` | integer | Filter by course |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

**Errors:** `400 VALIDATION_ERROR` | `401 UNAUTHORIZED` | `403 FORBIDDEN` | `404 NOT_FOUND` | `500 INTERNAL_ERROR`

---

## Resource 2: Students (Perfect Entry)

**URL:** `/api/v1/students`
**Roles:** Create/Update → `admin` | Read → `admin`, `hod`, `faculty`, `billing`, `placement`, `student` (own record)

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/students` | Create student (full admission entry) |
| GET | `/students` | List all students |
| GET | `/students/:id` | Get student details |
| PATCH | `/students/:id` | Update student record |
| DELETE | `/students/:id` | Remove student |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | integer | Yes | FK → `users.id` |
| `soa_id` | integer | No | FK → `soa_applications.id` |
| `first_name` | string | Yes | |
| `last_name` | string | Yes | |
| `student_id_no` | string | Yes | College-issued ID |
| `roll_no` | string | Yes | Class roll number |
| `register_no` | string | Yes | University register number |
| `aadhar_number` | string | No | 12-digit Aadhaar |
| `pan_number` | string | No | PAN card number |
| `dob` | string | No | ISO date |
| `gender` | string | No | `M`/`F`/`Other` |
| `community` | string | No | `OC`/`BC`/`MBC`/`SC`/`ST` |
| `student_type` | string | Yes | `day_scholar`/`hosteller` |
| `transport_used` | boolean | No | Uses college transport |
| `transport_route_id` | integer | No | FK → transport route |
| `hostel_room_id` | integer | No | FK → hostel room |
| `first_graduate` | boolean | No | First graduate in family |
| `sports_quota` | boolean | No | Admitted via sports quota |
| `class_id` | integer | Yes | FK → `classes.id` |
| `batch_id` | integer | Yes | FK → `batches.id` |
| `status` | string | No | `active`/`inactive`/`graduated` |

**Success 201:**
```json
{
  "id": 1, "student_id_no": "2022AIDS001", "roll_no": "001",
  "first_name": "Priya", "last_name": "Sharma",
  "student_type": "day_scholar", "class_id": 1, "status": "active"
}
```

**Query Params (GET list):**
| Param | Type | Description |
|-------|------|-------------|
| `class_id` | integer | Filter by class |
| `batch_id` | integer | Filter by batch |
| `department_id` | integer | Filter by department |
| `status` | string | Filter by status |
| `student_type` | string | `day_scholar` / `hosteller` |

---

## Resource 3: Bonafide Certificates

**URL:** `/api/v1/bonafide`
**Roles:** Create → `student` | Read → `student` (own), `admin`, `hod` | Update → `admin`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/bonafide` | Student requests bonafide certificate |
| GET | `/bonafide` | List requests |
| GET | `/bonafide/:id` | Get request |
| PATCH | `/bonafide/:id` | Approve / reject / mark issued |
| DELETE | `/bonafide/:id` | Delete request |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | integer | Yes | FK → `students.id` |
| `reason_id` | integer | Yes | FK → predefined reasons list |
| `purpose` | string | No | Additional purpose text |

**PATCH Body:**
| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `pending`/`approved`/`issued`/`rejected` |
| `remarks` | string | Admin remarks |

**Success 201:** `{ "id": 1, "student_id": 1, "reason_id": 2, "status": "pending", "created_at": "..." }`

---

## Resource 4: Certificates

**URL:** `/api/v1/certificates`
**Roles:** Create/Read/Update → `admin`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/certificates` | Issue certificate |
| GET | `/certificates` | List certificates |
| GET | `/certificates/:id` | Get certificate |
| PATCH | `/certificates/:id` | Update status |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | integer | Yes | FK → `students.id` |
| `type` | string | Yes | e.g. `Transfer Certificate`, `Conduct Certificate` |
| `issued_date` | string | Yes | ISO date |
| `remarks` | string | No | Notes |

---

## Resource 5: On-Duty (OD) Requests

**URL:** `/api/v1/od`
**Roles:** Create → `student` | Approve (faculty) → `faculty` | Approve (hod) → `hod` | Read → all relevant roles

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/od` | Student creates OD request |
| GET | `/od` | List OD requests |
| GET | `/od/:id` | Get OD request |
| PATCH | `/od/:id` | Update / approve OD |
| DELETE | `/od/:id` | Cancel OD |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | integer | Yes | Requesting student |
| `od_type` | string | Yes | `individual`/`team` |
| `team_code` | string | No | Unique team code (for team OD join) |
| `reason` | string | Yes | Purpose of OD |
| `from_date` | string | Yes | ISO date |
| `to_date` | string | Yes | ISO date |
| `event_name` | string | No | Event or competition name |
| `venue` | string | No | Location |

### PATCH Body (Approval)

| Field | Type | Description |
|-------|------|-------------|
| `mentor_approved` | boolean | Faculty/mentor approval |
| `hod_approved` | boolean | HoD approval |
| `status` | string | `pending`/`approved`/`rejected` |
| `remarks` | string | Rejection reason |

**Success 201:**
```json
{
  "id": 1, "student_id": 4, "od_type": "individual",
  "reason": "Hackathon participation", "from_date": "2026-08-10",
  "to_date": "2026-08-11", "status": "pending"
}
```

**Approval Flow:**
```
Student creates OD → mentor_approved = null → hod_approved = null
  → Faculty approves → mentor_approved = true → goes to HoD
  → HoD approves → hod_approved = true → status = 'approved'
  → If dept differs → goes to respective dept HoD
```

---

## Resource 6: Student Leaves

**URL:** `/api/v1/student-leaves`
**Roles:** Create → `student` | Approve → `faculty` (first), `hod` (final) | Read → `student`, `faculty`, `hod`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/student-leaves` | Student applies for leave |
| GET | `/student-leaves` | List leave requests |
| GET | `/student-leaves/:id` | Get leave request |
| PATCH | `/student-leaves/:id` | Approve / reject leave |
| DELETE | `/student-leaves/:id` | Cancel leave |

### POST Body


| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | integer | Yes | FK → `students.id` |
| `from_date` | string | Yes | ISO date |
| `to_date` | string | Yes | ISO date |
| `reason` | string | Yes | Leave reason |
| `leave_type` | string | No | `medical`/`personal`/`emergency` |

### PATCH Body (Approval)

| Field | Type | Description |
|-------|------|-------------|
| `faculty_approved` | boolean | Mentor approval |
| `hod_approved` | boolean | HoD approval |
| `status` | string | `pending`/`approved`/`rejected` |
| `remarks` | string | Notes |

**Errors:** `400` | `401` | `403` | `404` | `500`
