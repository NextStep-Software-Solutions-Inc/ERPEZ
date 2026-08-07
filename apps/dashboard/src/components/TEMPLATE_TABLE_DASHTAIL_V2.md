# TemplateTablDashTailv2 - Advanced Data Table Component

A production-ready, fully typed advanced data table component built with TanStack Table, Dashtail design, and shadcn/ui components.

## Features

- **TanStack Table Integration**: Powerful table state management
- **Advanced Sorting**: Multi-column sorting with visual indicators
- **Global & Column Filtering**: Flexible search and filtering capabilities
- **Column Visibility Toggle**: Show/hide columns dynamically
- **Multi-Select**: Select multiple rows with bulk actions
- **Pagination**: Configurable page sizes and navigation
- **Permission-Aware Actions**: Inline actions with permission checks
- **Fully Typed**: Zero `any` types, complete TypeScript support
- **Responsive Design**: Dashtail + shadcn UI styling
- **Loading States**: Skeleton and loading indicators
- **Empty States**: Customizable empty state messages

## Components & Hooks

### Main Component: `TemplateTablDashTailv2<T>`

```typescript
import { TemplateTablDashTailv2 } from '@/components/TemplateTablDashTailv2'
```

### Hooks

#### `useTableFilters`
```typescript
import { useTableFilters } from '@/components/TemplateTablDashTailv2Hooks'

const { 
  filters, 
  search,
  addFilter, 
  removeFilter, 
  clearFilters,
  setSearch,
  clearSearch,
  hasActiveFilters 
} = useTableFilters({ query: '' })
```

#### `useTableSelection`
```typescript
import { useTableSelection } from '@/components/TemplateTablDashTailv2Selection'

const {
  selectedRowIds,
  selectAll,
  selectedCount,
  isAllSelected,
  hasSelection,
  getSelectedIds,
  toggleRow,
  toggleSelectAll,
  clearSelection,
} = useTableSelection<MyDataType>(rowCount)
```

## Props

```typescript
interface TemplateTablDashTailv2Props<T extends { id: string | number }> {
  // Data and Structure
  data: T[]                                  // Array of items to display
  columns: TableColumn<T>[]                  // Column definitions
  actions?: TableAction<T>[]                 // Row action buttons

  // Callbacks
  onSelectRows?: (selectedRows: T[]) => void       // Selection change callback
  onDeleteRows?: (selectedRows: T[]) => Promise<void> // Delete handler for bulk actions

  // State
  isLoading?: boolean                        // Show loading state
  isError?: boolean                          // Show error state
  errorMessage?: string                      // Custom error message

  // Configuration
  pageSize?: number                          // Items per page (default: 10)
  enableSorting?: boolean                    // Enable column sorting (default: true)
  enableFiltering?: boolean                  // Enable filtering (default: true)
  enableColumnVisibility?: boolean           // Enable column toggle (default: true)
  enableRowSelection?: boolean               // Enable multi-select (default: true)
  enablePagination?: boolean                 // Enable pagination (default: true)

  // Display
  className?: string                         // Additional CSS classes
  toolbar?: ReactNode                        // Custom toolbar component
  emptyMessage?: string                      // Empty state message
}

interface TableColumn<T> extends ColumnDef<T> {
  id: string                                 // Unique column ID
  header?: string | ReactNode                // Column header
  cell?: (props: any) => ReactNode           // Cell renderer
  sortable?: boolean                         // Is sortable
  filterable?: boolean                       // Is filterable
  visible?: boolean                          // Initially visible
}

interface TableAction<T> {
  id: string                                 // Unique action ID
  label: string                              // Action label/tooltip
  icon?: ReactNode                           // Action icon
  onClick: (row: T) => void | Promise<void> // Click handler
  variant?: 'default' | 'outline' | 'destructive'  // Button style
  disabled?: (row: T) => boolean             // Disable condition
  hasPermission?: boolean | ((row: T) => boolean) // Permission check
}
```

## Usage Examples

### Basic Table

