# FlowLedger — Frontend Data Contracts

## 1. Purpose

Define the TypeScript domain models, service interfaces, mock-data boundaries and expected API shapes for the frontend MVP.

The frontend must be implementable with mock data now and replaceable with a real API implementation later.

## 2. Architecture rules

Use this data flow:

Page or component → domain service interface → mock or API implementation → typed result

Requirements:

- Components must not import raw mock records directly.
- Components must not call `fetch` throughout the UI.
- Keep API calls and response handling inside the API service layer.
- Keep mock implementations separate from API implementations.
- Share types between implementations.
- Keep display formatting separate from stored data.
- Do not trust frontend-supplied organization IDs, creator IDs or approval outcomes.
- Avoid adding global state libraries unless the existing project genuinely needs one.

## 3. Suggested folder organization

Adapt to the existing project structure rather than moving or replacing it unnecessarily.

```text
src/
  components/
    ui/
    layout/
    invoices/
    approvals/
  features/
    auth/
    dashboard/
    invoices/
    approvals/
    team/
    settings/
  lib/
    api/
    formatting/
    validation/
  services/
    contracts/
    mock/
    api/
  types/
    auth.ts
    invoice.ts
    organization.ts
    pagination.ts
```

If the repository uses a different alias or directory convention, preserve that convention and maintain the same separation of responsibilities.

## 4. Shared domain types

### Invoice status

```ts
export type InvoiceStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";
```

The UI should use one shared mapping for status labels, styling and allowed display behavior.

### User roles

```ts
export type OrganizationRole =
  | "OWNER"
  | "ADMIN"
  | "FINANCE"
  | "APPROVER"
  | "VIEWER";
```

Do not assume that role names alone fully determine every permission. Prefer effective permissions returned by the backend.

### Money

```ts
export interface Money {
  amount: string;
  currency: string;
}
```

Example:

```ts
const exampleAmount: Money = {
  amount: "12500.5000",
  currency: "ETB",
};
```

Use decimal strings at data boundaries. Avoid JavaScript floating-point arithmetic for financial calculations.

### Invoice

```ts
export interface Invoice {
  id: string;
  supplierName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  invoiceDate: string;
  dueDate: string | null;
  description: string | null;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}
```

Rules:

- `id` is an opaque identifier, typically a UUID.
- `invoiceDate` and `dueDate` are date-only strings in `YYYY-MM-DD` format.
- `createdAt` and `updatedAt` are timestamps in ISO 8601 format.
- Amounts remain strings until passed to a dedicated formatting utility.
- Optional values use explicit `null` when the contract defines them as nullable.
- Never create authoritative creator or organization identifiers from form input.

The exact invoice field set may expand as the backend schema is finalized. Keep the model consistent across screens.

### Invoice document

```ts
export interface InvoiceDocument {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  previewUrl?: string;
}
```

The preview URL is optional and must be supplied by the relevant service. Do not invent persistent document URLs or assume the browser has permission to access them.

### Activity event

```ts
export interface InvoiceActivity {
  id: string;
  type: string;
  description: string;
  actorName: string | null;
  occurredAt: string;
}
```

Display the event history supplied by the backend. Do not fabricate audit events to make a page appear more complete.

### Current user and organization context

```ts
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  role: OrganizationRole;
}

export interface CurrentSession {
  user: CurrentUser;
  organization: OrganizationSummary;
  permissions: string[];
}
```

If multiple organizations are supported, the service must expose the organizations available to the current user and define how the active organization is selected. The browser must not be able to gain access to an organization by changing a client-side identifier.

### Team member

```ts
export type MembershipStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: OrganizationRole;
  status: MembershipStatus;
}
```

Only include membership states that the service actually supports. Update this union when the backend contract is finalized.

## 5. Pagination and filtering

```ts
export interface PageRequest {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
```

Invoice filters:

```ts
export interface InvoiceFilters extends PageRequest {
  search?: string;
  status?: InvoiceStatus;
  fromDate?: string;
  toDate?: string;
}
```

Rules:

- Use zero-based or one-based pagination consistently with the actual API.
- Normalize pagination differences inside the service adapter if necessary.
- Do not hard-code total pages or result counts.
- Reset the page when a filter change makes the current page invalid.
- Debounce search where useful, without making the UI feel unresponsive.

## 6. API response and error conventions

Define a shared application error type:

```ts
export interface AppError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
```

The API adapter should normalize server responses into a predictable frontend error format.

Handle at least:

- `400` — invalid request or validation failure.
- `401` — authentication required or expired.
- `403` — authenticated user lacks permission.
- `404` — requested resource not found.
- `409` — conflicting or invalid state transition.
- `5xx` — server-side failure.
- Network failure — server could not be reached.

Do not assume the backend will always return valid JSON. Error parsing must fail safely.

## 7. Service interfaces

