# Module 7 — Library

**Base URL prefix:** `/api/v1`
**Auth:** All endpoints require `Authorization: Bearer <token>`

---

## Resource 1: Books

**URL:** `/api/v1/books`
**Roles:** Create/Update/Delete → `library` | Read → all staff + student

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/books` | Add book to library |
| GET | `/books` | List all books |
| GET | `/books/:id` | Get book details |
| PATCH | `/books/:id` | Update book info |
| DELETE | `/books/:id` | Remove book |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Book title |
| `author` | string | Yes | Author name |
| `isbn` | string | No | ISBN number |
| `qr_code` | string | No | QR/barcode from scan |
| `category_id` | integer | Yes | FK → book category |
| `publisher` | string | No | Publisher name |
| `edition` | string | No | e.g. `3rd Edition` |
| `total_copies` | integer | Yes | Total physical copies |
| `available_copies` | integer | No | Computed from borrows |
| `location` | string | No | Shelf/rack reference |
| `department_id` | integer | No | Relevant dept |
| `status` | string | No | `available`/`all_borrowed` |

**Success 201:**
```json
{
  "id": 1, "title": "Introduction to Algorithms",
  "author": "Cormen et al.", "isbn": "978-0262033848",
  "total_copies": 5, "available_copies": 5
}
```

**Query Params (GET list):**
| Param | Type | Description |
|-------|------|-------------|
| `category_id` | integer | Filter by category |
| `department_id` | integer | Filter by dept |
| `available` | boolean | Only available books |
| `search` | string | Search title/author |

---

## Resource 2: Borrow Records

**URL:** `/api/v1/borrow-records`
**Roles:** Create/Update → `library` | Read → `library`, `student` (own), `faculty` (own)

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/borrow-records` | Issue book to student/faculty |
| GET | `/borrow-records` | List borrow records |
| GET | `/borrow-records/:id` | Get record |
| PATCH | `/borrow-records/:id` | Return book / renew |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `book_id` | integer | Yes | FK → `books.id` |
| `borrower_type` | string | Yes | `student` / `faculty` |
| `borrower_id` | integer | Yes | FK → `students.id` or `faculty.id` |
| `issued_date` | string | Yes | ISO date |
| `due_date` | string | Yes | ISO date (typically 30 days) |

**Success 201:**
```json
{
  "id": 1, "book_id": 3, "borrower_type": "student",
  "borrower_id": 12, "issued_date": "2026-07-01",
  "due_date": "2026-08-01", "status": "borrowed"
}
```

### PATCH Body (Return / Renew)

| Field | Type | Description |
|-------|------|-------------|
| `action` | string | `return` / `renew` |
| `return_date` | string | ISO date (for return) |
| `new_due_date` | string | ISO date (for renew) |
| `fine_amount` | number | Late return fine |

**Note:** 3 days before due date, an automatic notification is triggered to the borrower.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `borrower_id` | integer | Filter by borrower |
| `borrower_type` | string | `student`/`faculty` |
| `status` | string | `borrowed`/`returned`/`overdue` |
| `overdue` | boolean | Only overdue records |

---

## Resource 3: E-Resources

**URL:** `/api/v1/e-resources`
**Roles:** Create/Update/Delete → `library` | Read → all staff + student

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/e-resources` | Add e-resource |
| GET | `/e-resources` | List e-resources |
| GET | `/e-resources/:id` | Get resource |
| PATCH | `/e-resources/:id` | Update resource |
| DELETE | `/e-resources/:id` | Remove resource |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Resource title |
| `type` | string | Yes | `journal`/`ebook`/`video`/`database`/`other` |
| `url` | string | Yes | Access link |
| `description` | string | No | Summary |
| `subject_id` | integer | No | Related subject |
| `department_id` | integer | No | Relevant department |
| `is_free` | boolean | No | Free or subscription-based |
| `subscription_expiry` | string | No | ISO date |

---

# Module 8 — Placement

**Base URL prefix:** `/api/v1`

---

## Resource 1: Companies

**URL:** `/api/v1/companies`
**Roles:** Create/Update/Delete → `placement` | Read → `placement`, `admin`, `student`, `faculty`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/companies` | Add company profile |
| GET | `/companies` | List companies |
| GET | `/companies/:id` | Get company |
| PATCH | `/companies/:id` | Update company |
| DELETE | `/companies/:id` | Remove company |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Company name |
| `industry` | string | No | Industry sector |
| `website` | string | No | Company website URL |
| `description` | string | No | Company profile |
| `location` | string | No | HQ city |
| `hr_contact_name` | string | No | HR contact |
| `hr_contact_email` | string | No | |
| `hr_contact_phone` | string | No | |
| `package_lpa` | number | No | Offered CTC in LPA |
| `bond_years` | integer | No | Bond period if any |

---

## Resource 2: Placement Drives

**URL:** `/api/v1/drives`
**Roles:** Create/Update/Delete → `placement` | Read → `placement`, `admin`, `student`, `faculty`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/drives` | Create a drive |
| GET | `/drives` | List drives |
| GET | `/drives/:id` | Get drive |
| PATCH | `/drives/:id` | Update drive (reveal company, update rounds) |
| DELETE | `/drives/:id` | Delete drive |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `company_id` | integer | No | FK → `companies.id` (null = undisclosed) |
| `title` | string | Yes | Drive title |
| `drive_date` | string | Yes | ISO date |
| `is_company_disclosed` | boolean | No | Whether company is shown to students |
| `disclose_date` | string | No | Date to auto-reveal company |
| `eligibility_criteria` | string | No | Minimum % / CGPA etc. |
| `package_lpa` | number | No | Offered package |
| `venue_id` | integer | No | FK → `venues.id` |
| `rounds` | array | No | `[{ round_name, description }]` |
| `target_batches` | array | No | `[batch_id, ...]` |
| `target_departments` | array | No | `[department_id, ...]` |

**Note:** Notification triggered to all eligible students day before drive.

---

## Resource 3: Student Profiles (Placement)

**URL:** `/api/v1/student-profiles`
**Roles:** Update → `student` (own) | Read → `placement`, `faculty` (mentor), `admin`, `student` (own)

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/student-profiles` | List all profiles |
| GET | `/student-profiles/:id` | Get student profile |
| PATCH | `/student-profiles/:id` | Student updates own profile |

### PATCH Body

| Field | Type | Description |
|-------|------|-------------|
| `resume_url` | string | Link to resume |
| `linkedin_url` | string | LinkedIn profile |
| `github_url` | string | GitHub profile |
| `leetcode_url` | string | LeetCode |
| `hackerrank_url` | string | HackerRank |
| `codeforces_url` | string | Codeforces |
| `projects` | array | `[{ title, description, url, tech_stack }]` |
| `placement_history` | array | `[{ drive_id, company_id, round_cleared, status }]` |

**Success GET:**
```json
{
  "student_id": 4, "first_name": "Priya",
  "resume_url": "https://...",
  "linkedin_url": "https://linkedin.com/in/...",
  "projects": [{ "title": "Smart Attendance", "tech_stack": "Python, OpenCV" }],
  "placement_history": [
    { "company": "TCS", "status": "Selected", "round_cleared": "R3" }
  ]
}
```
