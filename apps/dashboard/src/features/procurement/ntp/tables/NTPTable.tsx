/**
 * NTP List Table Component
 * Main table component using TanStack Table with pagination
 */

import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  PaginationState,
} from '@tanstack/react-table'
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
import { NTPListColumns } from './NTPListColumns'
import { NTPListActions } from './NTPListActions'
import { ManageNTPListActions } from './ManageNTPListActions'
import type { NoticeToProceedListItem, NoticeToProceedStatus } from '../types/ntpTypes'

export interface NTPTableProps {
  data: NoticeToProceedListItem[]
  isLoading?: boolean
  isFetching?: boolean
  onView: (ntp: NoticeToProceedListItem) => void
  onPrint: (ntp: NoticeToProceedListItem) => void
  onDelete?: (ntp: NoticeToProceedListItem) => void
  onIssue?: (ntp: NoticeToProceedListItem) => void
  onRecordReceipt?: (ntp: NoticeToProceedListItem) => void
  searchQuery?: string
  selectedStatus?: string
  variant?: 'user' | 'manager'
}

export function NTPTable({
  data,
  isLoading = false,
  isFetching = false,
  onView,
  onPrint,
  onDelete,
  onIssue,
  onRecordReceipt,
  searchQuery = '',
  selectedStatus = 'All',
  variant = 'user',
}: NTPTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Filter data based on search and status
  const filteredData = useMemo(() => {
    return data.filter((ntp) => {
      const q = searchQuery.toLowerCase().trim()
      const ntpNum = (ntp.ntpNumber || '').toLowerCase()
      const contractNum = (ntp.contractNumber || '').toLowerCase()
      const supplier = (ntp.supplierName || '').toLowerCase()
      const project = (ntp.projectTitle || '').toLowerCase()

      const matchesSearch =
        q === '' ||
        ntpNum.includes(q) ||
        contractNum.includes(q) ||
        supplier.includes(q) ||
        project.includes(q)

      const matchesStatus =
        selectedStatus === 'All' ||
        ntp.status.toLowerCase() === selectedStatus.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [data, searchQuery, selectedStatus])

  const columns = useMemo(() => {
    return [
      ...NTPListColumns,
      {
        id: 'actions',
        cell: ({ row }: { row: { original: NoticeToProceedListItem } }) => {
          if (variant === 'manager') {
            return (
              <ManageNTPListActions
                ntp={row.original}
                onView={onView}
                onPrint={onPrint}
                onIssue={onIssue}
                onRecordReceipt={onRecordReceipt}
                onDelete={onDelete}
              />
            )
          }
          return (
            <NTPListActions
              ntp={row.original}
              onView={onView}
              onPrint={onPrint}
              onDelete={onDelete}
            />
          )
        },
      },
    ]
  }, [variant, onView, onPrint, onIssue, onRecordReceipt, onDelete])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Loading Notice to Proceed records...
      </div>
    )
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm space-y-1">
        <p className="font-medium text-slate-700 dark:text-slate-300">No Notice to Proceed records found</p>
        <p className="text-xs text-slate-500">
          {data.length === 0
            ? 'No NTPs have been generated yet.'
            : 'Try adjusting your search query or status filter.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 text-xs font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-muted/40 cursor-pointer"
                onClick={() => onView(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    onClick={(e) => {
                      if (cell.column.id === 'actions') {
                        e.stopPropagation()
                      }
                    }}
                    className="py-2.5"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={String(size)} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>
            Showing {table.getRowModel().rows.length} of {filteredData.length} entries
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
