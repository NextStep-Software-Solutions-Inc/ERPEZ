import { Column, Toolbar } from '../item-master/table'
import { EditItemMasterDialog } from '../item-master/dialog/EditItemMasterDialog'
import { ItemDetailPage } from '../item-master/page/ItemDetailPage'
import { DeleteConfirmationDialog } from '../item-master/dialog/DeleteConfirmationDialog'
import { StatusToggleConfirmationDialog } from '../item-master/dialog/StatusToggleConfirmationDialog'
import { useToast } from '@/components/ui/use-toast'
import { useItemMaster } from '@/hooks/useItemMaster'
import type { ItemMaster } from '../types'
import type { MetaActions } from '@/types/global'
import { useEffect, useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  SortingState,
  VisibilityState,
  ColumnFiltersState,
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

// UACS Code to Description Mapping
const UACS_CODE_MAP: Record<string, string> = {
  '10101001': 'General Administration and Support',
  '10102001': 'Financial and Accounting',
  '30301001': 'Supplies and Materials',
  '40401001': 'Information Technology',
  '50501001': 'Infrastructure and Construction',
}

// Function to get UACS description by code
const getUacsDescription = (code: string): string => {
  return UACS_CODE_MAP[code] || 'Unknown Category'
}

export function ItemMasterTab() {
  const { toast } = useToast()
  const actions: MetaActions = ['write', 'delete', 'read']
  const { itemMasters, loading, error } = useItemMaster()
  const [allData, setAllData] = useState<ItemMaster[]>([])
  const [itemTypeFilter, setItemTypeFilter] = useState('all')
  const [editingItem, setEditingItem] = useState<ItemMaster | null>(null)
  const [viewingItemId, setViewingItemId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [statusToggleDialogOpen, setStatusToggleDialogOpen] = useState(false)
  const [togglingItem, setTogglingItem] = useState<ItemMaster | null>(null)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState<string>('')

  useEffect(() => {
    setAllData(itemMasters)
  }, [itemMasters])

  // Apply filters to data
  const filteredData = useMemo(() => {
    let data = allData
    if (itemTypeFilter !== 'all')
      data = data.filter((item) => item.itemType === itemTypeFilter)
    return data
  }, [allData, itemTypeFilter])

  const handleAddItem = (newItemData: any) => {
    const newItem = {
      id: `IM-${allData.length + 1}`,
      itemName: newItemData.itemName,
      uacsCode: newItemData.uacsCode,
      uacsDescription: getUacsDescription(newItemData.uacsCode),
      isCSE: newItemData.isCSE,
      unspscCode: newItemData.unspscCode,
      isActive: true,
      itemLife: newItemData.itemLife,
      itemLifeUnit: newItemData.itemLifeUnit,
      productCode: newItemData.productCode,
      imageURL: newItemData.imageURL,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemType: newItemData.itemType,
    } as ItemMaster
    setAllData((prev) => {
      return [...prev, newItem].sort((a, b) =>
        a.itemName.localeCompare(b.itemName),
      )
    })
    toast({
      title: 'Success',
      description: `Item "${newItemData.itemName}" has been created successfully.`,
      color: 'success',
    })
  }

  const handleViewItem = (item: ItemMaster) => {
    setViewingItemId(item.id)
    setViewDialogOpen(true)
  }

  const handleEditItem = (item: ItemMaster) => {
    setEditingItem(item)
    setEditDialogOpen(true)
  }

  const handleDeleteItem = (itemId: string | number) => {
    setDeletingItemId(String(itemId))
    setDeleteDialogOpen(true)
  }

  const handleToggleStatus = (itemId: string) => {
    const selectedItem = allData.find((item) => item.id === itemId) ?? null
    setTogglingItem(selectedItem)
    setStatusToggleDialogOpen(true)
  }

  const table = useReactTable({
    data: filteredData,
    columns: Column({
      onView: handleViewItem,
      onEdit: handleEditItem,
      onDelete: handleDeleteItem,
      onToggleStatus: handleToggleStatus,
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
    globalFilterFn: (row, filterValue) => {
      const search = filterValue.toLowerCase()
      const itemName = String(row.getValue('itemName') ?? '').toLowerCase()
      const uacsCode = String(row.getValue('uacsCode') ?? '').toLowerCase()
      const uacsDescription =
        (row.original as any).uacsDescription?.toLowerCase() ?? ''
      return (
        itemName.includes(search) ||
        uacsCode.includes(search) ||
        uacsDescription.includes(search)
      )
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
    <div className="space-y-4">
      {/* Show detail page if viewing item */}
      {viewDialogOpen && viewingItemId ? (
        <ItemDetailPage
          itemId={viewingItemId}
          onBack={() => {
            setViewDialogOpen(false)
            setViewingItemId(null)
          }}
        />
      ) : (
        <>
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold">Item Master List</h2>
            <p className="text-sm text-muted-foreground">
              Manage procurement items and specifications
            </p>
          </div>

          {/* Table */}
          <div className="w-full flex flex-col h-full p-2">
            <div className="flex items-center py-4 gap-1 flex-wrap">
              <Toolbar
                table={table}
                actions={actions}
                itemTypeFilter={itemTypeFilter}
                onItemTypeFilterChange={setItemTypeFilter}
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
                  {loading && allData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={table.getVisibleLeafColumns().length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Loading item masters...
                      </TableCell>
                    </TableRow>
                  ) : error && allData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={table.getVisibleLeafColumns().length}
                        className="h-24 text-center text-destructive"
                      >
                        {error}
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
                        colSpan={table.getVisibleLeafColumns().length}
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

          {/* Edit Dialog */}
          {editingItem && (
            <EditItemMasterDialog
              item={editingItem}
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              // onEditSuccess={handleUpdateItem}
            />
          )}

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              setDeleteDialogOpen(open)
              if (!open) {
                setDeletingItemId(null)
              }
            }}
            itemId={deletingItemId}
            itemName={
              allData.find((item) => item.id === deletingItemId)?.itemName ||
              'Item'
            }
          />

          {/* Status Toggle Confirmation Dialog */}
          {togglingItem && (
            <StatusToggleConfirmationDialog
              open={statusToggleDialogOpen}
              onOpenChange={(open) => {
                setStatusToggleDialogOpen(open)
                if (!open) {
                  setTogglingItem(null)
                }
              }}
              item={togglingItem}
            />
          )}
        </>
      )}
    </div>
  )
}
