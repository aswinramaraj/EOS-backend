# EOS Backend – API Contracts

> **Version:** 1.0 · **Base URL:** `http://localhost:3000/api/v1` · **Format:** JSON

Share the relevant module file with each intern. All files live in `docs/api/`.

---

## Global Conventions

### Authentication
All protected routes require:
```
Authorization: Bearer <accessToken>
```
Obtain via `POST /api/v1/auth/login`.

### Standard Success Envelope
Every `2xx` response is wrapped automatically:
```json
{
  "success": true,
  "message": "Success",
  "data": { },
  "timestamp": "2026-07-26T08:00:00.000Z"
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "...",
  "timestamp": "2026-07-26T08:00:00.000Z",
  "path": "/api/v1/..."
}
```

### Common Error Codes
| errorCode | HTTP | Cause |
|-----------|------|-------|
| `VALIDATION_ERROR` | 400 | Missing/invalid request fields |
| `UNAUTHORIZED` | 401 | No or invalid Bearer token |
| `INVALID_CREDENTIALS` | 401 | Login: wrong email/password |
| `ACCOUNT_INACTIVE` | 403 | Login: account deactivated |
| `FORBIDDEN` | 403 | Role not allowed on this route |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Unique constraint violated |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server failure |

### Pagination (all list endpoints)
```
GET /resource?page=1&limit=20
```
```json
{
  "data": [],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

---

## Module Index

| # | Module File | Endpoints |
|---|-------------|-----------|
| 1 | [Auth](docs/api/01-auth.md) | Login, Me |
| 2 | [Academic Structure](docs/api/02-academic-structure.md) | Departments, Courses, Batches, Classes, Subjects, Academic Calendar |
| 3 | [Admissions](docs/api/03-admissions.md) | SOA Applications, Students, Bonafide, Certificates, OD, Student Leaves |
| 4 | [Faculty](docs/api/04-faculty.md) | Faculty, Mapping, Attendance, Timetable, Lesson Plans, LMS Notes, Leaves, Appraisal, HR Payroll, Media Requests |
| 5 | [Examinations](docs/api/05-exams.md) | Exam Types, Exams, Hall Plans, Invigilation, Marks, Results, Revaluation |
| 6 | [Fees & Billing](docs/api/06-fees-billing.md) | Fee Structure, Billing, Education Loan, Hostel, Transport, Gate Ledger |
| 7 | [Library](docs/api/07-library.md) | Books, Borrow Records, E-Resources |
| 8 | [Placement](docs/api/08-placement.md) | Companies, Drives, Student Profiles |
| 9 | [Procurement](docs/api/09-procurement.md) | Vendors, Purchase Orders, Service Orders, GRN |
| 10 | [Announcements, Notifications, Venues, Feedback](docs/api/10-other.md) | All remaining |
