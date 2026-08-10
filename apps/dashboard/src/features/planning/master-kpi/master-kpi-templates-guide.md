# Key Performance Indicator Template Implementation Guide

This document outlines the standard implementation for the **Key Performance Indicator** feature using the modular **Dashtail + Shadcn** pattern.

## Folder Structure

All key components are organized for high cohesion and separation of concerns:

- `dashboard/src/features/planning/master-kpi/`
  - `table/`: Contains all table-related modules.
    - `columns.tsx`: Column definitions (TanStack Table).
    - `data-table-row-actions.tsx`: Row-level action buttons (Edit, Delete, View).
    - `index.tsx`: The primary `TemplateTableListDashtail` orchestrator.
  - `components/`
    - `TemplateCardListDashtail.tsx`: High-level wrapper for the card grid.
    - `MasterKpiCard.tsx`: Individual indicator card UI.
    - `KpiTagsDisplay.tsx`: Horizontal tag layout with Popover for Sustainable Development Goals/Divisible data.

## Key Implementation Patterns

### 1. Responsive Card Grid

The `TemplateCardListDashtail` uses a dynamic grid layout:

- **Mobile**: 1 column (Stacked).
- **Tablet/Desktop**: 2-3 columns (Customizable via `gridColumns` prop).
- Uses `framer-motion` for smooth layout transitions and stagger animations.

### 2. Horizontal Badge Layout with Popover

To maintain a clean and consistent UI:

- Primary tags (Category, GAD, Compliance) are displayed horizontally on the card.
- Secondary tags (**SDG** and **Divisible**) are moved into an `Info` popover.
- Layout uses `flex-wrap` and `items-center` for standard alignment.

### 3. Modular Table Architecture

The table is broken down into small, reusable pieces:

- **Columns**: Defined separately for easier maintenance and type safety.
- **Actions**: Encapsulated in `DataTableRowActions` to avoid cluttering column definitions.
- **Toolbar**: Integrates with the table instance for global searching and filtering.

### 4. Server-side Operations

Filtering and sorting are executed on the server (or backend handler) to ensure scalability:

- **Search**: Case-insensitive substring matching on Code, Name, and Definition.
- **Sorting**: Triggered via `onSortingChange` and passed to the `getIndicatorsHandler`.
- **Filtering**: Category and Major Final Output filters are computed at the handler level.

## Consistency Checklist

- [ ] No `isShoppable` logic remains in any component, type, or form.
- [ ] All table headers use `MasterKpiTableColumnHeader` for consistent sorting UI.
- [ ] Cards use `interactionAnimations.cardLift` for hover effects.
- [ ] All badges use Dashtail/Shadcn `Badge` variants.
- [ ] Popover triggers are clearly marked with an `Info` icon.

---

_Created on 2026-03-03_
