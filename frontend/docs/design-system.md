# FlowLedger — Design System

## 1. Purpose

Define shared visual and interaction rules for the FlowLedger frontend so that all screens look consistent and remain easy to maintain.

## 2. Design direction

**Style:** Modern SaaS  
**Theme:** Light  
**Primary accent:** Teal  
**Overall impression:** Calm, professional, organized, trustworthy

Use generous but efficient spacing, clear typography, subtle borders, restrained shadows and consistent alignment.

Avoid:

- Excessive gradients or glassmorphism.
- Decorative animations that delay work.
- Large hero sections inside operational screens.
- Oversized dashboard cards that hide useful information.
- Too many competing accent colors.
- Status communicated only through color.
- Different button, field or card styles on every page.

## 3. Color tokens

Create centralized design tokens rather than repeating hex values throughout components.

### Core colors

| Token                  | Value     | Usage                                             |
| ---------------------- | --------- | ------------------------------------------------- |
| `color.canvas`         | `#F8FAFC` | Main application background                       |
| `color.surface`        | `#FFFFFF` | Cards, dialogs and form surfaces                  |
| `color.surface-muted`  | `#F1F5F9` | Subtle grouped regions                            |
| `color.border`         | `#E2E8F0` | Dividers, outlines and table borders              |
| `color.text`           | `#0F172A` | Primary text                                      |
| `color.text-secondary` | `#475569` | Secondary text                                    |
| `color.text-muted`     | `#64748B` | Muted labels where contrast is sufficient         |
| `color.primary`        | `#0F766E` | Primary actions and active navigation             |
| `color.primary-hover`  | `#115E59` | Hover state for primary actions                   |
| `color.primary-soft`   | `#CCFBF1` | Subtle teal highlights                            |
| `color.focus`          | `#0D9488` | Focus indicator, subject to contrast verification |

### Semantic status colors

| Status           | Foreground | Soft background | Meaning                           |
| ---------------- | ---------- | --------------- | --------------------------------- |
| Draft            | `#475569`  | `#F1F5F9`       | Work in progress                  |
| Pending approval | `#92400E`  | `#FEF3C7`       | Waiting for a decision            |
| Approved         | `#166534`  | `#DCFCE7`       | Approval completed                |
| Rejected         | `#991B1B`  | `#FEE2E2`       | Approval declined                 |
| Cancelled        | `#475569`  | `#E2E8F0`       | Invoice cancelled                 |
| Error            | `#991B1B`  | `#FEE2E2`       | Failed operation or invalid input |
| Information      | `#1D4ED8`  | `#DBEAFE`       | Informational state               |

Use semantic tokens rather than hard-coding these values into individual screens.

Status indicators must include readable text. Icons and colors can reinforce the meaning but cannot be the only signal.

Verify contrast for text, borders, focus indicators and controls against the WCAG AA target where applicable. Adjust tokens if any combinations fail.

## 4. Typography

Use the existing project's font setup if it is suitable. Otherwise, choose a legible sans-serif such as Inter or a system sans-serif fallback.

Recommended hierarchy:

| Style           | Approximate size |  Weight | Usage                      |
| --------------- | ---------------: | ------: | -------------------------- |
| Page heading    |         28–32 px | 600–700 | Main screen title          |
| Section heading |         18–22 px |     600 | Content sections           |
| Card heading    |         14–16 px |     600 | Cards and grouped panels   |
| Body            |         14–16 px |     400 | Main interface text        |
| Label           |         12–14 px | 500–600 | Field labels and metadata  |
| Caption         |         12–13 px |     400 | Helper text and timestamps |

Use a consistent line-height and avoid using small text for important invoice amounts or primary decisions.

Monetary amounts and invoice numbers should use stable, readable numeral alignment where practical.

## 5. Spacing and layout

Use a spacing scale based on 4 px:

- `space-1`: 4 px
- `space-2`: 8 px
- `space-3`: 12 px
- `space-4`: 16 px
- `space-5`: 20 px
- `space-6`: 24 px
- `space-8`: 32 px
- `space-10`: 40 px
- `space-12`: 48 px

Prefer a consistent spacing scale over arbitrary per-component margins.

Suggested layout rules:

- Main content padding: 24–32 px on desktop, 16–24 px on tablet, 16 px on mobile.
- Standard card padding: 20–24 px on desktop and 16 px on mobile.
- Form field spacing: 16–20 px.
- Related field groups should share a section heading.
- Use a readable maximum content width for forms and settings screens.
- Allow invoice tables and document previews to use more horizontal space when needed.

## 6. Responsive breakpoints

Use the project's existing responsive conventions where possible. If no conventions exist, begin with:

- Mobile: below 640 px.
- Tablet: 640–1023 px.
- Desktop: 1024 px and above.

Breakpoints should be applied according to content needs, not merely device labels.

Required behavior:

- Navigation collapses on narrow layouts.
- Dashboard cards wrap into fewer columns.
- Invoice tables transform into compact records on small screens.
- Forms become single-column on mobile.
- Dialogs fit within the viewport.
- Long supplier names and invoice numbers wrap or truncate safely.
- Primary actions remain discoverable.

## 7. Surface, border and elevation rules

