# System Architecture & Technical Design Document

**Project:** FlowLedger  
**Target Platform:** Ethiopian SME Invoicing & Workflow Management  
**Status:** Implemented & Verified  
**Runtime:** Java 25 LTS, Spring Boot 4.1.1, PostgreSQL 16, Next.js 16.4.2  

---

## 1. System Overview

FlowLedger is structured as a decoupled multi-tier web application designed to achieve high data isolation, robust auditability, and immediate responsiveness.

The architecture comprises three principal tiers:
1. **Frontend Presentation & Client State Tier:** Next.js 16 App Router application running React 19, Tailwind CSS 4, and an external reactive invoice store.
2. **Backend Application & Security Tier:** Spring Boot 4.1.1 REST API implementing Spring Security 7, Nimbus JWT, JPA business rules, and Flyway migration controls.
3. **Relational Persistence Tier:** PostgreSQL 16 database operating with strict foreign key constraints, composite tenant indexes, and full ACID guarantees.

```mermaid
flowchart TD
    subgraph Client ["Client Presentation Tier (Next.js 16)"]
        UI["Web UI Components\n(Tailwind CSS 4, React 19)"]
        AuthCtx["AuthContext & useAuth()\n(Session Management)"]
        InvStore["InvoiceStore (useSyncExternalStore)\n(Reactive Cache & State Sync)"]
        APIClient["API Client (lib/api/client.ts)\n(Typed Fetch & Error Normalizer)"]
        Proxy["Next.js Proxy Rewrite\n(/api/:path* -> :8082/api/:path*)"]
        
        UI --> AuthCtx
        UI --> InvStore
        InvStore --> APIClient
        AuthCtx --> APIClient
        APIClient --> Proxy
    end

    subgraph Backend ["Application & Security Tier (Spring Boot 4.1.1)"]
        TokenResolver["CookieBearerTokenResolver\n(Resolves Cookie OR Header)"]
        SecurityConfig["SecurityConfig (FilterChain)\n(CORS, Stateless, CSRF Lax)"]
        UserContext["AuthenticatedUserContext\n(Tenant Claims Resolver)"]
        
        AuthController["AuthController\n(/api/v1/auth/*)"]
        InvoiceController["InvoiceController\n(/api/v1/invoices/*)"]
        ApprovalController["ApprovalController\n(/api/v1/approvals/*)"]
        TeamController["TeamController\n(/api/v1/organizations/team)"]
        
        InvoiceService["InvoiceService\n(Business Logic & Validation)"]
        ApprovalService["ApprovalService\n(Workflow State Machine)"]
        SpecEngine["InvoiceSpecifications\n(JPA Criteria Queries)"]
        
        TokenResolver --> SecurityConfig
        SecurityConfig --> UserContext
        UserContext --> AuthController & InvoiceController & ApprovalController & TeamController
        InvoiceController --> InvoiceService
        ApprovalController --> ApprovalService
        InvoiceService --> SpecEngine
        ApprovalService --> SpecEngine
    end

    subgraph Database ["Persistence Tier (PostgreSQL 16)"]
        Hikari["HikariCP Connection Pool"]
        JPA["Hibernate 7.4.5 JPA Provider"]
        PgTables[("PostgreSQL 16 Tables:\n- app_user\n- organization\n- organization_membership\n- invoice\n- invoice_activity")]
        
        SpecEngine --> JPA
        InvoiceService --> JPA
        ApprovalService --> JPA
        AuthController --> JPA
        TeamController --> JPA
        JPA --> Hikari
        Hikari --> PgTables
    end

    Proxy -->|HTTP + Cookie / Bearer| TokenResolver
```

---

## 2. Multi-Tenant Isolation Pattern

FlowLedger operates on a **Shared Database, Shared Schema with Discriminator Column** multi-tenancy model. Every domain entity is explicitly scoped to an `organization_id`.

