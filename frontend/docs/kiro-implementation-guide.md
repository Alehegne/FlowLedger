# FlowLedger — Kiro Frontend Implementation Guide

## 1. Mission

Implement the FlowLedger frontend MVP in the existing Next.js + TypeScript project using the approved product brief, user flows, sitemap, design system, data contracts and acceptance criteria.

The result must be a coherent, responsive invoice intake and approval prototype using mock data behind replaceable service interfaces.

## 2. Read before coding

Before changing files, inspect:

1. `docs/frontend/product-brief.md`
2. `docs/frontend/personas-and-user-flows.md`
3. `docs/frontend/sitemap-and-screen-specs.md`
4. `docs/frontend/design-system.md`
5. `docs/frontend/frontend-data-contracts.md`
6. `docs/frontend/ui-states-and-acceptance-criteria.md`
7. The existing project structure, package manifest, scripts, routing approach, styling system and installed dependencies.

If any existing project convention conflicts with a proposed document, explain the conflict and recommend the smallest safe change before proceeding.

## 3. Non-negotiable constraints

- Keep the existing Next.js + TypeScript project.
- Do not migrate to Vite or another frontend framework.
- Do not replace the package manager without approval.
- Do not overwrite working configuration without explaining why.
- Do not delete existing application files or unrelated features.
- Do not reset databases, Docker volumes or backend data.
- Do not expose secrets in client-side code.
- Do not store passwords or session identifiers in local storage.
- Do not embed mock invoice records directly in page components.
- Do not duplicate service or validation logic across screens.
- Do not introduce new dependencies unless justified.
- Do not implement unapproved features outside the documented MVP.
- Do not claim real authentication, email delivery, document storage or AI extraction when those integrations are simulated.

## 4. Implementation workflow

Work in small, verifiable phases.

At the beginning of each phase:

1. State the intended scope.
2. Identify the files likely to change.
3. Identify dependencies and assumptions.
4. Implement only that phase.
5. Run the relevant checks.
6. Summarize changed files, verification results and remaining issues.

Do not implement the entire application in one uncontrolled generation pass.

## 5. Phase 0 — Repository inspection

Tasks:

- Inspect the current Next.js version and router.
- Inspect TypeScript configuration.
- Inspect the existing styling approach and component library.
- Inspect available scripts and test tools.
- Identify current route conventions and import aliases.
- Identify existing reusable components.
- Report missing dependencies and configuration issues.

Deliverable:
A concise implementation plan aligned with the repository.

Do not make broad changes during inspection.

## 6. Phase 1 — Design tokens and shared components

Implement:

- Color, spacing, typography and responsive tokens.
- Application typography and base styles.
- Button variants.
- Inputs and form field wrappers.
- Cards and page headers.
- Status badges.
- Loading, empty and error states.
- Dialog and notification patterns where appropriate.

Requirements:

- Follow `design-system.md`.
- Reuse existing dependencies.
- Avoid creating duplicate components with slightly different styling.
- Verify contrast and focus states.
- Confirm the application still builds.

Deliverable:
A small, reusable UI foundation.

## 7. Phase 2 — Application shell and routing

Implement:

- Authenticated layout.
- Desktop sidebar and header.
- Tablet navigation behavior.
- Mobile navigation behavior.
- Active navigation states.
- Page title and content layout.
- Sign-in layout.
- Route-level not-found and access-denied states as appropriate.

Requirements:

- Preserve the current routing convention.
- All visible navigation links must work.
- Use mock session state through a service boundary.
- Do not present frontend-only access checks as real authorization.

Deliverable:
A navigable application shell with route placeholders for all documented screens.

## 8. Phase 3 — Data contracts and mock services

Implement:

- Shared domain types.
- Invoice status mapping.
- Mock invoices and other required fixtures.
- Service interfaces.
- Mock service implementations.
- Central service selection.
- Error normalization.
- Formatting and validation utilities.

Mock data should include representative cases:

- Draft invoice.
- Pending approval.
- Approved invoice.
- Rejected invoice.
- Cancelled invoice.
- Invoice with and without a document.
- Empty lists and filtered results.
- Controlled service failures.

Requirements:

- Mock mutations update later reads.
- Components import service interfaces or service factories, not raw fixture objects.
- Use stable IDs.
- Ensure summary counts agree with mock records.
- Avoid fake data that contradicts the documented workflow.

Deliverable:
A typed and testable data layer that can be replaced by API implementations.

## 9. Phase 4 — Invoice list and details

Implement:

- Invoice list.
- Search and filtering.
- Sorting and pagination.
- Responsive invoice records.
- Invoice details.
- Status badge and activity timeline.
- Document preview placeholder.
- Loading, empty, error and not-found states.

Requirements:

- Use the documented invoice model.
- Keep filters consistent with service parameters.
- Avoid duplicating status formatting.
- Verify desktop, tablet and mobile layouts.

