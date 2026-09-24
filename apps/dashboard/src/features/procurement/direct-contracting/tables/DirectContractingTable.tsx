import * as React from 'react'
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnFiltersState,
  type VisibilityState,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
} from '@tanstack/react-table'

import {
  Search,
  SlidersHorizontal,
  Send,
  Trash2,
  X,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DebouncedInput from '@/components/DebouncedInput'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

import { getDirectContractingColumns } from './columns'
import {
  COLUMN_LABELS,
  type TableActionHandlers,
} from './types'
import type { PaginationResponse } from 'erpez-shared-lib'
import type { DirectContracting } from '../types'

export interface DirectContractingTableProps {
  directContractings?: PaginationResponse<DirectContracting>
  isLoading?: boolean
  handlers: TableActionHandlers
  onBulkSubmit?: (selectedRows: DirectContracting[]) => void
  onBulkDelete?: (selectedRows: DirectContracting[]) => void
  // URL-based query controls
  pageNumber?: number
  pageSize?: number
  status?: string
  searchQuery?: string
  onPageChange?: (pageNumber: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onExportCSV?: () => void
  onStatusChange?: (status: string) => void
  onSearchChange?: (searchQuery: string) => void
}

export function DirectContractingTable({
  directContractings,
  isLoading = false,
  handlers,
  onBulkSubmit,
  onBulkDelete,

  pageNumber,
  pageSize,
  status,
  searchQuery,
  onPageChange,
  onPageSizeChange,
  onStatusChange,
  onSearchChange,
}: DirectContractingTableProps) {

  // Active status tab: prioritize controlled status prop, fallback to internal state
  const [internalStatusTab, setInternalStatusTab] = React.useState<string>(status || 'all')
  const activeStatusTab = status !== undefined ? status : internalStatusTab


  // TanStack Table v8 States
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: Math.max(0, (pageNumber ?? 1) - 1),
    pageSize: pageSize ?? 10,
  })

  // Columns using TanStack Table ColumnHelper
  const columns = React.useMemo(() => getDirectContractingColumns(handlers), [handlers])

  const totalRows =
    directContractings?.totalRows ?? directContractings?.data?.length ?? 0

  const pageCount = Math.max(1, Math.ceil(totalRows / (pagination.pageSize || 10)))

  // Initialize TanStack Table v8
  const table = useReactTable({
    data: directContractings?.data || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater
      setPagination(newPagination)
      if (newPagination.pageIndex !== pagination.pageIndex) {
        onPageChange?.(newPagination.pageIndex + 1)
      }
      if (newPagination.pageSize !== pagination.pageSize) {
        onPageSizeChange?.(newPagination.pageSize)
        onPageChange?.(1)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Sync pagination state when controlled props change
  React.useEffect(() => {
    if (pageNumber !== undefined || pageSize !== undefined) {
      setPagination((prev) => ({
        pageIndex: pageNumber !== undefined ? Math.max(0, pageNumber - 1) : prev.pageIndex,
        pageSize: pageSize !== undefined ? pageSize : prev.pageSize,
      }))
    }
  }, [pageNumber, pageSize])

  // Selected rows calculation
  const selectedRowList = React.useMemo(() => {
    return table.getSelectedRowModel().rows.map((r) => r.original)
  }, [table, rowSelection])

  const selectedCount = selectedRowList.length

  // Tab counts calculation
  const statusCounts = React.useMemo(() => {
    const counts = {
      all: directContractings?.data?.length || 0,
      draft: 0,
      'for-review': 0,
      'submitted-to-supplier': 0,
      approved: 0,
      rejected: 0,
    }
    directContractings?.data?.forEach((item) => {
      const s = (item.status || '').toLowerCase()
      if (s === 'draft') counts.draft += 1
      else if (s === 'for-review' || s === 'for_review' || s === 'submitted' || s === 'pending_for_approval' || s === 'pending-for-approval') counts['for-review'] += 1
      else if (s === 'submitted-to-supplier' || s === 'submitted_to_supplier') counts['submitted-to-supplier'] += 1
      else if (s === 'approved') counts.approved += 1
      else if (s === 'rejected' || s === 'returned') counts.rejected += 1
    })
    return counts
  }, [directContractings?.data])

  // Change status tab
  const handleSelectStatusTab = (tabValue: string) => {
    if (onStatusChange) {
      onStatusChange(tabValue)
      onPageChange?.(1)
    } else {
      setInternalStatusTab(tabValue)
      if (tabValue === 'all') {
        table.getColumn('status')?.setFilterValue(undefined)
      } else {
        table.getColumn('status')?.setFilterValue(tabValue)
      }
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
  }

  // Reset all filters
  const handleResetFilters = () => {
    table.getColumn('status')?.setFilterValue(undefined)
    setColumnFilters([])
    if (onSearchChange) onSearchChange('')
    if (onStatusChange) onStatusChange('all')
    if (onPageChange) onPageChange(1)
    setInternalStatusTab('all')
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }



  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-4">
        {/* Status Tabs with Counters */}
        <div className="flex items-center gap-1.5 pt-4 overflow-x-auto pb-1 border-b border-border/40 scrollbar-none">
          {[
            { id: 'all', label: 'All Requests', count: statusCounts.all },
            { id: 'draft', label: 'Drafts', count: statusCounts.draft },
            { id: 'for-review', label: 'For Review', count: statusCounts['for-review'] },
            {
              id: 'submitted-to-supplier',
              label: 'Sent to Supplier',
              count: statusCounts['submitted-to-supplier'],
            },
            { id: 'approved', label: 'Approved', count: statusCounts.approved },
            { id: 'rejected', label: 'Returned', count: statusCounts.rejected },
          ].map((tab) => {
            const isActive = activeStatusTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectStatusTab(tab.id)}
                type="button"
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70',
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted-foreground/15 text-muted-foreground',
                  )}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Table Toolbar: Search, Filters, Column Visibility */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <DebouncedInput
                placeholder="Search by project name..."
                value={searchQuery ?? ''}
                onChange={(val) => {
                  onSearchChange?.(val)
                  onPageChange?.(1)
                }}
                className="pl-9 pr-9 h-9 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    onSearchChange?.('')
                    onPageChange?.(1)
                  }}
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer z-10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Column Visibility Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-semibold">
                    Toggle Columns
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((col) => col.getCanHide())
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        className="capitalize text-xs cursor-pointer"
                        checked={col.getIsVisible()}
                        onCheckedChange={(val) => col.toggleVisibility(!!val)}
                      >
                        {COLUMN_LABELS[col.id] || col.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 text-xs"
              disabled={!searchQuery && activeStatusTab === 'all' && columnFilters.length === 0}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Interactive Bulk Action Banner */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-2.5 rounded-lg border border-primary/30 bg-primary/5 text-foreground animate-in fade-in-50 duration-150">
            <div className="flex items-center gap-2">
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground px-1.5">
                {selectedCount}
              </span>
              <span className="text-sm font-semibold">
                request{selectedCount > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5 bg-background shadow-xs hover:bg-muted"
                onClick={() => {
                  onBulkSubmit?.(selectedRowList)
                  setRowSelection({})
                }}
              >
                <Send className="h-3.5 w-3.5 text-sky-600" />
                Submit Selected
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs gap-1.5 shadow-xs"
                onClick={() => {
                  onBulkDelete?.(selectedRowList)
                  setRowSelection({})
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Selected
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setRowSelection({})}
              >
                Deselect All
              </Button>
            </div>
          </div>
        )}

        {/* TanStack Table Grid */}
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-11">
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
                Array.from({ length: Math.min(pagination.pageSize, 5) }).map((_, i) => (
                  <TableRow key={`skeleton-row-${i}`} className="hover:bg-transparent">
                    {columns.map((_col, colIdx) => (
                      <TableCell key={`skeleton-cell-${colIdx}`} className="py-3.5">
                        <Skeleton className="h-5 w-full max-w-[140px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="group transition-colors hover:bg-muted/40 data-[state=selected]:bg-primary/5"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5">
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
                  <TableCell colSpan={columns.length} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 py-8">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Inbox className="h-6 w-6" />
                      </div>
                      <div className="font-semibold text-base text-foreground">
                        No Direct Contracting requests found
                      </div>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {searchQuery || activeStatusTab !== 'all'
                          ? 'No requests match your current search and filter criteria. Try adjusting or clearing your filters.'
                          : 'There are currently no Direct Contracting requests registered. Create your first request to get started.'}
                      </p>
                      {(searchQuery || activeStatusTab !== 'all') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs"
                          onClick={handleResetFilters}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Full-featured Pagination Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-4 py-2">
          {/* Left: Selection count and record index */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Showing{' '}
              <span className="font-semibold text-foreground">
                {totalRows === 0
                  ? 0
                  : pagination.pageIndex * pagination.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-foreground">
                {Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  (totalRows ?? 0),
                )}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-foreground">
                {totalRows}
              </span>{' '}
              entries
            </span>
            {selectedCount > 0 && (
              <span className="font-medium text-primary">
                ({selectedCount} selected)
              </span>
            )}
          </div>

          {/* Right: Rows per page, page numbers, navigation buttons */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rows per page:</span>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(val) => {
                  const newSize = Number(val)
                  if (onPageSizeChange) {
                    onPageSizeChange(newSize)
                    onPageChange?.(1)
                  } else {
                    setPagination((prev) => ({ ...prev, pageSize: newSize, pageIndex: 0 }))
                  }
                }}
              >
                <SelectTrigger className="h-8 w-18 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)} className="text-xs">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <div className="text-xs font-medium text-foreground px-2 tabular-nums">
                Page {pageCount === 0 ? 0 : pagination.pageIndex + 1} of{' '}
                {pageCount}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (onPageChange) {
                    onPageChange(1)
                  } else {
                    table.setPageIndex(0)
                  }
                }}
                disabled={pagination.pageIndex === 0}
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (onPageChange) {
                    onPageChange(Math.max(1, pagination.pageIndex))
                  } else {
                    table.previousPage()
                  }
                }}
                disabled={pagination.pageIndex === 0}
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (onPageChange) {
                    onPageChange(pagination.pageIndex + 2)
                  } else {
                    table.nextPage()
                  }
                }}
                disabled={pagination.pageIndex >= pageCount - 1}
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (onPageChange) {
                    onPageChange(pageCount)
                  } else {
                    table.setPageIndex(pageCount - 1)
                  }
                }}
                disabled={pagination.pageIndex >= pageCount - 1}
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
