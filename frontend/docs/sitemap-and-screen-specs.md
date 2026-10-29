# FlowLedger — Sitemap and Screen Specifications

## 1. Purpose

Define the route structure, navigation model, shared layouts and screen-level requirements for the FlowLedger MVP frontend.

## 2. Route map

Use the existing Next.js routing convention discovered in the repository. The paths below are the desired product routes, not a requirement to migrate the project between App Router and Pages Router.

### Public routes

| Route                | Screen            | Purpose                                                   |
| -------------------- | ----------------- | --------------------------------------------------------- |
| `/sign-in`           | Sign in           | Start a session                                           |
| `/forgot-password`   | Forgot password   | Request password recovery                                 |
| `/accept-invitation` | Accept invitation | Prototype invitation acceptance when included in the flow |

### Authenticated routes

| Route                    | Screen                | Purpose                                                 |
| ------------------------ | --------------------- | ------------------------------------------------------- |
| `/dashboard`             | Dashboard             | Summarize invoice activity and next actions             |
| `/invoices`              | Invoice list          | Search, filter and browse invoices                      |
| `/invoices/new`          | Create invoice        | Enter invoice details and select a document             |
| `/invoices/[id]`         | Invoice details       | Review invoice data, document and history               |
| `/approvals`             | Approvals inbox       | Find invoices requiring a decision                      |
| `/approvals/[id]`        | Approval review       | Review a specific invoice and make an eligible decision |
| `/settings`              | Settings overview     | Navigate to profile, organization and team settings     |
| `/settings/profile`      | Profile settings      | Edit personal display information                       |
| `/settings/organization` | Organization settings | View or edit permitted workspace information            |
| `/settings/team`         | Team management       | View members, manage roles and initiate invitations     |

The implementation must follow the project's current route conventions. If the current router requires a different file structure, preserve the desired URLs and adapt the implementation to the existing router.

## 3. Navigation model

### Desktop

Use a persistent left sidebar and a compact top header.

**Sidebar items**

- Dashboard
- Invoices
- Approvals
- Team, if the user has access
- Settings

The sidebar should show a clear active state and may display an approval-count indicator when useful.

**Header**

- Current page title or breadcrumb.
- Organization name or organization selector when multiple organizations are supported.
- Optional global search entry point if it is implemented.
- User menu with profile and sign-out actions.

Avoid adding decorative navigation items that lead nowhere.

### Tablet

- Keep primary navigation visible when space permits.
- Allow the sidebar to collapse.
- Preserve access to the current organization, page title and user menu.
- Keep common actions reachable without horizontal scrolling.

### Mobile

- Use a compact header and a navigation drawer or a small bottom navigation for the most important destinations.
- Keep the New invoice action easy to discover.
- Convert dense invoice tables into stacked cards or a compact list.
- Move secondary filters into a sheet or expandable panel.
- Use full-width forms and touch-friendly controls.
- Avoid horizontal scrolling for essential workflows.

The mobile design must not be a desktop screenshot squeezed into a narrow viewport.

## 4. Shared application shell

The authenticated shell contains:

- Navigation.
- Header.
- Main content region.
- Optional breadcrumb or page description.
- Shared toast or notification region.
- Shared modal and confirmation patterns.

The shell must not assume all users can access every navigation item. Navigation visibility is based on the effective permissions provided to the frontend, while the backend remains responsible for authorization.

## 5. Screen specification — Sign in

**Route:** `/sign-in`

**Purpose:** Allow a user to start a session.

**Main content**

- FlowLedger wordmark or product name.
- Short sign-in heading.
- Email input.
- Password input.
- Password visibility toggle.
- Sign-in button.
- Forgot password link.
- Inline form error region.

**Interactions**

- Validate required fields.
- Submit through an authentication service.
- Show a loading state while submitting.
- Prevent repeated submission during processing.
- Show a generic authentication failure when credentials are invalid.
- Navigate to the dashboard after simulated or real success.
- Support a safe post-login return route if required by the application.

**States**

- Initial.
- Submitting.
- Invalid fields.
- Authentication failure.
- Session already active.
- Service unavailable.

**Acceptance criteria**

- Inputs have labels and accessible error messages.
- Keyboard users can complete the form.
- Errors do not expose sensitive server details.
- Prototype authentication is clearly simulated.

## 6. Screen specification — Forgot password

**Route:** `/forgot-password`

**Purpose:** Provide a password-recovery request interface.

**Main content**

- Email field.
- Submit button.
- Return-to-sign-in link.
- Submission confirmation region.

