# REST API Specification & Contract

**Project:** FlowLedger  
**Base URL:** `http://localhost:8082` (Backend Direct) / `http://localhost:3000/api` (Frontend Proxy)  
**API Version:** `v1`  
**Content-Type:** `application/json`  
**Authentication:** Dual Delivery (`Authorization: Bearer <token>` or `access_token` cookie)  

---

## 1. Authentication & Session Endpoints

### 1.1 Authenticate User (Login)
Authenticates user credentials, sets an `HttpOnly` session cookie, and returns the JWT with user profile.

- **Method:** `POST`
- **Path:** `/api/v1/auth/login`
- **Authentication:** Public

#### Request Body
```json
{
  "email": "abebe@acme.co",
  "password": "password"
}
```

#### Response: `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMjIyMjIyMi0yMjIyLTIyMjItMjIyMi0yMjIyMjIyMjIyMjIiLCJlbWFpbCI6ImFiZWJlQGFjbWUuY28iLCJuYW1lIjoiQWJlYmUgR2lybWEiLCJvcmdJZCI6IjExMTExMTExLTExMTEtMTExMS0xMTExLTExMTExMTExMTExMSIsInJvbGUiOiJPV05FUiIsImlhdCI6MTczMDY2NjQwMCwiZXhwIjoxNzMwNzUyODAwfQ...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": "22222222-2222-2222-2222-222222222222",
    "email": "abebe@acme.co",
    "fullName": "Abebe Girma"
  },
  "organization": {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "Acme Trading Co.",
    "role": "OWNER"
  }
}
```
**Response Headers:**
```http
Set-Cookie: access_token=<JWT>; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax
```

#### Error Responses
- `400 Bad Request`: Email or password is blank.
- `401 Unauthorized`: Invalid email or password credentials.

---

### 1.2 Sign Out (Logout)
Expires the `access_token` cookie.

- **Method:** `POST`
- **Path:** `/api/v1/auth/logout`
- **Authentication:** Public / Authenticated

#### Response: `200 OK`
```json
{
  "message": "Logged out successfully"
}
```
**Response Headers:**
```http
Set-Cookie: access_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax
```

---

### 1.3 Get Current User Session (`/me`)
Retrieves current authenticated identity, organization context, and computed permissions.

- **Method:** `GET`
- **Path:** `/api/v1/me`
- **Authentication:** Required (Bearer Token or Cookie)

#### Response: `200 OK`
```json
{
  "user": {
    "id": "22222222-2222-2222-2222-222222222222",
    "name": "Abebe Girma",
    "email": "abebe@acme.co"
  },
  "organization": {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "Acme Trading Co.",
    "role": "OWNER"
  },
  "permissions": [
    "invoices:create",
    "invoices:read",
    "invoices:approve",
    "invoices:reject",
    "team:manage"
  ]
}
```

#### Error Responses
- `401 Unauthorized`: No valid token provided or session expired.

---

## 2. Invoices Endpoints

### 2.1 List Invoices (Filtered & Paginated)
Returns a paginated list of invoices for the authenticated tenant with dynamic filters.

- **Method:** `GET`
- **Path:** `/api/v1/invoices`
- **Authentication:** Required

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `status` | string | No | Filter by invoice status (`DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `ALL`) | `PENDING_APPROVAL` |
| `search` | string | No | Search substring across supplier name and invoice number | `Addis` |
| `fromDate` | string | No | Earliest issue date (`YYYY-MM-DD`) | `2026-11-01` |
| `toDate` | string | No | Latest issue date (`YYYY-MM-DD`) | `2026-11-30` |
| `page` | integer | No | 1-based page number (default: `1`) | `1` |
| `pageSize` | integer | No | Items per page (default: `10`) | `20` |
| `sortBy` | string | No | Field to sort by (`invoiceDate`, `amount`, `supplierName`, `invoiceNumber`, `status`, `createdAt`) | `invoiceDate` |
| `sortDirection`| string | No | Sort direction (`asc` or `desc`, default: `desc`) | `desc` |

