# Module 9 — Procurement

**Base URL prefix:** `/api/v1`
**Auth:** All endpoints require `Authorization: Bearer <token>`

---

## Resource 1: Vendors

**URL:** `/api/v1/vendors`
**Roles:** Create/Update/Delete → `admin`, `secretary` | Read → `admin`, `secretary`, `hod`, `finance`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/vendors` | Add vendor |
| GET | `/vendors` | List vendors |
| GET | `/vendors/:id` | Get vendor |
| PATCH | `/vendors/:id` | Update vendor |
| DELETE | `/vendors/:id` | Delete vendor |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Vendor/company name |
| `contact_person` | string | No | Contact name |
| `phone` | string | No | Contact phone |
| `email` | string | No | Contact email |
| `address` | string | No | Vendor address |
| `gstin` | string | No | GST number |
| `category` | string | No | `hardware`/`software`/`furniture`/`service`/`other` |
| `bank_account` | string | No | Bank account for payments |
| `bank_ifsc` | string | No | IFSC |
| `quotation_url` | string | No | Link to submitted quotation |

---

## Resource 2: Purchase Orders

**URL:** `/api/v1/purchase-orders`
**Roles:** Create proposal → `secretary` | Review → `finance` | Approve → `hod` | Finalize → `admin` | Read → all above

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/purchase-orders` | Create purchase order proposal |
| GET | `/purchase-orders` | List POs |
| GET | `/purchase-orders/:id` | Get PO |
| PATCH | `/purchase-orders/:id` | Update / approve PO |
| DELETE | `/purchase-orders/:id` | Delete draft PO |

### POST Body (Proposal by Secretary)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | PO title |
| `purpose` | string | Yes | Why this purchase is needed |
| `department_id` | integer | Yes | Requesting department |
| `vendor_id` | integer | No | Selected vendor (chosen after quotation) |
| `items` | array | Yes | `[{ item_name, quantity, unit, unit_price, purpose }]` |
| `items[].item_name` | string | Yes | e.g. `16GB RAM` |
| `items[].quantity` | integer | Yes | |
| `items[].unit` | string | Yes | e.g. `Nos.` |
| `items[].unit_price` | number | No | Per unit cost |
| `expected_delivery` | string | No | ISO date |
| `remarks` | string | No | Notes |

### PATCH Body (Approval workflow)

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `draft`/`finance_review`/`hod_approved`/`admin_approved`/`ordered`/`rejected` |
| `finance_approved` | boolean | Finance team approval |
| `hod_approved` | boolean | HoD approval |
| `admin_approved` | boolean | Admin final approval |
| `rejection_reason` | string | If rejected |

**Workflow:**
```
Secretary creates PO → status: draft
  → Finance reviews → finance_approved: true → status: hod_approved
  → HoD approves → hod_approved: true → status: admin_approved
  → Admin finalizes → PO downloaded as letter-pad template → physically sent to vendor
```

**Success 201:**
```json
{
  "id": 1, "title": "Computer Lab Equipment",
  "total_amount": 250000, "status": "draft",
  "items_count": 4
}
```

---

## Resource 3: Service Orders

**URL:** `/api/v1/service-orders`
**Roles:** Create proposal → `secretary` | Review → `finance` | Approve → `hod` | Finalize → `admin`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/service-orders` | Create service order proposal |
| GET | `/service-orders` | List SOs |
| GET | `/service-orders/:id` | Get SO |
| PATCH | `/service-orders/:id` | Update / approve SO |
| DELETE | `/service-orders/:id` | Delete draft |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | SO title |
| `service_description` | string | Yes | e.g. `AC repair in Server Room` |
| `department_id` | integer | Yes | Requesting department |
| `vendor_id` | integer | No | Selected service vendor |
| `estimated_cost` | number | No | Cost estimate |
| `priority` | string | No | `low`/`medium`/`high` |
| `expected_completion` | string | No | ISO date |

### PATCH Body (same as PO approval workflow)

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `draft`/`finance_review`/`hod_approved`/`admin_approved`/`completed`/`rejected` |
| `finance_approved` | boolean | |
| `hod_approved` | boolean | |
| `actual_cost` | number | Final cost after completion |

---

## Resource 4: GRN (Goods Receipt Note)

**URL:** `/api/v1/grn`
**Roles:** Create/Update → `admin`, `secretary` | Read → `admin`, `secretary`, `hod`, `finance`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/grn` | Record received goods |
| GET | `/grn` | List GRNs |
| GET | `/grn/:id` | Get GRN |
| PATCH | `/grn/:id` | Update GRN (issue items) |

### POST Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `purchase_order_id` | integer | Yes | FK → `purchase_orders.id` |
| `received_date` | string | Yes | ISO date |
| `received_by` | integer | Yes | FK → `users.id` |
| `items` | array | Yes | `[{ item_name, ordered_qty, received_qty, condition }]` |
| `vendor_invoice_number` | string | No | Vendor invoice ref |
| `remarks` | string | No | Discrepancies noted |

