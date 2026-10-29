# FlowLedger — Product Brief

## 1. Product overview

**Product name:** FlowLedger  
**Product category:** Invoice intake, tracking and approval workflow  
**Initial market:** Small businesses in Ethiopia  
**Frontend stack:** Existing Next.js + TypeScript project  
**Backend direction:** Java 21, Spring Boot and PostgreSQL  
**Product stage:** MVP prototype

FlowLedger helps small businesses collect supplier invoices, organize invoice information, track approval progress and make invoice-related responsibilities visible.

The frontend MVP should demonstrate the complete invoice workflow using realistic mock data behind a replaceable service layer. It should be designed to connect to the production API without requiring a complete UI rewrite.

## 2. Problem statement

Small businesses may receive supplier invoices through email, messaging applications, paper documents and other channels. Tracking those invoices through spreadsheets and informal conversations can make it difficult to answer basic questions:

- Which invoices have been received?
- Which invoices still need review or approval?
- Who is responsible for the next action?
- Which invoices have been approved or rejected?
- Which invoices are overdue or require attention?
- Where can a team member find the invoice document and its history?

FlowLedger aims to provide one organized workspace for invoice intake, review, approval and status tracking.

## 3. Product vision

Make invoice workflows easier to understand, easier to manage and more accountable for small business teams.

The product should feel approachable to a business owner or finance employee who wants to complete work quickly rather than learn a complicated accounting system.

## 4. Target users

### Primary users

**Business owner**

- Wants visibility into outstanding invoices and pending approvals.
- Needs a clear overview of the business's invoice activity.
- Manages team access and basic organization settings.

**Finance staff**

- Creates invoice records and uploads invoice documents.
- Reviews invoice information and corrects mistakes.
- Tracks invoice status and follows up on pending work.

**Approver**

- Reviews invoices assigned for approval.
- Inspects supplier, amount, invoice date and supporting document.
- Approves or rejects an invoice with a clear explanation when needed.

### Secondary users

**Administrator**

- Manages team membership and roles.
- Maintains organization settings.

**Viewer**

- Reads invoice information and status without changing records or making approval decisions.

A person may hold more than one business responsibility, but the UI must display actions according to the permissions available to the current user.

## 5. Value proposition

FlowLedger provides a single place to:

1. Capture invoice details.
2. Store and locate invoice documents.
3. See the status of every invoice.
4. Review and approve invoices through an explicit workflow.
5. Understand who performed an action and when.
6. Identify work that needs attention.

The MVP should prioritize clarity and reliability over advanced automation.

## 6. MVP objectives

The frontend prototype must demonstrate:

- A consistent application shell and responsive navigation.
- Sign-in and basic authentication-related screens.
- A dashboard with invoice and approval summaries.
- An invoice list with search, filtering, sorting and pagination behavior.
- Manual invoice creation and a document-upload interface.
- Invoice detail and review screens.
- An approval inbox with approval and rejection interactions.
- Team member and role management screens.
- Organization and user settings.
- Clear loading, empty, error, validation, success and permission states.
- A replaceable mock-data layer with typed service interfaces.
- Reusable components and a consistent visual design system.

## 7. Invoice workflow

The UI will represent the following statuses:

- `DRAFT`: Invoice information is being prepared and has not been submitted for approval.
- `PENDING_APPROVAL`: The invoice has been submitted and awaits a decision.
- `APPROVED`: The invoice has passed the approval workflow.
- `REJECTED`: An approver has rejected the invoice.
- `CANCELLED`: The invoice has been cancelled.

Expected high-level workflow:

1. A finance user creates an invoice.
2. The invoice remains a draft while information is incomplete.
3. The user submits the invoice for approval.
4. An authorized approver reviews the invoice.
5. The approver approves or rejects it.
6. The invoice detail page reflects the latest status and available history.

Any resubmission or reopening behavior must be explicitly defined before implementation; the UI must not invent transitions that the backend does not support.