#### Response: `200 OK`
```json
{
  "items": [
    {
      "id": "33333333-3333-3333-3333-333333333331",
      "supplierName": "Ethio Telecom",
      "invoiceNumber": "ET-2026-881",
      "amount": "14500.50",
      "currency": "ETB",
      "invoiceDate": "2026-11-01",
      "dueDate": "2026-11-15",
      "description": "Monthly fiber internet service",
      "status": "PENDING_APPROVAL",
      "rejectionReason": null,
      "activities": [
        {
          "id": "44444444-4444-4444-4444-444444444441",
          "type": "SUBMITTED",
          "description": "Submitted for approval",
          "actorName": "Abebe Girma",
          "occurredAt": "2026-11-01T10:15:30Z"
        },
        {
          "id": "44444444-4444-4444-4444-444444444440",
          "type": "CREATED_DRAFT",
          "description": "Invoice draft created",
          "actorName": "Abebe Girma",
          "occurredAt": "2026-11-01T10:12:00Z"
        }
      ],
      "createdAt": "2026-11-01T10:12:00Z",
      "updatedAt": "2026-11-01T10:15:30Z"
    }
  ],
  "page": 1,
  "size": 10,
  "totalItems": 1,
  "totalPages": 1
}
```

---

### 2.2 Get Invoice By ID
Retrieves an invoice and its complete activity trail.

- **Method:** `GET`
- **Path:** `/api/v1/invoices/{id}`
- **Authentication:** Required

#### Response: `200 OK`
```json
{
  "id": "33333333-3333-3333-3333-333333333331",
  "supplierName": "Ethio Telecom",
  "invoiceNumber": "ET-2026-881",
  "amount": "14500.50",
  "currency": "ETB",
  "invoiceDate": "2026-11-01",
  "dueDate": "2026-11-15",
  "description": "Monthly fiber internet service",
  "status": "PENDING_APPROVAL",
  "rejectionReason": null,
  "activities": [
    {
      "id": "44444444-4444-4444-4444-444444444441",
      "type": "SUBMITTED",
      "description": "Submitted for approval",
      "actorName": "Abebe Girma",
      "occurredAt": "2026-11-01T10:15:30Z"
    }
  ],
  "createdAt": "2026-11-01T10:12:00Z",
  "updatedAt": "2026-11-01T10:15:30Z"
}
```

#### Error Responses
- `404 Not Found`: Invoice does not exist or belongs to another tenant.

---

### 2.3 Create Invoice Draft
Creates a new invoice in `DRAFT` status and logs `CREATED_DRAFT` activity.

- **Method:** `POST`
- **Path:** `/api/v1/invoices`
- **Authentication:** Required

#### Request Body
```json
{
  "supplierName": "Addis Paper Supplies",
  "invoiceNumber": "APS-1092",
  "amount": "8200.00",
  "currency": "ETB",
  "invoiceDate": "2026-11-02",
  "dueDate": "2026-11-20",
  "description": "A4 print paper and pens"
}
```

#### Response: `201 Created`
Returns full `InvoiceResponse` object with `status: "DRAFT"`.

---

### 2.4 Create and Immediately Submit Invoice
Creates an invoice directly in `PENDING_APPROVAL` status in a single transaction.

- **Method:** `POST`
- **Path:** `/api/v1/invoices/submit`
- **Authentication:** Required

#### Request Body
Same as `POST /api/v1/invoices`.

#### Response: `201 Created`
Returns full `InvoiceResponse` object with `status: "PENDING_APPROVAL"`.

---

### 2.5 Submit Draft Invoice for Approval
Transitions an existing `DRAFT` or `REJECTED` invoice to `PENDING_APPROVAL`.

- **Method:** `POST`
- **Path:** `/api/v1/invoices/{id}/submit`
- **Authentication:** Required

#### Response: `200 OK`
Returns updated `InvoiceResponse` with `status: "PENDING_APPROVAL"`.

#### Error Responses
- `400 Bad Request`: Invoice is already in `PENDING_APPROVAL` or `APPROVED` status.
- `404 Not Found`: Invoice not found.

---

### 2.6 Update Draft Invoice Details
Updates fields of an existing invoice in `DRAFT` or `REJECTED` status.

- **Method:** `PUT`
- **Path:** `/api/v1/invoices/{id}`
- **Authentication:** Required

#### Request Body
```json
{
  "supplierName": "Addis Paper Supplies Ltd",
  "invoiceNumber": "APS-1092-A",
  "amount": "8500.00",
  "currency": "ETB",
  "invoiceDate": "2026-11-02",
  "dueDate": "2026-11-25",
  "description": "Updated paper quantity"
}
```

