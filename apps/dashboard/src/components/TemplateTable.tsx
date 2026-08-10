import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import * as React from 'react'
import { useRef, useCallback } from 'react'
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  Table as TableType,
  VisibilityState,
} from '@tanstack/react-table'
import type { MetaActions } from '@/types/global'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDynamicTableSize } from '@/hooks/use-dynamic-table-size'

// Extend TableMeta to include custom properties
declare module '@tanstack/react-table' {
  interface TableMeta<TData = unknown> {
    actions?: MetaActions;
    role?: string;
    onView?: (item: TData) => void;
    onEdit?: (item: TData) => void;
    onDelete?: (id: string | number) => void;
  }
}

interface TemplateTableProps<T extends { id: string | number }> {
  title?: string
  description?: string
  columns: Array<ColumnDef<T>>
  data: Array<T>
  actions: MetaActions
  readonly?: boolean
  role?: string
  /** Override dynamic page sizing with a fixed page size */
  fixedPageSize?: number
  /** Minimum number of rows to display when using dynamic sizing */
  minRows?: number
  /** Maximum number of rows to display when using dynamic sizing */
  forTab?: boolean
  maxRows?: number
  toolbar?: (table: TableType<T>) => React.ReactNode
  /** Callback when table instance is ready */
  onTableReady?: (table: TableType<T>) => void
  meta?: Record<string, any>
  onView?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (id: string | number) => void
  /** External column visibility state */
  columnVisibility?: VisibilityState
  /** Callback when column visibility changes */
  onColumnVisibilityChange?: (
    updater: VisibilityState | ((old: VisibilityState) => VisibilityState),
  ) => void
  /** External sorting state */
  sorting?: SortingState
  /** Callback when sorting changes */
  onSortingChange?: (
    updater: SortingState | ((old: SortingState) => SortingState),
  ) => void
  /** External column filters state */
  columnFilters?: ColumnFiltersState
  /** Callback when column filters change */
  onColumnFiltersChange?: (
    updater:
      | ColumnFiltersState
      | ((old: ColumnFiltersState) => ColumnFiltersState),
  ) => void
  /** External global filter state */
  globalFilter?: string
  /** Callback when global filter changes */
  onGlobalFilterChange?: (value: string) => void
  /** Callback when row selection changes */
  onRowSelectionChange?: (rowSelection: Record<string, boolean>) => void
  /** Server-side pagination flags and callbacks */
  manualPagination?: boolean
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  onPaginationChange?: (paginationState: { pageIndex: number; pageSize: number }) => void
  totalCount?: number
}

