import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  ChevronDown,
  ColumnsIcon,
  Trash2,
  Download,
  Copy,
  FileText,
  LayoutGrid,
  List,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  enableViewToggle?: boolean
  defaultView?: 'table' | 'card'
  viewType?: 'table' | 'card'
  onViewTypeChange?: (view: 'table' | 'card') => void
  cardRenderer?: (item: TData, index: number) => React.ReactNode
}

type ViewType = 'table' | 'card'

export function DataTable<TData, TValue>({
  columns,
  data,
  enableViewToggle = true,
  defaultView = 'table',
  viewType: controlledView,
  onViewTypeChange,
  cardRenderer,
}: DataTableProps<TData, TValue>) {
  const [internalViewType, setInternalViewType] =
    React.useState<ViewType>(defaultView)

  // Use controlled view if provided, otherwise use internal state
  const viewType = controlledView || internalViewType

  const handleViewTypeChange = (newView: ViewType) => {
    setInternalViewType(newView)
    onViewTypeChange?.(newView)
  }
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
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full max-w-6xl space-y-2 ">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <Input
            placeholder="Filter fiscal year..."
            value={
              (table.getColumn('fiscalYearYear')?.getFilterValue() as string) ??
              ''
            }
            onChange={(event) => {
              const value = event.target.value.trim()
              if (value === '') {
                table.getColumn('fiscalYearYear')?.setFilterValue(undefined)
              } else {
                table.getColumn('fiscalYearYear')?.setFilterValue(value)
              }
            }}
            className="max-w-sm"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* View Toggle */}
          {enableViewToggle && (
            <div className="flex items-center gap-1 border border-border rounded-lg p-1">
              <Button
                variant={viewType === 'card' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => handleViewTypeChange('card')}
                className="h-8 w-8"
                title="Card view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewType === 'table' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => handleViewTypeChange('table')}
                className="h-8 w-8"
                title="Table view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {table.getFilteredSelectedRowModel().rows.length} selected
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy />
                  Copy selected IDs
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText />
                  Copy as JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 />
                  Delete selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ColumnsIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
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

      {/* Card View */}
      {viewType === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, idx) =>
              cardRenderer ? (
                <div key={row.id} className="h-full">
                  {cardRenderer(row.original, idx)}
                </div>
              ) : (
                <Card
                  key={row.id}
                  className="h-full flex items-center justify-center"
                >
                  <p className="text-sm text-muted-foreground">
                    Card view not configured
                  </p>
                </Card>
              ),
            )
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No results.</p>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-auto rounded-md border [&>div]:max-h-96">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-background! z-10 sticky top-0"
                >
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex items-center justify-end space-x-2">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
