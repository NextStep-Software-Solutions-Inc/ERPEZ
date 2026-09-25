import * as React from 'react'
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Check,
  Upload,
  Layers,
} from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { getSupplierDirectContractingColumns } from './columns'
import {
  COLUMN_LABELS,
  type DirectContracting,
  type SupplierTableActionHandlers,
} from './types'

export interface SupplierDirectContractingTableProps {
  data?: DirectContracting[]
  isLoading?: boolean
  handlers: SupplierTableActionHandlers
  // URL-based query controls
  pageNumber?: number
  pageSize?: number
  status?: string
  searchQuery?: string
  onPageChange?: (pageNumber: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onStatusChange?: (status: string) => void
  onSearchChange?: (searchQuery: string) => void
}

export function SupplierDirectContractingTable({
  data = [],
  isLoading = false,
  handlers,
  pageNumber,
  pageSize,
  status,
  searchQuery,
  onPageChange,
  onPageSizeChange,
  onStatusChange,
  onSearchChange,
}: SupplierDirectContractingTableProps) {
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

  // Synchronize external pagination prop
  React.useEffect(() => {
    if (pageNumber !== undefined) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: Math.max(0, pageNumber - 1),
      }))
    }
  }, [pageNumber])

  React.useEffect(() => {
    if (pageSize !== undefined) {
      setPagination((prev) => ({
        ...prev,
        pageSize,
      }))
    }
  }, [pageSize])

  // Columns definition
  const columns = React.useMemo(() => getSupplierDirectContractingColumns(handlers), [handlers])

  // Filter items by status & search
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // 1. Status Filter
      if (activeStatusTab && activeStatusTab !== 'all') {
        const itemStatus = (item.status || '').toLowerCase()
        const hasProposal = Boolean(item.proposalAmount || item.proposal)

        if (activeStatusTab === 'pending') {
          if (itemStatus === 'approved' || itemStatus === 'rejected' || itemStatus === 'returned' || hasProposal) {
            return false
          }
        } else if (activeStatusTab === 'submitted') {
          if (!hasProposal && itemStatus !== 'for-review' && itemStatus !== 'pending_for_approval' && itemStatus !== 'submitted') {
            return false
          }
        } else if (activeStatusTab === 'approved') {
          if (itemStatus !== 'approved') return false
        } else if (activeStatusTab === 'returned') {
          if (itemStatus !== 'returned' && itemStatus !== 'rejected') return false
        }
      }

      // 2. Search Query Filter
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchDc = (item.dcNumber || '').toLowerCase().includes(query)
        const matchName = (item.dcName || item.name || '').toLowerCase().includes(query)
        const matchProject = (item.bacProjectTitle || item.prNumber || '').toLowerCase().includes(query)
        if (!matchDc && !matchName && !matchProject) return false
      }

      return true
    })
  }, [data, activeStatusTab, searchQuery])

  // Status Tab Counts
  const statusCounts = React.useMemo(() => {
    const counts = {
      all: data.length,
      pending: 0,
      submitted: 0,
      approved: 0,
      returned: 0,
    }
    data.forEach((item) => {
      const s = (item.status || '').toLowerCase()
      const hasProposal = Boolean(item.proposalAmount || item.proposal)
      if (s === 'approved') {
        counts.approved += 1
      } else if (s === 'returned' || s === 'rejected') {
        counts.returned += 1
      } else if (s === 'for-review' || s === 'pending_for_approval' || s === 'submitted' || hasProposal) {
        counts.submitted += 1
      } else {
        counts.pending += 1
      }
    })
    return counts
  }, [data])

  // Initialize TanStack Table v8
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
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

  // Status Tab Selection
  const handleSelectStatusTab = (tabValue: string) => {
    if (onStatusChange) {
      onStatusChange(tabValue)
      onPageChange?.(1)
    } else {
      setInternalStatusTab(tabValue)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
  }

  // Search input handler with debounce
  const [localSearch, setLocalSearch] = React.useState(searchQuery || '')
  React.useEffect(() => {
    setLocalSearch(searchQuery || '')
  }, [searchQuery])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (searchQuery || '')) {
        onSearchChange?.(localSearch)
        onPageChange?.(1)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, searchQuery, onSearchChange, onPageChange])

  // Reset Filters
  const handleResetFilters = () => {
    setLocalSearch('')
    onSearchChange?.('')
    handleSelectStatusTab('all')
  }

  const selectedCount = Object.keys(rowSelection).length

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-4">
        {/* Status Tabs with Counters */}
        <div className="flex items-center gap-1.5 pt-2 overflow-x-auto pb-1 border-b border-border/40 scrollbar-none">
          {[
            { id: 'all', label: 'All Requests', count: statusCounts.all },
            { id: 'pending', label: 'Pending Quotation', count: statusCounts.pending },
            { id: 'submitted', label: 'Proposal Submitted', count: statusCounts.submitted },
            { id: 'approved', label: 'Approved', count: statusCounts.approved },
            { id: 'returned', label: 'Returned', count: statusCounts.returned },
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
                    'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
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

        {/* Toolbar: Search & Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reference, item name, or BAC project..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2">
            {(activeStatusTab !== 'all' || localSearch) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
            )}

            {/* Column Visibility Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs">Toggle Visible Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="text-xs capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {COLUMN_LABELS[column.id] || column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Selection Banner */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs">
            <span className="font-semibold text-primary">
              {selectedCount} item{selectedCount === 1 ? '' : 's'} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetRowSelection()}
              className="h-6 px-2 text-xs text-primary hover:text-primary"
            >
              Clear selection
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="rounded-md border-t border-border/40 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                        className="h-10 text-xs font-bold text-muted-foreground uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex} className="py-3">
                        <Skeleton className="h-5 w-full rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                      <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
                        <Search className="h-6 w-6 text-muted-foreground/60" />
                      </div>
                      <p className="text-sm font-semibold">No direct contracting requests found</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {localSearch || activeStatusTab !== 'all'
                          ? 'No invitations match the current search or status filters. Try clearing your filters.'
                          : 'There are no direct contracting invitations assigned to this supplier at this time.'}
                      </p>
                      {(localSearch || activeStatusTab !== 'all') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetFilters}
                          className="mt-2 text-xs"
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

        {/* Pagination & Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border/40 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(val) => {
                table.setPageSize(Number(val))
              }}
            >
              <SelectTrigger className="h-8 w-18 text-xs">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((sz) => (
                  <SelectItem key={sz} value={`${sz}`} className="text-xs">
                    {sz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground/80 pl-2">
              Showing{' '}
              {table.getFilteredRowModel().rows.length === 0
                ? 0
                : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              -
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}{' '}
              of {table.getFilteredRowModel().rows.length} entries
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 font-medium">
              Page {table.getPageCount() === 0 ? 0 : table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