**Interactions**

- Validate the email format.
- Display a processing state.
- Show a neutral confirmation appropriate to the service response.

**Prototype behavior**
The service may simulate a recovery request. The UI must not claim that an email was sent unless a connected service confirms that action.

## 7. Screen specification — Dashboard

**Route:** `/dashboard`

**Purpose:** Show what needs attention and provide shortcuts to the main workflows.

**Main content**

- Welcome heading and short contextual description.
- Summary cards: total invoices, pending approvals, approved invoices and rejected invoices.
- Recent invoices.
- Pending approvals or work requiring attention.
- Quick action to create an invoice.
- Optional recent activity section.

**Interactions**

- Clicking a summary card navigates to the invoice list with the corresponding filter when supported.
- Clicking an invoice opens its details.
- Clicking an approval opens the relevant review screen.
- New invoice opens `/invoices/new`.

**Data rules**

- Derive summary values from the service response or a shared selector over loaded data.
- Do not maintain conflicting independent counts on different pages.
- Format monetary values with their currency.
- Use explicit date formatting.

**States**

- Initial loading.
- Populated dashboard.
- No invoice activity.
- Partial data unavailable.
- Service failure.

**Acceptance criteria**

- Dashboard summaries agree with the underlying mock records.
- Each actionable widget has a working destination.
- The dashboard remains useful on mobile without requiring every section to fit above the fold.

## 8. Screen specification — Invoice list

**Route:** `/invoices`

**Purpose:** Find, filter and open invoices.

**Main content**

- Page title and New invoice action.
- Search field.
- Status filter.
- Date-range filter when supported.
- Sort control.
- Invoice count.
- Table on wider screens; card or compact list on narrow screens.
- Pagination controls.

**Suggested columns**

- Supplier.
- Invoice number.
- Invoice date.
- Amount and currency.
- Status.
- Last updated, if available.
- Row actions.

**Interactions**

- Search by supported fields.
- Apply and clear filters.
- Sort supported columns.
- Navigate through pages.
- Open an invoice by selecting its row or primary action.
- Create a new invoice.

**States**

- Loading.
- Populated results.
- No invoices exist.
- No results match filters.
- Error with retry.
- Unauthorized access.

**Acceptance criteria**

- Search and filters work together.
- Clearing filters restores the unfiltered list.
- Empty data and failed data requests are distinguishable.
- The list does not rely on color alone to communicate status.
- Pagination controls reflect the service's actual result metadata.

## 9. Screen specification — Create invoice

**Route:** `/invoices/new`

**Purpose:** Create a draft or submit a valid invoice for approval.

**Main content**

- Page title.
- Supplier name.
- Invoice number.
- Invoice date.
- Due date, if supported.
- Amount.
- Currency selector or default currency display.
- Description or notes, if supported.
- Document selection or upload area.
- Save draft action.
- Submit for approval action.
- Cancel or return navigation.

**Interactions**

- Validate required fields and formats.
- Display field-level errors.
- Show file name, type and size before upload or simulated attachment.
- Allow removal or replacement of a selected file before submission.
- Warn before discarding unsaved changes when practical.
- Show processing state and success or failure feedback.

**Acceptance criteria**

- Amount and date values use explicit types and formats.
- Invalid values are not submitted.
- Saving a draft and submitting for approval are distinct actions.
- Repeated submission is prevented while a request is in progress.
- The form preserves user input after recoverable service errors.

## 10. Screen specification — Invoice details

**Route:** `/invoices/[id]`

**Purpose:** Provide a complete view of an invoice and its workflow.

**Main content**

- Supplier name and invoice number.
- Status badge.
- Amount and currency.
- Invoice date and other supported dates.
- Supporting document preview area.
- Invoice metadata.
- Activity timeline.
- Contextual action area.
- Back navigation to the originating list when practical.

**Interactions**

- Display actions only when the current state and effective permissions allow them.
- Permit editing only when supported for that status and user.
- Link to the approval review experience when appropriate.
- Confirm consequential actions.
- Handle missing documents, inaccessible invoices and deleted records.

**Acceptance criteria**

- Status and history match the service response.
- The page has clear loading, not-found, access-denied and failure states.
- Document preview failure does not hide the invoice metadata.
- Unknown or newly introduced status values do not crash the page.

## 11. Screen specification — Approvals inbox

**Route:** `/approvals`

**Purpose:** Help approvers find invoices awaiting their decision.

**Main content**

