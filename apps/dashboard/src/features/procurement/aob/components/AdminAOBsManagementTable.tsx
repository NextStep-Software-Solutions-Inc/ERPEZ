/**
 * Admin AOBs Management Table Component
 * Displays table of AOBs for admin review and approval
 * Features: View details, Approve, Return for revision, Search, Filter, Sort, Pagination
 */

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getAdminAOBsTableColumns } from '../tables/AdminAOBsTableColumns'
import { AdminAOBsTableToolbar } from '../tables/AdminAOBsTableToolbar'
import type { AOB } from '../types'

interface AdminAOBsManagementTableProps {
  data: AOB[]
  isLoading?: boolean
  onView: (aob: AOB) => void
  onApprove: (aob: AOB) => void
  onReturn: (aob: AOB) => void
}

export function AdminAOBsManagementTable({
  data,
  isLoading = false,
  onView,
  onApprove,
  onReturn,
}: AdminAOBsManagementTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return data.filter((aob) => {
      // Search filter - check multiple fields
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          aob.aobNumber.toLowerCase().includes(searchLower) ||
          (aob.rfqNumber && aob.rfqNumber.toLowerCase().includes(searchLower)) ||
          (aob.description && aob.description.toLowerCase().includes(searchLower))

        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        const normStatus = (aob.status === 'ForApproval' || aob.status === 'Submitted') ? 'For Approval' : aob.status
        const normFilter = (statusFilter === 'ForApproval' || statusFilter === 'Submitted') ? 'For Approval' : statusFilter
        if (normStatus !== normFilter) return false
      }

      return true
    })
  }, [data, searchTerm, statusFilter])

  const columns = useMemo(
    () =>
      getAdminAOBsTableColumns({
        onView,
        onApprove,
        onReturn,
      }),
    [onView, onApprove, onReturn]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading AOBs...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No AOBs found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar with Search and Filters */}
      <AdminAOBsTableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        status={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Empty state for filtered results */}
      {filteredData.length === 0 && (
        <div className="flex items-center justify-center h-64 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">No AOBs match your search or filters</p>
        </div>
      )}

      {/* Table */}
      {filteredData.length > 0 && (
        <>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="bg-gray-50">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-md bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select value={pagination.pageSize.toString()} onValueChange={(value) => table.setPageSize(Number(value))}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                {' • '}
                {filteredData.length} total
              </span>
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
