# FlowLedger — Personas and User Flows

## 1. Purpose

Define the primary users, their responsibilities, the core invoice workflows and the expected UI behavior for the MVP prototype.

These flows are product and interaction requirements. They do not replace backend authorization, validation or workflow enforcement.

## 2. User roles

The initial role model contains five organization-level roles.

| Role       | Primary responsibility        | Typical UI capabilities                                                                  |
| ---------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| `OWNER`    | Owns the workspace            | View dashboard and invoices, manage settings and team, perform permitted invoice actions |
| `ADMIN`    | Administers the workspace     | Manage members and organization settings according to policy                             |
| `FINANCE`  | Prepares and manages invoices | Create, edit eligible drafts, submit invoices and view workflow status                   |
| `APPROVER` | Makes approval decisions      | Review assigned invoices and approve or reject eligible items                            |
| `VIEWER`   | Read-only access              | View permitted dashboards, invoice details and lists                                     |

Exact permission combinations must be confirmed in the backend authorization policy. The frontend should consume effective permissions from the session or API rather than treating role names as a complete security system.

### Permission display rules

- Hide or disable actions the current user cannot perform.
- When an action is disabled, provide a short explanation when useful.
- Do not rely on hidden buttons to protect data or enforce permissions.
- Handle backend `401 Unauthorized` and `403 Forbidden` responses even if the UI previously showed the action as available.
- Never allow the browser to choose another organization merely by supplying an organization ID in a request.

## 3. Persona A — Business owner

**Primary goal:** Understand the organization's invoice workload and keep work moving.

**Needs**

- A quick view of pending approvals and invoice status.
- A way to locate a particular invoice.
- Visibility into team membership and workspace settings.
- Clear indicators of work that needs attention.

**Pain points**

- Unclear status across multiple spreadsheets or conversations.
- Difficulty identifying the next responsible person.
- Uncertainty about whether a decision was recorded.

**Success outcome**
The owner can identify the most important outstanding work from the dashboard and navigate directly to the relevant invoice or approval queue.

## 4. Persona B — Finance staff member

**Primary goal:** Record invoice information accurately and submit it for review.

**Needs**

- A fast manual-entry form.
- Clear required-field indicators and validation messages.
- A document upload control.
- A searchable invoice list.
- A visible distinction between saving a draft and submitting for approval.

**Pain points**

- Re-entering invoice information.
- Missing required details.
- Losing track of a draft or submitting incomplete information.

**Success outcome**
The finance user can create an invoice, save or submit it as permitted, and find it later without confusion.

## 5. Persona C — Approver

**Primary goal:** Make informed decisions about invoices that require approval.

**Needs**

- A queue of invoices requiring their attention.
- Supplier, invoice number, amount, currency and date visible at a glance.
- Access to the supporting document.
- Clear approve and reject actions.
- A rejection-reason field and confirmation before finalizing a decision.

**Pain points**

- Having to search for invoice details across several screens.
- Accidentally approving the wrong record.
- Uncertainty about whether a decision succeeded.

**Success outcome**
The approver can inspect the relevant information, make an explicit decision and receive clear confirmation.

## 6. Persona D — Workspace administrator

**Primary goal:** Maintain the correct people and access in the workspace.

**Needs**

- A team directory.
- Member status and role information.
- Invitation and role-editing interfaces.
- Confirmation for consequential changes.

**Pain points**

- Unclear access levels.
- Unintended changes to member roles.
- Unclear invitation or update status.

**Success outcome**
The administrator can understand who has access and initiate permitted membership changes with clear feedback.

## 7. Shared application entry flow

1. User opens FlowLedger.
2. If no valid session exists, the UI displays the sign-in page.
3. User enters credentials and submits the form.
4. The UI displays a loading state while the sign-in request is processed.
5. On success, the UI loads the user's permitted organization and navigates to the dashboard.
6. On failure, the form displays a useful error without exposing sensitive system details.
7. If the session expires, the UI handles the authentication failure and guides the user back to sign-in.

**Prototype note:** Mock authentication can simulate success, invalid credentials and expired sessions. It must not be represented as production authentication.

## 8. Flow A — Create and submit an invoice

**Actor:** Finance staff member, or another authorized user  
**Starting point:** Dashboard or invoice list

1. User selects **New invoice**.
2. The UI opens the invoice creation screen.
3. User enters supplier name, invoice number, amount, currency, invoice date and any supported optional fields.
4. User optionally selects an invoice document.
5. The UI validates required fields, field formats and file constraints.
6. User chooses **Save draft** or **Submit for approval**, when permitted.
7. The UI shows a pending operation state and prevents accidental duplicate submission.
8. On success, the UI displays a confirmation and the created invoice's current status.
9. The user can open the invoice details page.
10. On failure, entered form values should be preserved where practical and actionable error feedback displayed.

**Important behavior**

- Saving a draft must not silently submit it for approval.
- Submitting must not silently save an invalid invoice.
- The UI must not assign the organization, creator, approval outcome or trusted timestamps based on user-controlled form values.
- Duplicate detection, if later added, should warn about possible duplicates rather than silently reject an invoice.

**Acceptance outcome:** The user can save or submit an invoice using the mock service, understand what happened and locate the resulting record.

## 9. Flow B — Browse and find invoices

**Actor:** Any user with invoice-list access  
**Starting point:** Invoice navigation or dashboard link