export function TemplateTable<T extends { id: string | number }>({
  title,
  description,
  columns,
  data,
  actions,
  readonly = true,
  toolbar,
  onTableReady,
  fixedPageSize,
  minRows = 5,
  maxRows = 50,
  forTab,
  role,
  meta = {},
  onView,
  onEdit,
  onDelete,
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange: externalOnColumnVisibilityChange,
  sorting: externalSorting,
  onSortingChange: externalOnSortingChange,
  columnFilters: externalColumnFilters,
  onColumnFiltersChange: externalOnColumnFiltersChange,
  globalFilter: externalGlobalFilter,
  onGlobalFilterChange: externalOnGlobalFilterChange,
  onRowSelectionChange: externalOnRowSelectionChange,
  manualPagination = false,
  pageCount,
  pageIndex,
  pageSize: externalPageSize,
  onPaginationChange,
  totalCount,
}: TemplateTableProps<T>) {
  const dynamicPageSize = useDynamicTableSize({
    minRows,
    maxRows,
    reservedHeight: forTab ? 400 : 350, // Adjusted for header, toolbar, pagination
  })

  const pageSize = fixedPageSize || dynamicPageSize

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState<string>('')

  // Local pagination state when not doing manual/server-side pagination
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: pageSize || 10,
  })

  // Sync internal page size state with dynamic/fixed page size when not manual
  React.useEffect(() => {
    if (!manualPagination) {
      setPagination((prev) => ({
        ...prev,
        pageSize: pageSize || 10,
      }))
    }
  }, [pageSize, manualPagination])

  // Effective pagination state
  const effectivePagination = React.useMemo(() => {
    if (manualPagination) {
      return {
        pageIndex: pageIndex ?? 0,
        pageSize: externalPageSize ?? pageSize ?? 10,
      }
    }
    return pagination
  }, [manualPagination, pageIndex, externalPageSize, pageSize, pagination])

  const handlePaginationChange = React.useCallback(
    (updater: any) => {
      if (manualPagination) {
        if (onPaginationChange) {
          const nextState = typeof updater === 'function' ? updater(effectivePagination) : updater
          onPaginationChange(nextState)
        }
      } else {
        setPagination(updater)
      }
    },
    [manualPagination, onPaginationChange, effectivePagination],
  )

  // Use external state if provided, otherwise use local state
  const effectiveSorting = externalSorting ?? sorting
  const effectiveOnSortingChange = externalOnSortingChange ?? setSorting
  const effectiveColumnFilters = externalColumnFilters ?? columnFilters
  const effectiveOnColumnFiltersChange =
    externalOnColumnFiltersChange ?? setColumnFilters
  const effectiveColumnVisibility = externalColumnVisibility ?? columnVisibility
  const effectiveOnColumnVisibilityChange =
    externalOnColumnVisibilityChange ?? setColumnVisibility
  const effectiveGlobalFilter = externalGlobalFilter ?? globalFilter
  const effectiveOnGlobalFilterChange =
    externalOnGlobalFilterChange ?? setGlobalFilter
  
  // Use refs to store callbacks and avoid infinite loops from changing callback references
  const externalOnRowSelectionChangeRef = useRef(externalOnRowSelectionChange)
  
  // Update callback refs when they change
  React.useEffect(() => {
    externalOnRowSelectionChangeRef.current = externalOnRowSelectionChange
  }, [externalOnRowSelectionChange])
  
  // Handle row selection with proper memoization to prevent infinite loops
  // Don't include callbacks in dependency array - use ref instead
  const handleRowSelectionChange = useCallback((updater: any) => {
    if (typeof updater === 'function') {
      setRowSelection((prev) => {
        const newSelection = updater(prev)
        externalOnRowSelectionChangeRef.current?.(newSelection)
        return newSelection
      })
    } else {
      setRowSelection(updater)
      externalOnRowSelectionChangeRef.current?.(updater)
    }
  }, [])

  const effectiveColumns = columns

  const table = useReactTable({
    data,
    columns: effectiveColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: effectiveOnSortingChange,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: effectiveOnColumnFiltersChange,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: effectiveOnColumnVisibilityChange,
    onRowSelectionChange: handleRowSelectionChange,
    enableRowSelection: true,
    onGlobalFilterChange: effectiveOnGlobalFilterChange,
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      const search = String(filterValue).toLowerCase().trim()
      if (!search) return true

      // Primary search across content properties of row.original
      const item = row.original as Record<string, unknown>
      if (item && typeof item === 'object') {
        const code = String(item.code || item.kpiCode || item.uacsCode || '').toLowerCase()
        const name = String(item.name || item.kpiName || item.itemName || item.supplierName || item.title || '').toLowerCase()
        const desc = String(item.description || item.uacsDescription || '').toLowerCase()
        const tin = String(item.tinNumber || '').toLowerCase()

        if (code.includes(search) || name.includes(search) || desc.includes(search) || tin.includes(search)) {
          return true
        }
      }

      // Check primary visible cells (Code and Name columns)
      const codeCell = String(row.getValue('code') ?? row.getValue('kpiCode') ?? '').toLowerCase()
      const nameCell = String(row.getValue('name') ?? row.getValue('kpiName') ?? '').toLowerCase()

      return codeCell.includes(search) || nameCell.includes(search)
    },
    state: {
      sorting: effectiveSorting,
      columnFilters: effectiveColumnFilters,
      columnVisibility: effectiveColumnVisibility,
      rowSelection,
      globalFilter: effectiveGlobalFilter,
      pagination: effectivePagination,
    },
    onPaginationChange: handlePaginationChange,
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    meta: {
      readonly,
      actions: Array.isArray(actions) ? actions : [],
      role,
      onView,
      onEdit,
      onDelete,
      ...meta,
    },
  })

  // Use refs to store table and callback to avoid infinite loops from table dependency
  const tableRef = useRef<TableType<T> | null>(null)
  const onTableReadyRef = useRef(onTableReady)
  const hasCalledOnTableReadyRef = useRef(false)

  // Update callback ref when it changes
  React.useEffect(() => {
    onTableReadyRef.current = onTableReady
  }, [onTableReady])

  // Store table reference
  React.useEffect(() => {
    tableRef.current = table
  }, [table])

  // Sync external pageSize into TanStack table pagination state
  // Only depend on pageSize, not table, to break the infinite loop
  React.useEffect(() => {
    if (tableRef.current && !manualPagination) {
      tableRef.current.setPageSize(pageSize)
    }
  }, [pageSize, manualPagination])

  // Call onTableReady callback when table is ready - call only once
  React.useEffect(() => {
    if (!hasCalledOnTableReadyRef.current && onTableReadyRef.current && tableRef.current) {
      hasCalledOnTableReadyRef.current = true
      onTableReadyRef.current(tableRef.current)
    }
  }, [])

  return (
    <div className="w-full flex flex-col h-full p-2">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      {description && (
        <p className="text-muted-foreground pt-2">{description}</p>
      )}
      <div className="flex items-center py-4 gap-1 flex-wrap ">
        {toolbar?.(table)}
      </div>
      <div className="rounded-md border flex-1 flex flex-col min-h-0 bg-white">
        <Table>
          <TableHeader className=" bg-transparent border rounded-t-3xl">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-gray-500">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`text-left relative ${cell.column.id !== 'select' && cell.column.id !== 'actions' ? 'pl-6' : ''}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center align-middle"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 py-8">
                    <div className="rounded-full bg-gray-100 p-3">
                      <svg
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-900">No data to display</div>
                    <div className="text-sm text-gray-500">
                      {globalFilter ? 'Try adjusting your search or filters' : 'Get started by adding some data'}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-row items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {totalCount !== undefined ? totalCount : table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="text-muted-foreground text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