```mermaid
sequenceDiagram
    autonumber
    actor User as SME User (Abebe)
    participant Client as Next.js Client
    participant Proxy as Next.js Proxy (:3000)
    participant Sec as Spring Security Filter
    participant Ctx as AuthenticatedUserContext
    participant Svc as InvoiceService
    participant Repo as InvoiceRepository
    participant DB as PostgreSQL 16

    User->>Client: Clicks "New Invoice" & Submits
    Client->>Proxy: POST /api/v1/invoices (Cookie: access_token)
    Proxy->>Sec: Forward Request to Backend (:8082)
    Sec->>Sec: Validate HS256 Signature & Claims
    Sec->>Ctx: Extract sub, orgId, role, name
    Sec->>Svc: Invoke createDraft(orgId, userId, name, input)
    Note over Ctx,Svc: orgId is injected from JWT, NEVER from client body!
    Svc->>Repo: save(invoice with organizationId = orgId)
    Repo->>DB: INSERT INTO invoice (organization_id, ...) VALUES (orgId, ...)
    DB-->>Repo: Saved entity with generated UUID
    Repo-->>Svc: Entity
    Svc-->>Client: 201 Created (InvoiceResponse JSON)
```

### Defense Against Insecure Direct Object Reference (IDOR)
- **Zero Trust on Incoming Organization Identifiers:** Endpoints never accept an `organizationId` from the request query string or JSON payload.
- **Context Injection:** The [`AuthenticatedUserContext`](../flowLedger_backend/src/main/java/com/example/flowLedger_backend/security/AuthenticatedUserContext.java) service extracts the user's `organizationId` directly from the authenticated `Jwt` object in the `SecurityContextHolder`.
- **Query Scoping:** All database queries require `organizationId` as a mandatory `WHERE` clause constraint:
  ```java
  Optional<Invoice> findByIdAndOrganizationId(UUID id, UUID organizationId);
  ```
  If an authorized user from Organization A attempts to query an invoice belonging to Organization B by UUID, the repository returns an empty `Optional`, resulting in a safe `404 Not Found` response.

---

## 3. Dual Authentication & Token Delivery Architecture

FlowLedger supports two parallel delivery channels for authentication credentials:

```mermaid
flowchart TD
    Req["Incoming HTTP Request"] --> Resolver{"CookieBearerTokenResolver"}
    Resolver -->|Header Present?| HCheck["Authorization: Bearer <token>"]
    Resolver -->|No Header?| CCheck["Cookie: access_token=<token>"]
    
    HCheck --> Validate["Nimbus JwtDecoder (HS256 Verification)"]
    CCheck --> Validate
    
    Validate -->|Valid Signature & Not Expired| AuthSuccess["Construct JwtAuthenticationToken\nSet in SecurityContextHolder"]
    Validate -->|Invalid / Expired| AuthFail["Clear Context & Return 401 Unauthorized"]
```

### Token Mechanics
- **Algorithm:** HMAC-SHA256 (`MacAlgorithm.HS256`) with a 256-bit cryptographically secure secret key.
- **Token Claims Payload:**
  - `sub`: User ID (`UUID`)
  - `email`: User email address
  - `name`: User full name
  - `orgId`: Tenant Organization ID (`UUID`)
  - `role`: Membership role (`OWNER`, `ADMIN`, `FINANCE`, `APPROVER`, `VIEWER`)
  - `iat`: Issued At timestamp
  - `exp`: Expiration timestamp (default: 24 hours)

### Cookie Security Attributes
When issued by [`AuthController.java`](../flowLedger_backend/src/main/java/com/example/flowLedger_backend/identity/AuthController.java):
- **`HttpOnly`:** `true` (Cannot be read or manipulated by client-side JavaScript, neutralizing Cross-Site Scripting [XSS] token theft).
- **`SameSite`:** `Lax` (Prevents Cross-Site Request Forgery [CSRF] attacks while allowing normal top-level navigation).
- **`Path`:** `/` (Accessible across the entire application domain).
- **`Secure`:** Enabled in production environments over HTTPS.

---

## 4. Invoice State Machine & Lifecycle

The invoice state machine governs all legal lifecycle transitions and ensures business rules are strictly maintained:

```mermaid
stateDiagram-v2
    [*] --> DRAFT : createDraft()
    [*] --> PENDING_APPROVAL : createAndSubmit()
    
    DRAFT --> PENDING_APPROVAL : submitForApproval()
    DRAFT --> DRAFT : updateDraft()
    
    PENDING_APPROVAL --> APPROVED : approve() [Approver/Admin/Owner]
    PENDING_APPROVAL --> REJECTED : reject(reason) [Approver/Admin/Owner]
    
    REJECTED --> DRAFT : updateDraft() [Clears Rejection Reason]
    REJECTED --> PENDING_APPROVAL : submitForApproval()
    
    APPROVED --> [*]
```