1. User opens **Invoices**.
2. The UI displays the invoice list with useful summary information.
3. User searches by supported fields such as supplier or invoice number.
4. User applies status and date filters.
5. User may sort the list and navigate between pages.
6. User selects an invoice.
7. The UI opens the corresponding detail page.
8. If no records match, the UI shows an empty-results state and a way to clear filters.
9. If the service fails, the UI shows a retry option rather than falsely displaying an empty list.

**Acceptance outcome:** Search, filters, sorting and pagination work against mock data and have documented service interfaces.

## 10. Flow C — Review invoice details

**Actor:** User with permission to view the invoice  
**Starting point:** Invoice list, dashboard or approvals inbox

1. User opens an invoice.
2. The UI displays invoice identity, supplier, amount, currency, relevant dates and current status.
3. The UI displays the supporting document when available, or a clear unavailable-document state.
4. The UI displays activity or status history when supplied by the service.
5. The UI shows actions appropriate to the current invoice state and the user's permissions.
6. If the invoice cannot be found or the user lacks access, the UI displays the appropriate error state.

**Acceptance outcome:** The user can understand the invoice and its workflow status without relying on hidden information or unexplained icons.

## 11. Flow D — Approve an invoice

**Actor:** Authorized approver  
**Starting point:** Approvals inbox or invoice detail page

1. User opens an invoice awaiting their decision.
2. User reviews invoice details and the supporting document.
3. User selects **Approve**.
4. The UI displays a confirmation dialog identifying the invoice and amount.
5. User confirms the decision.
6. The UI displays a processing state and prevents repeated submission.
7. On success, the UI refreshes the invoice status and relevant queue or summary.
8. On failure, the UI preserves context and explains that the decision was not confirmed.

**Acceptance outcome:** The mock service records the simulated decision, and the UI updates consistently across the invoice detail, approvals inbox and dashboard.

The backend must determine whether the user is authorized and whether the invoice is in a state that can be approved.

## 12. Flow E — Reject an invoice

**Actor:** Authorized approver  
**Starting point:** Approvals inbox or invoice detail page

1. User opens an eligible invoice.
2. User selects **Reject**.
3. The UI opens a confirmation dialog with a rejection-reason field.
4. The user enters a reason when required by the configured policy.
5. The UI validates the reason and clearly identifies the invoice being rejected.
6. User confirms the decision.
7. The UI submits the request and displays a processing state.
8. On success, the invoice is shown as rejected and the activity history reflects the recorded decision when available.
9. On failure, the user receives clear feedback and can retry if appropriate.

**Acceptance outcome:** Rejection requires an explicit action and a reason when required. The UI never reports a rejection as successful before the service confirms it.

## 13. Flow F — Manage team members

**Actor:** Owner or administrator with the necessary permissions  
**Starting point:** Settings → Team

1. User opens the team directory.
2. The UI displays member identity, assigned role and membership status.
3. User selects **Invite member**.
4. User enters the requested invitation information and selects a role.
5. The UI validates the form and submits the request to the service.
6. The UI displays the returned invitation state.
7. If the service is unavailable or the user lacks permission, the UI displays an actionable error.
8. When editing a role or removing access, the UI requires confirmation where appropriate.

**Prototype note:** Invitation sending can be simulated. Do not claim that an email was actually sent unless the service confirms it.

## 14. Flow G — Update profile and organization settings

**Actor:** Signed-in user with the relevant permissions

1. User opens Settings.
2. User selects Profile or Organization.
3. The UI loads the current values.
4. User edits permitted fields.
5. The UI validates changes and enables Save only when appropriate.
6. User saves the changes.
7. The UI displays success feedback and updated values after confirmation.
8. On failure, the UI preserves edits where practical and explains the problem.

Organization-level settings and personal profile settings must be distinguished so users understand which information applies to them and which affects the workspace.

## 15. Flow H — Handle session expiration and access errors

1. A service request returns an authentication or authorization error.
2. For `401 Unauthorized`, the UI handles session expiration and redirects to sign-in as appropriate.
3. For `403 Forbidden`, the UI displays an access-denied state without exposing restricted data.
4. For `404 Not Found`, the UI displays a not-found state for the requested resource.
5. For network or server errors, the UI offers a retry when safe.
6. The UI must not treat a failed operation as a successful state change.

## 16. Cross-flow UI requirements

All flows must support:

- Visible loading and processing states.
- Clear form validation.
- Success and failure feedback.
- Keyboard-accessible controls and dialogs.
- Responsive layouts.
- Preservation of form values after recoverable errors.
- Safe confirmation for consequential actions.
- Consistent invoice status labels.
- Clear distinctions between mock behavior and real integrations.
- No unauthorized actions based solely on frontend checks.

## 17. Questions to resolve before production integration

- Can rejected invoices be edited and resubmitted?
- Can an approved invoice ever be cancelled, and under what conditions?
- Are rejection reasons always required?
- Are approval assignments individual, role-based or both?
- Can an organization have multiple approval stages?
- What invitation states and expiration rules will the backend support?
- Which invoice fields are mandatory for the initial release?
- Will invoice documents be uploaded immediately or in a separate step?
- Which organization settings are editable in the MVP?

Until resolved, the prototype should use simple, explicit behavior and avoid suggesting unsupported workflow capabilities.
