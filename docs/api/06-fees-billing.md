# Module 6 — Fees & Billing

**Base URL prefix:** `/api/v1`
**Auth:** All endpoints require `Authorization: Bearer <token>`

---

## Resource 1: Fee Structure

**URL:** `/api/v1/fee-structure`
**Roles:** Create/Update/Delete → `admin`, `finance` | Read → `admin`, `finance`, `billing`, `student`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/fee-structure` | Create fee demand |
| GET | `/fee-structure` | List fee structures |
| GET | `/fee-structure/:id` | Get structure |
| PATCH | `/fee-structure/:id` | Update structure |
| DELETE | `/fee-structure/:id` | Delete structure |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | e.g. `Government Quota - Tuition Fee` |
| `category` | string | Yes | `govt_quota`/`management_quota`/`first_graduate`/`7_5_reservation` |
| `fee_type` | string | Yes | `tuition`/`special`/`development`/`hostel`/`transport` |
| `amount` | number | Yes | Fee amount |
| `concession` | number | No | Concession amount |
| `academic_year` | string | Yes | e.g. `2024-25` |
| `batch_id` | integer | No | FK → `batches.id` |
| `description` | string | No | Notes |

---

## Resource 2: Billing (Fee Collection)

**URL:** `/api/v1/billing`
**Roles:** Create/Update → `billing` | Read → `billing`, `admin`, `finance`, `student` (own)

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/billing` | Record fee payment |
| GET | `/billing` | List billing records |
| GET | `/billing/:id` | Get billing record + receipt |
| PATCH | `/billing/:id` | Update payment (partial handling) |
| DELETE | `/billing/:id` | Void entry |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | integer | Yes | FK → `students.id` |
| `fee_structure_id` | integer | Yes | FK → `fee_structure.id` |
| `amount_paid` | number | Yes | Amount collected this transaction |
| `payment_mode` | string | Yes | `cash`/`dd`/`online`/`card` |
| `payment_date` | string | Yes | ISO date |
| `reference_number` | string | No | Cheque/DD/transaction ref |
| `is_partial` | boolean | No | Partial payment flag |
| `remarks` | string | No | Notes |

**Success 201:**
```json
{
  "id": 1, "student_id": 4, "amount_paid": 45000,
  "payment_mode": "online", "receipt_number": "RCP-2026-001",
  "remaining_balance": 5000
}
```

**Query Params (GET list):**
| Param | Type | Description |
|-------|------|-------------|
| `student_id` | integer | Student filter |
| `department_id` | integer | Department filter |
| `class_id` | integer | Class filter |
| `is_partial` | boolean | Show partial payments only |
| `from_date` | string | Date range |
| `to_date` | string | Date range |

---

## Resource 3: Education Loan DD

**URL:** `/api/v1/education-loan`
**Roles:** Create/Update → `billing` | Read → `billing`, `admin`, `student` (own)

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/education-loan` | Register DD received |
| GET | `/education-loan` | List DDs |
| GET | `/education-loan/:id` | Get DD record |
| PATCH | `/education-loan/:id` | Update DD status |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | integer | Yes | FK → `students.id` |
| `dd_number` | string | Yes | DD reference number |
| `bank_name` | string | Yes | Issuing bank |
| `branch` | string | No | Bank branch |
| `amount` | number | Yes | DD amount |
| `dd_date` | string | Yes | ISO date of DD |
| `received_date` | string | Yes | Date received by college |
| `status` | string | No | `received`/`submitted`/`cleared` |

**Success 201:**
```json
{
  "id": 1, "dd_number": "DD123456", "bank_name": "SBI",
  "amount": 50000, "status": "received",
  "acknowledgement_number": "ACK-2026-001"
}
```

---

## Resource 4: Hostel

**URL:** `/api/v1/hostel`
**Roles:** Create/Update → `admin`, `billing` | Read → `admin`, `billing`, `student` (own), `gate_warden`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/hostel` | Create hostel record |
| GET | `/hostel` | List hostel assignments |
| GET | `/hostel/:id` | Get hostel record |
| PATCH | `/hostel/:id` | Update assignment |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | integer | Yes | FK → `students.id` |
| `room_number` | string | Yes | Room identifier |
| `room_type` | string | Yes | `2_sharing`/`3_sharing`/`4_sharing`/`4_sharing_attached`/`3_sharing_attached` |
| `block` | string | No | Block/wing name |
| `fee_structure_id` | integer | Yes | FK → hostel fee demand |
| `joining_date` | string | Yes | ISO date |
| `leaving_date` | string | No | ISO date |
| `status` | string | No | `active`/`vacated` |

---

## Resource 5: Transport

**URL:** `/api/v1/transport`
**Roles:** Create/Update → `admin` | Read → `admin`, `billing`, `student` (own)

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/transport` | Create route or assign student |
| GET | `/transport` | List routes |
| GET | `/transport/:id` | Get route details |

### POST Body (Route creation)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `route_name` | string | Yes | Route identifier e.g. `Route 1 - Coimbatore` |
| `stages` | array | Yes | `[{ stage_name, distance_km, fee }]` |
| `vehicle_number` | string | No | Bus number |
| `driver_name` | string | No | |
| `driver_phone` | string | No | |

### POST Body (Student assignment — nested endpoint)
`POST /transport/:routeId/assign`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | integer | Yes | |
| `boarding_point` | string | Yes | Stage name |
| `destination_point` | string | Yes | Stage name |
| `fee` | number | Yes | Calculated fee |

---

## Resource 6: Gate Ledger (IN/OUT Log)

**URL:** `/api/v1/gate-ledger`
**Roles:** Create → `gate_warden` | Read → `gate_warden`, `admin`, `parent` (own child), `student` (own)

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/gate-ledger` | Log student IN or OUT entry |
| GET | `/gate-ledger` | List entries |
| GET | `/gate-ledger/:id` | Get entry |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | integer | Yes | FK → `students.id` |
| `entry_type` | string | Yes | `IN` / `OUT` |
| `location` | string | Yes | `main_gate` / `hostel` |
| `timestamp` | string | No | ISO datetime (defaults to now) |
| `purpose` | string | No | Reason (for visitors) |
| `id_scanned` | boolean | No | Whether ID card was scanned |
| `remarks` | string | No | Notes |

**Note:** On POST, SMS is automatically triggered to student and parent.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `student_id` | integer | Filter by student |
| `date` | string | Specific date |
| `entry_type` | string | `IN` or `OUT` |
| `location` | string | `main_gate` or `hostel` |