Define interfaces for the capabilities the screens need. Adapt method signatures as API requirements become concrete.

```ts
export interface InvoiceService {
  list(filters: InvoiceFilters): Promise<PageResult<Invoice>>;
  getById(id: string): Promise<Invoice>;
  createDraft(input: CreateInvoiceInput): Promise<Invoice>;
  submitForApproval(id: string): Promise<Invoice>;
}

export interface ApprovalService {
  listPending(filters: PageRequest): Promise<PageResult<Invoice>>;

  approve(id: string): Promise<Invoice>;

  reject(id: string, reason: string): Promise<Invoice>;
}
```

Create the input type separately:

```ts
export interface CreateInvoiceInput {
  supplierName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  invoiceDate: string;
  dueDate?: string | null;
  description?: string | null;
}
```

Additional services may include:

- Authentication.
- Current session and permissions.
- Dashboard summaries.
- Organization settings.
- Team members and invitations.
- Profile settings.
- Invoice document handling.

Components should depend on these contracts rather than the mock or API implementation directly.

## 8. Mock and API implementations

Provide two implementations of the same service contracts:

- `MockInvoiceService`, `MockApprovalService`, and corresponding mock services.
- `ApiInvoiceService`, `ApiApprovalService`, and corresponding API services.

Select the implementation through one configuration point, such as a typed service factory or environment-based setting.

Requirements:

- Mock data should be realistic and internally consistent.
- Use stable fixture IDs so routes and tests remain repeatable.
- Model pending, approved, rejected, draft and cancelled invoices.
- Include empty results and controlled error scenarios for testing.
- A successful mutation must update subsequent mock reads.
- Avoid directly modifying shared fixture constants in a way that contaminates tests.
- Never silently fall back to mock data after a production API failure.
- Do not include credentials or secrets in client-exposed environment variables.

For the initial prototype, in-memory mock data is sufficient. If persistence across reloads is needed, add it as an isolated prototype-only capability and do not confuse it with backend persistence.

## 9. API boundary

Use a configurable API base path with a default development convention of `/api/v1`.

Expected endpoints, subject to backend implementation:

| Method | Endpoint                 | Purpose                                                      |
| ------ | ------------------------ | ------------------------------------------------------------ |
| `GET`  | `/me`                    | Current user, organization context and effective permissions |
| `GET`  | `/invoices`              | Search and paginate invoices                                 |
| `POST` | `/invoices`              | Create an invoice draft                                      |
| `GET`  | `/invoices/{id}`         | Retrieve invoice details                                     |
| `POST` | `/invoices/{id}/submit`  | Submit an eligible invoice                                   |
| `GET`  | `/approvals`             | List approvals available to the current user                 |
| `POST` | `/invoices/{id}/approve` | Approve an eligible invoice                                  |
| `POST` | `/invoices/{id}/reject`  | Reject an eligible invoice                                   |
| `GET`  | `/dashboard/summary`     | Retrieve dashboard metrics, if implemented                   |
| `GET`  | `/team`                  | List permitted team members                                  |

These are proposed contracts, not claims that the backend endpoints already exist. Confirm the final API design before connecting the frontend.

## 10. Authentication and browser security

The planned browser authentication approach uses server-side sessions with secure cookies.

Frontend requirements:

- Keep session cookies inaccessible to JavaScript when configured as HttpOnly.
- Include credentials when making same-origin requests that require the session.
- Follow the backend's CSRF protection contract for state-changing requests.
- Do not store passwords or session identifiers in local storage.
- Handle expired sessions.
- Do not treat a client-side role value as proof of authorization.

The frontend must align with the actual Spring Security configuration and deployment topology.

## 11. Document upload contract

Document upload may require a separate endpoint or multipart request.

The UI should:

- Validate permitted file types and size based on configured service constraints.
- Show selected file metadata.
- Represent upload progress if the service supports it.
- Handle cancellation or failure appropriately.
- Display a document preview only when a usable URL or preview response is supplied.

Do not assume document upload is part of the invoice JSON request.

## 12. Data formatting

Create shared utilities for:

- Currency formatting.
- Date-only formatting.
- Timestamp formatting.
- Invoice status labels.
- File sizes.
- Validation messages.

Keep the raw amount and date values separate from display formatting.

Do not parse a date-only invoice date as a timestamp unless the contract explicitly defines it that way. Avoid accidental date shifts caused by timezone conversion.

## 13. Contract testing

The mock and API implementations should satisfy the same service interface.

Verify:

- List filtering and pagination.
- Detail retrieval.
- Draft creation.
- Submission.
- Approval and rejection.
- Permission and conflict errors.
- Empty results.
- Stable handling of nullable fields.
- Correct formatting of decimal amounts and date-only values.

## 14. Definition of done

The data contract is complete when the UI consumes typed services, mock data is isolated, all core screens use consistent models, errors are normalized, and an API implementation can be introduced without rewriting page components.
