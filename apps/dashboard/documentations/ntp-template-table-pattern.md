# NTP Template Table Pattern

## Overview

All tables in the NTP feature follow a consistent **4-component template pattern** for maintainability, consistency, and reusability across the codebase.

## Pattern Components

### 1. **Main Table Component** (`NTPTable.tsx` / `NTPDetailsTable.tsx`)

The core TanStack table implementation handling data display, sorting, filtering, and pagination.

**Responsibilities:**
- Import and compose toolbar, columns, and actions components
- Manage table state (sorting, pagination)
- Filter data based on search/filters
- Render toolbar + table + pagination/total row
- Handle loading and empty states

**Key Features:**
```tsx
- Pagination with page size selector
- Sorting support
- Row filtering
- Loading state UI
- Empty state UI
```

**Example:**
```tsx
export function NTPTable({ data, onView, onPrint, onDelete, ... }) {
  const table = useReactTable({
    data: filteredData,
    columns, // Imported from NTPListColumns
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })
  
  return (
    <div>
      <NTPListToolbar {...toolbarProps} />
      <Table>...</Table>
      <PaginationFooter />
    </div>
  )
}
```

---

### 2. **Toolbar Component** (`NTPListToolbar.tsx` / `NTPDetailsToolbar.tsx`)

Provides search, filters, and primary actions. Can be customized per table use case.

**Responsibilities:**
- Search input (for data tables)
- Filter dropdowns (status, categories, etc.)
- Primary action buttons (Create, Export, etc.)
- Summary info display (for read-only tables)

**Variants:**

**Interactive Toolbar (NTPListToolbar):**
```tsx
- Search input with icon
- Status filter dropdown
- Create NTP button
- Flexible responsive layout
```

**Read-Only Toolbar (NTPDetailsToolbar):**
```tsx
- Summary info cards (total items, total amount)
- No search/filter
- Info icon
- Display-focused design
```

**Props Interface:**
```tsx
interface NTPListToolbarProps {
  onSearch: (query: string) => void
  onStatusFilter: (status: NTPStatus | 'All') => void
  onCreateClick: () => void
  selectedStatus?: NTPStatus | 'All'
  searchQuery?: string
}

interface NTPDetailsToolbarProps {
  itemsCount: number
  totalAmount: number
  isLoading?: boolean
}
```

---

### 3. **Columns Component** (`NTPListColumns.tsx` / `NTPDetailsColumns.tsx`)

Defines column configuration and cell rendering logic.

**Responsibilities:**
- Define column accessors and headers
- Implement custom cell rendering
- Format data (currency, dates, badges, etc.)
- Handle responsive rendering

**Structure:**
```tsx
export const NTPListColumns: ColumnDef<NTP>[] = [
  {
    accessorKey: 'ntpNumber',
    header: 'NTP Number',
    cell: ({ row }) => <span className="font-medium">{row.getValue('ntpNumber')}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as NTPStatus
      return <Badge variant={...}>{status}</Badge>
    },
  },
  // ... more columns
]
```

**Common Patterns:**
- **Formatted values:** Currency, dates, percentages
- **Badges:** Status, tags, categories
- **Links:** Clickable items that navigate
- **Icons:** Visual indicators
- **Descriptions:** Multi-line with subtitles

---

### 4. **Actions Component** (`NTPListActions.tsx` / `NTPDetailsActions.tsx`)

Defines row-level actions in a dropdown menu.

**Responsibilities:**
- Render action buttons (View, Edit, Delete, Print, etc.)
- Handle business logic (delete confirmation, permissions, etc.)
- Support different action sets based on data state
- Manage modal/dialog triggers

**Interactive Variant (NTPListActions):**
```tsx
- View Details action
- Print action
- Delete action (with confirmation dialog)
- Conditional rendering based on NTP status
- Permission checks
```

**Read-Only Variant (NTPDetailsActions):**
```tsx
- "View Only" badge indicating read-only state
- No interactive actions
- Placeholder for future edit capabilities
```

