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
import { pageAnimations } from '@/utils/animation'
import { Table as TableType } from '@tanstack/react-table'

interface TemplateTableListDashtailProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  renderToolbar?: (table: TableType<TData>) => React.ReactNode
  pagination?: React.ReactNode
  className?: string
  // Table States
  sorting?: SortingState
  onSortingChange?: (updater: any) => void
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: (updater: any) => void
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (updater: any) => void
  rowSelection?: Record<string, boolean>
  onRowSelectionChange?: (updater: any) => void
  emptyState?: React.ReactNode
}

export function TemplateTableListDashtail<TData, TValue>({
  columns,
  data,
  isLoading = false,
  renderToolbar,
  pagination,
  className,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  columnVisibility,
  onColumnVisibilityChange,
  rowSelection,
  onRowSelectionChange,
  emptyState,
}: TemplateTableListDashtailProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: sorting ?? [],
      columnFilters: columnFilters ?? [],
      columnVisibility: columnVisibility ?? {},
      rowSelection: rowSelection ?? {},
    },
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === 'function' ? updater(sorting ?? []) : updater
      onSortingChange?.(newSorting)
    },
    onColumnFiltersChange: (updater) => {
      const newFilters =
        typeof updater === 'function' ? updater(columnFilters ?? []) : updater
      onColumnFiltersChange?.(newFilters)
    },
    onColumnVisibilityChange: (updater) => {
      const newVisibility =
        typeof updater === 'function'
          ? updater(columnVisibility ?? {})
          : updater
      onColumnVisibilityChange?.(newVisibility)
    },
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === 'function' ? updater(rowSelection ?? {}) : updater
      onRowSelectionChange?.(newSelection)
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  })

  return (
    <div className={cn('space-y-4 w-full', className)}>
      {renderToolbar && <div className="w-full">{renderToolbar(table)}</div>}

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="relative w-full overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-b"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="h-11 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                      >
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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    {columns.map((_, j) => (
                      <TableCell key={j} className="h-16 px-4">
                        <div className="h-4 bg-muted/60 rounded w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                <AnimatePresence mode="popLayout">
                  {table.getRowModel().rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      variants={pageAnimations.containerStagger}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      className={cn(
                        'border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted/50',
                        row.getIsSelected() && 'bg-muted/50',
                      )}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="p-4 align-middle">
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
                    className="p-0 border-none"
                  >
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center space-y-2 h-32 text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                          No results found.
                        </p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && <div className="w-full">{pagination}</div>}
    </div>
  )
}