#### Response: `200 OK`
Returns updated `InvoiceResponse`.

#### Error Responses
- `400 Bad Request`: Attempting to edit an invoice that is `PENDING_APPROVAL` or `APPROVED`.
- `404 Not Found`: Invoice not found.

---

### 2.7 Check Duplicate Invoice Number
Checks whether an invoice number has already been entered within the tenant organization.

- **Method:** `GET`
- **Path:** `/api/v1/invoices/check-duplicate`
- **Authentication:** Required

#### Query Parameters
- `invoiceNumber` (string, required): Invoice number to verify.
- `excludeId` (UUID string, optional): Current invoice ID to exclude when editing an existing invoice.

#### Response: `200 OK`
```json
{
  "invoiceNumber": "APS-1092",
  "duplicate": true
}
```

---

### 2.8 Get Dashboard Summary Metrics
Computes organizational metrics, pending queue count, and top 5 recent invoices.

- **Method:** `GET`
- **Path:** `/api/v1/invoices/summary`
- **Authentication:** Required

#### Response: `200 OK`
```json
{
  "totalInvoices": 12,
  "pendingApprovals": 3,
  "approvedInvoices": 7,
  "rejectedInvoices": 1,
  "draftInvoices": 1,
  "recentInvoices": [ ... ],
  "pendingApprovalInvoices": [ ... ]
}
```

---

## 3. Approvals Endpoints

### 3.1 List Pending Approvals Queue
Lists all invoices currently awaiting an approval decision.

- **Method:** `GET`
- **Path:** `/api/v1/approvals/pending`
- **Authentication:** Required

#### Query Parameters
- `search` (string, optional): Substring search over supplier name and invoice number.
- `page` (integer, optional, default: 1): Page number.
- `pageSize` (integer, optional, default: 10): Items per page.

#### Response: `200 OK`
Returns `PageResult<InvoiceResponse>`.

---

### 3.2 Approve Invoice
Approves a pending invoice (`PENDING_APPROVAL` → `APPROVED`) and records an `APPROVED` activity event.

- **Method:** `POST`
- **Path:** `/api/v1/approvals/{id}/approve`
- **Authentication:** Required (`OWNER`, `ADMIN`, `APPROVER`, `FINANCE`)

#### Response: `200 OK`
Returns updated `InvoiceResponse` with `status: "APPROVED"`.

#### Error Responses
- `403 Forbidden`: User has `VIEWER` role.
- `400 Bad Request`: Invoice is not in `PENDING_APPROVAL` status.
- `404 Not Found`: Invoice not found.

---

### 3.3 Reject Invoice
Rejects a pending invoice (`PENDING_APPROVAL` → `REJECTED`), records the mandatory rejection reason, and logs a `REJECTED` activity event.

- **Method:** `POST`
- **Path:** `/api/v1/approvals/{id}/reject`
- **Authentication:** Required (`OWNER`, `ADMIN`, `APPROVER`, `FINANCE`)

#### Request Body
```json
{
  "reason": "Total amount does not match purchase order PO-8821"
}
```

#### Response: `200 OK`
Returns updated `InvoiceResponse` with `status: "REJECTED"` and `rejectionReason`.

#### Error Responses
- `400 Bad Request`: Reason is missing, blank, or shorter than 3 characters; or invoice not in `PENDING_APPROVAL` status.
- `403 Forbidden`: User has `VIEWER` role.
- `404 Not Found`: Invoice not found.

---

## 4. Team & Organization Endpoints

### 4.1 List Organization Members
Lists all active users and their roles within the authenticated organization.

- **Method:** `GET`
- **Path:** `/api/v1/organizations/team`
- **Authentication:** Required

#### Response: `200 OK`
```json
[
  {
    "id": "22222222-2222-2222-2222-222222222222",
    "name": "Abebe Girma",
    "email": "abebe@acme.co",
    "role": "OWNER",
    "status": "ACTIVE"
  }
]
```

---

## 5. System Health Endpoint

### 5.1 Actuator Health Check
Reports backend availability and database connectivity.

- **Method:** `GET`
- **Path:** `/actuator/health`
- **Authentication:** Public

#### Response: `200 OK`
```json
{
  "status": "UP"
}
```