## 8. MVP scope

### In scope

- Sign-in UI and related authentication states.
- Authenticated application layout.
- Dashboard and summary cards.
- Invoice list, filters and search.
- Manual invoice entry.
- Document-upload UI with file validation feedback.
- Invoice details and document preview placeholder.
- Approval inbox and decision dialogs.
- Invoice status badges and activity timeline.
- Team list, invitations UI and role selection.
- Organization settings and profile settings.
- Responsive desktop, tablet and mobile layouts.
- Mock data, simulated service responses and error scenarios.
- Accessibility-conscious interaction and form behavior.

### Out of scope for the initial frontend prototype

- Real payment processing or bank integrations.
- Full accounting, tax filing or bookkeeping functionality.
- Production OCR or AI extraction.
- Automatic payment execution.
- Real email delivery or invitation dispatch.
- Production authentication and authorization.
- Real file storage and virus scanning.
- Complex multi-stage approval policy configuration.
- Claims of compliance with any specific accounting or regulatory standard.

These capabilities may be considered later, but they must not be presented as implemented functionality in the prototype.

## 9. Product design principles

### Clarity first

Show the invoice's status, amount, supplier and next required action prominently.

### Workflow-oriented

Prioritize tasks such as reviewing an invoice or submitting a draft over decorative dashboard content.

### Trustworthy

Use clear confirmation messages, visible validation and an understandable activity history.

### Restrained visual design

Use clean light surfaces, neutral backgrounds, teal as the primary accent and semantic colors for statuses.

### Responsive by default

Core tasks must remain usable on desktop, tablet and mobile. Dense tables should become compact lists or cards on narrow screens when necessary.

### Backend-ready

Keep UI components separate from data access. Use typed models and service functions instead of embedding mock records directly into pages.

### Accessible

Provide visible focus states, keyboard navigation, labeled form fields, adequate contrast and status labels that do not depend on color alone.

## 10. Success criteria for the prototype

The prototype is successful when a reviewer can:

- Sign in through a clearly defined prototype flow.
- Navigate between dashboard, invoices, approvals, team and settings.
- Create and validate an invoice using mock data.
- Find an invoice using search and filters.
- Inspect invoice details and status history.
- Complete simulated approve and reject flows.
- See useful feedback for success, failure and empty results.
- Understand what actions their selected role can perform.
- Use the core screens at desktop, tablet and mobile widths.
- Replace the mock service implementation with an API implementation without rewriting page-level UI.

## 11. Product assumptions

- Currency defaults to ETB in example data, while the UI should remain capable of displaying other ISO currency codes.
- Amounts are represented as decimal strings at the frontend/API boundary to avoid floating-point precision issues.
- Dates use an explicit date-only representation when they represent calendar dates.
- Invoice IDs are opaque identifiers; the UI must not assume they are sequential integers.
- A user's available organizations and permissions come from the authenticated session or API, not from arbitrary browser input.
- The prototype may simulate authentication and authorization, but it must clearly remain a prototype rather than imply production security.

## 12. Design and implementation constraints

- Keep the existing Next.js + TypeScript application.
- Inspect the current project structure and package versions before modifying configuration.
- Reuse existing dependencies when practical.
- Do not replace the package manager or introduce another framework without approval.
- Keep mock data and service implementations separate from UI components.
- Avoid large, monolithic page components.
- Do not hard-code business rules in multiple screens.
- Do not treat frontend-only permission checks as security enforcement.
- Do not delete existing project files or reset databases as part of frontend work.

## 13. Definition of done

The frontend MVP is ready for backend integration when its principal user flows work with mock data, all key screens have documented UI states, shared components are consistent, responsive behavior is verified, and service interfaces are documented and typed.

Every visible control must either perform a meaningful prototype action or be clearly identified as unavailable. No dead buttons, unexplained placeholder links or fake success messages should remain.