**Example:**
```tsx
export function NTPListActions({ ntp, onView, onPrint, onDelete }) {
  const canDelete = ntp.status === 'Draft'
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>...</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onView(ntp)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {canDelete && (
          <DropdownMenuItem onClick={() => setShowDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## Implementation Checklist

When creating a new table, ensure all 4 components follow this pattern:

### Table Component
- [ ] Imports toolbar, columns, actions
- [ ] Manages sorting state
- [ ] Manages pagination state
- [ ] Filters data based on props
- [ ] Renders toolbar above table
- [ ] Renders table with TanStack Table
- [ ] Renders pagination/footer below table
- [ ] Handles loading states
- [ ] Handles empty states
- [ ] Exports interface with all props

### Toolbar Component
- [ ] Has clear props interface
- [ ] Implements search (if applicable)
- [ ] Implements filters (if applicable)
- [ ] Implements primary actions (if applicable)
- [ ] Shows summary info (if read-only)
- [ ] Responsive layout
- [ ] Exports interface with props

### Columns Component
- [ ] Exports ColumnDef[] array
- [ ] Each column has accessor, header, cell
- [ ] Formats data appropriately
- [ ] Uses consistent styling (badges, text styles)
- [ ] No business logic, pure presentation

### Actions Component
- [ ] Exports interface with props
- [ ] Implements dropdown menu or variants
- [ ] Handles permissions/disabled states
- [ ] Triggers dialogs/callbacks properly
- [ ] Read-only variant available (if applicable)

---

## File Organization

```
src/features/procurement/ntp/
├── tables/
│   ├── index.ts                    # Central export
│   │
│   ├── NTPTable.tsx               # Main table
│   ├── NTPListToolbar.tsx          # Toolbar (interactive)
│   ├── NTPListColumns.tsx          # Columns
│   ├── NTPListActions.tsx          # Actions
│   │
│   ├── NTPDetailsTable.tsx         # Main table (details)
│   ├── NTPDetailsToolbar.tsx       # Toolbar (read-only)
│   ├── NTPDetailsColumns.tsx       # Columns
│   └── NTPDetailsActions.tsx       # Actions (read-only)
```

---

## Usage Examples

### In a Page Component

```tsx
import { NTPTable, NTPListToolbar } from '../tables'

export function NTPListPage() {
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const handleViewDetails = (ntp) => { /* ... */ }
  const handlePrintNTP = (ntp) => { /* ... */ }
  const handleDeleteNTP = (ntp) => { /* ... */ }

  return (
    <Card>
      <NTPTable
        data={data}
        isLoading={isLoading}
        onView={handleViewDetails}
        onPrint={handlePrintNTP}
        onDelete={handleDeleteNTP}
        searchQuery={searchQuery}
        selectedStatus={selectedStatus}
      />
    </Card>
  )
}
```

### Details Table

```tsx
import { NTPDetailsTable } from '../tables'

export function NTPDetailsPage() {
  const ntp = /* fetch NTP data */

  return (
    <Card>
      <h2>Line Items</h2>
      <NTPDetailsTable 
        lineItems={ntp.lineItems}
        isLoading={isLoading}
      />
    </Card>
  )
}
```

---

## Current Implementation Status

| Table | Toolbar | Columns | Actions | Status |
|-------|---------|---------|---------|--------|
| NTPTable (List) | NTPListToolbar ✅ | NTPListColumns ✅ | NTPListActions ✅ | Complete |
| NTPDetailsTable | NTPDetailsToolbar ✅ | NTPDetailsColumns ✅ | NTPDetailsActions ✅ | Complete |

---

## Best Practices

1. **Separation of Concerns:** Each component has a single responsibility
2. **Reusability:** Components are generic and can be adapted
3. **Consistency:** Styling and patterns are uniform across tables
4. **Type Safety:** All components have TypeScript interfaces
5. **Readability:** Clear naming and documentation
6. **Performance:** useMemo for computed values, avoid re-renders
7. **Accessibility:** Proper ARIA labels and keyboard support

---

## Future Enhancements

- [ ] Column visibility toggle
- [ ] Export to CSV/PDF
- [ ] Advanced filtering
- [ ] Bulk actions (select multiple rows)
- [ ] Drag-to-reorder columns
- [ ] Save column preferences to localStorage
