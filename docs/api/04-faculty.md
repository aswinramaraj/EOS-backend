# Module 4 — Faculty

**Base URL prefix:** `/api/v1`
**Auth:** All endpoints require `Authorization: Bearer <token>`

---

## Resource 1: Faculty Management

**URL:** `/api/v1/faculty`
**Roles:** Create/Delete → `admin` | Update → `admin`, `faculty` (own) | Read → `admin`, `hod`, `faculty`, `hr_payroll`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/faculty` | Create faculty record |
| GET | `/faculty` | List all faculty |
| GET | `/faculty/:id` | Get faculty details |
| PATCH | `/faculty/:id` | Update faculty |
| DELETE | `/faculty/:id` | Remove faculty |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | integer | Yes | FK → `users.id` |
| `first_name` | string | Yes | |
| `last_name` | string | Yes | |
| `designation` | string | Yes | e.g. `Assistant Professor` |
| `department_id` | integer | Yes | FK → `departments.id` |
| `employee_id` | string | Yes | College employee ID |
| `aadhar_number` | string | No | 12-digit |
| `pan_number` | string | No | PAN card |
| `bank_account` | string | No | Bank account number |
| `bank_ifsc` | string | No | IFSC code |
| `phone` | string | No | Contact number |
| `email_official` | string | No | Official email |
| `qualification` | string | No | Highest qualification |
| `experience_years` | integer | No | Teaching experience |
| `joining_date` | string | No | ISO date |
| `status` | string | No | `active`/`inactive` |

**Success 201:** `{ "id": 1, "employee_id": "FAC001", "first_name": "Dr. Raj", "designation": "Assistant Professor" }`

**Query Params (GET list):**
| Param | Type | Description |
|-------|------|-------------|
| `department_id` | integer | Filter by department |
| `status` | string | `active` / `inactive` |

---

## Resource 2: Faculty Mapping (Class & Subject Assignment)

**URL:** `/api/v1/faculty-mapping`
**Roles:** Create/Update/Delete → `hod` | Read → `hod`, `admin`, `faculty`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/faculty-mapping` | Assign faculty to class+subject |
| GET | `/faculty-mapping` | List all mappings |
| GET | `/faculty-mapping/:id` | Get mapping |
| PATCH | `/faculty-mapping/:id` | Update mapping |
| DELETE | `/faculty-mapping/:id` | Remove mapping |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `faculty_id` | integer | Yes | FK → `faculty.id` |
| `class_id` | integer | Yes | FK → `classes.id` |
| `subject_id` | integer | Yes | FK → `subjects.id` |
| `is_mentor` | boolean | No | Is this faculty the class mentor |
| `academic_year` | string | Yes | e.g. `2024-25` |
| `semester` | integer | Yes | 1–8 |

**Success:** `{ "id": 1, "faculty_id": 1, "class_id": 2, "subject_id": 3, "is_mentor": false }`

---

## Resource 3: Attendance