```tsx
import { TemplateTablDashTailv2 } from '@/components/TemplateTablDashTailv2'
import { ColumnDef } from '@tanstack/react-table'

interface Item {
  id: string
  name: string
  value: number
  status: string
}

export function BasicTable() {
  const data: Item[] = [
    { id: '1', name: 'Item 1', value: 100, status: 'active' },
    { id: '2', name: 'Item 2', value: 200, status: 'inactive' },
  ]

  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'value',
      header: 'Value',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          info.getValue() === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {info.getValue() as string}
        </span>
      ),
    },
  ]

  return (
    <TemplateTablDashTailv2
      data={data}
      columns={columns}
      pageSize={10}
      enableSorting
      enableColumnVisibility
    />
  )
}
```

### Table with Actions and Permissions

```tsx
import { TemplateTablDashTailv2 } from '@/components/TemplateTablDashTailv2'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface EconomicIndicator {
  id: string
  type: 'vat-rate' | 'inflation-rate' | 'income-tax-rate'
  fiscalYear: string
  value: number
}

export function IndicatorsTable({ data, userPermissions }) {
  const columns: ColumnDef<EconomicIndicator>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: (info) => {
        const type = info.getValue() as string
        const labels = {
          'vat-rate': 'VAT Rate',
          'inflation-rate': 'Inflation Rate',
          'income-tax-rate': 'Income Tax Rate',
        }
        return labels[type as keyof typeof labels] || type
      },
    },
    {
      accessorKey: 'fiscalYear',
      header: 'Fiscal Year',
    },
    {
      accessorKey: 'value',
      header: 'Value (%)',
      cell: (info) => `${info.getValue()}%`,
    },
  ]

  const actions: TableAction<EconomicIndicator>[] = [
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => handleEdit(row),
      hasPermission: userPermissions.includes('write'),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row) => handleDelete(row),
      variant: 'destructive',
      hasPermission: userPermissions.includes('delete'),
      disabled: (row) => row.type === 'vat-rate', // Can't delete VAT rates
    },
  ]

  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteRows = async (rows: EconomicIndicator[]) => {
    setIsDeleting(true)
    try {
      for (const row of rows) {
        await deleteIndicator(row.id)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <TemplateTablDashTailv2
      data={data}
      columns={columns}
      actions={actions}
      onDeleteRows={handleDeleteRows}
      enableRowSelection
      pageSize={15}
    />
  )
}
```

### Table with Custom Toolbar

```tsx
import { TemplateTablDashTailv2 } from '@/components/TemplateTablDashTailv2'
import { useTableFilters } from '@/components/TemplateTablDashTailv2Hooks'
import { DebouncedInput } from '@/components/DebouncedInput'

export function TableWithToolbar() {
  const { search, setSearch, clearSearch } = useTableFilters()
  
  const toolbar = (
    <div className="flex items-center gap-2">
      <DebouncedInput
        placeholder="Search..."
        value={search.query}
        onChange={(value) => setSearch({ query: value })}
        className="flex-1"
      />
      {search.query && (
        <button onClick={clearSearch} className="text-sm text-muted-foreground">
          Clear
        </button>
      )}
    </div>
  )

  return (
    <TemplateTablDashTailv2
      data={data}
      columns={columns}
      toolbar={toolbar}
    />
  )
}
```

### Advanced Example: Economic Indicators Table

