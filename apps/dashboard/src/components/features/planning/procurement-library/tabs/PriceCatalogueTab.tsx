import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Column, Toolbar } from '../price-catalogue/table'
import { DeleteConfirmationDialog } from '../item-master/dialog/DeleteConfirmationDialog'
import { EditPriceCatalogueDialog } from '../price-catalogue/dialog/EditPriceCatalogueDialog'
import { PriceDetailPage } from '../price-catalogue/page/PriceDetailPage'
import { useToast } from '@/components/ui/use-toast'
import type { PriceCatalogueItem } from '../types'
import type { MetaActions } from '@/types/global'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useFiscalYearQueries } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/hooks/useFiscalYearQueries'
import { mapItemPricesToPriceCatalogueItems } from '@/features/planning/procurement-library/item-price/mappers'
import { useItemPrices } from '@/features/planning/procurement-library/item-price/hooks/useItemPriceQueries'

export function PriceCatalogueTab() {
  const actions: MetaActions = ['write', 'delete', 'read']
  const { fiscalYears } = useFiscalYearQueries()
  const [selectedFiscalYearId, setSelectedFiscalYearId] = useState<string>('')
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [viewingItem, setViewingItem] = useState<PriceCatalogueItem | null>(
    null,
  )
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PriceCatalogueItem | null>(
    null,
  )
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    if (!selectedFiscalYearId && fiscalYears.length > 0) {
      const latestFiscalYear = [...fiscalYears].sort(
        (left, right) => right.year - left.year,
      )[0]
      setSelectedFiscalYearId(latestFiscalYear.id)
    }
  }, [fiscalYears, selectedFiscalYearId])

  const queryParams = useMemo(
    () => ({
      search: globalFilter || undefined,
      fiscalYearId: selectedFiscalYearId || undefined,
    }),
    [globalFilter, selectedFiscalYearId],
  )

  const { itemPrices, isLoading, isError } = useItemPrices(queryParams)

  const availableFiscalYears = useMemo(
    () =>
      [...fiscalYears]
        .sort((left, right) => right.year - left.year)
        .map((fiscalYear) => ({
          value: fiscalYear.id,
          label: `FY ${fiscalYear.year}`,
        })),
    [fiscalYears],
  )

  const rows = useMemo(
    () => mapItemPricesToPriceCatalogueItems(itemPrices),
    [itemPrices],
  )

  const filteredData = useMemo(
    () =>
      [...rows].sort((left, right) => {
        if (left.fiscalYear !== right.fiscalYear) {
          return right.fiscalYear - left.fiscalYear
        }

        return left.itemName.localeCompare(right.itemName)
      }),
    [rows],
  )
  const handleViewItem = (item: PriceCatalogueItem) => {
    setViewingItem(item)
    setViewDialogOpen(true)
  }

  const handleEditItem = (item: PriceCatalogueItem) => {
    setEditingItem(item)
    setEditDialogOpen(true)
  }

  const handleDeleteItem = (itemId: string | number) => {
    setDeletingItemId(String(itemId))
    setDeleteDialogOpen(true)
  }

  const table = useReactTable({
    data: filteredData,
    columns: Column({
      onView: handleViewItem,
      onEdit: handleEditItem,
      onDelete: handleDeleteItem,
    }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue ?? '').toLowerCase()
      const itemName = String(row.getValue('itemName') ?? '').toLowerCase()
      return itemName.includes(search)
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    meta: {
      readonly: false,
      actions,
    },
  })

  return (
    <div className="space-y-6">
      {viewDialogOpen && viewingItem ? (
        <PriceDetailPage
          item={viewingItem}
          onBack={() => {
            setViewDialogOpen(false)
            setViewingItem(null)
          }}
        />
      ) : (
        <>
          <div>
            <h2 className="text-2xl font-bold">Price Catalogue</h2>
            <p className="text-sm text-muted-foreground">
              Manage item pricing and historical cost data
            </p>
          </div>

          <div className="w-full flex flex-col h-full p-2">
            <div className="flex items-center py-4 gap-1 flex-wrap">
              <Toolbar
                table={table}
                actions={actions}
                selectedFiscalYearId={selectedFiscalYearId}
                onSelectedFiscalYearChange={setSelectedFiscalYearId}
                availableFiscalYears={availableFiscalYears}
              />
            </div>
            <div className="rounded-md border flex-1 flex flex-col min-h-0">
              <Table>
                <TableHeader className="bg-transparent border rounded-t-3xl">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="text-gray-500">
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
                    <TableRow>
                      <TableCell
                        colSpan={table.getAllColumns().length}
                        className="h-24 text-center"
                      >
                        Loading price catalogue...
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={table.getAllColumns().length}
                        className="h-24 text-center"
                      >
                        <div className="flex flex-col items-center justify-center py-12">
                          <h3 className="text-lg font-semibold">
                            Failed to load price catalogue
                          </h3>
                          <p className="text-muted-foreground">
                            An error occurred while fetching prices. Please try
                            again.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={`text-left relative ${
                              cell.column.id !== 'select' &&
                              cell.column.id !== 'actions'
                                ? 'pl-6'
                                : ''
                            }`}
                          >
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
                        colSpan={table.getAllColumns().length}
                        className="h-24 text-center"
                      >
                        <div className="flex flex-col items-center justify-center py-12">
                          <Search className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold">
                            No items found
                          </h3>
                          <p className="text-muted-foreground">
                            Try adjusting your filters or add a new item.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-row items-center justify-between space-x-2 py-4">
              <div className="text-muted-foreground text-sm">
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="text-muted-foreground text-sm">
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </div>
              <div className="flex space-x-2">
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

          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            itemName={
              filteredData.find((item) => item.id === deletingItemId)
                ?.itemName || 'Price Item'
            }
            itemId={deletingItemId}
          />

          {editingItem && (
            <EditPriceCatalogueDialog
              item={editingItem}
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
            />
          )}
        </>
      )}
    </div>
  )
}
