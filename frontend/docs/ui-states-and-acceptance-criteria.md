# FlowLedger — UI States and Acceptance Criteria

## 1. Purpose

Define the behavior that every major screen and interaction must support, including successful operations, loading, validation, empty results, errors and permission restrictions.

## 2. Shared state requirements

Every data-driven screen must define the applicable states below.

| State                   | Expected behavior                                                        |
| ----------------------- | ------------------------------------------------------------------------ |
| Initial loading         | Show a stable skeleton or progress indicator                             |
| Success                 | Display returned data and available actions                              |
| Empty data              | Explain that no records exist and offer a relevant next step             |
| Empty filtered results  | Explain that filters found no matches and provide a clear-filters action |
| Validation failure      | Identify the invalid fields and how to correct them                      |
| Request in progress     | Prevent duplicate submissions and show progress                          |
| Recoverable error       | Explain the failure and offer retry when safe                            |
| Authentication required | Handle expired or missing session                                        |
| Permission denied       | Explain that access is unavailable without revealing restricted data     |
| Resource not found      | Display a deliberate not-found state                                     |
| Conflict                | Explain that the operation could not be completed in the current state   |
| Success feedback        | Confirm only after the service reports success                           |

Do not use an empty list as a substitute for an API failure.

## 3. Dashboard acceptance criteria

- Summary values agree with the data source.
- Clicking an actionable metric navigates to the appropriate filtered list.
- Recent invoice rows open the correct invoice.
- Pending approval items open the relevant review screen.
- A new user sees a useful first-run empty state.
- Partial failures are represented clearly if dashboard sections load independently.
- Mobile layouts retain the most important information and actions.

## 4. Invoice list acceptance criteria

- Search works against the supported mock fields.
- Status filters can be applied and cleared.
- Search and filters work together.
- Sorting produces the expected order.
- Pagination changes the displayed records and result metadata consistently.
- Filter changes reset pagination when necessary.
- Loading, no-data, no-match and failure states are visually distinct.
- Opening a record uses its stable ID.
- Narrow layouts do not require horizontal scrolling for essential invoice information.

## 5. Create invoice acceptance criteria

- Required fields are marked clearly.
- Invalid values receive actionable field-level messages.
- Amount input rejects invalid values according to the agreed validation rules.
- Currency and date formats are explicit.
- Save draft and submit for approval are distinct operations.
- Duplicate clicks cannot create repeated requests while the first request is processing.
- File validation shows the accepted constraints.
- Recoverable errors preserve entered values where practical.
- Success feedback reflects the returned invoice status.
- Unsaved changes are handled deliberately when the user leaves the form.

The prototype's validation should mirror the known API contract, while acknowledging that the backend remains authoritative.

## 6. Invoice details acceptance criteria

- The page loads the invoice using its route ID.
- All displayed data comes from the service response.
- A missing invoice shows a not-found state.
- Access errors are not presented as ordinary empty data.
- Document preview failure does not break the rest of the page.
- Status labels and colors are consistent across the application.
- Activity history is displayed only when supplied by the service.
- Available actions reflect the invoice's state and the user's effective permissions.

## 7. Approval acceptance criteria

### Approve

- The action is available only when the service and current UI state permit it.
- A confirmation identifies the invoice.
- Processing disables repeated submission.
- Success updates the detail screen and approval queue.
- A conflict response triggers a refresh or appropriate explanation.
- Failure does not falsely display an approved state.

### Reject

- The rejection dialog includes a reason field when required.
- The reason is validated according to the agreed policy.
- Confirmation identifies the invoice.
- Repeated submission is prevented.
- Success updates the relevant screens.
- Failure leaves the user with a clear next step.

### Queue consistency

- The queue reflects the current service result after a decision.
- Pending counts update consistently.
- A stale record that is no longer eligible for a decision is handled safely.

## 8. Team and settings acceptance criteria

- Only appropriate users see membership-management actions.
- Forms distinguish editable and read-only values.
- Invitation status reflects the service response.
- Role changes require confirmation when consequential.
- Validation errors are associated with the relevant fields.
- Successful updates refresh the displayed data.
- Failures do not discard edits without explanation.
- Restricted settings have a deliberate unavailable or access-denied state.

## 9. Authentication acceptance criteria

- Sign-in validates required fields.
- Submission shows progress.
- Invalid credentials produce useful feedback.
- Authentication errors do not reveal sensitive details.
- Successful sign-in loads the current session and navigates appropriately.
- Expired sessions are handled consistently.
- Sign-out clears the frontend's current session view.
- Protected screens handle unauthenticated access.
- The prototype does not claim to provide production security.

## 10. Accessibility acceptance criteria

- All form controls have accessible names.
- Every interactive element is keyboard reachable.
- Focus is visible.
- Dialog focus is managed correctly.
- Error messages are announced or associated with their fields.
- Status information is not conveyed by color alone.
- Text contrast is checked against WCAG AA targets where applicable.
- Touch targets are comfortable to use.
- The application remains usable with reduced motion enabled.
- Responsive layouts preserve readable text and logical focus order.

## 11. Responsive acceptance criteria

Test at representative widths:

- Mobile: 375 px and 430 px.
- Tablet: 768 px.
- Desktop: 1280 px and 1440 px.

At each width:

- No accidental horizontal overflow on core screens.
- Navigation remains usable.
- Forms fit the viewport.
- Dialogs remain visible and operable.
- Invoice information remains readable.
- Primary actions are discoverable.
- Tables transform appropriately on narrow screens.

These widths are test cases, not a requirement to support only those exact sizes.

## 12. Interaction quality requirements

- No dead buttons or unexplained interactive icons.
- No fake success messages after failed service calls.
- No silent data changes.
- No browser alerts for ordinary application feedback when an in-app pattern is available.
- Confirmation dialogs have meaningful cancel actions.
- Loading states prevent accidental duplicate mutations.
- Links and buttons use the correct semantic purpose.
- Back navigation behaves predictably.
- Empty states provide a useful next action when one exists.

## 13. Test strategy

Use the project's existing test framework where possible. Add tests for:

- Formatting utilities.
- Invoice validation.
- Status mapping.
- Service behavior.
- Filtering and pagination.
- Form submissions.
- Approval and rejection dialogs.
- Error states.
- Responsive navigation.
- Role-sensitive UI behavior.

Use automated browser testing if the repository already includes it or the project explicitly adopts it. Do not install a large testing stack without a clear benefit.

## 14. Release checklist

Before declaring the prototype complete:

- [ ] All documented routes render.
- [ ] Navigation works across the core screens.
- [ ] All primary actions perform meaningful operations.
- [ ] Mock mutations update subsequent reads.
- [ ] All invoice statuses are represented.
- [ ] Empty and failure states are implemented.
- [ ] Forms have validation and submission feedback.
- [ ] Responsive behavior is checked at target widths.
- [ ] Accessibility basics are verified.
- [ ] No sensitive values are stored in browser storage.
- [ ] No accidental mock fallback hides API errors.
- [ ] No existing project configuration was unnecessarily replaced.
- [ ] The development server starts successfully.
- [ ] The production build succeeds.
- [ ] Known limitations are documented.

## 15. Definition of done

A feature is done only when its happy path, relevant error states, responsive behavior and service contract are implemented and verified. Visual completeness alone is not sufficient.