```tsx
import { TemplateTablDashTailv2, TableColumn, TableAction } from '@/components/TemplateTablDashTailv2'
import { Edit, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'

interface EconomicIndicator {
  id: string
  type: 'vat-rate' | 'inflation-rate' | 'income-tax-rate'
  fiscalYear: string
  value: number
  effectiveDate: string
  lastModified: string
  createdBy: string
}

export function EconomicIndicatorsTableView() {
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState<EconomicIndicator[]>([])

  // Column definitions
  const columns: TableColumn<EconomicIndicator>[] = [
    {
      id: 'type',
      accessorKey: 'type',
      header: 'Indicator Type',
      sortable: true,
      cell: (info) => {
        const type = info.getValue() as string
        const colors = {
          'vat-rate': 'emerald',
          'inflation-rate': 'orange',
          'income-tax-rate': 'purple',
        }
        const labels = {
          'vat-rate': 'VAT Rate',
          'inflation-rate': 'Inflation Rate',
          'income-tax-rate': 'Income Tax Rate',
        }
        return (
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold bg-${colors[type as keyof typeof colors]}-100 text-${colors[type as keyof typeof colors]}-800`}>
            {labels[type as keyof typeof labels]}
          </span>
        )
      },
    },
    {
      id: 'fiscalYear',
      accessorKey: 'fiscalYear',
      header: 'Fiscal Year',
      sortable: true,
    },
    {
      id: 'value',
      accessorKey: 'value',
      header: 'Value (%)',
      sortable: true,
      cell: (info) => `${(info.getValue() as number).toFixed(2)}%`,
    },
    {
      id: 'effectiveDate',
      accessorKey: 'effectiveDate',
      header: 'Effective Date',
      sortable: true,
    },
    {
      id: 'lastModified',
      accessorKey: 'lastModified',
      header: 'Last Modified',
      sortable: true,
    },
  ]

  // Action definitions
  const actions: TableAction<EconomicIndicator>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row) => console.log('View:', row),
      hasPermission: true,
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => handleEdit(row),
      hasPermission: userCan('write'),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row) => handleDelete(row),
      variant: 'destructive',
      hasPermission: userCan('delete'),
    },
  ]

  const handleDeleteRows = async (rows: EconomicIndicator[]) => {
    setIsLoading(true)
    try {
      await Promise.all(rows.map(row => deleteIndicator(row.id)))
      setIndicators(prev => prev.filter(i => !rows.find(r => r.id === i.id)))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TemplateTablDashTailv2
      data={indicators}
      columns={columns}
      actions={actions}
      onSelectRows={setSelectedRows}
      onDeleteRows={handleDeleteRows}
      isLoading={isLoading}
      pageSize={15}
      enableSorting
      enableFiltering
      enableRowSelection
      enablePagination
      emptyMessage="No economic indicators found. Create one to get started."
    />
  )
}
```

## Advanced Features

### Custom Filtering

```tsx
const { filters, addFilter, removeFilter } = useTableFilters()

// Add filter
addFilter({
  columnId: 'status',
  value: 'active',
  operator: 'equals',
})

// Remove filter
removeFilter('status')
```

### Multi-Select with Bulk Actions

```tsx
<TemplateTablDashTailv2
  data={data}
  columns={columns}
  enableRowSelection
  onSelectRows={(selected) => {
    console.log('Selected rows:', selected)
  }}
  onDeleteRows={async (rows) => {
    await deleteAPI(rows.map(r => r.id))
  }}
/>
```

### Permission-Based Actions

```tsx
const actions: TableAction<Item>[] = [
  {
    id: 'edit',
    label: 'Edit',
    icon: <Edit className="h-4 w-4" />,
    onClick: (row) => handleEdit(row),
    hasPermission: (row) => userRole === 'admin' || row.createdBy === currentUser.id,
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: (row) => handleDelete(row),
    variant: 'destructive',
    disabled: (row) => row.locked === true,
    hasPermission: userPermissions.includes('delete'),
  },
]
```

## Styling & Theming

The component uses Dashtail design system with shadcn/ui components:
- Border colors: `border-border`
- Background colors: `bg-muted/30`, `bg-muted/50`
- Text colors: Text hierarchy with semantic classes
- Hover states: `hover:bg-muted/50`

## Best Practices

1. **Type Safety**: Always provide complete types for your data
2. **Permissions**: Use `hasPermission` to respect user permissions
3. **Loading States**: Handle `isLoading` prop for async operations
4. **Error Handling**: Provide meaningful `errorMessage` values
5. **Pagination**: Adjust `pageSize` based on your data volume
6. **Actions**: Keep action list concise (3-4 actions max per row)
7. **Column Order**: Order columns by importance and frequency of use
8. **Sorting**: Enable sorting on commonly filtered columns

## Performance Considerations

- Large datasets (10k+ rows): Use server-side pagination
- Filtering: Implement debouncing for real-time search
- Sorting: Lazy-load sorted data from API when possible
- Selection: Clear selection after bulk actions complete
- Re-renders: Use React.memo for custom cell/header renderers

## Accessibility

- Keyboard navigation: Tab through rows and actions
- Screen readers: ARIA labels on all interactive elements
- Color contrast: Meets WCAG AA standards
- Keyboard shortcuts: Support arrow keys for navigation
