# Master KPI Registry - Implementation Guide

## Overview

The Master KPI Registry is a centralized library for managing Performance Indicators across the organization. This module has been refactored to follow the **Dashtail Design System** and uses **TanStack Table v8** for high-performance data management.

## Project Structure

- `pages/MasterKpiPage.tsx`: The main entry point supporting both Card and Table views.
- `components/MasterKpiCard.tsx`: Responsive card component with fixed height (250px) and auto-truncation.
- `components/TemplateCardListDashtail.tsx`: Generic container for card-based lists with staggered animations.
- `table/templates/TemplateTableListDashtail.tsx`: Generic, reusable table infrastructure.
- `table/columns-dashtail.tsx`: KPI-specific column definitions including status indicators and action menus.

## Technical Specifications

### Card View Layout

- **Height**: Fixed at `250px` to maintain grid alignment.
- **Description**: Limited to 3 lines using Tailwind `line-clamp-3`.
- **Code Badge**: Displayed as a muted mono-font badge below the KPI name.
- **Actions**: Consolidated into a dropdown menu to maximize space.

### Table View Features

- **Server-side Logic**: Sorting and Filtering are performed at the handler level (simulating an API call).
- **Responsive Headers**: Sticky headers with support for individual column sorting.
- **Opt-In Status**: Visual indicator for KPIs that are available for agency-level participation.

### Key Logic: `isOptIn`

The `isShoppable` property has been renamed to `isOptIn` throughout the feature. This Boolean value determines if a KPI can be "opted into" by individual agencies during their planning phase.

## Usage in Other Features

### Using the Generic Card List

```tsx
import { TemplateCardListDashtail } from '../components/TemplateCardListDashtail'

;<TemplateCardListDashtail
  data={myKpis}
  isLoading={loading}
  gridColumns={3}
  renderCard={(item) => <MyCard item={item} />}
/>
```

### Using the Generic Table

```tsx
import { TemplateTableListDashtail } from '../table/templates'

;<TemplateTableListDashtail
  columns={myColumns}
  data={myData}
  pagination={pagination}
  onSortingChange={handleSort}
  onSearchChange={handleSearch}
/>
```

## Future Enhancements

- Integration with real backend endpoints.
- Advanced multi-column filtering.
- Bulk archive/delete actions.