- Use white surfaces over a subtle neutral canvas.
- Prefer a thin neutral border for cards and panels.
- Reserve shadows for floating menus, dialogs and elements that need elevation.
- Use consistent border radii:
  - Small controls: 6–8 px.
  - Cards and dialogs: 10–12 px.
  - Pills: fully rounded.
- Avoid nesting many bordered cards inside one another.
- Separate content primarily through spacing and hierarchy rather than heavy shadows.

## 8. Buttons

Provide shared button variants:

### Primary

Used for the main action on a screen, such as Save, Submit or Approve.

### Secondary

Used for less prominent actions such as Cancel or Back.

### Outline

Used for neutral actions that need a visible boundary.

### Ghost

Used for low-emphasis navigation or contextual actions.

### Destructive

Used for destructive or consequential actions such as removing access or confirming rejection when appropriate.

Button requirements:

- Consistent height and horizontal padding.
- Clear hover, focus, active and disabled states.
- Visible processing state during async actions.
- Prevent accidental repeated submission.
- Use labels that describe the action.
- Do not use destructive styling for ordinary navigation.

## 9. Form controls

Create shared input, select, textarea, checkbox, radio and file-selection components as needed.

Each form field should support:

- Visible label.
- Optional helper text.
- Required-field indication.
- Error message.
- Disabled state.
- Read-only state where applicable.
- Keyboard focus.
- Appropriate input type and autocomplete behavior.

Use inline errors near the relevant field and a form-level summary for longer or more complex forms.

Do not rely on placeholder text as the only label.

## 10. Cards and dashboard metrics

Dashboard metric cards should have:

- Short, clear labels.
- Prominent values.
- Optional explanatory context.
- A useful destination when clickable.

Avoid adding decorative charts unless they answer a real question. Use charting only when the mock data and screen purpose justify it.

## 11. Tables and invoice records

Desktop invoice tables should provide:

- Clear column headings.
- Consistent numeric alignment.
- Readable status badges.
- A predictable row height.
- A visible hover and keyboard-focus state.
- A clear action to open invoice details.

For narrow screens, use a compact record card with the most important fields: supplier, invoice number, amount, status and a detail action.

Do not force a wide table to fit by making its text unreadably small.

## 12. Status badges

Use a shared status component that maps the invoice status union to a readable label and semantic style.

The mapping must:

- Handle all supported statuses.
- Avoid duplicating styling logic across pages.
- Provide a safe fallback for an unknown status.
- Never infer a status from unrelated fields.

## 13. Dialogs, confirmations and toasts

### Dialogs

Use for consequential decisions, rejection reasons and confirmation of access changes.

Dialogs should:

- Have a descriptive title.
- Explain the action's consequence.
- Provide explicit confirm and cancel actions.
- Support keyboard interaction and focus management.
- Prevent accidental double submission.

### Toasts or inline notifications

Use for concise success and failure feedback. Important form errors should remain visible in the form rather than existing only in a temporary toast.

## 14. Navigation components

- Highlight the active route.
- Use consistent icons from the project's existing icon library, if available.
- Pair icons with labels for primary navigation.
- Provide accessible names for icon-only controls.
- Keep the organization and user menus distinct.
- Hide or disable navigation actions based on effective permissions when supplied by the application.

## 15. Document preview and upload area

The upload component should communicate:

- Accepted file types.
- Maximum file size when defined by the service.
- Selected file name and size.
- Upload or simulated processing state.
- Validation errors.
- Removal or replacement action.

If a real document viewer is not available, show a deliberate preview placeholder with the file's metadata. Do not make a broken preview look like a successful upload.

## 16. Icons and imagery

- Prefer a consistent outline icon style.
- Reuse the icon library already installed in the project.
- Avoid emoji as the primary UI icon system.
- Do not add stock illustrations just to fill whitespace.
- Use the FlowLedger wordmark as text until a brand asset exists.
- Ensure every icon-only button has an accessible name.

## 17. Motion and interaction

Use subtle, short transitions for menus, hover states and dialogs when useful.

Motion must not:

- Delay form submission or navigation.
- Hide state changes.
- Be required to understand an action.
- Create accessibility problems for users who prefer reduced motion.

## 18. Accessibility requirements

- Semantic headings and landmarks.
- Keyboard-accessible navigation and forms.
- Visible focus indicators.
- Labels associated with inputs.
- Accessible validation messages.
- Adequate text and control contrast.
- Non-color status indicators.
- Focus management for dialogs and menus.
- Reasonable touch target sizes.
- Support for reduced motion.

## 19. Component architecture

Use shared components for recurring patterns such as:

- Application shell.
- Page header.
- Buttons and form fields.
- Status badges.
- Invoice record row or card.
- Empty state.
- Error state.
- Loading skeleton.
- Confirmation dialog.
- Toast or inline notification.
- Pagination.
- Search and filter controls.

Keep business-specific rules in domain utilities or service logic, not duplicated across presentation components.

## 20. Design system acceptance criteria

- All main screens use the same tokens and component variants.
- Invoice status styling is consistent everywhere.
- Forms have consistent labels, errors and focus states.
- Responsive navigation works at all target widths.
- Contrast has been checked and adjusted.
- Components support loading, disabled and error states where appropriate.
- The UI remains usable without relying on hover or color alone.
