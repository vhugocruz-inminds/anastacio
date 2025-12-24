# Design Guidelines: e-Proc B2B Procurement Platform

## Design Approach

**Selected System:** Carbon Design System (IBM)
**Rationale:** Carbon is purpose-built for data-intensive enterprise applications with complex workflows, tables, and forms - perfectly suited for a B2B procurement platform managing suppliers, quotations, purchase orders, and analytics.

**Design Principles:**
- **Clarity over decoration**: Information hierarchy drives every decision
- **Efficiency**: Minimize clicks, maximize productivity
- **Consistency**: Predictable patterns across all modules
- **Professional**: Enterprise-grade polish without unnecessary embellishment

---

## Typography System

**Primary Font:** IBM Plex Sans (via Google Fonts CDN)
**Secondary/Mono:** IBM Plex Mono (for codes, IDs, numbers)

**Hierarchy:**
- Page Titles: text-4xl font-semibold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card/Panel Titles: text-lg font-semibold (18px)
- Body Text: text-base (16px)
- Secondary Text: text-sm text-gray-600 (14px)
- Captions/Labels: text-xs text-gray-500 uppercase tracking-wide (12px)
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
- Shadow: shadow-sm

**Side Navigation:**
- Width: w-64 (collapsible to w-16 icon-only)
- Module groups with expandable sections
- Active state: left border indicator (border-l-4)
- Icons from Heroicons (outline for inactive, solid for active)

### Data Tables
**Standard Table Pattern:**
- Striped rows (even row background)
- Sticky header row
- Sortable columns with arrow indicators
- Row actions in rightmost column (kebab menu)
- Pagination: Items per page selector + page numbers
- Bulk actions: Checkbox column with top action bar
- Filters: Collapsible panel above table

**Key Tables:**
- Supplier list
- RFCI/Quotations
- Purchase Orders
- Invoices
- Products catalog

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
- Rich text: Minimal toolbar for descriptions

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
- Status-specific styling (not using colors, but reference to system's approach):
  - Pending: Muted treatment
  - Approved: Positive treatment
  - Rejected: Negative treatment
  - In Progress: Informational treatment

### Buttons & Actions
**Primary Actions:** Solid background, font-medium
**Secondary Actions:** Outlined style
**Tertiary/Ghost:** Text-only with hover background
**Sizes:** sm (h-8), md (h-10), lg (h-12)

### Modals & Dialogs
- Overlay: Semi-transparent backdrop
- Max-width: max-w-2xl for forms, max-w-4xl for data views
- Header with title and close button
- Footer with action buttons (Cancel left, Primary right)

---

## Page Layouts

### Dashboard (Buyer/Manager)
- **Header:** Welcome message, quick stats (4 KPI cards in grid-cols-4)
- **Charts Section:** 2-column grid with spend analysis + savings chart
- **Quick Actions:** Card with shortcut buttons (Create RFCI, New Requisition)
- **Recent Activity:** Timeline of latest RFCIs, approvals, POs
- **Alerts Panel:** Pending approvals, expiring quotations

### Supplier Portal Dashboard
- **Performance Scorecard:** Large card with radial score chart
- **Active RFCIs:** Table with response deadlines
- **Purchase Orders:** Status overview with timeline
- **Documents:** Upload status and expiration alerts
- **Quick Stats:** 3-card grid (Total quotations, Win rate, Average response time)

### RFCI Creation Flow (Multi-Step)
1. **Basic Information:** Form with RFCI type, title, deadline
2. **Item Selection:** Searchable product table with quantities
3. **Supplier Selection:** Checkbox list with supplier cards (score visible)
4. **Documents & Specs:** File upload zone
5. **Review & Send:** Summary view with edit links

### Supplier List Page
- **Filters Panel:** Collapsible left sidebar (Status, Type, Category, Score range)
- **Table View:** Sortable columns (Name, CNPJ, Type, Score, Status, Actions)
- **Bulk Actions:** Top bar appears when rows selected
- **Details Drawer:** Slides from right on row click

### Quotation Comparison (Comparative Map)
- **Side-by-Side Table:** Sticky supplier name columns
- **Highlighted Winner:** Visual indicator for best offers
- **Expandable Details:** Each row expands to show terms/conditions
- **Action Bar:** Award button, export PDF, request clarification

### Purchase Order Detail
- **Header Section:** PO number, status badge, supplier info
- **Timeline:** Horizontal progress bar with milestones
- **Items Table:** Product details with received quantities
- **Documents Tab:** Invoices, packing lists, receipts
- **Activity Log:** Chronological updates with timestamps

### Analytics Dashboard
- **Filters Row:** Date range, category, cost center selectors
- **Key Metrics:** 6-card grid (Savings, Lead time, POs, Active suppliers, Spend, Compliance %)
- **Charts Section:** 
  - Spend by category (Pareto chart)
  - Lead time trends (Line chart)
  - Supplier performance (Horizontal bar chart)
- **Export Section:** Generate report buttons (PDF, Excel)

---

## Images

**Placement:**
- **No large hero images** - This is a business application focused on functionality
- **Empty states:** Illustrations for empty tables/lists (simple line art style)
- **Onboarding:** Small illustrations in multi-step form headers
- **Dashboard widgets:** Icon-based, no photography
- **Supplier logos:** Avatar-style placeholders in cards/tables
- **Document previews:** Thumbnail images in document lists

**Style Guide for Illustrations:**
- Line art, minimal, professional
- Monochromatic matching design system
- Use for guidance, not decoration

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

- **Animations:** None except smooth transitions on hovers/state changes (transition-all duration-200)
- **Loading States:** Skeleton screens for tables, spinner for actions
- **Error Handling:** Toast notifications (top-right), inline form errors
- **Accessibility:** Full keyboard navigation, ARIA labels, high contrast ratios
- **Print Styles:** Optimized layouts for PO, invoice, quotation reports

This design creates a professional, efficient, data-rich experience optimized for procurement workflows with minimal cognitive load and maximum productivity.