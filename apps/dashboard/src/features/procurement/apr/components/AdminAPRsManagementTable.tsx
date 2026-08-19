/**
 * Admin APRs Management Table Component
 * 
 * Displays table of APRs for admin review and approval
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
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getAdminAPRsTableColumns } from '../tables/AdminAPRsTableColumns'
import { AdminAPRsTableToolbar } from '../tables/AdminAPRsTableToolbar'
import type { APRMaster } from '../types'

interface AdminAPRsTableProps {
  data: APRMaster[]
  isLoading?: boolean
  onView: (apr: APRMaster) => void
  onApprove: (apr: APRMaster) => void
  onReturn: (apr: APRMaster) => void
}

export function AdminAPRsManagementTable({
  data,
  isLoading = false,
  onView,
  onApprove,
  onReturn,
}: AdminAPRsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [fiscalYearFilter, setFiscalYearFilter] = useState('all')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return data.filter((apr) => {
      // Search filter - check multiple fields
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase()
        const aprNumber = (apr.aprNumber || '').toLowerCase()
        const requestingEntity = (apr.requestingEntity || (apr as any).officeName || '').toLowerCase()
        const requestedBy = (apr.requestedBy || '').toLowerCase()
        const agencyControlNumber = (apr.agencyControlNumber || '').toLowerCase()
        const description = (apr.description || '').toLowerCase()

        const matchesSearch =
          aprNumber.includes(searchLower) ||
          requestingEntity.includes(searchLower) ||
          requestedBy.includes(searchLower) ||
          agencyControlNumber.includes(searchLower) ||
          description.includes(searchLower)

        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'ALL' && apr.status !== statusFilter) {
        return false
      }

      // Fiscal year filter
      if (fiscalYearFilter && fiscalYearFilter !== 'all' && apr.fiscalYear !== parseInt(fiscalYearFilter)) {
        return false
      }

      return true
    })
  }, [data, searchTerm, statusFilter, fiscalYearFilter])

  const columns = useMemo(
    () =>
      getAdminAPRsTableColumns({
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
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading APRs...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No APRs found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar with Search and Filters */}
      <AdminAPRsTableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        fiscalYear={fiscalYearFilter}
        onFiscalYearChange={setFiscalYearFilter}
      />

      {/* Empty state for filtered results */}
      {filteredData.length === 0 && (
        <div className="flex items-center justify-center h-64 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">No APRs match your search or filters</p>
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
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? 'cursor-pointer select-none hover:text-gray-900 flex items-center gap-2'
                                : 'flex items-center gap-2'
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {header.column.getCanSort() && (
                              <span className="text-xs text-muted-foreground">
                                {header.column.getIsSorted() === false && '⇅'}
                                {header.column.getIsSorted() === 'asc' && '↑'}
                                {header.column.getIsSorted() === 'desc' && '↓'}
                              </span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()} • Showing{' '}
              {table.getRowModel().rows.length} of {filteredData.length} APRs
              {searchTerm || statusFilter !== 'ALL' || fiscalYearFilter !== 'all'
                ? ` (${filteredData.length} filtered)`
                : ''}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
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
