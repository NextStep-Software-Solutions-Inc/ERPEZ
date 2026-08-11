import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  ColumnFiltersState,
  SortingState,
  getFilteredRowModel,
  VisibilityState,
  getSortedRowModel,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import React from 'react'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { PPMPManagementSearch } from '@/routes/v2/(planning)/ppmp/constants'
import DebouncedInput from '@/components/ui/DebouncedInput'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Office } from '@/lib/opcr'
import { FiscalYear } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/types/types'
import { LIB } from '@/features/planning/line-item-budgeting/line-item-budget/types'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onCreateNew?: () => void
  searchParams: PPMPManagementSearch
  handleUpdateSearch: (
    updater: (prev: PPMPManagementSearch) => Partial<PPMPManagementSearch>,
  ) => void
  pageCount: number
  totalRows: number
  offices: Office[]
  fiscalYears: FiscalYear[]
  libs: LIB[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onCreateNew,
  searchParams,
  handleUpdateSearch,
  pageCount,
  totalRows,
  offices,
  fiscalYears,
  libs,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const sortedFiscalYears = React.useMemo(() => {
    return [...fiscalYears].sort((a, b) => {
      const yearA = a.year || 0
      const yearB = b.year || 0
      return yearA - yearB
    })
  }, [fiscalYears])

  const filteredLibs = React.useMemo(() => {
    return libs.filter((lib) => {
      if (lib.status !== 'Approved' && lib.status !== 'Proposed') {
        return false
      }
      const isSuperseded = libs.some(
        (other) => other.previousVersionId === lib.id,
      )
      if (isSuperseded) {
        return false
      }
      return true
    })
  }, [libs])

  const table = useReactTable({
    data,
    columns,
    pageCount,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex: (searchParams.pageNumber ?? 1) - 1,
        pageSize: searchParams.pageSize ?? 10,
      },
    },
  })

  return (
    <div>
      <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        {/* search and filters functionalities */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <DebouncedInput
            placeholder="Search PPMP..."
            value={searchParams.searchQuery || ''}
            onChange={(val) =>
              handleUpdateSearch((prev) => ({
                ...prev,
                searchQuery: val || undefined,
                pageNumber: 1,
              }))
            }
            className="h-9 min-w-50 max-w-xs border-primary/20 focus-visible:ring-primary/30"
          />

          {/* Status Filter */}
          <Select
            value={searchParams.status || 'all'}
            onValueChange={(val) =>
              handleUpdateSearch((prev) => ({
                ...prev,
                status: val === 'all' ? undefined : val,
                pageNumber: 1,
              }))
            }
          >
            <SelectTrigger className="h-9 w-37.5 border-primary/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="amending">Amending</SelectItem>
              <SelectItem value="superseded">Superseded</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Fiscal Year Filter */}
          <Select
            value={searchParams.fiscalYearId || 'all'}
            onValueChange={(val) =>
              handleUpdateSearch((prev) => ({
                ...prev,
                fiscalYearId: val === 'all' ? undefined : val,
                pageNumber: 1,
              }))
            }
          >
            <SelectTrigger className="h-9 w-37.5 border-primary/20">
              <SelectValue placeholder="Fiscal Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fiscal Years</SelectItem>
              {sortedFiscalYears.map((fy) => (
                <SelectItem key={fy.id} value={fy.id}>
                  FY {fy.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Office Filter */}
          <Select
            value={searchParams.officeId || 'all'}
            onValueChange={(val) =>
              handleUpdateSearch((prev) => ({
                ...prev,
                officeId: val === 'all' ? undefined : val,
                pageNumber: 1,
              }))
            }
          >
            <SelectTrigger className="h-9 w-37.5 border-primary/20">
              <SelectValue placeholder="Office" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Offices</SelectItem>
              {offices.map((office) => (
                <SelectItem key={office.id} value={office.id}>
                  {office.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* LIB Filter */}
          <Select
            value={searchParams.lib || 'all'}
            onValueChange={(val) =>
              handleUpdateSearch((prev) => ({
                ...prev,
                lib: val === 'all' ? undefined : val,
                pageNumber: 1,
              }))
            }
          >
            <SelectTrigger className="h-9 w-37.5 border-primary/20">
              <SelectValue placeholder="Line Item Budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All LIBs</SelectItem>
              {filteredLibs.map((lib) => (
                <SelectItem key={lib.id} value={lib.id}>
                  {lib.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Consolidation Filter */}
          <Select
            value={searchParams.consolidated || 'all'}
            onValueChange={(val) =>
              handleUpdateSearch((prev) => ({
                ...prev,
                consolidated: val === 'all' ? undefined : val,
                pageNumber: 1,
              }))
            }
          >
            <SelectTrigger className="h-9 w-37.5 border-primary/20">
              <SelectValue placeholder="Consolidation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="consolidated">Consolidated</SelectItem>
              <SelectItem value="not_consolidated">Not Consolidated</SelectItem>
            </SelectContent>
          </Select>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(
                    (column) => column.getCanHide() && column.id !== 'actions',
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div>
          <Button
            onClick={onCreateNew}
            disabled={!onCreateNew}
            size="sm"
            className="h-9"
          >
            Create New PPMP
          </Button>
        </div>
      </div>
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
                <TableCell colSpan={columns.length} className="h-48 p-0">
                  <div className="flex h-full min-h-48 items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-muted-foreground">
                        No results.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* pagination controls */}
      <div className="flex items-center justify-between py-4 px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {totalRows}{' '}
          row(s) selected.
        </div>
        <div className="flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={String(searchParams.pageSize ?? 10)}
              onValueChange={(value) => {
                handleUpdateSearch((prev) => ({
                  ...prev,
                  pageSize: Number(value),
                  pageNumber: 1,
                }))
              }}
            >
              <SelectTrigger className="h-8 w-17.5">
                <SelectValue
                  placeholder={String(searchParams.pageSize ?? 10)}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 45, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-25 items-center justify-center text-sm font-medium">
            Page {searchParams.pageNumber ?? 1} of {pageCount || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() =>
                handleUpdateSearch((prev) => ({ ...prev, pageNumber: 1 }))
              }
              disabled={(searchParams.pageNumber ?? 1) <= 1}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                handleUpdateSearch((prev) => ({
                  ...prev,
                  pageNumber: Math.max(1, (prev.pageNumber ?? 1) - 1),
                }))
              }
              disabled={(searchParams.pageNumber ?? 1) <= 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                handleUpdateSearch((prev) => ({
                  ...prev,
                  pageNumber: Math.min(pageCount, (prev.pageNumber ?? 1) + 1),
                }))
              }
              disabled={
                (searchParams.pageNumber ?? 1) >= pageCount || pageCount === 0
              }
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() =>
                handleUpdateSearch((prev) => ({
                  ...prev,
                  pageNumber: pageCount,
                }))
              }
              disabled={
                (searchParams.pageNumber ?? 1) >= pageCount || pageCount === 0
              }
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
