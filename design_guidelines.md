# Design Guidelines: e-Proc B2B Procurement Platform

## Design Approach

**Brand Identity:** Química Anastácio
**Design Reference:** https://anastacio.com/
**Typography System:** Nunito Sans (Proxima Nova alternative)

**Design Principles:**

- **Brand consistency**: Match Anastacio's corporate identity
- **Professional navy theme**: Dark navy sidebar with teal accents
- **Clarity over decoration**: Information hierarchy drives every decision
- **Efficiency**: Minimize clicks, maximize productivity

---

## Color System

### Primary Palette

| Token      | Light Mode                      | Dark Mode                       | Usage                 |
| ---------- | ------------------------------- | ------------------------------- | --------------------- |
| Primary    | Navy Blue `hsl(220, 85%, 12%)`  | `hsl(220, 70%, 35%)`            | Main actions, headers |
| Accent     | Teal `hsl(165, 45%, 32%)`       | `hsl(165, 45%, 38%)`            | Highlights, links     |
| Background | Light gray `hsl(220, 20%, 97%)` | Deep navy `hsl(220, 60%, 6%)`   | Page backgrounds      |
| Sidebar    | Dark navy `hsl(220, 85%, 8%)`   | Darker navy `hsl(220, 70%, 5%)` | Navigation areas      |

### Status Colors

| Status      | Color       | Use Case                          |
| ----------- | ----------- | --------------------------------- |
| Success     | Teal accent | Approved, completed items         |
| Warning     | Orange      | Pending approvals, expiring items |
| Destructive | Red         | Errors, rejected, delete actions  |
| Muted       | Gray        | Secondary info, disabled states   |

---

## Typography System

**Primary Font:** Nunito Sans (via Google Fonts CDN)
**Alternative:** Inter (fallback)
**Monospace:** IBM Plex Mono (for codes, IDs, numbers)

**Hierarchy:**

- Page Titles: text-4xl font-semibold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card/Panel Titles: text-lg font-semibold (18px)
- Body Text: text-base (16px)
- Secondary Text: text-sm text-muted-foreground (14px)
- Captions/Labels: text-xs text-muted-foreground uppercase tracking-wide (12px)
- Data Tables: text-sm (14px, mono for numerical columns)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, and 8** exclusively

- Component padding: p-6
- Section spacing: mb-8, mt-6
- Card spacing: p-4
- Form field gaps: gap-4
- Page margins: mx-8, my-6

**Grid System:**

- Dashboard: 12-column grid (grid-cols-12)
- Forms: 2-column on desktop (grid-cols-2 gap-6)
- Tables: Full-width with horizontal scroll
- Cards: 3-column grid on desktop (grid-cols-3 gap-6)

**Container Widths:**

- Full-width pages: max-w-full with px-8
- Form pages: max-w-5xl mx-auto
- Detail panels: max-w-7xl

---

## Core Components

### Navigation

**Top Navigation Bar:**

- Height: h-16
- Contains: Logo, Global search, User menu, Notifications
- Sticky positioned (sticky top-0 z-50)
- Background: Navy primary color

**Side Navigation:**

- Width: w-64 (collapsible to w-16 icon-only)
- Background: Dark navy (`--sidebar`)
- Text: White/light gray
- Active state: Teal accent indicator
- Icons from Lucide React (outline for inactive, solid for active)

### Data Tables

**Standard Table Pattern:**

- Striped rows (even row background)
- Sticky header row
- Sortable columns with arrow indicators
- Row actions in rightmost column (kebab menu)
- Pagination: Items per page selector + page numbers
- Bulk actions: Checkbox column with top action bar
- Filters: Collapsible panel above table

### Forms

**Layout:**

- Two-column grid on desktop, single column on mobile
- Field labels: font-medium mb-2
- Required fields: Red asterisk
- Validation: Inline error messages below fields
- Multi-step forms: Progress stepper at top

**Input Types:**

- Text inputs: h-10, rounded border
- Select dropdowns: Custom styled with chevron
- Date pickers: Calendar popup
- File upload: Drag-and-drop zone with file list

### Cards & Panels

**Standard Card:**

- Border: border rounded-lg
- Padding: p-6
- Shadow: shadow-sm hover:shadow-md transition
- Header: flex justify-between items-center mb-4

**Dashboard Widgets:**

- KPI cards: Large number display with trend indicator
- Chart cards: Recharts integration with legend
- Activity feed: Timeline style with icons

### Status Badges

**Visual Treatment:**

- Rounded-full px-3 py-1 text-xs font-medium
- Status-specific styling:
  - Pending: Muted treatment (gray)
  - Approved: Accent treatment (teal)
  - Rejected: Destructive treatment (red)
  - In Progress: Primary treatment (navy)

### Buttons & Actions

**Primary Actions:** Solid navy background, white text, font-medium
**Secondary Actions:** Outlined style with navy border
**Accent Actions:** Solid teal background for highlighted CTAs
**Tertiary/Ghost:** Text-only with hover background
**Sizes:** sm (h-8), md (h-10), lg (h-12)

### Modals & Dialogs

- Overlay: Semi-transparent backdrop
- Max-width: max-w-2xl for forms, max-w-4xl for data views
- Header with title and close button
- Footer with action buttons (Cancel left, Primary right)

---

## Responsive Behavior

**Desktop (lg+):** Full layout as specified
**Tablet (md):** Collapse sidebar to icons, stack dashboard cards to 2 columns
**Mobile (base):**

- Hamburger menu for navigation
- Single column layouts
- Tables become cards with key info
- Bottom sheet for filters
- Floating action button for primary actions

---

## Critical Implementation Notes

- **Brand Consistency:** All UI elements should reflect Anastacio's corporate identity
- **Animations:** Subtle transitions on hovers/state changes (transition-all duration-200)
- **Loading States:** Skeleton screens for tables, spinner for actions
- **Error Handling:** Toast notifications (top-right), inline form errors
- **Accessibility:** Full keyboard navigation, ARIA labels, high contrast ratios

This design creates a professional, brand-aligned experience optimized for procurement workflows with minimal cognitive load and maximum productivity.