**URL:** `/api/v1/attendance`
**Roles:** Create/Update → `faculty` | Read → `faculty`, `hod`, `admin`, `student` (own), `parent` (child's)

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/attendance` | Mark attendance for a class session |
| GET | `/attendance` | List attendance records |
| GET | `/attendance/:id` | Get single record |
| PATCH | `/attendance/:id` | Edit attendance (bulk edit by secretary/admin) |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `class_id` | integer | Yes | FK → `classes.id` |
| `subject_id` | integer | Yes | FK → `subjects.id` |
| `faculty_id` | integer | Yes | Faculty marking attendance |
| `date` | string | Yes | ISO date |
| `session` | string | Yes | `morning`/`afternoon`/`period_1`…etc |
| `records` | array | Yes | Array of `{ student_id, status }` |
| `records[].student_id` | integer | Yes | FK → `students.id` |
| `records[].status` | string | Yes | `present`/`absent`/`od`/`leave` |

**Success 201:** `{ "id": 1, "class_id": 1, "date": "2026-07-26", "session": "period_1", "total_present": 42 }`

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `class_id` | integer | Filter by class |
| `date` | string | Specific date |
| `from_date` | string | Date range start |
| `to_date` | string | Date range end |
| `student_id` | integer | Individual student |

---

## Resource 4: Timetable

**URL:** `/api/v1/timetable`
**Roles:** Create/Update/Delete → `hod` | Read → `hod`, `faculty`, `student`, `admin`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/timetable` | Create timetable entry |
| GET | `/timetable` | List timetable |
| GET | `/timetable/:id` | Get entry |
| PATCH | `/timetable/:id` | Update entry |
| DELETE | `/timetable/:id` | Remove entry |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `class_id` | integer | Yes | FK → `classes.id` |
| `subject_id` | integer | Yes | FK → `subjects.id` |
| `faculty_id` | integer | Yes | FK → `faculty.id` |
| `day_of_week` | string | Yes | `MON`/`TUE`/`WED`/`THU`/`FRI`/`SAT` |
| `period_number` | integer | Yes | 1–8 |
| `start_time` | string | Yes | `HH:MM` |
| `end_time` | string | Yes | `HH:MM` |
| `semester` | integer | Yes | 1–8 |
| `academic_year` | string | Yes | e.g. `2024-25` |

---

## Resource 5: Lesson Plans

**URL:** `/api/v1/lesson-plans`
**Roles:** Create/Update → `faculty` | Read → `faculty`, `hod`, `student`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/lesson-plans` | Create lesson plan |
| GET | `/lesson-plans` | List lesson plans |
| GET | `/lesson-plans/:id` | Get plan |
| PATCH | `/lesson-plans/:id` | Update plan |
| DELETE | `/lesson-plans/:id` | Delete plan |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `faculty_mapping_id` | integer | Yes | FK → `faculty_mapping.id` |
| `unit_number` | integer | Yes | Unit number |
| `topic` | string | Yes | Topic/subtopic |
| `planned_date` | string | Yes | ISO date |
| `actual_date` | string | No | When actually taught |
| `teaching_method` | string | No | e.g. `lecture`, `demo`, `lab` |
| `remarks` | string | No | Notes |

---

## Resource 6: LMS Notes

**URL:** `/api/v1/lms-notes`
**Roles:** Create/Update/Delete → `faculty` | Read → `faculty`, `student` (mapped class)

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/lms-notes` | Upload/create note |
| GET | `/lms-notes` | List notes |
| GET | `/lms-notes/:id` | Get note |
| PATCH | `/lms-notes/:id` | Update note |
| DELETE | `/lms-notes/:id` | Delete note |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `faculty_mapping_id` | integer | Yes | FK → `faculty_mapping.id` |
| `title` | string | Yes | Note title |
| `content` | string | No | Text content / description |
| `file_url` | string | No | URL to uploaded PDF/PPT |
| `unit_number` | integer | No | Associated unit |
| `is_published` | boolean | No | Visible to students |

---

## Resource 7: Faculty Leaves

**URL:** `/api/v1/faculty-leaves`
**Roles:** Create → `faculty` | Approve (HoD) → `hod` | Approve (HR) → `hr_payroll` | Read → `faculty`, `hod`, `hr_payroll`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/faculty-leaves` | Faculty applies for leave |
| GET | `/faculty-leaves` | List leave requests |
| GET | `/faculty-leaves/:id` | Get request |
| PATCH | `/faculty-leaves/:id` | Approve / reject |
| DELETE | `/faculty-leaves/:id` | Cancel leave |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `faculty_id` | integer | Yes | FK → `faculty.id` |
| `leave_type` | string | Yes | `casual`/`medical`/`earned`/`emergency` |
| `from_date` | string | Yes | ISO date |
| `to_date` | string | Yes | ISO date |
| `reason` | string | Yes | Leave reason |
| `document_url` | string | No | Supporting doc (medical cert etc.) |

### PATCH Body (Approval)

| Field | Type | Description |
|-------|------|-------------|
| `hod_approved` | boolean | HoD approval |
| `hr_approved` | boolean | HR approval (after HoD approval) |
| `status` | string | `pending`/`approved`/`rejected` |
| `remarks` | string | Notes |

---

## Resource 8: Appraisal

**URL:** `/api/v1/appraisal`
**Roles:** Create → `faculty` | Review → `hod` | Process → `hr_payroll` | Read → `faculty` (own), `hod`, `hr_payroll`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/appraisal` | Faculty submits appraisal |
| GET | `/appraisal` | List appraisals |
| GET | `/appraisal/:id` | Get appraisal |
| PATCH | `/appraisal/:id` | Update / approve |
| DELETE | `/appraisal/:id` | Delete draft |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `faculty_id` | integer | Yes | FK → `faculty.id` |
| `academic_year` | string | Yes | e.g. `2024-25` |
| `subjects_handled` | array | No | List of subject names taught |
| `student_projects` | integer | No | Count of mentored projects |
| `online_courses` | integer | No | Count of certifications |
| `paper_publications` | integer | No | Research papers published |
| `hod_score` | number | No | Score given by HoD |
| `hr_remarks` | string | No | HR remarks |
| `status` | string | No | `draft`/`submitted`/`hod_reviewed`/`approved` |

---

## Resource 9: HR Payroll

**URL:** `/api/v1/hr-payroll`
**Roles:** All operations → `hr_payroll` | Read (own) → `faculty`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/hr-payroll` | Create payroll record |
| GET | `/hr-payroll` | List payroll records |
| GET | `/hr-payroll/:id` | Get record |
| PATCH | `/hr-payroll/:id` | Update salary / payslip |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `faculty_id` | integer | Yes | FK → `faculty.id` |
| `month` | string | Yes | e.g. `2026-07` |
| `basic_salary` | number | Yes | Basic pay |
| `hra` | number | No | House rent allowance |
| `da` | number | No | Dearness allowance |
| `pf_deduction` | number | No | PF deduction |
| `other_deductions` | number | No | Other deductions |
| `net_salary` | number | No | Computed net pay |
| `payslip_url` | string | No | Generated payslip URL |
| `paid_on` | string | No | ISO date of payment |

---

## Resource 10: Media Requests

**URL:** `/api/v1/media-requests`
**Roles:** Create → `faculty` | Process → `media_room` | Read → `faculty` (own), `media_room`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/media-requests` | Faculty requests design/media |
| GET | `/media-requests` | List requests |
| GET | `/media-requests/:id` | Get request |
| PATCH | `/media-requests/:id` | Update / deliver media |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `faculty_id` | integer | Yes | Requesting faculty |
| `request_type` | string | Yes | `poster`/`banner`/`video`/`other` |
| `description` | string | Yes | What is needed |
| `required_by` | string | No | ISO date deadline |

### PATCH Body (Media Room)

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `pending`/`in_progress`/`delivered`/`rejected` |
| `delivered_url` | string | URL to delivered media file |
| `remarks` | string | Notes from media room |