### Transition Invariants
1. **Immutable States:** An invoice in `APPROVED` status is completely locked; no further edits or status transitions are allowed.
2. **Draft Modifications:** Only invoices in `DRAFT` or `REJECTED` status may be updated via `updateDraft()`. Attempting to modify a `PENDING_APPROVAL` or `APPROVED` invoice raises an `IllegalStateException` (HTTP 400).
3. **Mandatory Rejection Rationale:** An invoice can only transition to `REJECTED` if a non-blank justification string (minimum 3 characters) is provided. The reason is persisted in `invoice.rejection_reason` and recorded in the audit activity log.
4. **Resubmission:** If an invoice is rejected, editing its details automatically moves it back to `DRAFT` with the prior rejection note cleared, readying it for subsequent resubmission.

---

## 5. Audit Activity Logging Engine

FlowLedger incorporates an **immutable activity log** on every invoice. State transitions cannot occur without recording an audit event.

```mermaid
classDiagram
    class Invoice {
        +UUID id
        +UUID organizationId
        +String invoiceNumber
        +String supplierName
        +LocalDate issueDate
        +LocalDate dueDate
        +BigDecimal totalAmount
        +String currency
        +String status
        +String description
        +String rejectionReason
        +UUID createdBy
        +Instant createdAt
        +Instant updatedAt
        +List~InvoiceActivity~ activities
        +addActivity(type, description, actorName, actorId)
    }

    class InvoiceActivity {
        +UUID id
        +UUID invoiceId
        +String type
        +String description
        +String actorName
        +UUID actorId
        +Instant occurredAt
    }

    Invoice "1" *-- "many" InvoiceActivity : cascade ALL, orphanRemoval
```

### Event Types
- `CREATED_DRAFT`: Initial draft saved by submitter.
- `SUBMITTED`: Submitted for formal approval.
- `EDITED`: Draft details modified prior to approval.
- `APPROVED`: Formal approval granted by authorized user.
- `REJECTED`: Invoice rejected with logged justification.

---

## 6. Dynamic Query Engine (Criteria API)

To support flexible filtering across statuses, suppliers, invoice numbers, and date ranges without falling victim to PostgreSQL type-inference defects (such as `lower(bytea)` when binding nullable parameters in raw JPQL), FlowLedger utilizes the **JPA Criteria API Specification Pattern** in [`InvoiceSpecifications.java`](../flowLedger_backend/src/main/java/com/example/flowLedger_backend/invoices/InvoiceSpecifications.java):

```java
public static Specification<Invoice> withFilters(
        UUID orgId,
        String status,
        String search,
        LocalDate fromDate,
        LocalDate toDate
) {
    return (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(root.get("organizationId"), orgId));

        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            predicates.add(cb.equal(root.get("status"), status.toUpperCase()));
        }

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.trim().toLowerCase() + "%";
            Predicate supplierLike = cb.like(cb.lower(root.get("supplierName")), pattern);
            Predicate invoiceNumLike = cb.like(cb.lower(root.get("invoiceNumber")), pattern);
            predicates.add(cb.or(supplierLike, invoiceNumLike));
        }

        if (fromDate != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("issueDate"), fromDate));
        }

        if (toDate != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("issueDate"), toDate));
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    };
}
```

**Benefits:**
- **Zero Null-Parameter Cast Errors:** Only non-null filters generate SQL `WHERE` clauses. If `search` is omitted, no `LIKE` expressions are compiled.
- **Index Optimization:** Database query planner utilizes the `idx_invoice_org_num` composite index without synthetic parameter wrapping.
- **Type Safety:** Criteria compiler guarantees field name and type checking at build time.

---

## 7. Cross-Cutting Technical Concerns

### 7.1 Unified Error Representation (RFC 7807)
All error responses from the backend adhere to a standardized JSON schema handled by [`GlobalExceptionHandler.java`](../flowLedger_backend/src/main/java/com/example/flowLedger_backend/config/GlobalExceptionHandler.java):

```json
{
  "timestamp": "2026-11-03T20:20:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Rejection reason is required and must not be blank",
  "path": "/api/v1/approvals/d3b07384-d113-40a8-b649-0112f4553221/reject"
}
```

### 7.2 Connection Pooling & Transaction Management
- Connection management is managed by **HikariCP** with sensible pool defaults (max pool size: 10, minimum idle: 5, connection timeout: 30,000 ms).
- All mutative business logic runs inside `@Transactional` boundaries. If an activity log creation fails or a repository update encounters an error, the entire database transaction rolls back, guaranteeing zero orphaned or inconsistent state records.
