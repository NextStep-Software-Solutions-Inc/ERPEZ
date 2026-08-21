/**
 * CatalogTable
 * TanStack Table implementation for Non-CSE catalog items.
 * Features: row selection, sorting, pagination, stale price indicator, locked state.
 */

import { useCallback, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table'
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { ChevronUp, ChevronDown, ChevronsUpDown, Lock } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  catalogRowSelectionAtom,
  catalogSortingAtom,
  catalogColumnVisibilityAtom,
  catalogPaginationAtom,
  catalogTotalItemsAtom,
} from '../atoms/catalogTableAtom'
import { selectedItemIdAtom } from '../atoms/selectedItemAtom'
import { StalePriceIndicator } from './StalePriceIndicator'
import { formatPrice, formatDate } from '../utils/catalogFormatters'
import { CatalogToolbar } from './CatalogToolbar'
import { CatalogPagination } from './CatalogPagination'
import type { NonCseCatalogItem } from '../types'

// ─── Column Helper ─────────────────────────────────────────────────────────────

const colHelper = createColumnHelper<NonCseCatalogItem>()

// ─── Column Definitions ────────────────────────────────────────────────────────

function buildColumns() {
  return [
    // Select checkbox
    colHelper.display({
      id: 'select',
      enableHiding: false,
      enableSorting: false,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? 'indeterminate'
                : false
          }
          onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
          aria-label="Select all rows on this page"
          className="translate-y-px"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(val) => row.toggleSelected(!!val)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${row.original.name}`}
          className="translate-y-px"
        />
      ),
      size: 40,
    }),

    // Item Code
    colHelper.accessor('itemCode', {
      id: 'itemCode',
      header: 'Code',
      enableHiding: true,
      cell: (info) => (
        <span className="font-mono text-xs text-muted-foreground">
          {info.getValue()}
        </span>
      ),
      size: 130,
    }),

    // Name
    colHelper.accessor('name', {
      id: 'name',
      header: 'Item Name',
      enableHiding: false,
      enableSorting: true,
      cell: (info) => {
        const item = info.row.original
        return (
          <div className="flex items-center gap-2 min-w-0">
            {item.isLocked && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-48">
                    {item.reasonLocked ??
                      'Locked — referenced in Submitted PPMP'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <span className="truncate text-sm font-medium">
              {info.getValue()}
            </span>
          </div>
        )
      },
    }),

    // Category
    colHelper.accessor('category', {
      id: 'category',
      header: 'Category',
      enableHiding: true,
      enableSorting: true,
      cell: (info) => (
        <span className="text-sm text-muted-foreground">{info.getValue()}</span>
      ),
      size: 180,
    }),

    // Unit Price
    colHelper.accessor('currentPrice', {
      id: 'currentPrice',
      header: 'Unit Price',
      enableHiding: true,
      enableSorting: true,
      cell: (info) => (
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatPrice(info.getValue())}
        </span>
      ),
      size: 130,
    }),

    // Last Survey Date
    colHelper.accessor('lastSurveyDate', {
      id: 'lastSurveyDate',
      header: 'Last Surveyed',
      enableHiding: true,
      enableSorting: true,
      cell: (info) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">
            {formatDate(info.getValue())}
          </span>
          <StalePriceIndicator lastSurveyDate={info.getValue()} />
        </div>
      ),
      size: 160,
    }),

    // Status
    colHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      enableHiding: true,
      enableSorting: true,
      cell: (info) => {
        const isActive = info.getValue() === 'active'
        return (
          <Badge
            variant="outline"
            className={cn(
              'text-xs capitalize',
              isActive
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400'
                : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900',
            )}
          >
            {info.getValue()}
          </Badge>
        )
      },
      size: 90,
    }),

    // Supplier
    colHelper.accessor('supplier', {
      id: 'supplier',
      header: 'Supplier',
      enableHiding: true,
      enableSorting: false,
      cell: (info) => (
        <span className="text-sm text-muted-foreground truncate">
          {info.getValue() ?? <span className="italic text-gray-400">—</span>}
        </span>
      ),
      size: 160,
    }),
  ]
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface CatalogTableProps {
  data: NonCseCatalogItem[]
  total: number
  isLoading: boolean
}

export function CatalogTable({ data, total, isLoading }: CatalogTableProps) {
  const [rowSelection, setRowSelection] = useAtom(catalogRowSelectionAtom)
  const [sorting, setSorting] = useAtom(catalogSortingAtom)
  const [columnVisibility, setColumnVisibility] = useAtom(
    catalogColumnVisibilityAtom,
  )
  const [pagination, setPagination] = useAtom(catalogPaginationAtom)
  const setSelectedItemId = useSetAtom(selectedItemIdAtom)
  const selectedItemId = useAtomValue(selectedItemIdAtom)

  // Sync total for display
  const setTotal = useSetAtom(catalogTotalItemsAtom)
  useMemo(() => setTotal(total), [total, setTotal])

  const columns = useMemo(() => buildColumns(), [])

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      sorting,
      columnVisibility,
      pagination,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    rowCount: total,
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiRowSelection: true,
  })

  const handleRowClick = useCallback(
    (itemId: string) => {
      setSelectedItemId((prev) => (prev === itemId ? null : itemId))
    },
    [setSelectedItemId],
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <CatalogToolbar table={table} totalItems={total} />

      {/* Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-muted/30 hover:bg-muted/30">
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    const sorted = header.column.getIsSorted()
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() }}
                        className={cn(
                          'text-xs font-semibold uppercase tracking-wide text-muted-foreground h-10',
                          canSort && 'cursor-pointer select-none',
                        )}
                        onClick={
                          canSort
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                          {canSort && (
                            <span className="text-muted-foreground/60">
                              {sorted === 'asc' ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : sorted === 'desc' ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                              )}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading ? (
                // Loading skeletons
                Array.from({
                  length: pagination.pageSize > 20 ? 12 : pagination.pageSize,
                }).map((_, i) => (
                  <TableRow key={`skel-${i}`}>
                    {table.getVisibleLeafColumns().map((col) => (
                      <TableCell key={col.id}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No catalog items found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    className={cn(
                      'cursor-pointer transition-colors duration-100',
                      selectedItemId === row.original.id &&
                        'bg-primary/5 border-l-2 border-l-primary',
                      'hover:bg-muted/40',
                    )}
                    onClick={() => handleRowClick(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <CatalogPagination table={table} total={total} isLoading={isLoading} />
    </div>
  )
}