- Page title and pending count.
- Search.
- Optional age or date filter.
- Invoice list with supplier, invoice number, amount, submitted date and status.
- Clear review action.

**Interactions**

- Search and filter the queue.
- Open the approval review screen.
- Refresh or retry the list.
- Update the queue after a successful decision.

**States**

- Loading.
- Pending approvals available.
- No approvals assigned.
- Filtered results empty.
- Service failure.
- Access denied.

**Acceptance criteria**

- The queue shows only records returned by the authorized service.
- A decision removes or updates the record according to the returned state.
- The pending count updates consistently.

## 12. Screen specification — Approval review

**Route:** `/approvals/[id]`

**Purpose:** Let an authorized approver inspect an invoice and make an explicit decision.

**Main content**

- Invoice summary.
- Supporting document area.
- Relevant invoice fields.
- Available history.
- Approve button.
- Reject button.
- Back to approvals navigation.

**Interactions**

- Approve opens a confirmation dialog.
- Reject opens a dialog with a reason field when required.
- Disable repeated decisions while a request is processing.
- Refresh invoice and queue state after success.
- Show an error if the invoice is no longer eligible for a decision.

**Acceptance criteria**

- The dialog identifies the invoice being acted upon.
- Rejection validation matches the configured policy.
- Success is shown only after service confirmation.
- A stale or conflicting state is handled without silently overwriting data.

## 13. Screen specification — Team management

**Route:** `/settings/team`

**Purpose:** Display organization members and support permitted membership actions.

**Main content**

- Team heading and Invite member action.
- Member list with name, email, role and membership status.
- Role edit action when allowed.
- Invitation state when returned by the service.

**Interactions**

- Open invitation form.
- Validate invitation fields and selected role.
- Confirm sensitive role changes or access removal.
- Display service-confirmed results.

**States**

- Loading.
- Members available.
- No members beyond the current user.
- Invitation or update in progress.
- Validation failure.
- Service failure.
- Insufficient permissions.

**Acceptance criteria**

- Role choices come from the supported role model.
- The UI never implies an invitation was sent when it was only simulated.
- The backend remains authoritative for team membership changes.

## 14. Screen specification — Settings overview

**Route:** `/settings`

**Purpose:** Provide a clear entry point to account and workspace settings.

**Sections**

- Profile.
- Organization.
- Team, subject to permissions.

**Acceptance criteria**

- Each section has a working destination.
- Unavailable sections are hidden or explained.
- Settings navigation remains usable on mobile.

## 15. Screen specification — Profile settings

**Route:** `/settings/profile`

**Purpose:** Edit personal display information supported by the service.

**Main content**

- Name or display name.
- Email displayed as appropriate.
- Save action.
- Cancel or reset behavior when useful.

**Acceptance criteria**

- Current values load from the service.
- Editable fields are clearly distinguished from read-only fields.
- Validation and save feedback are visible.
- Unsaved edits are not silently discarded.

## 16. Screen specification — Organization settings

**Route:** `/settings/organization`

**Purpose:** View and edit organization information permitted by the current user's permissions.

**Main content**

- Organization name.
- Supported business profile fields.
- Default currency where configured.
- Save action.

**Acceptance criteria**

- Organization-level settings are clearly distinguished from personal settings.
- Read-only values are not presented as editable.
- Failed updates preserve the user's input where practical.
- Currency and locale behavior does not assume all future organizations use identical settings.

## 17. Global UI states

Every data-driven screen must define:

- Initial loading.
- Empty data.
- Empty filtered results.
- Service error and retry.
- Authentication expiration.
- Permission denied.
- Not found.
- Form validation.
- In-progress mutation.
- Success confirmation.

## 18. Responsive acceptance criteria

### Desktop

- Primary navigation is easy to scan.
- Tables use available width without excessive empty space.
- Main actions are easy to locate.

### Tablet

- Navigation can collapse.
- Content retains readable spacing.
- Filters and forms remain operable.

### Mobile

- No horizontal scrolling for essential content.
- Invoice records remain readable without wide tables.
- Dialogs and forms fit the viewport.
- Primary actions remain visible and touch-friendly.
- Keyboard focus and validation messages remain usable.

## 19. Route and navigation rules

- Use stable, opaque invoice identifiers in detail routes.
- Use URL query parameters for shareable list state where appropriate, such as search, status, sort and page.
- Preserve useful list context when navigating back from details.
- Avoid exposing sensitive invoice data in URLs.
- Do not embed authorization decisions in route names or client-controlled query parameters.
- Ensure unknown routes render a deliberate not-found screen.