Deliverable:
Users can browse, filter and inspect invoices using mock data.

## 10. Phase 5 — Invoice creation

Implement:

- Manual-entry form.
- Field-level validation.
- File selection and metadata display.
- Save draft action.
- Submit for approval action.
- Unsaved-change handling where practical.
- Success and failure feedback.

Requirements:

- Keep financial amounts as strings at data boundaries.
- Use explicit date-only strings.
- Keep save and submit operations distinct.
- Prevent duplicate submission.
- Do not invent upload completion or persistent storage.
- Preserve form values after recoverable errors.

Deliverable:
The create-invoice flow works against the mock service.

## 11. Phase 6 — Approvals

Implement:

- Approvals inbox.
- Approval review screen.
- Approve confirmation dialog.
- Reject dialog and reason validation.
- Processing and conflict states.
- Consistent queue and detail updates.

Requirements:

- Respect the documented state model.
- Do not allow the UI to silently bypass workflow rules.
- Do not show success before service confirmation.
- Keep rejection reasons and decision states consistent.

Deliverable:
The prototype supports a coherent simulated approval workflow.

## 12. Phase 7 — Dashboard

Implement:

- Invoice summary cards.
- Pending approvals section.
- Recent invoices.
- Quick actions.
- Empty and error states.
- Links to filtered lists and review screens.

Requirements:

- Derive counts from a shared service response or consistent selector.
- Avoid duplicating inconsistent summary values.
- Ensure all actionable sections have working destinations.

Deliverable:
A useful overview of the invoice workflow.

## 13. Phase 8 — Authentication, team and settings

Implement:

- Sign-in UI.
- Forgot-password UI.
- Mock authentication states.
- Session expiration behavior in the prototype.
- Team directory.
- Invitation form.
- Role selection.
- Profile settings.
- Organization settings.
- Confirmation for consequential membership changes.

Requirements:

- Clearly distinguish simulated behavior from real integrations.
- Do not store passwords or session identifiers in local storage.
- Keep permissions and service errors centralized.
- Do not claim that an invitation email was sent unless a service confirms it.

Deliverable:
The complete documented MVP route set is navigable and has meaningful interactions.

## 14. Phase 9 — Quality assurance

Verify:

- Every documented route.
- Every primary button and link.
- Invoice creation and submission.
- Search, filters and pagination.
- Approval and rejection.
- Mock mutation consistency.
- Empty, loading, validation and error states.
- Responsive layouts at 375 px, 430 px, 768 px and 1280 px or equivalent.
- Keyboard navigation and visible focus.
- TypeScript checks.
- Linting.
- Automated tests available in the project.
- Production build.

Use the existing scripts in the package manifest. Do not assume script names; inspect them first.

Fix errors introduced by the implementation before declaring the work complete.

## 15. Architecture expectations

Keep presentation components focused on display and interaction.

Use:

- Shared domain types.
- Feature-level components.
- Shared UI components.
- Service interfaces.
- Mock service implementations.
- A separate API adapter when backend integration begins.
- Centralized validation and formatting utilities.

Avoid:

- Giant page components.
- Direct mock-data imports in pages.
- Repeated ad hoc fetch logic.
- Repeated status mappings.
- Financial calculations using floating-point numbers.
- Business rules duplicated across components.
- Client-side permissions treated as security boundaries.

## 16. API integration readiness

When the backend becomes available:

- Implement API services behind the existing interfaces.
- Configure the API base URL through appropriate environment configuration.
- Follow the actual authentication and CSRF contract.
- Normalize API errors.
- Use server-provided permissions and workflow states.
- Keep mock mode explicitly configured for development and testing.
- Never silently switch to mock data when the real API fails.

Do not guess the final backend response schema when it has not been confirmed. Document discrepancies and align the adapter to the agreed contract.

## 17. Visual quality requirements

The finished prototype should:

- Use clean light surfaces and teal accents consistently.
- Maintain clear typography and spacing.
- Make the current navigation location obvious.
- Emphasize invoice status and primary actions.
- Avoid unnecessary gradients and decoration.
- Use readable tables and responsive record cards.
- Have polished empty, loading and error states.
- Look coherent across all documented routes.

## 18. Reporting requirements

At the end of every phase, report:

- What was implemented.
- Files created or changed.
- Dependencies added, if any, and why.
- Checks run and their results.
- Known limitations.
- Any decisions requiring human approval.
- The next recommended phase.

Do not claim that a test, build or integration passed unless it was actually run and the result was observed.

## 19. Completion definition

The frontend MVP is complete when all documented screens are implemented, primary user flows work against mock services, UI states are handled, the responsive and accessibility checks have been performed, and the existing project builds successfully.

The result must remain ready for a future Spring Boot API integration without a rewrite of the presentation layer.
