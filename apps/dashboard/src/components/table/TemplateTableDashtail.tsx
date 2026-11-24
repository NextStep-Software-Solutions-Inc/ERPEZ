import React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  Table as TableType,
  Row,
  TableMeta,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { DataTablePagination } from './DataTablePagination'

export interface TemplateTableDashtailProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  renderToolbar?: (table: TableType<TData>) => React.ReactNode
  toolbar?: React.ReactNode
  pagination?: React.ReactNode
  showPagination?: boolean
  className?: string
  tableClassName?: string
  containerClassName?: string

  // Table States
  sorting?: SortingState
  onSortingChange?: (updater: any) => void
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: (updater: any) => void
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (updater: any) => void
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (updater: any) => void

  // Server-side / Manual controls
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  pageCount?: number
  totalCount?: number
  pageIndex?: number
  pageSize?: number
  onPaginationChange?: (updater: any) => void

  // Customization
  emptyState?: React.ReactNode
  meta?: TableMeta<TData>
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string
}

export function TemplateTableDashtail<TData, TValue = unknown>({
  columns,
  data,
  isLoading = false,
  renderToolbar,
  toolbar,
  pagination,
  showPagination = true,
  className,
  tableClassName,
  containerClassName,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  columnVisibility,
  onColumnVisibilityChange,
  rowSelection,
  onRowSelectionChange,
  manualPagination = true,
  manualSorting = true,
  manualFiltering = true,
  pageCount,
  totalCount,
  pageIndex = 0,
  pageSize = 10,
  onPaginationChange,
  emptyState,
  meta,
  getRowId,
}: TemplateTableDashtailProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [internalColumnFilters, setInternalColumnFilters] = React.useState<ColumnFiltersState>([])
  const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>({})
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({})
  const [internalPagination, setInternalPagination] = React.useState({
    pageIndex,
    pageSize,
  })

  // Sync internal pagination state if external props change
  React.useEffect(() => {
    setInternalPagination({ pageIndex, pageSize })
  }, [pageIndex, pageSize])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: sorting ?? internalSorting,
      columnFilters: columnFilters ?? internalColumnFilters,
      columnVisibility: columnVisibility ?? internalColumnVisibility,
      rowSelection: rowSelection ?? internalRowSelection,
      pagination: manualPagination
        ? { pageIndex, pageSize }
        : internalPagination,
    },
    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnFiltersChange: onColumnFiltersChange ?? setInternalColumnFilters,
    onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalColumnVisibility,
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
    onPaginationChange: onPaginationChange ?? setInternalPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount: manualPagination ? pageCount : undefined,
    getRowId,
    meta,
  })

  const renderedToolbar = renderToolbar ? renderToolbar(table) : toolbar

  return (
    <div className={cn('space-y-3.5 w-full flex flex-col', className)}>
      {renderedToolbar && <div className="w-full">{renderedToolbar}</div>}

      <div
        className={cn(
          'rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col',
          containerClassName,
        )}
      >
        <div className="relative w-full overflow-x-auto">
          <Table className={cn('w-full border-collapse', tableClassName)}>
            <TableHeader className="bg-muted/40 border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-b border-border"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      className="h-11 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-b border-border/50">
                    {columns.map((_, j) => (
                      <TableCell key={j} className="h-14 px-4 py-3">
                        <div className="h-4 bg-muted/60 rounded-md w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                <AnimatePresence mode="popLayout" initial={false}>
                  {table.getRowModel().rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'border-b border-border/60 transition-colors hover:bg-muted/30 data-[state=selected]:bg-primary/5',
                        row.getIsSelected() && 'bg-primary/5',
                      )}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-4 py-3.5 align-middle text-xs font-medium text-foreground"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="p-8 text-center border-none"
                  >
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center space-y-2.5 py-6 text-center">
                        <div className="rounded-full bg-muted/50 p-3 text-muted-foreground">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          No results found
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          Try adjusting your search terms or active filters to find what you&apos;re looking for.
                        </p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Built-in Dashtail pagination footer or slot override */}
        {showPagination && (
          pagination ? (
            <div className="w-full">{pagination}</div>
          ) : (
            <DataTablePagination
              table={table}
              pageIndex={pageIndex}
              pageSize={pageSize}
              totalCount={totalCount}
              pageCount={pageCount}
              onPageChange={(newIndex) => {
                if (onPaginationChange) {
                  onPaginationChange({ pageIndex: newIndex, pageSize })
                }
              }}
              onPageSizeChange={(newSize) => {
                if (onPaginationChange) {
                  onPaginationChange({ pageIndex: 0, pageSize: newSize })
                }
              }}
            />
          )
        )}
      </div>
    </div>
  )
}