### PATCH Body (Issue items)

| Field | Type | Description |
|-------|------|-------------|
| `issued_items` | array | `[{ item_name, quantity, issued_to, venue_id }]` |
| `issued_date` | string | ISO date |

**Success 201:**
```json
{
  "id": 1, "purchase_order_id": 3,
  "received_date": "2026-07-20",
  "total_items_received": 10,
  "grn_number": "GRN-2026-001"
}
```

---

# Module 10 — Announcements, Notifications, Venues & Feedback

---

## Resource 1: Announcements

**URL:** `/api/v1/announcements`
**Roles:** Create/Delete → `admin`, `faculty`, `hod`, `academic_coordinator` | Read → based on target audience

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/announcements` | Post announcement |
| GET | `/announcements` | List (filtered to caller's role) |
| GET | `/announcements/:id` | Get announcement |
| PATCH | `/announcements/:id` | Edit announcement |
| DELETE | `/announcements/:id` | Delete |

### POST / PATCH Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Announcement title |
| `content` | string | Yes | Announcement body |
| `target_audience` | string | Yes | `students`/`faculty`/`parents` |
| `target_batch_ids` | array | No | Specific batches |
| `target_department_ids` | array | No | Specific departments |
| `target_class_ids` | array | No | Specific classes |
| `attachment_url` | string | No | File attachment |
| `is_published` | boolean | No | Draft vs published |
| `publish_at` | string | No | Scheduled publish ISO datetime |

---

## Resource 2: Notifications

**URL:** `/api/v1/notifications`
**Roles:** Read → all authenticated users (own notifications) | Mark read → own

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/notifications` | Get my notifications |
| PATCH | `/notifications/:id` | Mark as read |
| PATCH | `/notifications/mark-all-read` | Mark all as read |

**GET Response:**
```json
{
  "data": [
    {
      "id": 1, "title": "CIA 1 Results Published",
      "message": "Your CIA 1 results are now available.",
      "type": "exam", "is_read": false,
      "created_at": "2026-07-26T08:00:00.000Z"
    }
  ],
  "unread_count": 5
}
```

---

## Resource 3: Venues & Bookings

**URL:** `/api/v1/venues`
**Roles:** Create/Update/Delete venue → `admin`, `iqac` | Book → `faculty`, `hod`, `placement` | Approve booking → `iqac` | Read → all

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/venues` | Create venue |
| GET | `/venues` | List venues with availability |
| GET | `/venues/:id` | Get venue + bookings |
| PATCH | `/venues/:id` | Update venue info |
| DELETE | `/venues/:id` | Delete venue |
| POST | `/venues/:id/book` | Request venue booking |
| PATCH | `/venues/bookings/:bookingId` | Approve/reject/alternative |

### POST Body (Create Venue)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Venue name e.g. `Seminar Hall A` |
| `capacity` | integer | Yes | Max occupancy |
| `type` | string | No | `hall`/`lab`/`classroom`/`auditorium` |
| `location` | string | No | Building / block |
| `facilities` | array | No | `["projector", "AC", "whiteboard"]` |

### POST Body (`/venues/:id/book`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `booked_by` | integer | Yes | FK → `users.id` |
| `purpose` | string | Yes | Reason for booking |
| `event_date` | string | Yes | ISO date |
| `start_time` | string | Yes | `HH:MM` |
| `end_time` | string | Yes | `HH:MM` |
| `expected_attendees` | integer | No | Headcount |

### PATCH Body (Booking approval by IQAC)

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `approved`/`rejected`/`alternative_suggested` |
| `alternative_venue_id` | integer | Suggested alternative if rejected |
| `remarks` | string | Notes from IQAC |

**GET venues response includes availability status:**
```json
{
  "id": 1, "name": "Seminar Hall A", "capacity": 150,
  "is_available": true,
  "current_booking": null
}
```

---

## Resource 4: Feedback

**URL:** `/api/v1/feedback`
**Roles:** Create form → `academic_coordinator` | Fill → `student` | Read → `academic_coordinator`, `admin`, `hod`

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/feedback` | Create feedback form |
| GET | `/feedback` | List feedback forms |
| GET | `/feedback/:id` | Get form + responses |
| PATCH | `/feedback/:id` | Update form |
| DELETE | `/feedback/:id` | Delete form |
| POST | `/feedback/:id/submit` | Student submits response |

### POST Body (Create Form)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Form title |
| `target_class_ids` | array | Yes | Target classes |
| `target_subject_ids` | array | No | Specific subjects |
| `deadline` | string | No | ISO date |
| `questions` | array | Yes | `[{ text, type, options }]` |
| `questions[].type` | string | Yes | `rating`/`mcq`/`text` |

### POST Body (`/feedback/:id/submit`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | integer | Yes | |
| `responses` | array | Yes | `[{ question_id, answer }]` |
