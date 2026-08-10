/**
 * NTP List Table Component
 * Main table component using TanStack Table with pagination
 * Uses discriminated union to enforce type safety based on variant
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
import type { NTP, NTPStatus } from '../types/ntpTypes'

/**
 * Base props shared by both variants
 */
interface NTPTableBaseProps {
  data: NTP[]
  isLoading?: boolean
  isFetching?: boolean
  onView: (ntp: NTP) => void
  onPrint: (ntp: NTP) => void
  searchQuery?: string
  selectedStatus?: NTPStatus | 'All'
}

/**
 * User/creator variant - requires delete actions
 * TODO: Add edit mode when inline editing is implemented
 */
interface NTPTableUserProps extends NTPTableBaseProps {
  variant: 'user'
  onDelete: (ntp: NTP) => void
  onApprove?: never
  onReturn?: never
  onEdit?: never
}

/**
 * Manager/approver variant - requires approve and return actions
 */
interface NTPTableManagerProps extends NTPTableBaseProps {
  variant: 'manager'
  onApprove: (ntp: NTP) => void
  onReturn: (ntp: NTP) => void
  onEdit?: never
  onDelete?: never
}

/**
 * Discriminated union type - ensures correct callbacks for each variant
 */
export type NTPTableProps = NTPTableUserProps | NTPTableManagerProps

export function NTPTable(props: NTPTableProps) {
  const {
    data,
    isLoading = false,
    isFetching = false,
    onView,
    onPrint,
    searchQuery = '',
    selectedStatus = 'All',
    variant,
  } = props

  // Type-safe callback access based on variant
  const [sorting, setSorting] = useState<SortingState>([])

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Filter data based on search and status
  const filteredData = useMemo(() => {
    return data.filter((ntp) => {
      const matchesSearch =
        searchQuery === '' ||
        ntp.ntpNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ntp.supplierName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = selectedStatus === 'All' || ntp.status === selectedStatus

      return matchesSearch && matchesStatus
    })
  }, [data, searchQuery, selectedStatus])

  // Extract variant-specific callbacks for dependency stability
  const variantSpecificCallbacks = useMemo(() => {
    if (variant === 'manager') {
      const managerProps = props as NTPTableManagerProps
      return { onApprove: managerProps.onApprove, onReturn: managerProps.onReturn }
    }
    const userProps = props as NTPTableUserProps
    return { onDelete: userProps.onDelete }
  }, [variant, props])

  const columns = useMemo(() => {
    const baseColumns = NTPListColumns
    return [
      ...baseColumns,
      {
        id: 'actions',
        cell: ({ row }) => {
          if (variant === 'manager') {
            // Type-safe: when variant is 'manager', props is narrowed to NTPTableManagerProps
            const managerProps = props as NTPTableManagerProps
            return (
              <ManageNTPListActions
                ntp={row.original}
                onView={onView}
                onPrint={onPrint}
                onApprove={managerProps.onApprove}
                onReturn={managerProps.onReturn}
              />
            )
          }
          // Type-safe: when variant is 'user', props is narrowed to NTPTableUserProps
          const userProps = props as NTPTableUserProps
          return (
            <NTPListActions
              ntp={row.original}
              onView={onView}
              onPrint={onPrint}
              onDelete={userProps.onDelete}
            />
          )
        },
      },
    ]
  }, [variant, onView, onPrint, variantSpecificCallbacks])

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
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading NTPs...</div>
      </div>
    )
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">
          {data.length === 0 ? 'No NTPs found' : 'No results match your filters'}
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="h-12">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                No NTPs to display
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onView(row.original)}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} onClick={(e) => {
                    if (cell.column.id === 'actions') {
                      e.stopPropagation()
                    }
                  }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-t">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select value={pagination.pageSize.toString()} onValueChange={(value) => {
            table.setPageSize(Number(value))
          }}>
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
            {table.getRowModel().rows.length} of {filteredData.length} rows
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

      {isFetching && (
        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground border-t">
          Updating...
        </div>
      )}
    </div>
  )
}
