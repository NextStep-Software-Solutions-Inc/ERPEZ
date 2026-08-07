import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
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
import React from 'react'
import { DataTableToolbar } from './data-table-toolbar'
import { OPCR } from '../../types'
import { ApprovalWorkflowTableMeta } from './columns'
import OPCRPaginationFooter from '../../components/OPCRPaginationFooter'

interface DataTableProps<TData extends OPCR, TValue> {
  readonly columns: ColumnDef<TData, TValue>[]
  readonly data: TData[]
  readonly isLoading?: boolean
  readonly onSearch?: (searchValue: string) => void
  readonly onStatusFilter?: (status: string | null) => void
  readonly showToolbar?: boolean
  readonly meta?: ApprovalWorkflowTableMeta
  readonly pageNumber: number
  readonly pageSize: number
  readonly totalPageNumber: number
  readonly totalRows: number
  readonly onPageChange: (pageNumber: number) => void
  readonly onPageSizeChange: (pageSize: number) => void
}

export function DataTable<TData extends OPCR, TValue>({
  columns,
  data,
  isLoading = false,
  onSearch,
  onStatusFilter,
  showToolbar = true,
  meta,
  pageNumber,
  pageSize,
  totalPageNumber,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    meta,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: totalPageNumber,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: pageNumber - 1,
        pageSize,
      },
    },
  })

  return (
    <div className="space-y-4">
      {showToolbar && (
        <DataTableToolbar
          table={table}
          onSearch={onSearch}
          onStatusFilter={onStatusFilter}
          isLoading={isLoading}
        />
      )}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={row.getIsSelected() ? 'bg-blue-50' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  {isLoading ? 'Loading...' : 'No results.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <OPCRPaginationFooter
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPageNumber={totalPageNumber}
        totalRows={totalRows}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
